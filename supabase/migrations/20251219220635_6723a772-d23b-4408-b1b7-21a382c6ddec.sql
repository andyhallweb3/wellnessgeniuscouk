-- Create table for shareable report links
CREATE TABLE public.report_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  completion_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  view_count INTEGER NOT NULL DEFAULT 0
);

-- Create index for fast token lookup
CREATE INDEX idx_report_shares_token ON public.report_shares(share_token);

-- Enable RLS
ALTER TABLE public.report_shares ENABLE ROW LEVEL SECURITY;

-- Anyone can view shares (needed for public access)
CREATE POLICY "Anyone can view shares by token"
  ON public.report_shares
  FOR SELECT
  USING (true);

-- Service role can insert shares
CREATE POLICY "Service role can insert shares"
  ON public.report_shares
  FOR INSERT
  WITH CHECK (true);

-- Service role can update shares (for view count)
CREATE POLICY "Service role can update shares"
  ON public.report_shares
  FOR UPDATE
  USING (true);