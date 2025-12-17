-- Add RLS policies for admin blog post management
CREATE POLICY "Admins can insert blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update blog posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.is_admin());