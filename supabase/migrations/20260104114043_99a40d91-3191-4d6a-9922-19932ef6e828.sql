
-- =====================================================
-- WELLNESS BUSINESS DATA SCHEMA FOR ML/AI READINESS
-- Designed for future personalization and analytics
-- =====================================================

-- 1. Create standardized taxonomy/lookup tables for consistent categorization
-- This allows ML models to work with clean, categorical data

CREATE TABLE IF NOT EXISTS public.wellness_business_types (
  id text PRIMARY KEY,
  label text NOT NULL,
  category text NOT NULL, -- 'operator' or 'supplier'
  description text,
  parent_type text REFERENCES public.wellness_business_types(id),
  sort_order integer DEFAULT 0
);

-- Insert wellness industry taxonomy
INSERT INTO public.wellness_business_types (id, label, category, description, sort_order) VALUES
-- Operators
('gym', 'Gym / Fitness Center', 'operator', 'Traditional fitness facilities', 1),
('boutique_studio', 'Boutique Studio', 'operator', 'Specialized fitness studios (yoga, pilates, cycling)', 2),
('spa_wellness_center', 'Spa & Wellness Center', 'operator', 'Day spas, wellness retreats, thermal facilities', 3),
('health_club', 'Health Club', 'operator', 'Full-service health and fitness clubs', 4),
('leisure_center', 'Leisure Center', 'operator', 'Public or private leisure facilities', 5),
('hotel_resort_spa', 'Hotel / Resort Spa', 'operator', 'Hospitality-based wellness offerings', 6),
('corporate_wellness', 'Corporate Wellness Provider', 'operator', 'Workplace wellness programs', 7),
('medical_wellness', 'Medical Wellness Clinic', 'operator', 'Clinically-integrated wellness services', 8),
('outdoor_adventure', 'Outdoor & Adventure', 'operator', 'Nature-based wellness experiences', 9),
('mental_wellness', 'Mental Wellness Center', 'operator', 'Mindfulness, meditation, mental health focused', 10),
-- Suppliers
('equipment_manufacturer', 'Equipment Manufacturer', 'supplier', 'Fitness and wellness equipment', 20),
('technology_platform', 'Technology Platform', 'supplier', 'Software, apps, digital solutions', 21),
('content_provider', 'Content Provider', 'supplier', 'Workout content, wellness programs', 22),
('consulting_services', 'Consulting Services', 'supplier', 'Strategy, design, implementation', 23),
('nutrition_supplements', 'Nutrition & Supplements', 'supplier', 'Food, beverage, supplements', 24),
('apparel_accessories', 'Apparel & Accessories', 'supplier', 'Fitness clothing and gear', 25),
('facility_design', 'Facility Design & Build', 'supplier', 'Architecture, interior design, construction', 26),
('insurance_finance', 'Insurance & Finance', 'supplier', 'Financial services for wellness', 27),
('education_training', 'Education & Training', 'supplier', 'Certifications, courses, training', 28),
('marketing_agency', 'Marketing Agency', 'supplier', 'Wellness-focused marketing services', 29)
ON CONFLICT (id) DO NOTHING;

-- 2. Create revenue band lookup for consistent categorization
CREATE TABLE IF NOT EXISTS public.revenue_bands (
  id text PRIMARY KEY,
  label text NOT NULL,
  min_value integer, -- In thousands
  max_value integer, -- In thousands (NULL = no upper limit)
  sort_order integer DEFAULT 0
);

INSERT INTO public.revenue_bands (id, label, min_value, max_value, sort_order) VALUES
('pre_revenue', 'Pre-revenue / Startup', 0, 0, 1),
('under_100k', 'Under £100k', 1, 100, 2),
('100k_500k', '£100k - £500k', 100, 500, 3),
('500k_1m', '£500k - £1M', 500, 1000, 4),
('1m_5m', '£1M - £5M', 1000, 5000, 5),
('5m_10m', '£5M - £10M', 5000, 10000, 6),
('10m_50m', '£10M - £50M', 10000, 50000, 7),
('50m_plus', '£50M+', 50000, NULL, 8)
ON CONFLICT (id) DO NOTHING;

-- 3. Create team size lookup
CREATE TABLE IF NOT EXISTS public.team_size_bands (
  id text PRIMARY KEY,
  label text NOT NULL,
  min_size integer,
  max_size integer,
  sort_order integer DEFAULT 0
);

