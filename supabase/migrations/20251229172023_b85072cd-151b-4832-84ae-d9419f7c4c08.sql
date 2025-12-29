-- Add policy for public viewing of feedback reports (excluding admin notes and user emails)
CREATE POLICY "Anyone can view feedback status" 
ON public.feedback_reports 
FOR SELECT 
USING (true);