-- Fix 1: report_shares - Require share_token match for SELECT instead of open access
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view shares by token" ON public.report_shares;

-- Create a proper policy that requires knowing the token
-- Users can only view a share if they provide the correct token in their query
-- This prevents enumeration attacks while still allowing token-based access
CREATE POLICY "View shares only with valid token lookup"
ON public.report_shares
FOR SELECT
USING (
  -- Shares can be viewed via RPC function that validates the token
  -- For direct table access, only allow users to see their own shares if authenticated
  EXISTS (
    SELECT 1 FROM public.ai_readiness_completions arc
    WHERE arc.id = report_shares.completion_id
    AND arc.email = public.get_current_user_email()
  )
);

-- Create a security definer function to safely look up shares by token
-- This allows public token lookups without exposing the entire table
CREATE OR REPLACE FUNCTION public.get_share_by_token(p_share_token text)
RETURNS TABLE (
  id uuid,
  completion_id uuid,
  share_token text,
  view_count integer,
  expires_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, completion_id, share_token, view_count, expires_at, created_at
  FROM public.report_shares
  WHERE share_token = p_share_token
  AND (expires_at IS NULL OR expires_at > now())
$$;

-- Grant execute to anon and authenticated for public share access
GRANT EXECUTE ON FUNCTION public.get_share_by_token(text) TO anon, authenticated;