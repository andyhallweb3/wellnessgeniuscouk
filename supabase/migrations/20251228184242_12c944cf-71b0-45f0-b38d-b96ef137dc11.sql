-- Create founder_partnerships table
CREATE TABLE public.founder_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'paused')),
  last_contact TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fit_score INTEGER NOT NULL DEFAULT 50 CHECK (fit_score >= 0 AND fit_score <= 100),
  next_move TEXT,
  insight TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founder_partnerships ENABLE ROW LEVEL SECURITY;

-- RLS policies for admin users only
CREATE POLICY "Admins can view partnerships"
ON public.founder_partnerships
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

CREATE POLICY "Admins can insert partnerships"
ON public.founder_partnerships
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

CREATE POLICY "Admins can update partnerships"
ON public.founder_partnerships
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

CREATE POLICY "Admins can delete partnerships"
ON public.founder_partnerships
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) AND auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_founder_partnerships_updated_at
BEFORE UPDATE ON public.founder_partnerships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();