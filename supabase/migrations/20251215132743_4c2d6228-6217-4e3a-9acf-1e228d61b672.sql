-- Create table to cache RSS news items
CREATE TABLE public.rss_news_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL,
  source_url text NOT NULL,
  source_name text NOT NULL,
  category text NOT NULL,
  image_url text,
  published_date timestamp with time zone NOT NULL,
  fetched_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_rss_news_cache_fetched_at ON public.rss_news_cache(fetched_at DESC);
CREATE INDEX idx_rss_news_cache_category ON public.rss_news_cache(category);
CREATE INDEX idx_rss_news_cache_published_date ON public.rss_news_cache(published_date DESC);

-- Enable RLS
ALTER TABLE public.rss_news_cache ENABLE ROW LEVEL SECURITY;

-- Allow public read access (news is public)
CREATE POLICY "Anyone can view cached news"
ON public.rss_news_cache
FOR SELECT
USING (true);

-- Create a metadata table to track last refresh time
CREATE TABLE public.rss_cache_metadata (
  id text PRIMARY KEY DEFAULT 'global',
  last_refresh timestamp with time zone NOT NULL DEFAULT now(),
  items_count integer NOT NULL DEFAULT 0
);

-- Allow public read access to metadata
ALTER TABLE public.rss_cache_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cache metadata"
ON public.rss_cache_metadata
FOR SELECT
USING (true);

-- Insert initial metadata row
INSERT INTO public.rss_cache_metadata (id, last_refresh, items_count) 
VALUES ('global', '1970-01-01', 0);