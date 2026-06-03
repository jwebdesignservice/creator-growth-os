-- 0051_community_event_kind.sql
-- Event "type" for community events (Live Session / Q&A / Workshop / …) so the
-- members' Events tab can show a type badge and the admin can categorise them.

alter table public.community_events
  add column if not exists kind text;

-- Backfill existing rows to a sensible default.
update public.community_events set kind = 'live' where kind is null;
