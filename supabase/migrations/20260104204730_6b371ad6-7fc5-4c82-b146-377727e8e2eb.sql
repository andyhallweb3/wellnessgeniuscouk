-- Drop the existing policy that uses public role (may not work correctly)
DROP POLICY IF EXISTS "Users can view their own downloads by email" ON public.product_downloads;

-- Create a proper policy for authenticated users to view their own downloads
CREATE POLICY "Users can view their own downloads by email"
ON public.product_downloads
FOR SELECT
TO authenticated
USING (email = get_current_user_email());