-- Zoho tokens are server-only. The browser must never query this table directly.

CREATE TABLE IF NOT EXISTS public.zoho_books_integrations (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  organization_id text,
  is_connected boolean NOT NULL DEFAULT false,
  connected_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.zoho_books_integrations
  ADD COLUMN IF NOT EXISTS access_token text,
  ADD COLUMN IF NOT EXISTS refresh_token text,
  ADD COLUMN IF NOT EXISTS token_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS organization_id text,
  ADD COLUMN IF NOT EXISTS is_connected boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS connected_at timestamptz,
  ADD COLUMN IF NOT EXISTS disconnected_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS zoho_books_integrations_user_id_key
  ON public.zoho_books_integrations (user_id);

ALTER TABLE public.zoho_books_integrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own Zoho integration"
  ON public.zoho_books_integrations;
DROP POLICY IF EXISTS "Users can insert own Zoho integration"
  ON public.zoho_books_integrations;
DROP POLICY IF EXISTS "Users can update own Zoho integration"
  ON public.zoho_books_integrations;

REVOKE ALL ON TABLE public.zoho_books_integrations FROM anon, authenticated;
GRANT ALL ON TABLE public.zoho_books_integrations TO service_role;
