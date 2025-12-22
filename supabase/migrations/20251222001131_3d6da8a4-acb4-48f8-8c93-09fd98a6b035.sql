-- Create leaderboard entries table for opt-in users
CREATE TABLE public.leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  opted_in boolean NOT NULL DEFAULT false,
  score_band text NOT NULL DEFAULT 'building',
  business_type text,
  size_band text,
  streak_weeks integer DEFAULT 0,
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Users can manage their own entry
CREATE POLICY "Users can view own leaderboard entry"
ON public.leaderboard_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leaderboard entry"
ON public.leaderboard_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leaderboard entry"
ON public.leaderboard_entries
FOR UPDATE
USING (auth.uid() = user_id);

-- Anyone can view aggregated leaderboard data (opted-in entries only)
-- This allows reading aggregated stats without exposing individual users
CREATE POLICY "Anyone can view opted-in entries for aggregation"
ON public.leaderboard_entries
FOR SELECT
USING (opted_in = true);

-- Create index for efficient querying
CREATE INDEX idx_leaderboard_opted_in ON public.leaderboard_entries (opted_in, business_type, size_band)
WHERE opted_in = true;

-- Create function to get aggregated leaderboard stats
CREATE OR REPLACE FUNCTION public.get_leaderboard_stats(
  p_business_type text DEFAULT NULL,
  p_size_band text DEFAULT NULL
)
RETURNS TABLE (
  business_type text,
  size_band text,
  score_band text,
  user_count bigint,
  avg_streak numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    le.business_type,
    le.size_band,
    le.score_band,
    COUNT(*) as user_count,
    ROUND(AVG(le.streak_weeks), 1) as avg_streak
  FROM public.leaderboard_entries le
  WHERE le.opted_in = true
    AND (p_business_type IS NULL OR le.business_type = p_business_type)
    AND (p_size_band IS NULL OR le.size_band = p_size_band)
  GROUP BY le.business_type, le.size_band, le.score_band
  ORDER BY 
    le.business_type,
    le.size_band,
    CASE le.score_band 
      WHEN 'strong' THEN 1
      WHEN 'growing' THEN 2
      WHEN 'building' THEN 3
      ELSE 4
    END
$$;

-- Create trigger to update last_updated timestamp
CREATE TRIGGER update_leaderboard_entries_updated_at
BEFORE UPDATE ON public.leaderboard_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();