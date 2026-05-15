-- ─── Points ledger ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.points_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points" ON public.points_ledger
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert (called from edge functions and triggers)
CREATE POLICY "Service role can insert points" ON public.points_ledger
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_points_user_id ON public.points_ledger (user_id);
CREATE INDEX idx_points_event_type ON public.points_ledger (user_id, event_type);
CREATE INDEX idx_points_created_at ON public.points_ledger (user_id, created_at DESC);

-- ─── Deduplication guard for one-time events ─────────────────────────────────

CREATE UNIQUE INDEX idx_points_unique_event
  ON public.points_ledger (user_id, event_type)
  WHERE event_type IN (
    'first_genie_session',
    'assessment_completed',
    'onboarding_completed',
    'first_kb_note',
    'first_document_upload',
    'profile_complete'
  );

-- ─── Aggregate view ───────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.user_points AS
SELECT
  user_id,
  COALESCE(SUM(points), 0) AS total_points,
  COUNT(*) AS total_events,
  MAX(created_at) AS last_earned_at
FROM public.points_ledger
GROUP BY user_id;

-- ─── Award points function (callable from triggers or edge functions) ─────────

CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_points INTEGER,
  p_event_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.points_ledger (user_id, points, event_type, description, metadata)
  VALUES (p_user_id, p_points, p_event_type, p_description, p_metadata)
  ON CONFLICT (user_id, event_type)
  WHERE event_type IN (
    'first_genie_session', 'assessment_completed', 'onboarding_completed',
    'first_kb_note', 'first_document_upload', 'profile_complete'
  )
  DO NOTHING;
END;
$$;

-- ─── Auto-award on assessment completion ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.on_assessment_complete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  PERFORM public.award_points(
    NEW.user_id,
    100,
    'assessment_completed',
    'Completed the AI Readiness Assessment'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assessment_points ON public.ai_readiness_completions;
CREATE TRIGGER trg_assessment_points
  AFTER INSERT ON public.ai_readiness_completions
  FOR EACH ROW EXECUTE FUNCTION public.on_assessment_complete();

-- ─── Auto-award on business note added ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.on_business_note_added()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  note_count INTEGER;
BEGIN
  -- First note ever: one-time bonus
  SELECT COUNT(*) INTO note_count FROM public.business_notes WHERE user_id = NEW.user_id;
  IF note_count = 1 THEN
    PERFORM public.award_points(NEW.user_id, 25, 'first_kb_note', 'Added first Knowledge Base note');
  END IF;

  -- Recurring: 5 points per note (capped via application logic)
  INSERT INTO public.points_ledger (user_id, points, event_type, description)
  VALUES (NEW.user_id, 5, 'kb_note_added', 'Added a Knowledge Base note');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_note_points ON public.business_notes;
CREATE TRIGGER trg_note_points
  AFTER INSERT ON public.business_notes
  FOR EACH ROW EXECUTE FUNCTION public.on_business_note_added();

-- ─── Auto-award on workspace profile onboarded ───────────────────────────────

CREATE OR REPLACE FUNCTION public.on_workspace_onboarded()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.onboarding_completed = true AND (OLD IS NULL OR OLD.onboarding_completed = false) THEN
    PERFORM public.award_points(
      NEW.user_id,
      150,
      'onboarding_completed',
      'Completed business profile setup'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_onboarding_points ON public.workspace_profile;
CREATE TRIGGER trg_onboarding_points
  AFTER INSERT OR UPDATE ON public.workspace_profile
  FOR EACH ROW EXECUTE FUNCTION public.on_workspace_onboarded();
