-- Add trust display preference to business_memory table
ALTER TABLE public.business_memory
ADD COLUMN IF NOT EXISTS trust_display_mode text DEFAULT 'compact';

-- Add comment
COMMENT ON COLUMN public.business_memory.trust_display_mode IS 'User preference for trust indicator display: compact or full';