-- Add bounced tracking to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers 
ADD COLUMN IF NOT EXISTS bounced boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bounced_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS bounce_type text;

-- Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active_not_bounced 
ON public.newsletter_subscribers (is_active, bounced) 
WHERE is_active = true AND bounced = false;