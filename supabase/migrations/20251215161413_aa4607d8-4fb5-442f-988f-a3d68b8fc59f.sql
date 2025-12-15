-- Create a public storage bucket for cached proxy images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'image-cache', 
  'image-cache', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
);

-- Allow anyone to read cached images (they're public proxied content)
CREATE POLICY "Anyone can view cached images"
ON storage.objects FOR SELECT
USING (bucket_id = 'image-cache');

-- Only service role can write to the cache
CREATE POLICY "Service role can insert cached images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'image-cache');

CREATE POLICY "Service role can update cached images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'image-cache');

CREATE POLICY "Service role can delete cached images"
ON storage.objects FOR DELETE
USING (bucket_id = 'image-cache');