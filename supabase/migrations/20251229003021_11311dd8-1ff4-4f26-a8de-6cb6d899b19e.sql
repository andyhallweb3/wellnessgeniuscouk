-- Add a new column for multiple perspectives
ALTER TABLE public.business_profiles
ADD COLUMN IF NOT EXISTS preferred_perspectives text[] DEFAULT ARRAY['ceo']::text[];