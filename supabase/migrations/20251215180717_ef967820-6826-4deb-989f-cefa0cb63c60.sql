-- Add explicit INSERT policy to deny public inserts to blog_posts
CREATE POLICY "No public inserts to blog posts"
ON public.blog_posts
FOR INSERT
WITH CHECK (false);