-- =====================================================================
-- 0038_performance_entries_platform_strict.sql
-- Removes the DEFAULT 'manual' on performance_entries.platform.
--
-- The default was silently rescuing sync code paths that forgot to set
-- platform explicitly (the original Instagram-sync bug — rows were
-- written without platform, fell back to 'manual', polluted the
-- aggregation that's supposed to filter by currently-connected social
-- accounts). The column stays NOT NULL, so now any future writer that
-- forgets the field will fail loudly with a NOT NULL violation at
-- INSERT time, surfacing the bug in dev / server logs immediately
-- instead of corrupting the dashboard.
--
-- All four current writers (savePerformanceEntry + syncInstagram /
-- syncFacebook / syncYouTube) now pass `platform` explicitly, so this
-- migration is safe today and the constraint will catch regressions
-- in any new sync function added later.
-- =====================================================================

alter table public.performance_entries
  alter column platform drop default;
