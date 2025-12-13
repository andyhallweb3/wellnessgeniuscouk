-- Add restrictive SELECT policy to prevent public access to subscriber data
-- Only service_role (backend/admin operations) can read subscriber data
CREATE POLICY "Only service role can read subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (false);

-- This ensures no one can SELECT from the table via the client API
-- Admin access is still possible via service_role key in backend/edge functions