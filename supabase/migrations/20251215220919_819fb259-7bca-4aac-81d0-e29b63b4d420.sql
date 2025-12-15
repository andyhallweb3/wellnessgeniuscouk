-- Add scoring fields to articles table
ALTER TABLE public.articles
ADD COLUMN IF NOT EXISTS score_source_authority integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_commercial_impact integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_operator_relevance integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_novelty integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_timeliness integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_wg_fit integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_total integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS score_reasoning text,
ADD COLUMN IF NOT EXISTS scored_at timestamp with time zone;

-- Create index for newsletter selection (score >= 65)
CREATE INDEX IF NOT EXISTS idx_articles_score_total ON public.articles (score_total DESC) WHERE score_total >= 65;

-- Create index for unscored articles
CREATE INDEX IF NOT EXISTS idx_articles_unscored ON public.articles (created_at DESC) WHERE scored_at IS NULL;