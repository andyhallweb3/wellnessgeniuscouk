-- Remove public read access from newsletter_sends table
-- This prevents competitors from seeing email content and metrics

DROP POLICY IF EXISTS "Anyone can view newsletter sends" ON public.newsletter_sends;

-- Only service role can read (admin panel uses service_role key)
CREATE POLICY "Only service role can read newsletter sends"
ON public.newsletter_sends
FOR SELECT
USING (false);