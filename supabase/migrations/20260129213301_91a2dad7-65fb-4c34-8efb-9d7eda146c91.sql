-- Wellness Goals table for Goal Setting and Monitoring pattern
CREATE TABLE public.wellness_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL, -- matches AI Readiness pillars: transformation, architecture, governance, value, operating
  description TEXT NOT NULL,
  target_date DATE,
  target_value NUMERIC,
  current_progress NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused, abandoned
  priority TEXT DEFAULT 'medium', -- low, medium, high
  success_criteria JSONB DEFAULT '[]'::jsonb, -- array of criteria strings
  milestones JSONB DEFAULT '[]'::jsonb, -- array of {week, target, completed}
  phase TEXT DEFAULT 'foundation', -- foundation, building, sustaining
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own goals" ON public.wellness_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON public.wellness_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.wellness_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.wellness_goals FOR DELETE USING (auth.uid() = user_id);

-- Wellness Progress tracking for monitoring pattern
CREATE TABLE public.wellness_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID REFERENCES public.wellness_goals(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  progress_percentage NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'on_track', -- excellent, on_track, needs_attention, at_risk
  insights JSONB DEFAULT '[]'::jsonb, -- array of insight strings
  recommendations JSONB DEFAULT '[]'::jsonb, -- array of recommendation strings
  data_snapshot JSONB DEFAULT '{}'::jsonb, -- metrics at time of recording
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own progress" ON public.wellness_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.wellness_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.wellness_progress FOR UPDATE USING (auth.uid() = user_id);

-- Wellness Plans table for Planning pattern
CREATE TABLE public.wellness_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_name TEXT,
  duration_weeks INTEGER DEFAULT 12,
  phases JSONB DEFAULT '[]'::jsonb, -- array of {phase, name, weeks, focus, intensity}
  milestones JSONB DEFAULT '[]'::jsonb, -- array of {milestone_id, week, description, activities, completed}
  reflection_score NUMERIC, -- from self-evaluation pattern
  reflection_feedback JSONB DEFAULT '{}'::jsonb, -- {specificity, feasibility, comprehensiveness, recommendation}
  status TEXT DEFAULT 'draft', -- draft, active, completed, archived
  assessment_snapshot JSONB DEFAULT '{}'::jsonb, -- original assessment data
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own plans" ON public.wellness_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own plans" ON public.wellness_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans" ON public.wellness_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own plans" ON public.wellness_plans FOR DELETE USING (auth.uid() = user_id);

-- User Feedback table for Human-in-the-Loop pattern
CREATE TABLE public.wellness_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID REFERENCES public.wellness_plans(id) ON DELETE SET NULL,
  goal_id UUID REFERENCES public.wellness_goals(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL, -- goal_adjustment, timeline_adjustment, preference_update, difficulty_change
  feedback_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  adjustments_made JSONB DEFAULT '[]'::jsonb, -- what was changed based on feedback
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wellness_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own feedback" ON public.wellness_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedback" ON public.wellness_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_wellness_goals_updated_at
  BEFORE UPDATE ON public.wellness_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wellness_plans_updated_at
  BEFORE UPDATE ON public.wellness_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();