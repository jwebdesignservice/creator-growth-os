-- ============================================================================
-- 0022_realtime_notifications.sql
--
-- Enable Supabase Realtime broadcasts for the notifications table so the
-- topbar bell can update live when a new row is inserted (e.g. when an
-- admin publishes an announcement or a community reply lands).
--
-- RLS already restricts which rows a client can read, so the realtime
-- publication respects that — each subscriber only receives events for
-- rows their RLS policy lets them see.
-- ============================================================================

alter publication supabase_realtime add table public.notifications;
