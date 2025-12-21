-- Create notifications table for proactive alerts
CREATE TABLE public.genie_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alert', 'insight', 'reminder', 'nudge')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  trigger_reason TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.genie_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.genie_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read/dismissed)
CREATE POLICY "Users can update own notifications"
ON public.genie_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
ON public.genie_notifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_genie_notifications_user_unread 
ON public.genie_notifications(user_id, read, dismissed) 
WHERE read = false AND dismissed = false;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.genie_notifications;