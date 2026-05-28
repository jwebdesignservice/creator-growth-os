-- =====================================================================
-- 0031_social_oauth.sql
-- Extends social_accounts with OAuth token storage so the "Connect"
-- buttons on the Performance page can actually authenticate against
-- each platform. Tokens are stored in plaintext (Supabase Vault is
-- overkill for an MVP); RLS already restricts reads/writes to the
-- owning user. OAuth CSRF state is handled via signed HTTP-only
-- cookies on the route layer, so no DB table for in-flight state.
-- =====================================================================

-- ── enum: add facebook ───────────────────────────────────────────────
-- Existing enum had instagram/tiktok/youtube/snapchat/linkedin/multiple/other
-- but no facebook. Add it without disturbing existing values.
alter type public.social_platform add value if not exists 'facebook';

-- ── columns on social_accounts ───────────────────────────────────────
alter table public.social_accounts
  add column if not exists provider_user_id  text,
  add column if not exists access_token      text,
  add column if not exists refresh_token     text,
  add column if not exists token_expires_at  timestamptz,
  add column if not exists scopes            text[],
  add column if not exists connected_at      timestamptz,
  add column if not exists last_synced_at    timestamptz,
  add column if not exists sync_status       text
    default 'idle'
    check (sync_status in ('idle', 'syncing', 'error')),
  add column if not exists sync_error        text,
  add column if not exists profile_url       text,
  add column if not exists display_name      text;

-- Used by the OAuth callback to upsert connections by (user, platform).
-- The existing UNIQUE(user_id, platform) on social_accounts already covers
-- this; nothing to add.

create index if not exists idx_social_accounts_provider_user
  on public.social_accounts (platform, provider_user_id)
  where provider_user_id is not null;

-- ── helper: clear OAuth-related columns on disconnect ────────────────
-- A user clicking "Disconnect" should drop the credentials but we want
-- to keep their handle + follower_count history if any. This function
-- is a convenience for the server action — RLS still applies.
create or replace function public.social_account_disconnect(
  p_user_id  uuid,
  p_platform social_platform
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.social_accounts
  set access_token = null,
      refresh_token = null,
      token_expires_at = null,
      scopes = null,
      sync_status = 'idle',
      sync_error = null,
      connected_at = null
  where user_id = p_user_id
    and platform = p_platform;
end $$;
