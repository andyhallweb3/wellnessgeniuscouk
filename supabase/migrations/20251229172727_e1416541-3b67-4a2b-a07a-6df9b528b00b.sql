-- Add feedback_type column to feedback_reports
ALTER TABLE public.feedback_reports 
ADD COLUMN feedback_type text NOT NULL DEFAULT 'bug';

-- Add constraint to ensure valid types
ALTER TABLE public.feedback_reports 
ADD CONSTRAINT feedback_type_check 
CHECK (feedback_type IN ('bug', 'feature', 'improvement'));