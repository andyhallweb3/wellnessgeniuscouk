-- Track per-recipient send state to make newsletter sends idempotent and resumable
CREATE TABLE IF NOT EXISTS public.newsletter_send_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  send_id uuid NOT NULL REFERENCES public.newsletter_sends(id) ON DELETE CASCADE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | sent | failed
  error_message text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz NULL
);

-- Add article_ids to newsletter_sends so sends can be resumed deterministically
ALTER TABLE public.newsletter_sends
ADD COLUMN IF NOT EXISTS article_ids uuid[];

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS newsletter_send_recipients_send_email_uidx
ON public.newsletter_send_recipients (send_id, (lower(email)));

CREATE INDEX IF NOT EXISTS newsletter_send_recipients_send_status_idx
ON public.newsletter_send_recipients (send_id, status);

-- Enable RLS
ALTER TABLE public.newsletter_send_recipients ENABLE ROW LEVEL SECURITY;

-- Policies (no IF NOT EXISTS support; use guards)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_send_recipients'
      AND policyname = 'Only service role can read send recipients'
  ) THEN
    CREATE POLICY "Only service role can read send recipients"
    ON public.newsletter_send_recipients
    FOR SELECT
    USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_send_recipients'
      AND policyname = 'Service role can insert send recipients'
  ) THEN
    CREATE POLICY "Service role can insert send recipients"
    ON public.newsletter_send_recipients
    FOR INSERT
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_send_recipients'
      AND policyname = 'Service role can update send recipients'
  ) THEN
    CREATE POLICY "Service role can update send recipients"
    ON public.newsletter_send_recipients
    FOR UPDATE
    USING (true)
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_send_recipients'
      AND policyname = 'Service role can delete send recipients'
  ) THEN
    CREATE POLICY "Service role can delete send recipients"
    ON public.newsletter_send_recipients
    FOR DELETE
    USING (true);
  END IF;
END $$;

-- Timestamp trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_newsletter_send_recipients_updated_at'
  ) THEN
    CREATE TRIGGER update_newsletter_send_recipients_updated_at
    BEFORE UPDATE ON public.newsletter_send_recipients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;