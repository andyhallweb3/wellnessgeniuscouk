-- Fix newsletter_send_recipients upsert support by using a column-based unique index
-- The existing index is on (send_id, lower(email)) which PostgREST cannot target via onConflict.

-- Drop the expression-based unique index if it exists
DROP INDEX IF EXISTS public.newsletter_send_recipients_send_email_uidx;

-- Create a simple unique index on the actual columns
CREATE UNIQUE INDEX newsletter_send_recipients_send_id_email_uidx
  ON public.newsletter_send_recipients (send_id, email);

-- Optional: ensure email is always stored lowercase going forward at DB level
-- (keeps application logic as primary guard; avoids needing triggers here)