INSERT INTO public.team_size_bands (id, label, min_size, max_size, sort_order) VALUES
('solo', 'Solo / Founder only', 1, 1, 1),
('micro', '2-5 employees', 2, 5, 2),
('small', '6-20 employees', 6, 20, 3),
('medium', '21-50 employees', 21, 50, 4),
('large', '51-200 employees', 51, 200, 5),
('enterprise', '200+ employees', 200, NULL, 6)
ON CONFLICT (id) DO NOTHING;

-- 4. Create a unified wellness_entities table for ML-ready business data
-- This consolidates business data from multiple sources into a clean structure
CREATE TABLE IF NOT EXISTS public.wellness_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identity linking (can link to multiple sources)
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text, -- For non-authenticated entities
  
  -- Core business identity
  business_name text NOT NULL,
  legal_name text,
  
  -- Standardized categorical fields (foreign keys to lookup tables)
  business_type_id text REFERENCES public.wellness_business_types(id),
  revenue_band_id text REFERENCES public.revenue_bands(id),
  team_size_band_id text REFERENCES public.team_size_bands(id),
  
  -- Geographic data (structured for analytics)
  country_code text, -- ISO 3166-1 alpha-2
  region text, -- State/Province/Region
  city text,
  
  -- Business characteristics (ML-friendly arrays with controlled vocabulary)
  services_offered text[] DEFAULT '{}',
  customer_segments text[] DEFAULT '{}',
  technology_stack text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  
  -- Quantitative metrics (nullable - collected over time)
  member_count integer,
  location_count integer DEFAULT 1,
  years_in_business integer,
  
  -- AI Readiness snapshot (latest scores)
  ai_readiness_score integer,
  ai_readiness_band text,
  ai_readiness_assessed_at timestamptz,
  
  -- Pillar scores for detailed analysis
  pillar_scores jsonb DEFAULT '{}', -- {"leadership": 75, "data": 60, ...}
  
  -- Goals and challenges (semi-structured for NLP processing)
  primary_goals text[] DEFAULT '{}',
  key_challenges text[] DEFAULT '{}',
  
  -- Behavioral/preference data
  communication_preference text, -- 'concise', 'detailed', 'visual'
  decision_style text, -- 'data_driven', 'intuitive', 'collaborative'
  
  -- Engagement metrics
  first_interaction_at timestamptz DEFAULT now(),
  last_interaction_at timestamptz DEFAULT now(),
  total_interactions integer DEFAULT 0,
  
  -- Data quality indicators
  profile_completeness_score integer DEFAULT 0, -- 0-100
  data_source text DEFAULT 'manual', -- 'manual', 'assessment', 'onboarding', 'enriched'
  verified_at timestamptz,
  
  -- ML/Embedding ready fields
  business_description text, -- Free text for embeddings
  embedding vector(1536), -- For semantic search/similarity
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Create entity interactions log for behavioral analytics
CREATE TABLE IF NOT EXISTS public.entity_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES public.wellness_entities(id) ON DELETE CASCADE,
  
  -- Interaction classification
  interaction_type text NOT NULL, -- 'assessment', 'chat', 'download', 'purchase', 'page_view'
  interaction_category text, -- More specific categorization
  
  -- Context
  feature_used text, -- 'ai_coach', 'genie', 'assessment', 'newsletter'
  mode text, -- Specific mode within feature
  
  -- Content (for ML training)
  input_summary text, -- Summarized/anonymized user input
  output_type text, -- Type of response given
  
  -- Engagement metrics
  duration_seconds integer,
  satisfaction_signal text, -- 'positive', 'negative', 'neutral', NULL
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Create indexes for efficient querying and ML workloads

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_wellness_entities_user_id ON public.wellness_entities(user_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entities_email ON public.wellness_entities(email);
CREATE INDEX IF NOT EXISTS idx_wellness_entities_business_type ON public.wellness_entities(business_type_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entities_revenue_band ON public.wellness_entities(revenue_band_id);

-- Composite indexes for common analytics queries
CREATE INDEX IF NOT EXISTS idx_wellness_entities_type_revenue ON public.wellness_entities(business_type_id, revenue_band_id);
CREATE INDEX IF NOT EXISTS idx_wellness_entities_ai_readiness ON public.wellness_entities(ai_readiness_band, ai_readiness_score);

-- Array indexes for service/segment queries
CREATE INDEX IF NOT EXISTS idx_wellness_entities_services ON public.wellness_entities USING GIN(services_offered);
CREATE INDEX IF NOT EXISTS idx_wellness_entities_segments ON public.wellness_entities USING GIN(customer_segments);
CREATE INDEX IF NOT EXISTS idx_wellness_entities_challenges ON public.wellness_entities USING GIN(key_challenges);

-- Interaction analytics indexes
CREATE INDEX IF NOT EXISTS idx_entity_interactions_entity ON public.entity_interactions(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_interactions_type ON public.entity_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_entity_interactions_feature ON public.entity_interactions(feature_used);
CREATE INDEX IF NOT EXISTS idx_entity_interactions_created ON public.entity_interactions(created_at DESC);

-- 7. Enable RLS with appropriate policies

ALTER TABLE public.wellness_business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_size_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_interactions ENABLE ROW LEVEL SECURITY;

-- Lookup tables are public read
CREATE POLICY "Anyone can view business types" ON public.wellness_business_types FOR SELECT USING (true);
CREATE POLICY "Anyone can view revenue bands" ON public.revenue_bands FOR SELECT USING (true);
CREATE POLICY "Anyone can view team size bands" ON public.team_size_bands FOR SELECT USING (true);

-- Entity data is user-owned
CREATE POLICY "Users can view their own entity" ON public.wellness_entities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own entity" ON public.wellness_entities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entity" ON public.wellness_entities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage entities" ON public.wellness_entities FOR ALL USING (true) WITH CHECK (true);

-- Interactions are tied to entities
CREATE POLICY "Users can view their own interactions" ON public.entity_interactions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.wellness_entities WHERE id = entity_id AND user_id = auth.uid()));
CREATE POLICY "Service role can insert interactions" ON public.entity_interactions FOR INSERT WITH CHECK (true);

-- Admins can view all for analytics
CREATE POLICY "Admins can view all entities" ON public.wellness_entities FOR SELECT USING (is_admin());
CREATE POLICY "Admins can view all interactions" ON public.entity_interactions FOR SELECT USING (is_admin());

-- 8. Create function to calculate profile completeness
CREATE OR REPLACE FUNCTION public.calculate_entity_completeness(entity_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entity public.wellness_entities;
  score integer := 0;
  max_score integer := 100;
BEGIN
  SELECT * INTO entity FROM public.wellness_entities WHERE id = entity_id;
  
  IF entity IS NULL THEN RETURN 0; END IF;
  
  -- Core fields (40 points)
  IF entity.business_name IS NOT NULL THEN score := score + 10; END IF;
  IF entity.business_type_id IS NOT NULL THEN score := score + 10; END IF;
  IF entity.revenue_band_id IS NOT NULL THEN score := score + 10; END IF;
  IF entity.team_size_band_id IS NOT NULL THEN score := score + 10; END IF;
  
  -- Location (15 points)
  IF entity.country_code IS NOT NULL THEN score := score + 5; END IF;
  IF entity.city IS NOT NULL THEN score := score + 10; END IF;
  
  -- Descriptive data (25 points)
  IF array_length(entity.services_offered, 1) > 0 THEN score := score + 10; END IF;
  IF array_length(entity.customer_segments, 1) > 0 THEN score := score + 10; END IF;
  IF entity.business_description IS NOT NULL THEN score := score + 5; END IF;
  
  -- AI Readiness (10 points)
  IF entity.ai_readiness_score IS NOT NULL THEN score := score + 10; END IF;
  
  -- Behavioral (10 points)
  IF entity.communication_preference IS NOT NULL THEN score := score + 5; END IF;
  IF entity.decision_style IS NOT NULL THEN score := score + 5; END IF;
  
  RETURN LEAST(score, max_score);
END;
$$;

-- 9. Create trigger to auto-update completeness and timestamps
CREATE OR REPLACE FUNCTION public.update_entity_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  NEW.profile_completeness_score := calculate_entity_completeness(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_entity_metadata
  BEFORE UPDATE ON public.wellness_entities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_entity_metadata();

-- 10. Create view for ML-ready export (denormalized for training)
CREATE OR REPLACE VIEW public.wellness_entities_ml_view AS
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
