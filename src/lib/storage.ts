import { supabase } from './supabase';

export type StorageBucket = 'avatars' | 'verification-documents';

export interface FileUploadOptions {
  bucket: StorageBucket;
  file: File;
  userId: string;
  path?: string; // Optional subdirectory within user's folder
}

export interface FileUploadResult {
  url: string;
  path: string;
  error: Error | null;
}

/**
 * Upload a file to Supabase Storage
 * Files are organized by user ID: {userId}/{optional-path}/{filename}
 */
export async function uploadFile({
  bucket,
  file,
  userId,
  path,
}: FileUploadOptions): Promise<FileUploadResult> {
  try {
    // Generate unique filename to prevent collisions
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${sanitizedFileName}`;

    // Construct file path: userId/optional-path/filename
    const filePath = path
      ? `${userId}/${path}/${fileName}`
      : `${userId}/${fileName}`;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { url: '', path: '', error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      error: null,
    };
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return {
      url: '',
      path: '',
      error: error as Error,
    };
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  filePath: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Storage delete error:', error);
      return { error };
    }

    return { error: null };
  } catch (error) {
    console.error('Unexpected delete error:', error);
    return { error: error as Error };
  }
}

/**
 * Extract storage path from a public URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/avatars/user-id/file.jpg
 * Returns: user-id/file.jpg
 */
export function extractPathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const bucketIndex = pathParts.indexOf('public');

    if (bucketIndex === -1) return null;

    // Path is everything after the bucket name
    return pathParts.slice(bucketIndex + 2).join('/');
  } catch {
    return null;
  }
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * Validate file size (in bytes)
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get allowed file types for each bucket
 */
export const ALLOWED_FILE_TYPES = {
  avatars: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  'verification-documents': [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'image/webp',
    'application/pdf',
  ],
} as const;

/**
 * Get max file size for each bucket (in bytes)
 */
export const MAX_FILE_SIZE = {
  avatars: 5 * 1024 * 1024, // 5MB
  'verification-documents': 10 * 1024 * 1024, // 10MB
} as const;
