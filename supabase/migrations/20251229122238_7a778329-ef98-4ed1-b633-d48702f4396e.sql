-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Only service role can read completions" ON public.ai_readiness_completions;

-- Create a policy allowing users to read their own completions by email
CREATE POLICY "Users can view their own completions by email"
ON public.ai_readiness_completions
FOR SELECT
USING (email = get_current_user_email());

-- Also allow service role to read all (for admin purposes)
CREATE POLICY "Service role can read all completions"
ON public.ai_readiness_completions
FOR SELECT
USING (true);