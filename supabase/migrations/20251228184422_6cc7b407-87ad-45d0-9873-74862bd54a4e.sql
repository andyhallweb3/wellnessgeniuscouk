-- Create founder_partnership_contacts table for contact logs
CREATE TABLE public.founder_partnership_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.founder_partnerships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founder_partnership_contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin users only
CREATE POLICY "Admins can view contacts"
ON public.founder_partnership_contacts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

CREATE POLICY "Admins can insert contacts"
ON public.founder_partnership_contacts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

CREATE POLICY "Admins can delete contacts"
ON public.founder_partnership_contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);