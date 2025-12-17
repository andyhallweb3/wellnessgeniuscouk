-- Create newsletter templates table
CREATE TABLE public.newsletter_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  article_ids TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.newsletter_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Admins can view templates" 
ON public.newsletter_templates 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can insert templates" 
ON public.newsletter_templates 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update templates" 
ON public.newsletter_templates 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete templates" 
ON public.newsletter_templates 
FOR DELETE 
USING (is_admin());

-- Add updated_at trigger
CREATE TRIGGER update_newsletter_templates_updated_at
BEFORE UPDATE ON public.newsletter_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();