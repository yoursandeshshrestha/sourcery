import { FileCheck, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { DocumentUpload } from './DocumentUpload';
import { KYC_DOCUMENTS } from '../types';

export function KYCSection() {
  const { profile } = useAuth();
  const { uploadKYCDocument, deleteKYCDocument, loading } = useProfile();

  if (!profile || profile.role !== 'SOURCER') {
    return null; // Only show for Sourcers
  }

  const handleUpload = async (file: File, documentType: 'id' | 'aml' | 'insurance') => {
    await uploadKYCDocument(file, documentType);
  };

  const handleDelete = async (documentType: 'id' | 'aml' | 'insurance') => {
    await deleteKYCDocument(documentType);
  };

  // Check if all documents are uploaded
  const allDocumentsUploaded =
    profile.id_document_url &&
    profile.aml_document_url &&
    profile.insurance_document_url;

  const isVerified = profile.verification_status === 'VERIFIED';
  const isPending = profile.verification_status === 'PENDING';
  const isRejected = profile.verification_status === 'REJECTED';

  return (
    <div className="flex flex-col gap-3">
      {/* Section Header */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[15px] font-[450] leading-[23px] text-foreground">
          KYC Verification
        </h3>
        <p className="text-xs text-muted-foreground">
          Upload required documents to verify your account
        </p>
      </div>

      {/* Status Alert */}
      {!allDocumentsUploaded && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Please upload all required documents to complete your verification. Once
            submitted, our team will review within 24-48 hours.
          </AlertDescription>
        </Alert>
      )}

      {isRejected && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Your verification was rejected. Please update your documents and resubmit
            for review.
          </AlertDescription>
        </Alert>
      )}

      {isPending && allDocumentsUploaded && (
        <Alert>
          <FileCheck className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Your documents are under review. We'll notify you once verification is
            complete (typically 24-48 hours).
          </AlertDescription>
        </Alert>
      )}

      {isVerified && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <FileCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-900 dark:text-green-100">
            Your account is verified! You can now create and list deals on the
            platform.
          </AlertDescription>
        </Alert>
      )}

      {/* Document Uploads */}
      <section className="rounded-[7px] bg-card border border-border p-6 space-y-6">
        {KYC_DOCUMENTS.map((doc) => (
          <DocumentUpload
            key={doc.type}
            label={doc.label}
            description={doc.description}
            currentUrl={profile[doc.dbField]}
            bucket="verification-documents"
            onUpload={(file) => handleUpload(file, doc.type)}
            onDelete={
              isVerified ? undefined : () => handleDelete(doc.type)
            } // Can't delete if verified
            disabled={loading || isVerified} // Can't upload if verified
            className={doc.type !== 'insurance' ? 'pb-6 border-b border-border' : ''}
          />
        ))}

        {/* Verification Notice */}
        {allDocumentsUploaded && !isVerified && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              All documents uploaded. Your verification is{' '}
              {isPending ? 'currently under review' : 'pending submission'}.
            </p>
          </div>
        )}
      </section>

      {/* Requirements Note */}
      <div className="rounded-lg bg-muted/50 border border-border/50 p-4">
        <p className="text-sm font-medium text-foreground mb-2">
          Document Requirements:
        </p>
        <ul className="text-xs text-muted-foreground space-y-1.5 ml-4 list-disc">
          <li>
            <strong>ID Document:</strong> Clear photo of valid passport or driver's
            license
          </li>
          <li>
            <strong>AML Certificate:</strong> Valid Anti-Money Laundering certification
          </li>
          <li>
            <strong>Insurance:</strong> Current professional indemnity insurance
            certificate
          </li>
          <li>All documents must be in PDF, JPG, PNG, or WebP format (max 10MB each)</li>
        </ul>
      </div>
    </div>
  );
}
