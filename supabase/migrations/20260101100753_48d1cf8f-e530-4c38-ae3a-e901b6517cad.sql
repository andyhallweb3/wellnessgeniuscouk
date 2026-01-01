-- Create knowledge base table for admin-curated resources
CREATE TABLE public.knowledge_base (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can view knowledge base"
  ON public.knowledge_base FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert knowledge base"
  ON public.knowledge_base FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update knowledge base"
  ON public.knowledge_base FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete knowledge base"
  ON public.knowledge_base FOR DELETE
  USING (is_admin());

-- Service role can read for chat context (used by edge functions)
CREATE POLICY "Service role can read knowledge base"
  ON public.knowledge_base FOR SELECT
  USING (true);

-- Add updated_at trigger
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for category filtering
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_knowledge_base_active ON public.knowledge_base(is_active);