-- Create table to track AI Readiness Index completions
CREATE TABLE public.ai_readiness_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  company text,
  role text,
  industry text,
  company_size text,
  overall_score integer NOT NULL,
  leadership_score integer,
  data_score integer,
  people_score integer,
  process_score integer,
  risk_score integer,
  score_band text,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.ai_readiness_completions ENABLE ROW LEVEL SECURITY;

-- Only service role can read completions (protects PII)
CREATE POLICY "Only service role can read completions"
ON public.ai_readiness_completions
FOR SELECT
USING (false);

-- Service role can insert completions
CREATE POLICY "Service role can insert completions"
ON public.ai_readiness_completions
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_ai_readiness_completions_completed_at ON public.ai_readiness_completions(completed_at DESC);