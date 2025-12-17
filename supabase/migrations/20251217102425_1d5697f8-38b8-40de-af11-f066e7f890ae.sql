-- Add business_lens column to rss_news_cache table
ALTER TABLE public.rss_news_cache 
ADD COLUMN business_lens text;