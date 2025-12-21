-- Add tags column to genie_sessions table
ALTER TABLE public.genie_sessions 
ADD COLUMN tags text[] DEFAULT ARRAY[]::text[];