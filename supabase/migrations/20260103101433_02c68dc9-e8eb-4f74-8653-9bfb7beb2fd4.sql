-- Add coupon tracking columns to newsletter_subscribers table
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS coupon_used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS coupon_product_id TEXT DEFAULT NULL;