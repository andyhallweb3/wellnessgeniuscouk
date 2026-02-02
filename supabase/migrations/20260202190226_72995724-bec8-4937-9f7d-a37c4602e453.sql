-- Add column to track last Telegram send time
ALTER TABLE public.rss_cache_metadata 
ADD COLUMN IF NOT EXISTS last_telegram_send TIMESTAMP WITH TIME ZONE;