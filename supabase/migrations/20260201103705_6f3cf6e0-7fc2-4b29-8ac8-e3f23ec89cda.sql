-- Create table to link Telegram users to Wellness Genius accounts
CREATE TABLE public.telegram_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_user_id BIGINT NOT NULL UNIQUE,
  telegram_username TEXT,
  telegram_first_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  link_code TEXT UNIQUE,
  link_code_expires_at TIMESTAMP WITH TIME ZONE,
  daily_messages_used INTEGER NOT NULL DEFAULT 0,
  daily_messages_reset_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Service role can manage telegram users"
ON public.telegram_users FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own telegram link"
ON public.telegram_users FOR SELECT
USING (auth.uid() = user_id);

-- Create index for fast lookups
CREATE INDEX idx_telegram_users_telegram_id ON public.telegram_users(telegram_user_id);
CREATE INDEX idx_telegram_users_user_id ON public.telegram_users(user_id);
CREATE INDEX idx_telegram_users_link_code ON public.telegram_users(link_code);

-- Add trigger for updated_at
CREATE TRIGGER update_telegram_users_updated_at
BEFORE UPDATE ON public.telegram_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();