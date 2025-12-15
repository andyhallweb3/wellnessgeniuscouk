-- Add restrictive UPDATE and DELETE policies to blog_posts table
-- This prevents any public user from modifying blog content

CREATE POLICY "No public updates to blog posts"
ON public.blog_posts
FOR UPDATE
USING (false)
WITH CHECK (false);

CREATE POLICY "No public deletes of blog posts"
ON public.blog_posts
FOR DELETE
USING (false);