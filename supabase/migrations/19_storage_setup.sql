-- ============================================
-- STORAGE SETUP
-- Migration: 20
-- Description: Create storage buckets and policies for avatars and verification documents
-- ============================================

-- Create storage buckets (skip if already exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  (
    'avatars',
    'avatars',
    true, -- Public bucket (avatars are public)
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  ),
  (
    'verification-documents',
    'verification-documents',
    false, -- Private bucket (KYC documents)
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
  ),
  (
    'deal-images',
    'deal-images',
    true, -- Public bucket (deal images are public)
    NULL, -- No file size limit
    NULL -- No MIME type restrictions
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AVATARS BUCKET POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Sourcers can upload verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Sourcers can update verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Sourcers can delete verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can update verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view deal images" ON storage.objects;
DROP POLICY IF EXISTS "Sourcers can upload deal images" ON storage.objects;
DROP POLICY IF EXISTS "Sourcers can update their own deal images" ON storage.objects;
DROP POLICY IF EXISTS "Sourcers can delete their own deal images" ON storage.objects;

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars (they're public)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- VERIFICATION DOCUMENTS BUCKET POLICIES
-- ============================================

-- Allow authenticated users to upload their own verification documents
-- (Needed for investors applying to become sourcers)
CREATE POLICY "Users can upload verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own verification documents
CREATE POLICY "Users can update verification documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own verification documents
CREATE POLICY "Users can delete verification documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own verification documents
CREATE POLICY "Users can view their own verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow Admins to view all verification documents
CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'verification-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'ADMIN'
  )
);

-- ============================================
-- DEAL IMAGES BUCKET POLICIES
-- ============================================

-- Anyone can view deal images (they're public)
CREATE POLICY "Anyone can view deal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'deal-images');

-- Sourcers can upload deal images
CREATE POLICY "Sourcers can upload deal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deal-images' AND
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE role IN ('SOURCER', 'ADMIN')
  )
);

-- Sourcers can update their own deal images
CREATE POLICY "Sourcers can update their own deal images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'deal-images' AND
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE role IN ('SOURCER', 'ADMIN')
  )
);

-- Sourcers can delete their own deal images
CREATE POLICY "Sourcers can delete their own deal images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deal-images' AND
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE role IN ('SOURCER', 'ADMIN')
  )
);
