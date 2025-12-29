-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to founder_journal table
ALTER TABLE public.founder_journal 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create an index for fast similarity search
CREATE INDEX IF NOT EXISTS founder_journal_embedding_idx 
ON public.founder_journal 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function to search journal entries by semantic similarity
CREATE OR REPLACE FUNCTION public.search_journal_entries(
  query_embedding vector(768),
  match_user_id uuid,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fj.id,
    fj.content,
    fj.created_at,
    1 - (fj.embedding <=> query_embedding) as similarity
  FROM public.founder_journal fj
  WHERE fj.user_id = match_user_id
    AND fj.embedding IS NOT NULL
  ORDER BY fj.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;