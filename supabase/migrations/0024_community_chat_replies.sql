-- =====================================================================
-- 0024_community_chat_replies.sql
-- Adds quote-reply support to community_chat_messages.
-- =====================================================================

alter table public.community_chat_messages
  add column if not exists reply_to_id      uuid references public.community_chat_messages(id) on delete set null,
  add column if not exists reply_to_preview jsonb;

-- Index for fetching all replies to a parent (used by future threading UI)
create index if not exists idx_chat_reply_to
  on public.community_chat_messages (reply_to_id)
  where reply_to_id is not null and deleted_at is null;
