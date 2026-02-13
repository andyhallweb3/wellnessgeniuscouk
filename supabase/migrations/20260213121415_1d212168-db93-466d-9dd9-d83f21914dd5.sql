
SELECT cron.schedule(
  'fetch-rss-news-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url:='https://hiayegpvrsxhhemyxghz.supabase.co/functions/v1/fetch-rss-news',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXllZ3B2cnN4aGhlbXl4Z2h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NzMxMjIsImV4cCI6MjA4MTE0OTEyMn0.SN229Dz1Edqp1Ru_cxyu_3z9EoOUNeCuSpvaDhflnTI"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
