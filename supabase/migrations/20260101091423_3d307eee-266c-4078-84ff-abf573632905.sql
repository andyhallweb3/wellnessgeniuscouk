-- Create free tier access table to track trial periods
CREATE TABLE public.free_tier_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 5,
  trial_expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature)
);

-- Enable RLS
ALTER TABLE public.free_tier_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own access
CREATE POLICY "Users can view own free tier access"
ON public.free_tier_access
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own access (for credit deduction)
CREATE POLICY "Users can update own free tier access"
ON public.free_tier_access
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert (for auto-creation on signup)
CREATE POLICY "Service role can insert free tier access"
ON public.free_tier_access
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create function to auto-create free tier access on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_free_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Give new users free advisor credits
  INSERT INTO public.free_tier_access (user_id, feature, credits_remaining, trial_expires_at)
  VALUES (NEW.id, 'advisor', 10, now() + interval '14 days');
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create free tier access
CREATE TRIGGER on_auth_user_created_free_tier
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_free_tier();

-- Add column to link ai_readiness_completions to users
ALTER TABLE public.ai_readiness_completions 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add RLS policy for users to view their linked completions
CREATE POLICY "Users can view their linked completions"
ON public.ai_readiness_completions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to update their own completions (to link them)
CREATE POLICY "Users can update their own completions"
ON public.ai_readiness_completions
FOR UPDATE
USING (user_id IS NULL OR auth.uid() = user_id);