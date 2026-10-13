-- Sector tags for news items: hotels-spas, fitness, clinics, country-clubs
ALTER TABLE public.rss_news_cache ADD COLUMN IF NOT EXISTS sectors text[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS rss_news_cache_sectors_idx ON public.rss_news_cache USING gin (sectors);

-- Backfill existing rows from source and keywords (same rules as fetch-rss-news)
UPDATE public.rss_news_cache SET sectors = ARRAY(SELECT DISTINCT unnest(
  (CASE WHEN source_name IN ('Spa Business','Hotel Management') OR title || ' ' || coalesce(summary,'') ~* '\m(hotels?|hospitality|resorts?|spas?|thermal|bathhouse|hotelier)\M' THEN ARRAY['hotels-spas'] ELSE ARRAY[]::text[] END) ||
  (CASE WHEN source_name IN ('HCM Magazine','Club Industry','Athletech News') OR title || ' ' || coalesce(summary,'') ~* '\m(gyms?|fitness|health clubs?|leisure centres?|boutique fitness|personal training|pilates|ukactive)\M' THEN ARRAY['fitness'] ELSE ARRAY[]::text[] END) ||
  (CASE WHEN title || ' ' || coalesce(summary,'') ~* '\m(clinics?|med ?spas?|medspas?|aesthetics?|longevity|cryotherapy|hyperbaric|physiotherapy|diagnostics|preventive health|dermatology)\M' THEN ARRAY['clinics'] ELSE ARRAY[]::text[] END) ||
  (CASE WHEN title || ' ' || coalesce(summary,'') ~* '\m(country clubs?|private clubs?|golf|members'' club|club management)\M' THEN ARRAY['country-clubs'] ELSE ARRAY[]::text[] END)
));
