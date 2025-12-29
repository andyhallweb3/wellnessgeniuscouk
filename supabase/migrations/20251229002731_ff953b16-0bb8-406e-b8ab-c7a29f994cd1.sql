-- Drop existing constraint and add new one with CFO and CTO
ALTER TABLE public.business_profiles
DROP CONSTRAINT IF EXISTS valid_perspective;

ALTER TABLE public.business_profiles
ADD CONSTRAINT valid_perspective CHECK (preferred_perspective IN ('ceo', 'cmo', 'cfo', 'cto', 'investor'));