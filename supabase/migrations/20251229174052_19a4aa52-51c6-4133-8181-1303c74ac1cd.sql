-- Drop existing overly permissive SELECT policies on ai_readiness_completions
DROP POLICY IF EXISTS "Service role can read all completions" ON public.ai_readiness_completions;
DROP POLICY IF EXISTS "Users can view their own completions" ON public.ai_readiness_completions;
DROP POLICY IF EXISTS "Anyone can view completions by email" ON public.ai_readiness_completions;

-- Create admin-only SELECT policy
CREATE POLICY "Only admins can read completions"
ON public.ai_readiness_completions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Keep INSERT policy for edge function (uses service role, bypasses RLS)
-- The edge function already uses service role key which bypasses RLS for inserts