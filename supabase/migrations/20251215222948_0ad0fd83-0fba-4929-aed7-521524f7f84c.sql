-- Fix: Restrict articles to only show processed (published) content
DROP POLICY IF EXISTS "Anyone can view articles" ON public.articles;

CREATE POLICY "Anyone can view processed articles"
ON public.articles FOR SELECT
USING (processed = true);

-- Add email format validation constraint to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
ADD CONSTRAINT valid_email_format
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');