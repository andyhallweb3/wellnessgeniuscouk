-- Aesthetic Medicine moves to keyword tagging; country-club Google News query changed (new source name kept).
CREATE OR REPLACE FUNCTION public.news_decode_entities(p text) RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT replace(replace(replace(replace(replace(replace(replace(replace(replace(replace(
    replace(coalesce(p,''), '&amp;amp;', '&'),
    '&amp;', '&'), '&quot;', '"'), '&#39;', ''''), '&#039;', ''''), '&apos;', ''''),
    '&rsquo;', ''''), '&lsquo;', ''''), '&ldquo;', '"'), '&rdquo;', '"'), '&nbsp;', ' ')
$$;

UPDATE public.rss_news_cache
SET title = public.news_decode_entities(title),
    summary = public.news_decode_entities(summary)
WHERE title ~ '&[a-z#0-9]+;' OR summary ~ '&[a-z#0-9]+;';

-- Aesthetic Medicine is no longer a trusted clinics source.
CREATE OR REPLACE FUNCTION public.news_sectors_for(p_source text, p_text text)
RETURNS text[] LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  t text := coalesce(p_text, '');
  tags text[] := '{}';
BEGIN
  CASE p_source
    WHEN 'Hospitality Net','Hotel Designs','Hotel Owner','Hotelier Middle East','Google News: hotel spa','Spa Business','Hotel Management' THEN RETURN ARRAY['hotels-spas'];
    WHEN 'Global Wellness Summit','Global Wellness Institute' THEN RETURN ARRAY['hotels-spas','clinics'];
    WHEN 'Aesthetics Journal','Lifespan.io','Google News: clinics' THEN RETURN ARRAY['clinics'];
    WHEN 'Club + Resort Business','Google News: country clubs' THEN RETURN ARRAY['country-clubs'];
    WHEN 'HCM Magazine','Club Industry','Athletech News','Athletic Business','Fitt Insider' THEN RETURN ARRAY['fitness'];
    ELSE NULL;
  END CASE;
  IF regexp_count(t, '\m(hotels?|hotelier|hospitality|resorts?|day spas?|hotel spas?|spa (resort|business|operator|menu|director)s?|thermal spas?|wellness (retreat|resort|tourism|travel)s?)\M', 1, 'i') >= 1
     OR regexp_count(t, '\m(spas?|guests?|bookings?|thermal|sauna|bathhouse|retreats?|travel)\M', 1, 'i') >= 2 THEN tags := array_append(tags, 'hotels-spas'); END IF;
  IF regexp_count(t, '\m(gyms?|fitness|health clubs?|leisure centres?|ukactive|ihrsa|personal train(er|ers|ing)|boutique fitness)\M', 1, 'i') >= 1
     OR regexp_count(t, '\m(studios?|yoga|pilates|strength|workouts?|exercise|members(hip)?|classes|trainers?)\M', 1, 'i') >= 2 THEN tags := array_append(tags, 'fitness'); END IF;
  IF regexp_count(t, '\m(clinics?|med ?spas?|medspas?|aesthetic (clinic|medicine|practitioner|treatment)s?|longevity|hyperbaric|cryotherapy|dermatolog(y|ist|ists))\M', 1, 'i') >= 1
     OR regexp_count(t, '\m(patients?|diagnostics?|physiotherap(y|ist)|iv drips?|red light|injectables?|botox|healthspan|biomarkers?)\M', 1, 'i') >= 2 THEN tags := array_append(tags, 'clinics'); END IF;
  IF regexp_count(t, '\m(country clubs?|private clubs?|golf (clubs?|courses?|resorts?)|members''? clubs?|club manag(er|ers|ement))\M', 1, 'i') >= 1
     OR regexp_count(t, '\m(golf(ers)?|tennis|racquet|padel|clubhouse|members?)\M', 1, 'i') >= 2 THEN tags := array_append(tags, 'country-clubs'); END IF;
  RETURN tags;
END $$;

UPDATE public.rss_news_cache
SET sectors = public.news_sectors_for(source_name, title || ' ' || coalesce(summary, ''))
WHERE source_name = 'Aesthetic Medicine';

-- Untag college and university sport picked up by the old country-club query.
UPDATE public.rss_news_cache SET sectors = '{}'
WHERE source_name = 'Google News: country clubs' AND title ~* '\m(college|university|ncaa|athletics)\M';
