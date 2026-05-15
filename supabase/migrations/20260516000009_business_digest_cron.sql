-- Monday morning business digest — 7am UTC every Monday
SELECT cron.schedule(
  'send-business-digest-monday',
  '0 7 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/send-business-digest',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amlzc3Rlb21iZXljbmhveWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTQwODQsImV4cCI6MjA4NjY3MDA4NH0.qmqHXQu5_7niJG0_c6FZkyTi_n12IkyZXvI_0jPFv5A"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
