-- =====================================================================
-- 0023_community_chat.sql
-- Global community chat: messages table, RLS, realtime publication.
-- =====================================================================

-- Extend notification_type enum with chat_mention
alter type public.notification_type add value if not exists 'chat_mention';

-- MESSAGES TABLE -------------------------------------------------------
create table public.community_chat_messages (
  id               uuid      primary key default gen_random_uuid(),
  user_id          uuid      not null references auth.users(id) on delete cascade,
  body             text      not null check (length(body) between 1 and 2000),
  pinned           boolean   not null default false,
  deleted_at       timestamptz,
  deleted_by       uuid      references auth.users(id),
  mention_user_ids uuid[]    not null default '{}',
  -- Denormalized author fields so realtime INSERT events carry display data
  -- without requiring a cross-user profile JOIN (profiles RLS restricts
  -- reading other users' rows to admins only).
  author_name      text      not null default 'Creator',
  author_avatar    text,
  author_is_admin  boolean   not null default false,
  created_at       timestamptz not null default now()
);

create index idx_chat_created
  on public.community_chat_messages (created_at desc)
  where deleted_at is null;

create index idx_chat_pinned
  on public.community_chat_messages (pinned)
  where pinned = true and deleted_at is null;

-- REALTIME -------------------------------------------------------------
alter publication supabase_realtime add table public.community_chat_messages;

-- RLS ------------------------------------------------------------------
alter table public.community_chat_messages enable row level security;

-- Any signed-in user can read (including soft-deleted rows — client hides them)
drop policy if exists "chat_select" on public.community_chat_messages;
create policy "chat_select" on public.community_chat_messages
  for select using (auth.role() = 'authenticated');

-- Users INSERT as themselves; cannot pre-pin or pre-delete on insert
drop policy if exists "chat_insert" on public.community_chat_messages;
create policy "chat_insert" on public.community_chat_messages
  for insert with check (
    auth.uid() = user_id
    and pinned = false
    and deleted_at is null
  );

-- Owners can soft-delete their own rows; admins can update anything
-- (including pin/unpin). Per-column enforcement is in the action layer.
drop policy if exists "chat_update" on public.community_chat_messages;
create policy "chat_update" on public.community_chat_messages
  for update using  (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());
