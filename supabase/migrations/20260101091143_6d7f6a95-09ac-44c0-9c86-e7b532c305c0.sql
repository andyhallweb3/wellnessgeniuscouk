-- Add RLS policy to allow public viewing of AI Readiness results within 24 hours of completion
CREATE POLICY "Public can view recent completions by ID"
ON public.ai_readiness_completions
FOR SELECT
USING (
  completed_at > (now() - interval '24 hours')
);