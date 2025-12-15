-- Create articles table for newsletter processing
CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  source text NOT NULL,
  url text NOT NULL UNIQUE,
  published_at timestamp with time zone NOT NULL DEFAULT now(),
  category text NOT NULL DEFAULT 'AI',
  excerpt text,
  content text,
  processed boolean NOT NULL DEFAULT false,
  ai_summary text,
  ai_why_it_matters text[],
  ai_commercial_angle text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_articles_processed ON public.articles(processed);
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);
CREATE INDEX idx_articles_category ON public.articles(category);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view articles"
ON public.articles
FOR SELECT
USING (true);

-- Service role can manage
CREATE POLICY "Service role can insert articles"
ON public.articles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update articles"
ON public.articles
FOR UPDATE
USING (true);

-- Create newsletter_sends table to track sent newsletters
CREATE TABLE public.newsletter_sends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  recipient_count integer NOT NULL DEFAULT 0,
  article_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  email_html text
);

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view newsletter sends"
ON public.newsletter_sends
FOR SELECT
USING (true);

CREATE POLICY "Service role can insert newsletter sends"
ON public.newsletter_sends
FOR INSERT
WITH CHECK (true);