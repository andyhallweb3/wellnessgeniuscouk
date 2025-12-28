-- Create founder guardrails table for strategic boundaries
CREATE TABLE public.founder_guardrails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  section_id text NOT NULL,
  items text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Enable RLS
ALTER TABLE public.founder_guardrails ENABLE ROW LEVEL SECURITY;

-- Only admins can view guardrails
CREATE POLICY "Admins can view guardrails"
ON public.founder_guardrails
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert guardrails
CREATE POLICY "Admins can insert guardrails"
ON public.founder_guardrails
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

-- Only admins can update guardrails
CREATE POLICY "Admins can update guardrails"
ON public.founder_guardrails
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

-- Only admins can delete guardrails
CREATE POLICY "Admins can delete guardrails"
ON public.founder_guardrails
FOR DELETE
USING (public.has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_founder_guardrails_updated_at
BEFORE UPDATE ON public.founder_guardrails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();