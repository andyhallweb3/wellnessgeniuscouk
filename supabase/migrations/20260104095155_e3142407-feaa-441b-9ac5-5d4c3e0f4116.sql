-- Create subscriber groups table
CREATE TABLE public.subscriber_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  emails text[] NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriber_groups ENABLE ROW LEVEL SECURITY;

-- Only admins can manage groups
CREATE POLICY "Admins can view subscriber groups" ON public.subscriber_groups
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can insert subscriber groups" ON public.subscriber_groups
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update subscriber groups" ON public.subscriber_groups
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete subscriber groups" ON public.subscriber_groups
  FOR DELETE USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_subscriber_groups_updated_at
  BEFORE UPDATE ON public.subscriber_groups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();