
-- =============================================
-- WELLNESS GENIUS ADVISOR - DATABASE UPGRADE
-- Phase 1: Workspace Model + Knowledge Base
-- =============================================

-- LAYER A: Wellness Genius Canon (wg_canon)
CREATE TABLE public.kb_canon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LAYER B: Curated Industry Intelligence (wg_intel)
CREATE TABLE public.kb_intel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT,
  source_name TEXT,
  published_date DATE,
  content_type TEXT DEFAULT 'news',
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_outdated BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- LAYER C: Business Workspace Tables

-- Workspace Profile (core business info)
CREATE TABLE public.workspace_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  sector TEXT,
  geography TEXT,
  business_size TEXT,
  primary_offer TEXT,
  current_stack TEXT[],
  ai_readiness_score INTEGER,
  ai_readiness_band TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Workspace Goals
CREATE TABLE public.workspace_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goals TEXT[] DEFAULT '{}',
  priority_order TEXT[] DEFAULT '{}',
  timeframe TEXT DEFAULT '90',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Workspace Constraints
CREATE TABLE public.workspace_constraints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_range TEXT,
  team_capacity TEXT DEFAULT 'medium',
  data_access TEXT DEFAULT 'basic',
  integration_ability TEXT DEFAULT 'basic',
  compliance_sensitivity TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Workspace Metrics
CREATE TABLE public.workspace_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kpis JSONB DEFAULT '{}',
  current_values JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Workspace Decisions
CREATE TABLE public.workspace_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  decision_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  context TEXT,
  status TEXT DEFAULT 'planned',
  outcomes TEXT,
  mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agent Feedback (for tracking quality)
CREATE TABLE public.advisor_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id UUID,
  mode TEXT,
  rating TEXT,
  feedback_type TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agent Metrics (for success tracking)
CREATE TABLE public.advisor_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed_at TIMESTAMP WITH TIME ZONE,
  first_plan_at TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  decisions_saved INTEGER DEFAULT 0,
  last_session_at TIMESTAMP WITH TIME ZONE,
  weekly_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.kb_canon ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_intel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies: KB Canon (read-only for all authenticated, write for admins)
CREATE POLICY "kb_canon_read" ON public.kb_canon
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "kb_canon_admin_all" ON public.kb_canon
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies: KB Intel (read-only for all authenticated, write for admins)
CREATE POLICY "kb_intel_read" ON public.kb_intel
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "kb_intel_admin_all" ON public.kb_intel
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- RLS Policies: Workspace tables (users can only access their own)
CREATE POLICY "workspace_profile_user" ON public.workspace_profile
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_goals_user" ON public.workspace_goals
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_constraints_user" ON public.workspace_constraints
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_metrics_user" ON public.workspace_metrics
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "workspace_decisions_user" ON public.workspace_decisions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "advisor_feedback_user" ON public.advisor_feedback
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "advisor_feedback_admin_read" ON public.advisor_feedback
  FOR SELECT TO authenticated
  USING (public.is_admin() OR auth.uid() = user_id);

CREATE POLICY "advisor_metrics_user" ON public.advisor_metrics
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policy for workspace viewing
CREATE POLICY "workspace_profile_admin_read" ON public.workspace_profile
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "workspace_decisions_admin_read" ON public.workspace_decisions
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Triggers for updated_at
CREATE TRIGGER update_kb_canon_updated_at
  BEFORE UPDATE ON public.kb_canon
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kb_intel_updated_at
  BEFORE UPDATE ON public.kb_intel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_profile_updated_at
  BEFORE UPDATE ON public.workspace_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_goals_updated_at
  BEFORE UPDATE ON public.workspace_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_constraints_updated_at
  BEFORE UPDATE ON public.workspace_constraints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspace_metrics_updated_at
  BEFORE UPDATE ON public.workspace_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_metrics_updated_at
  BEFORE UPDATE ON public.advisor_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing business_memory data to workspace tables
INSERT INTO public.workspace_profile (user_id, business_name, sector, business_size, primary_offer, created_at, updated_at)
SELECT 
  user_id,
  business_name,
  business_type as sector,
  team_size as business_size,
  revenue_model as primary_offer,
  created_at,
  updated_at
FROM public.business_memory
ON CONFLICT (user_id) DO NOTHING;

-- Migrate goals from business_memory
INSERT INTO public.workspace_goals (user_id, goals, created_at, updated_at)
SELECT 
  user_id,
  ARRAY[primary_goal] as goals,
  created_at,
  updated_at
FROM public.business_memory
WHERE primary_goal IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Migrate constraints from business_memory
INSERT INTO public.workspace_constraints (user_id, created_at, updated_at)
SELECT 
  user_id,
  created_at,
  updated_at
FROM public.business_memory
ON CONFLICT (user_id) DO NOTHING;

-- Enable realtime for workspace tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_profile;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_decisions;

-- Create indexes for performance
CREATE INDEX idx_kb_canon_category ON public.kb_canon(category);
CREATE INDEX idx_kb_canon_tags ON public.kb_canon USING GIN(tags);
CREATE INDEX idx_kb_intel_category ON public.kb_intel(category);
CREATE INDEX idx_kb_intel_published_date ON public.kb_intel(published_date);
CREATE INDEX idx_workspace_decisions_user_type ON public.workspace_decisions(user_id, decision_type);
CREATE INDEX idx_workspace_decisions_status ON public.workspace_decisions(status);
