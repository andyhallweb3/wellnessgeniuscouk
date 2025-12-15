-- Allow service role to manage cache (INSERT, UPDATE, DELETE)
-- These operations will be done via service_role key in edge function

CREATE POLICY "Service role can insert cache"
ON public.rss_news_cache
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update cache"
ON public.rss_news_cache
FOR UPDATE
USING (true);

CREATE POLICY "Service role can delete cache"
ON public.rss_news_cache
FOR DELETE
USING (true);

CREATE POLICY "Service role can insert metadata"
ON public.rss_cache_metadata
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update metadata"
ON public.rss_cache_metadata
FOR UPDATE
USING (true);