-- Create email templates table for HubSpot onboarding series
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  subject text NOT NULL,
  preview_text text,
  html_content text NOT NULL,
  sequence_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  template_type text NOT NULL DEFAULT 'onboarding',
  variables jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can view all templates
CREATE POLICY "Admins can view email templates"
ON public.email_templates
FOR SELECT
USING (is_admin());

-- Admins can insert templates
CREATE POLICY "Admins can insert email templates"
ON public.email_templates
FOR INSERT
WITH CHECK (is_admin());

-- Admins can update templates
CREATE POLICY "Admins can update email templates"
ON public.email_templates
FOR UPDATE
USING (is_admin());

-- Admins can delete templates
CREATE POLICY "Admins can delete email templates"
ON public.email_templates
FOR DELETE
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for sequence ordering
CREATE INDEX idx_email_templates_sequence ON public.email_templates(template_type, sequence_order);