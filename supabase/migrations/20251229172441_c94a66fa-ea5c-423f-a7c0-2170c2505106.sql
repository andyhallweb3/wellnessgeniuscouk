-- Create feedback upvotes table
CREATE TABLE public.feedback_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid REFERENCES public.feedback_reports(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (feedback_id, user_id)
);

-- Enable RLS
ALTER TABLE public.feedback_upvotes ENABLE ROW LEVEL SECURITY;

-- Users can view all upvotes (for counting)
CREATE POLICY "Anyone can view upvotes"
ON public.feedback_upvotes
FOR SELECT
USING (true);

-- Authenticated users can insert their own upvotes
CREATE POLICY "Authenticated users can upvote"
ON public.feedback_upvotes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own upvotes
CREATE POLICY "Users can remove their own upvotes"
ON public.feedback_upvotes
FOR DELETE
USING (auth.uid() = user_id);

-- Add upvote_count column to feedback_reports for efficient counting
ALTER TABLE public.feedback_reports ADD COLUMN upvote_count integer NOT NULL DEFAULT 0;

-- Create function to update upvote count
CREATE OR REPLACE FUNCTION public.update_feedback_upvote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback_reports 
    SET upvote_count = upvote_count + 1 
    WHERE id = NEW.feedback_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback_reports 
    SET upvote_count = upvote_count - 1 
    WHERE id = OLD.feedback_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger to auto-update count
CREATE TRIGGER update_upvote_count
AFTER INSERT OR DELETE ON public.feedback_upvotes
FOR EACH ROW
EXECUTE FUNCTION public.update_feedback_upvote_count();