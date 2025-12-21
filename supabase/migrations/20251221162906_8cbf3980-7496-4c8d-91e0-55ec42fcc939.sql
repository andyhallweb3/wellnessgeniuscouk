-- Create storage bucket for coach documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('coach-documents', 'coach-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for coach documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'coach-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'coach-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'coach-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Table to track document metadata and extracted content
CREATE TABLE public.coach_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  extracted_text TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coach_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for coach_documents
CREATE POLICY "Users can view their own documents"
ON public.coach_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents"
ON public.coach_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON public.coach_documents FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON public.coach_documents FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_coach_documents_updated_at
BEFORE UPDATE ON public.coach_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();