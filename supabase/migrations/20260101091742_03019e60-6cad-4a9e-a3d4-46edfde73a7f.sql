-- Update the handle_new_user_free_tier function to also link assessments
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
  
  -- Link any existing AI Readiness completions with matching email
  UPDATE public.ai_readiness_completions
  SET user_id = NEW.id
  WHERE email = NEW.email
    AND user_id IS NULL;
  
  RETURN NEW;
END;
$$;