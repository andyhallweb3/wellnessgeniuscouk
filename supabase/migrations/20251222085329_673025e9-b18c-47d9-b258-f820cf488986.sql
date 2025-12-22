-- Email-based rate limiting for AI Readiness Completions
CREATE OR REPLACE FUNCTION public.check_readiness_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many completions this email submitted in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.ai_readiness_completions
  WHERE email = NEW.email
    AND completed_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 3 attempts per hour per email
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER readiness_rate_limit_trigger
  BEFORE INSERT ON public.ai_readiness_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_readiness_rate_limit();

-- IP-based rate limiting for AI Readiness Completions
CREATE OR REPLACE FUNCTION public.check_readiness_ip_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_ip_count INTEGER;
BEGIN
  -- If IP is provided, check IP-based rate limit
  IF NEW.ip_address IS NOT NULL THEN
    SELECT COUNT(*) INTO recent_ip_count
    FROM public.ai_readiness_completions
    WHERE ip_address = NEW.ip_address
      AND completed_at > NOW() - INTERVAL '1 hour';
    
    -- Allow max 10 assessments per IP per hour
    IF recent_ip_count >= 10 THEN
      RAISE EXCEPTION 'Too many requests from this location. Please try again later.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER readiness_ip_rate_limit_trigger
  BEFORE INSERT ON public.ai_readiness_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_readiness_ip_rate_limit();