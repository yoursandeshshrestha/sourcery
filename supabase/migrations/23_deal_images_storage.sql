-- Create storage bucket for deal images
INSERT INTO storage.buckets (id, name, public)
VALUES ('deal-images', 'deal-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for deal-images bucket
CREATE POLICY "Anyone can view deal images"
ON storage.objects FOR SELECT
USING (bucket_id = 'deal-images');

CREATE POLICY "Sourcers can upload deal images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'deal-images' AND
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE role IN ('SOURCER', 'ADMIN')
  )
);

CREATE POLICY "Sourcers can update their own deal images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'deal-images' AND
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE role IN ('SOURCER', 'ADMIN')
  )
);

CREATE POLICY "Sourcers can delete their own deal images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'deal-images' AND
  auth.uid() IN (
    SELECT id FROM profiles
    WHERE role IN ('SOURCER', 'ADMIN')
  )
);
