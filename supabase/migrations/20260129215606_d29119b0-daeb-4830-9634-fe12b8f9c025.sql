-- Research reports table
CREATE TABLE public.research_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  query TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('market_trends', 'competitive', 'evidence', 'roi', 'policy', 'demographics')),
  executive_summary TEXT,
  confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  research_plan JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research findings table
CREATE TABLE public.research_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.research_reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data TEXT NOT NULL,
  change TEXT,
  source TEXT,
  confidence TEXT CHECK (confidence IN ('high', 'medium', 'low')),
  supporting_evidence TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research insights table
CREATE TABLE public.research_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.research_reports(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN ('opportunity', 'risk', 'trend', 'benchmark', 'evidence', 'caution')),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  impact TEXT CHECK (impact IN ('high', 'medium', 'low')),
  timeframe TEXT CHECK (timeframe IN ('immediate', 'short_term', 'long_term')),
  recommended_actions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Research sources table
CREATE TABLE public.research_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.research_reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  source_date TEXT,
  credibility_score NUMERIC(3,2) CHECK (credibility_score >= 0 AND credibility_score <= 1),
  source_type TEXT CHECK (source_type IN ('academic', 'industry_report', 'news', 'blog', 'government')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;

-- RLS policies for research_reports
CREATE POLICY "Users can view their own research reports"
  ON public.research_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own research reports"
  ON public.research_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own research reports"
  ON public.research_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own research reports"
  ON public.research_reports FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for research_findings (via report ownership)
CREATE POLICY "Users can view findings for their reports"
  ON public.research_findings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_findings.report_id
    AND research_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can create findings for their reports"
  ON public.research_findings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_findings.report_id
    AND research_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete findings for their reports"
  ON public.research_findings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_findings.report_id
    AND research_reports.user_id = auth.uid()
  ));

-- RLS policies for research_insights (via report ownership)
CREATE POLICY "Users can view insights for their reports"
  ON public.research_insights FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_insights.report_id
    AND research_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can create insights for their reports"
  ON public.research_insights FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_insights.report_id
    AND research_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete insights for their reports"
  ON public.research_insights FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_insights.report_id
    AND research_reports.user_id = auth.uid()
  ));

-- RLS policies for research_sources (via report ownership)
CREATE POLICY "Users can view sources for their reports"
  ON public.research_sources FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_sources.report_id
    AND research_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can create sources for their reports"
  ON public.research_sources FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_sources.report_id
    AND research_reports.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete sources for their reports"
  ON public.research_sources FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.research_reports
    WHERE research_reports.id = research_sources.report_id
    AND research_reports.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_research_reports_user_id ON public.research_reports(user_id);
CREATE INDEX idx_research_reports_category ON public.research_reports(category);
CREATE INDEX idx_research_findings_report_id ON public.research_findings(report_id);
CREATE INDEX idx_research_insights_report_id ON public.research_insights(report_id);
CREATE INDEX idx_research_sources_report_id ON public.research_sources(report_id);

-- Trigger to update updated_at
CREATE TRIGGER update_research_reports_updated_at
  BEFORE UPDATE ON public.research_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();