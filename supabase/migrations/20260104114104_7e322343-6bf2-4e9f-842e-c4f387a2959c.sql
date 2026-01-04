
-- Fix: Remove SECURITY DEFINER from view and recreate as standard view
DROP VIEW IF EXISTS public.wellness_entities_ml_view;

CREATE VIEW public.wellness_entities_ml_view AS
SELECT 
  e.id,
  e.business_name,
  bt.label as business_type,
  bt.category as business_category,
  rb.label as revenue_band,
  rb.min_value as revenue_min_k,
  rb.max_value as revenue_max_k,
  ts.label as team_size,
  ts.min_size as team_min,
  ts.max_size as team_max,
  e.country_code,
  e.region,
  e.city,
  e.services_offered,
  e.customer_segments,
  e.technology_stack,
  e.member_count,
  e.location_count,
  e.years_in_business,
  e.ai_readiness_score,
  e.ai_readiness_band,
  e.pillar_scores,
  e.primary_goals,
  e.key_challenges,
  e.communication_preference,
  e.decision_style,
  e.profile_completeness_score,
  e.total_interactions,
  e.business_description,
  e.created_at,
  e.last_interaction_at
FROM public.wellness_entities e
LEFT JOIN public.wellness_business_types bt ON e.business_type_id = bt.id
LEFT JOIN public.revenue_bands rb ON e.revenue_band_id = rb.id
LEFT JOIN public.team_size_bands ts ON e.team_size_band_id = ts.id;

-- Set view to use invoker's permissions (respects RLS)
ALTER VIEW public.wellness_entities_ml_view SET (security_invoker = on);
