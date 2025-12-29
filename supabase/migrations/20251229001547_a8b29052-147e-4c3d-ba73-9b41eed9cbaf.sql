-- Create storage bucket for founder uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('founder-uploads', 'founder-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'founder-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'founder-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'founder-uploads' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);