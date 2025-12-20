-- Add A/B testing columns to product_downloads table
ALTER TABLE public.product_downloads 
ADD COLUMN IF NOT EXISTS ab_variant text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ab_subject_line text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_opened boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_opened_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS email_clicked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_clicked_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS converted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS converted_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conversion_product text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS conversion_value numeric DEFAULT NULL;

-- Create index for A/B analytics queries
CREATE INDEX IF NOT EXISTS idx_product_downloads_ab_variant ON public.product_downloads(ab_variant);
CREATE INDEX IF NOT EXISTS idx_product_downloads_converted ON public.product_downloads(converted);

-- Update RLS to allow service role to update for tracking
DROP POLICY IF EXISTS "Service role can update downloads" ON public.product_downloads;
CREATE POLICY "Service role can update downloads" 
ON public.product_downloads 
FOR UPDATE 
USING (true)
WITH CHECK (true);