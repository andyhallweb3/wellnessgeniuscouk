-- Create product_downloads table to track all downloads
CREATE TABLE public.product_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL DEFAULT 'free',
  download_type TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  upsell_email_sent BOOLEAN DEFAULT false,
  upsell_email_sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.product_downloads ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read all downloads
CREATE POLICY "Admins can read all downloads"
ON public.product_downloads
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Policy for admins to update downloads (for marking upsell emails sent)
CREATE POLICY "Admins can update downloads"
ON public.product_downloads
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- Allow inserts from authenticated and anonymous users (for tracking)
CREATE POLICY "Anyone can insert downloads"
ON public.product_downloads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_product_downloads_email ON public.product_downloads(email);
CREATE INDEX idx_product_downloads_product_id ON public.product_downloads(product_id);
CREATE INDEX idx_product_downloads_created_at ON public.product_downloads(created_at DESC);