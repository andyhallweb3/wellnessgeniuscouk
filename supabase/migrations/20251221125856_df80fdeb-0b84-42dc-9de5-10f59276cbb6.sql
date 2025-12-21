
-- Create a rate limiting function for newsletter subscribers
-- Limits to 3 subscription attempts per email per hour
CREATE OR REPLACE FUNCTION public.check_newsletter_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many times this email has tried to subscribe in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.newsletter_subscribers
  WHERE email = NEW.email
    AND subscribed_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 3 attempts per hour per email
  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for newsletter rate limiting
DROP TRIGGER IF EXISTS newsletter_rate_limit_trigger ON public.newsletter_subscribers;
CREATE TRIGGER newsletter_rate_limit_trigger
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_newsletter_rate_limit();

-- Create a rate limiting function for product downloads
-- Limits to 5 downloads per email per hour
CREATE OR REPLACE FUNCTION public.check_download_rate_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count INTEGER;
BEGIN
  -- Check how many downloads this email has made in the last hour
  SELECT COUNT(*) INTO recent_count
  FROM public.product_downloads
  WHERE email = NEW.email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Allow max 5 downloads per hour per email
  IF recent_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please try again later.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for download rate limiting
DROP TRIGGER IF EXISTS download_rate_limit_trigger ON public.product_downloads;
CREATE TRIGGER download_rate_limit_trigger
  BEFORE INSERT ON public.product_downloads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_download_rate_limit();

-- Add IP-based rate limiting for newsletter (additional protection)
CREATE OR REPLACE FUNCTION public.check_newsletter_ip_rate_limit()
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
    FROM public.newsletter_subscribers
    WHERE ip_address = NEW.ip_address
      AND subscribed_at > NOW() - INTERVAL '1 hour';
    
    -- Allow max 10 subscriptions per IP per hour
    IF recent_ip_count >= 10 THEN
      RAISE EXCEPTION 'Too many requests from this location. Please try again later.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add IP column to newsletter_subscribers if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'newsletter_subscribers' 
    AND column_name = 'ip_address'
  ) THEN
    ALTER TABLE public.newsletter_subscribers ADD COLUMN ip_address text;
  END IF;
END $$;

-- Create IP rate limit trigger for newsletter
DROP TRIGGER IF EXISTS newsletter_ip_rate_limit_trigger ON public.newsletter_subscribers;
CREATE TRIGGER newsletter_ip_rate_limit_trigger
  BEFORE INSERT ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.check_newsletter_ip_rate_limit();

-- Add IP-based rate limiting for downloads
CREATE OR REPLACE FUNCTION public.check_download_ip_rate_limit()
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
    FROM public.product_downloads
    WHERE ip_address = NEW.ip_address
      AND created_at > NOW() - INTERVAL '1 hour';
    
    -- Allow max 20 downloads per IP per hour
    IF recent_ip_count >= 20 THEN
      RAISE EXCEPTION 'Too many requests from this location. Please try again later.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create IP rate limit trigger for downloads
DROP TRIGGER IF EXISTS download_ip_rate_limit_trigger ON public.product_downloads;
CREATE TRIGGER download_ip_rate_limit_trigger
  BEFORE INSERT ON public.product_downloads
  FOR EACH ROW
  EXECUTE FUNCTION public.check_download_ip_rate_limit();
