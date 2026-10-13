-- Full entity decode (named + numeric), then strip tags revealed by decoding.
CREATE OR REPLACE FUNCTION public.news_decode_full(t text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE m text[]; i int;
BEGIN
  IF t IS NULL THEN RETURN NULL; END IF;
  FOR i IN 1..2 LOOP
    t := replace(replace(replace(replace(replace(replace(replace(replace(t,
      '&lt;','<'),'&gt;','>'),'&quot;','"'),'&apos;',''''),'&nbsp;',' '),'&mdash;','—'),'&ndash;','–'),'&hellip;','…');
    t := replace(replace(replace(replace(t,'&rsquo;','’'),'&lsquo;','‘'),'&ldquo;','“'),'&rdquo;','”');
    FOR m IN SELECT regexp_matches(t, '&#([0-9]{1,7});', 'g') LOOP
      t := replace(t, '&#'||m[1]||';', chr(m[1]::int));
    END LOOP;
    FOR m IN SELECT regexp_matches(t, '&#[xX]([0-9a-fA-F]{1,6});', 'g') LOOP
      t := replace(t, '&#x'||m[1]||';', chr(('x'||lpad(m[1],8,'0'))::bit(32)::int));
      t := replace(t, '&#X'||m[1]||';', chr(('x'||lpad(m[1],8,'0'))::bit(32)::int));
    END LOOP;
    t := replace(t,'&amp;','&');
  END LOOP;
  t := regexp_replace(t, '<[^>]+>', ' ', 'g');
  t := replace(t, chr(160), ' ');
  RETURN btrim(regexp_replace(t, '\s+', ' ', 'g'));
END $$;

UPDATE public.rss_news_cache
SET title = public.news_decode_full(title), summary = public.news_decode_full(summary)
WHERE title ~ '&[a-zA-Z#0-9]+;|<' OR summary ~ '&[a-zA-Z#0-9]+;|<';
