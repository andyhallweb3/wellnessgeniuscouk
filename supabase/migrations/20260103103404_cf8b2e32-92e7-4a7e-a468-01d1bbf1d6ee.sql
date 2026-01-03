-- Update the handle_new_user_free_tier function to also grant free prompt pack to newsletter subscribers
CREATE OR REPLACE FUNCTION public.handle_new_user_free_tier()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  -- Check if user is a newsletter subscriber and grant free prompt pack
  IF EXISTS (
    SELECT 1 FROM public.newsletter_subscribers 
    WHERE email = NEW.email AND is_active = true
  ) THEN
    -- Insert a product_downloads record for the free prompt pack
    INSERT INTO public.product_downloads (
      email,
      product_id,
      product_name,
      download_type,
      product_type
    ) VALUES (
      NEW.email,
      'prompt-pack',
      'Wellness AI Prompt Pack',
      'subscriber-gift',
      'free'
    )
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;