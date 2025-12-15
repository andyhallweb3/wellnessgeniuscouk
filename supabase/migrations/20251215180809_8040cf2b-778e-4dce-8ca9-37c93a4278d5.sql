-- Remove the overly permissive UPDATE policy
DROP POLICY IF EXISTS "Anyone can unsubscribe" ON public.newsletter_subscribers;