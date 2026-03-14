import { useState, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  type StorageBucket,
} from '@/lib/storage';

interface DocumentUploadProps {
  label: string;
  description: string;
  currentUrl: string | null;
  bucket: StorageBucket;
  onUpload: (file: File) => Promise<void>;
  onDelete?: () => Promise<void>;
  disabled?: boolean;
  className?: string;
}

export function DocumentUpload({
  label,
  description,
  currentUrl,
  bucket,
  onUpload,
  onDelete,
  disabled = false,
  className,
}: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ALLOWED_FILE_TYPES[bucket];
  const maxSize = MAX_FILE_SIZE[bucket];

  const handleFileSelect = async (file: File) => {
    setUploadError(null);

    // Validate file type
    if (!validateFileType(file, allowedTypes)) {
      const types = allowedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ');
      setUploadError(`Invalid file type. Allowed: ${types}`);
      return;
    }

    // Validate file size
    if (!validateFileSize(file, maxSize)) {
      setUploadError(`File too large. Max size: ${formatFileSize(maxSize)}`);
      return;
    }

    // Upload file
    setIsUploading(true);
    try {
      await onUpload(file);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsUploading(true);
    try {
      await onDelete();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setIsUploading(false);
    }
  };

  const isPDF = currentUrl?.endsWith('.pdf');

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <div>
        <label className="text-sm font-medium text-foreground">{label}</label>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>

      {/* Upload Area or Preview */}
      {currentUrl ? (
        // Document Preview
        <div className="relative rounded-lg border border-border bg-muted/30 overflow-hidden">
          {isPDF ? (
            // PDF Preview
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0 h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">PDF Document</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentUrl, '_blank')}
                  disabled={isUploading}
                  className="cursor-pointer"
                >
                  View
                </Button>
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    disabled={disabled || isUploading}
                    className="cursor-pointer h-8 w-8 p-0"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            // Image Preview
            <div className="relative aspect-video">
              <img
                src={currentUrl}
                alt={label}
                className="w-full h-full object-cover"
              />
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={disabled || isUploading}
                  className="cursor-pointer absolute top-2 right-2"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        // Upload Area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={cn(
            'relative rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-muted/30 hover:bg-muted/50',
            disabled && 'opacity-50 cursor-not-allowed',
            'p-8'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                  {bucket === 'avatars' ? (
                    <ImageIcon className="h-6 w-6 text-primary" />
                  ) : (
                    <Upload className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop file here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {allowedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ')} •{' '}
                    Max {formatFileSize(maxSize)}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}
    </div>
  );
}
