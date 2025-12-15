-- Create newsletter_events table for tracking opens and clicks
CREATE TABLE public.newsletter_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  send_id UUID NOT NULL REFERENCES public.newsletter_sends(id) ON DELETE CASCADE,
  subscriber_email TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  link_url TEXT, -- Only for click events
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);

-- Create indexes for efficient querying
CREATE INDEX idx_newsletter_events_send_id ON public.newsletter_events(send_id);
CREATE INDEX idx_newsletter_events_type ON public.newsletter_events(event_type);
CREATE INDEX idx_newsletter_events_email_send ON public.newsletter_events(subscriber_email, send_id);

-- Enable RLS
ALTER TABLE public.newsletter_events ENABLE ROW LEVEL SECURITY;

-- Only service role can read events (for admin dashboard)
CREATE POLICY "Only service role can read events"
  ON public.newsletter_events
  FOR SELECT
  USING (false);

-- Service role can insert events (for tracking)
CREATE POLICY "Service role can insert events"
  ON public.newsletter_events
  FOR INSERT
  WITH CHECK (true);

-- Add tracking columns to newsletter_sends
ALTER TABLE public.newsletter_sends
ADD COLUMN unique_opens INTEGER DEFAULT 0,
ADD COLUMN total_opens INTEGER DEFAULT 0,
ADD COLUMN unique_clicks INTEGER DEFAULT 0,
ADD COLUMN total_clicks INTEGER DEFAULT 0;