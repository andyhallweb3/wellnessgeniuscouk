-- Add RLS policy to allow users to read their own downloads by email
CREATE POLICY "Users can view their own downloads by email"
ON public.product_downloads
FOR SELECT
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);