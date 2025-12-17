-- Add business impact lens column to articles table
ALTER TABLE public.articles 
ADD COLUMN business_lens text;

-- Add comment explaining valid values
COMMENT ON COLUMN public.articles.business_lens IS 'Primary business impact lens: revenue_growth, cost_efficiency, retention_engagement, risk_regulation, investment_ma, technology_enablement';