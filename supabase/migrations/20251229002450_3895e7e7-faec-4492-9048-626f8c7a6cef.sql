-- Add preferred_perspective column to business_profiles
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS preferred_perspective text DEFAULT 'ceo';

-- Add constraint to ensure valid values
ALTER TABLE public.business_profiles
ADD CONSTRAINT valid_perspective CHECK (preferred_perspective IN ('ceo', 'cmo', 'investor'));