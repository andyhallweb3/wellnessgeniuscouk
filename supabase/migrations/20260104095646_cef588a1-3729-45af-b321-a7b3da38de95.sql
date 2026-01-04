-- Update the handle_new_user_free_tier function to add new users to newsletter subscribers
CREATE OR REPLACE FUNCTION public.handle_new_user_free_tier()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Give new users free advisor credits
  INSERT INTO public.free_tier_access (user_id, feature, credits_remaining, trial_expires_at)
  VALUES (NEW.id, 'advisor', 10, now() + interval '14 days');
  
  -- Link any existing AI Readiness completions with matching email
  UPDATE public.ai_readiness_completions
  SET user_id = NEW.id
  WHERE email = NEW.email
    AND user_id IS NULL;
  
  -- Add user to newsletter subscribers if not already subscribed
  INSERT INTO public.newsletter_subscribers (email, name, source, is_active)
  VALUES (
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    'account-signup',
    true
  )
  ON CONFLICT (email) DO UPDATE SET
    is_active = true,
    name = COALESCE(EXCLUDED.name, newsletter_subscribers.name);
  
  -- Check if user is a newsletter subscriber and grant free prompt pack
  IF EXISTS (
    SELECT 1 FROM public.newsletter_subscribers 
    WHERE email = NEW.email AND is_active = true
  ) THEN
    -- Only insert if they don't already have this product
    IF NOT EXISTS (
      SELECT 1 FROM public.product_downloads
      WHERE email = NEW.email AND product_id = 'prompt-pack'
    ) THEN
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
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;