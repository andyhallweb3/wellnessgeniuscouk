DO \ jid bigint;
BEGIN
  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'fetch-rss-news-hourly';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;

  SELECT jobid INTO jid FROM cron.job WHERE jobname = 'newsletter-auto-send-weekly';
  IF jid IS NOT NULL THEN PERFORM cron.unschedule(jid); END IF;
END \$;

-- NOTE:
-- Replace {{NEWSLETTER_AUTOMATION_SECRET}} with your `NEWSLETTER_AUTOMATION_SECRET`
-- when running this in the Supabase SQL editor. Do NOT commit real secrets to git.

SELECT cron.schedule(
  'fetch-rss-news-hourly',
  '0 * * * *',
  \$  SELECT net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/fetch-rss-news',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  \$);

SELECT cron.schedule(
  'newsletter-auto-send-weekly',
  '0 8 * * 1',
  \$  SELECT net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/newsletter-run',
    headers := '{"Content-Type":"application/json","x-newsletter-secret":"{{NEWSLETTER_AUTOMATION_SECRET}}"}'::jsonb,
    body := '{"action":"auto-send"}'::jsonb
  ) AS request_id;
  \$);
