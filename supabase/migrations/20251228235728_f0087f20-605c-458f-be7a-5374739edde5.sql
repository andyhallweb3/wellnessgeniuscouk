-- Create founder_journal table for brain dumps
CREATE TABLE public.founder_journal (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.founder_journal ENABLE ROW LEVEL SECURITY;

-- RLS policies for admins only
CREATE POLICY "Admins can view their own journal entries"
ON public.founder_journal
FOR SELECT
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can insert their own journal entries"
ON public.founder_journal
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can delete their own journal entries"
ON public.founder_journal
FOR DELETE
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);