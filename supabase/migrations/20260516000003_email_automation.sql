-- Email automation log: tracks sent emails to prevent duplicates
CREATE TABLE IF NOT EXISTS public.email_automation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_automation_log_user_type ON public.email_automation_log (user_id, email_type);
CREATE INDEX IF NOT EXISTS email_automation_log_sent_at ON public.email_automation_log (sent_at);

ALTER TABLE public.email_automation_log ENABLE ROW LEVEL SECURITY;

-- Service role only — edge functions use service key
CREATE POLICY "Service role can manage email log"
  ON public.email_automation_log
  USING (false);

-- Trigger function: fires welcome email when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_welcome_email()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amlzc3Rlb21iZXljbmhveWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTQwODQsImV4cCI6MjA4NjY3MDA4NH0.qmqHXQu5_7niJG0_c6FZkyTi_n12IkyZXvI_0jPFv5A'
    ),
    body := jsonb_build_object(
      'user_id', NEW.id::text,
      'email', NEW.email,
      'full_name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_send_welcome ON auth.users;
CREATE TRIGGER on_auth_user_created_send_welcome
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_welcome_email();

-- Fix existing RSS cron to use correct project URL
SELECT cron.unschedule('fetch-rss-news-hourly');

SELECT cron.schedule(
  'fetch-rss-news-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/fetch-rss-news',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amlzc3Rlb21iZXljbmhveWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTQwODQsImV4cCI6MjA4NjY3MDA4NH0.qmqHXQu5_7niJG0_c6FZkyTi_n12IkyZXvI_0jPFv5A"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Weekly AI operator nudge — every Monday at 9am UTC
SELECT cron.unschedule('send-operator-nudge-weekly') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-operator-nudge-weekly'
);

SELECT cron.schedule(
  'send-operator-nudge-weekly',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/send-operator-nudge',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amlzc3Rlb21iZXljbmhveWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTQwODQsImV4cCI6MjA4NjY3MDA4NH0.qmqHXQu5_7niJG0_c6FZkyTi_n12IkyZXvI_0jPFv5A"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Daily onboarding drip — every day at 9am UTC
SELECT cron.schedule(
  'send-onboarding-email-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/send-onboarding-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amlzc3Rlb21iZXljbmhveWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTQwODQsImV4cCI6MjA4NjY3MDA4NH0.qmqHXQu5_7niJG0_c6FZkyTi_n12IkyZXvI_0jPFv5A"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Weekly re-engagement — every Wednesday at 10am UTC
SELECT cron.schedule(
  'send-reengagement-email-weekly',
  '0 10 * * 3',
  $$
  SELECT net.http_post(
    url := 'https://vzjissteombeycnhoyhz.supabase.co/functions/v1/send-reengagement-email',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6amlzc3Rlb21iZXljbmhveWh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwOTQwODQsImV4cCI6MjA4NjY3MDA4NH0.qmqHXQu5_7niJG0_c6FZkyTi_n12IkyZXvI_0jPFv5A"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
