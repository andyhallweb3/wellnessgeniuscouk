-- Create feedback_reports table for storing user-reported problems
CREATE TABLE public.feedback_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  feature_area TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports (authenticated or anonymous with email)
CREATE POLICY "Anyone can submit feedback" 
ON public.feedback_reports 
FOR INSERT 
WITH CHECK (true);

-- Users can view their own reports
CREATE POLICY "Users can view their own reports" 
ON public.feedback_reports 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  (user_email IS NOT NULL AND user_email = get_current_user_email())
);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports" 
ON public.feedback_reports 
FOR SELECT 
USING (is_admin());

-- Admins can update reports
CREATE POLICY "Admins can update reports" 
ON public.feedback_reports 
FOR UPDATE 
USING (is_admin());

-- Admins can delete reports
CREATE POLICY "Admins can delete reports" 
ON public.feedback_reports 
FOR DELETE 
USING (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_reports_updated_at
BEFORE UPDATE ON public.feedback_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();