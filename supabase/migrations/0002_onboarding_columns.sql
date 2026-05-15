-- =====================================================================
-- Creator Growth OS — onboarding answers columns (additive)
-- Run AFTER 0001_init.sql. Safe to re-run (idempotent).
-- =====================================================================

alter table public.profiles
  add column if not exists weekly_pace          text,
  add column if not exists top_value_priorities text[] not null default array[]::text[],
  add column if not exists focus_formats        text[] not null default array[]::text[],
  add column if not exists help_needs           text[] not null default array[]::text[],
  add column if not exists onboarded_at         timestamptz;

-- Index for fast onboarded lookups in middleware/layout
create index if not exists idx_profiles_onboarded on public.profiles (onboarded);
