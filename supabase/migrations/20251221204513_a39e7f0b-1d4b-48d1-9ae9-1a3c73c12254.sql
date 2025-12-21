-- Drop the problematic RLS policy that references auth.users directly
DROP POLICY IF EXISTS "Users can view their own downloads by email" ON public.product_downloads;

-- Create a security definer function to safely get the current user's email
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Create a new RLS policy using the security definer function
CREATE POLICY "Users can view their own downloads by email"
ON public.product_downloads
FOR SELECT
USING (email = get_current_user_email());