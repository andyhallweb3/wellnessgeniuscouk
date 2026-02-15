
-- Create tasks table for Kanban board
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'To Do',
  priority TEXT NOT NULL DEFAULT 'Medium',
  due_date DATE,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (founder command centre is admin-only)
CREATE POLICY "Admins can view all tasks"
ON public.tasks FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert tasks"
ON public.tasks FOR INSERT
WITH CHECK (is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can update tasks"
ON public.tasks FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete tasks"
ON public.tasks FOR DELETE
USING (is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
