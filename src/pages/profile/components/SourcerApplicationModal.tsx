import { useState, useRef } from 'react';
import { Loader2, Upload, X, FileText, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LottiePlayer } from '@/components/LottiePlayer';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  uploadFile,
  deleteFile,
  extractPathFromUrl,
  validateFileType,
  validateFileSize,
  formatFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from '@/lib/storage';

interface SourcerApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DocumentUpload {
  file: File | null;
  preview: string | null;
  url: string | null;
  uploading: boolean;
  error: string | null;
}

interface FormData {
  company_name: string;
  bio: string;
  phone: string;
}

type Step = 1 | 2;
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export function SourcerApplicationModal({ isOpen, onClose }: SourcerApplicationModalProps) {
  const { user, profile, refreshProfile } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    company_name: profile?.company_name || '',
    bio: profile?.bio || '',
    phone: profile?.phone || '',
  });

  // Check if in development mode
  const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';

  // Fill dummy data for testing (development only)
  const fillDummyData = () => {
    setFormData({
      company_name: 'Acme Property Solutions Ltd',
      bio: 'Experienced property sourcer with over 10 years in the UK property market. Specializing in off-market deals, HMOs, and BRRR strategies. Extensive network of estate agents and property professionals across London and the South East.',
      phone: '+44 7700 900123',
    });
    setFormErrors({});
  };

  const [documents, setDocuments] = useState<{
    id: DocumentUpload;
    aml: DocumentUpload;
    insurance: DocumentUpload;
  }>({
    id: { file: null, preview: null, url: null, uploading: false, error: null },
    aml: { file: null, preview: null, url: null, uploading: false, error: null },
    insurance: { file: null, preview: null, url: null, uploading: false, error: null },
  });

  const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

  const idInputRef = useRef<HTMLInputElement>(null);
  const amlInputRef = useRef<HTMLInputElement>(null);
  const insuranceInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (type: 'id' | 'aml' | 'insurance', file: File) => {
    if (!user) return;

    // Validate
    if (!validateFileType(file, ALLOWED_FILE_TYPES['verification-documents'])) {
      setDocuments((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          error: 'Invalid file type. Use JPG, PNG, WebP, or PDF',
        },
      }));
      return;
    }

    if (!validateFileSize(file, MAX_FILE_SIZE['verification-documents'])) {
      setDocuments((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          error: `File too large. Max ${formatFileSize(MAX_FILE_SIZE['verification-documents'])}`,
        },
      }));
      return;
    }

    // Create preview for images
    let preview: string | null = null;
    if (file.type.startsWith('image/')) {
      preview = URL.createObjectURL(file);
    }

    // Set uploading state
    setDocuments((prev) => ({
      ...prev,
      [type]: { file, preview, url: null, uploading: true, error: null },
    }));

    // Upload immediately to storage
    try {
      const result = await uploadFile({
        bucket: 'verification-documents',
        file,
        userId: user.id,
        path: 'kyc',
      });

      if (result.error) {
        throw result.error;
      }

      // Update with uploaded URL
      setDocuments((prev) => ({
        ...prev,
        [type]: { file, preview, url: result.url, uploading: false, error: null },
      }));
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`Failed to upload ${type} document:`, error);
      }
      setDocuments((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          uploading: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        },
      }));
    }
  };

  const handleRemoveFile = async (type: 'id' | 'aml' | 'insurance') => {
    const doc = documents[type];

    // Revoke preview URL
    if (doc.preview) {
      URL.revokeObjectURL(doc.preview);
    }

    // Delete from storage if uploaded
    if (doc.url) {
      const path = extractPathFromUrl(doc.url);
      if (path) {
        await deleteFile('verification-documents', path);
      }
    }

    // Reset state
    setDocuments((prev) => ({
      ...prev,
      [type]: { file: null, preview: null, url: null, uploading: false, error: null },
    }));
  };

  const validateStep1 = () => {
    const errors: Partial<FormData> = {};

    if (!formData.company_name.trim()) {
      errors.company_name = 'Company name is required';
    }
    if (!formData.bio.trim()) {
      errors.bio = 'Bio is required';
    } else if (formData.bio.trim().length < 50) {
      errors.bio = 'Bio must be at least 50 characters';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Validate documents are uploaded
    if (!documents.id.url || !documents.aml.url || !documents.insurance.url) {
      setSubmitError('All 3 KYC documents must be uploaded successfully');
      return;
    }

    setSubmitState('submitting');
    setSubmitError(null);

    try {
      // Update profile with application data (role stays INVESTOR until admin approves)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_status: 'PENDING',
          company_name: formData.company_name.trim(),
          bio: formData.bio.trim(),
          phone: formData.phone.trim(),
          id_document_url: documents.id.url,
          aml_document_url: documents.aml.url,
          insurance_document_url: documents.insurance.url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setSubmitState('success');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Application submission error:', error);
      }
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit application'
      );
      setSubmitState('error');
    }
  };

  const handleClose = () => {
    // Reset state
    setStep(1);
    setSubmitState('idle');
    setSubmitError(null);
    setFormErrors({});
    onClose();
  };

  const allDocumentsUploaded =
    documents.id.url && documents.aml.url && documents.insurance.url;

  const isUploading =
    documents.id.uploading || documents.aml.uploading || documents.insurance.uploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 border-border flex flex-col max-h-[90vh]">
        {/* Fixed Header - Hidden on success/error */}
        {submitState !== 'success' && submitState !== 'error' && (
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {submitState === 'submitting' && 'Submitting Application...'}
                  {submitState === 'idle' && `Become a Deal Sourcer - Step ${step} of 2`}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {submitState === 'idle' &&
                    (step === 1
                      ? 'Fill in your business information'
                      : 'Upload required verification documents')}
                  {submitState === 'submitting' && 'Please wait while we process your application...'}
                </p>
              </div>
              {/* Development only: Fill dummy data button */}
              {isDevelopment && submitState === 'idle' && step === 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fillDummyData}
                  className="cursor-pointer shrink-0"
                >
                  Fill Dummy Data
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Submitting State */}
          {submitState === 'submitting' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
              <p className="text-lg font-medium text-foreground">Submitting your application</p>
              <p className="text-sm text-muted-foreground mt-2">Uploading documents and processing...</p>
            </div>
          )}

          {/* Success State */}
          {submitState === 'success' && (
            <div className="flex flex-col items-center justify-center py-12">
              <LottiePlayer
                src="/lottie/success.json"
                autoplay={true}
                loop={false}
                className="w-45 h-45 mb-4"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">Application Submitted Successfully!</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Your sourcer application has been received and is now under review. We'll notify you once an admin approves your verification (typically within 24-48 hours).
              </p>
            </div>
          )}

          {/* Error State */}
          {submitState === 'error' && (
            <div className="flex flex-col items-center justify-center py-12">
              <LottiePlayer
                src="/lottie/error.json"
                autoplay={true}
                loop={false}
                className="w-45 h-45 mb-4"
              />
              <h3 className="text-lg font-semibold text-foreground mb-2">Submission Failed</h3>
              <p className="text-sm text-destructive text-center max-w-md mb-4">
                {submitError || 'An unexpected error occurred. Please try again.'}
              </p>
              <Button
                onClick={() => setSubmitState('idle')}
                variant="outline"
                className="cursor-pointer"
              >
                Try Again
              </Button>
            </div>
          )}

          {/* Step 1: Business Information */}
          {submitState === 'idle' && step === 1 && (
            <div className="space-y-6">
              <Alert className="border-border">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Complete this application to become a verified sourcer. All fields are required.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* Phone and Company in one row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData({ ...formData, phone: e.target.value });
                        setFormErrors({ ...formErrors, phone: undefined });
                      }}
                      placeholder="+44 7700 900000"
                      className={formErrors.phone ? 'border-destructive' : ''}
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-destructive">{formErrors.phone}</p>
                    )}
                  </div>

                  {/* Company */}
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      Company Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="company"
                      value={formData.company_name}
                      onChange={(e) => {
                        if (e.target.value.length <= 50) {
                          setFormData({ ...formData, company_name: e.target.value });
                          setFormErrors({ ...formErrors, company_name: undefined });
                        }
                      }}
                      placeholder="Your company or business name"
                      maxLength={50}
                      className={formErrors.company_name ? 'border-destructive' : ''}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formData.company_name.length}/50 characters
                      </p>
                      {formErrors.company_name && (
                        <p className="text-xs text-destructive">{formErrors.company_name}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">
                    Professional Bio <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => {
                      setFormData({ ...formData, bio: e.target.value });
                      setFormErrors({ ...formErrors, bio: undefined });
                    }}
                    placeholder="Tell us about your experience in property sourcing..."
                    rows={6}
                    className={`resize-none ${formErrors.bio ? 'border-destructive' : ''}`}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {formData.bio.length}/500 characters (minimum 50)
                    </p>
                    {formErrors.bio && (
                      <p className="text-xs text-destructive">{formErrors.bio}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {submitState === 'idle' && step === 2 && (
            <div className="space-y-6">
              <Alert className="border-border">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Upload all 3 required KYC documents. Accepted formats: JPG, PNG, WebP, PDF (max 10MB each).
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {/* ID Document */}
                <DocumentUploadField
                  label="ID Document"
                  description="Valid passport or driver's license"
                  file={documents.id}
                  inputRef={idInputRef}
                  onSelect={(file) => handleFileSelect('id', file)}
                  onRemove={() => handleRemoveFile('id')}
                />

                {/* AML Certificate */}
                <DocumentUploadField
                  label="AML Certificate"
                  description="Anti-Money Laundering certification"
                  file={documents.aml}
                  inputRef={amlInputRef}
                  onSelect={(file) => handleFileSelect('aml', file)}
                  onRemove={() => handleRemoveFile('aml')}
                />

                {/* Insurance */}
                <DocumentUploadField
                  label="Insurance Certificate"
                  description="Professional indemnity insurance"
                  file={documents.insurance}
                  inputRef={insuranceInputRef}
                  onSelect={(file) => handleFileSelect('insurance', file)}
                  onRemove={() => handleRemoveFile('insurance')}
                />
              </div>

              {submitError && (
                <Alert variant="destructive" className="border-border">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        {/* Fixed Footer - Hidden on success/error */}
        {submitState !== 'success' && submitState !== 'error' && (
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex items-center justify-between">
              <>
                <div>
                  {step === 2 && (
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={submitState === 'submitting'}
                      className="cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={submitState === 'submitting'}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  {step === 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={submitState === 'submitting'}
                      className="cursor-pointer"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!allDocumentsUploaded || isUploading || submitState === 'submitting'}
                      className="cursor-pointer"
                    >
                      {submitState === 'submitting' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </Button>
                  )}
                </div>
              </>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Document Upload Field Component
interface DocumentUploadFieldProps {
  label: string;
  description: string;
  file: DocumentUpload;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

function DocumentUploadField({
  label,
  description,
  file,
  inputRef,
  onSelect,
  onRemove,
}: DocumentUploadFieldProps) {
  const isPDF = file.file?.type === 'application/pdf';
  const isUploaded = !!file.url;

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES['verification-documents'].join(',')}
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) onSelect(selectedFile);
        }}
        disabled={file.uploading}
        className="hidden"
      />

      {file.file ? (
        <div className="flex items-center gap-3 p-3 border border-border rounded-lg bg-muted/30">
          <div className="shrink-0">
            {file.uploading ? (
              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              </div>
            ) : isPDF ? (
              <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
            ) : file.preview ? (
              <img
                src={file.preview}
                alt={label}
                className="h-10 w-10 rounded object-cover border border-border"
              />
            ) : null}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {file.uploading ? 'Uploading...' : isUploaded ? 'Uploaded ✓' : formatFileSize(file.file.size)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={file.uploading}
            className="cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full cursor-pointer border-border"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload {label}
        </Button>
      )}

      {file.error && <p className="text-xs text-destructive">{file.error}</p>}
    </div>
  );
}
