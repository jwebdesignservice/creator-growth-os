-- =====================================================================
-- 0036_performance_entries_platform.sql
-- Add per-platform dimension to performance_entries so multiple social
-- syncs (Instagram, Facebook, YouTube, etc.) can each own their own
-- weekly row instead of fighting over a single (user, week) cell.
--
-- Existing data (manually entered weekly summaries) is backfilled with
-- platform = 'manual'. Each social platform's sync function will write
-- with its provider key (instagram / facebook / youtube / tiktok /
-- linkedin / snapchat).
--
-- Aggregation strategy lives in queries.ts: KPI tiles SUM rows for
-- currently-connected platforms (access_token NOT NULL), falling back
-- to the 'manual' row when no platform is connected. When a user
-- disconnects a platform its row stays for history but no longer
-- contributes to current totals.
-- =====================================================================

alter table public.performance_entries
  add column if not exists platform text;

-- Backfill: every existing row becomes a manual entry. New manual-form
-- submissions will continue to use this value via savePerformanceEntry.
update public.performance_entries
  set platform = 'manual'
  where platform is null;

alter table public.performance_entries
  alter column platform set default 'manual',
  alter column platform set not null;

-- Replace the old (user_id, week_start) unique constraint with a
-- 3-tuple including platform. Use DO blocks to handle either naming —
-- Supabase auto-names the original constraint and it may differ across
-- branches.
do $$
declare
  con_name text;
begin
  select conname into con_name
  from pg_constraint
  where conrelid = 'public.performance_entries'::regclass
    and contype = 'u'
    and pg_get_constraintdef(oid) ~* 'user_id.*week_start\)';
  if con_name is not null then
    execute format('alter table public.performance_entries drop constraint %I', con_name);
  end if;
end $$;

alter table public.performance_entries
  add constraint performance_entries_user_week_platform_unique
  unique (user_id, week_start, platform);

create index if not exists idx_performance_entries_platform
  on public.performance_entries (platform);
