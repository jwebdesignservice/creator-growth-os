-- =====================================================================
-- 0035_social_provider_data.sql
-- Adds provider_data jsonb to social_accounts for platform-specific
-- payloads (page access tokens, IG Business Account IDs, channel IDs,
-- etc.) without polluting the table with per-platform columns.
-- =====================================================================

alter table public.social_accounts
  add column if not exists provider_data jsonb not null default '{}'::jsonb;
