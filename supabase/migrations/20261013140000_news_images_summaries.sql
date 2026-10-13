ALTER TABLE public.rss_news_cache ADD COLUMN IF NOT EXISTS image_url text;

-- Strip WordPress "The post ... appeared first on ..." boilerplate and trailing "Read more".
UPDATE public.rss_news_cache
SET summary = btrim(regexp_replace(summary, '\s*The post .*? appeared first on .*?\.?\s*$', '', 'i'))
WHERE summary ~* 'appeared first on';

UPDATE public.rss_news_cache
SET summary = btrim(regexp_replace(summary, '\s*(Continue reading|Read more)\s*(\.\.\.|…)?\s*$', '', 'i'))
WHERE summary ~* '(Continue reading|Read more)\s*(\.\.\.|…)?\s*$';

-- Blank out junk or placeholder summaries.
UPDATE public.rss_news_cache SET summary = ''
WHERE summary IS NOT NULL AND (length(btrim(summary)) < 15
   OR btrim(summary) ~* '^(x+|test|lorem ipsum.*|n/?a|null|undefined|\.+|-+)$'
   OR summary = 'Read more at source...');
