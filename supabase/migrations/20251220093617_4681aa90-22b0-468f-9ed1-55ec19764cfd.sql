-- Add additional personal context fields to coach_profiles
ALTER TABLE public.coach_profiles 
ADD COLUMN IF NOT EXISTS business_name text,
ADD COLUMN IF NOT EXISTS team_size text,
ADD COLUMN IF NOT EXISTS current_tech text,
ADD COLUMN IF NOT EXISTS ai_experience text,
ADD COLUMN IF NOT EXISTS biggest_win text,
ADD COLUMN IF NOT EXISTS decision_style text;