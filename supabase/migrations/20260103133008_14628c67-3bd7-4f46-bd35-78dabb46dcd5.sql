-- Add delivery tracking to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS last_delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivery_count integer DEFAULT 0;

-- Create index for delivery status queries
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_delivery 
ON public.newsletter_subscribers (is_active, bounced, last_delivered_at);