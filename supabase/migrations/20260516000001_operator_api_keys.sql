-- Operator API Keys table
-- Stores API keys for B2B operators integrating the WG AI advisor into their platforms
-- Inserts are restricted to service role only (edge function); RLS allows owners to read/update/delete their own rows

CREATE TABLE operator_api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  key_prefix      TEXT NOT NULL,
  key_hash        TEXT NOT NULL UNIQUE,
  tier            TEXT NOT NULL DEFAULT 'starter' CHECK (tier IN ('starter', 'growth')),
  monthly_limit   INTEGER NOT NULL DEFAULT 500,
  calls_this_month INTEGER NOT NULL DEFAULT 0,
  reset_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT date_trunc('month', now()) + INTERVAL '1 month',
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fast lookup by key hash (called on every API request)
CREATE INDEX operator_api_keys_key_hash_idx ON operator_api_keys (key_hash);

-- Index for listing keys by user
CREATE INDEX operator_api_keys_user_id_idx ON operator_api_keys (user_id);

-- Enable Row Level Security
ALTER TABLE operator_api_keys ENABLE ROW LEVEL SECURITY;

-- Users can read their own keys
CREATE POLICY "owner_select"
  ON operator_api_keys
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own keys (e.g. rename)
CREATE POLICY "owner_update"
  ON operator_api_keys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can soft-delete (set active = false) their own keys
CREATE POLICY "owner_delete"
  ON operator_api_keys
  FOR DELETE
  USING (auth.uid() = user_id);

-- No INSERT policy via RLS — inserts happen exclusively from the service role in the manage-api-keys edge function
