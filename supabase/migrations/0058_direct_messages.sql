-- 0056_direct_messages.sql
-- 1:1 direct messaging. Mirrors the community chat schema (reply, react, edit,
-- delete, images, link previews, mentions, realtime) scoped to a private
-- conversation between exactly two users. No pinning / admin-only.

-- ── Conversations ───────────────────────────────────────────────────────────
create table if not exists public.dm_conversations (
  id                    uuid primary key default gen_random_uuid(),
  participant_1_id      uuid not null references auth.users(id) on delete cascade,
  participant_2_id      uuid not null references auth.users(id) on delete cascade,
  created_at            timestamptz not null default now(),
  -- Denormalised "latest activity" for cheap conversation-list sorting/previews.
  last_message_at       timestamptz not null default now(),
  last_message_preview  text,
  last_message_sender   uuid references auth.users(id) on delete set null,
  check (participant_1_id <> participant_2_id)
);

-- One conversation per unordered pair of users.
create unique index if not exists idx_dm_conversations_pair
  on public.dm_conversations (
    least(participant_1_id, participant_2_id),
    greatest(participant_1_id, participant_2_id)
  );
create index if not exists idx_dm_conversations_p1 on public.dm_conversations (participant_1_id);
create index if not exists idx_dm_conversations_p2 on public.dm_conversations (participant_2_id);
create index if not exists idx_dm_conversations_recent on public.dm_conversations (last_message_at desc);

-- ── Messages ────────────────────────────────────────────────────────────────
create table if not exists public.dm_messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.dm_conversations(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  body             text not null check (length(body) between 0 and 2000),
  deleted_at       timestamptz,
  deleted_by       uuid references auth.users(id),
  mention_user_ids uuid[] not null default '{}',
  author_name      text not null default 'Creator',
  author_avatar    text,
  reply_to_id      uuid references public.dm_messages(id) on delete set null,
  reply_to_preview jsonb,
  edited_at        timestamptz,
  image_url        text,
  link_preview     jsonb,
  created_at       timestamptz not null default now()
);
create index if not exists idx_dm_messages_conversation on public.dm_messages (conversation_id, created_at desc);
create index if not exists idx_dm_messages_user on public.dm_messages (user_id);

-- ── Reactions ───────────────────────────────────────────────────────────────
create table if not exists public.dm_reactions (
  message_id uuid not null references public.dm_messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null check (length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

-- ── Helper: is the current user a participant of a conversation? ─────────────
create or replace function public.is_dm_participant(conv uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.dm_conversations c
    where c.id = conv
      and (auth.uid() = c.participant_1_id or auth.uid() = c.participant_2_id)
  );
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.dm_conversations enable row level security;
alter table public.dm_messages      enable row level security;
alter table public.dm_reactions     enable row level security;

-- Conversations: only the two participants (or admins) can see/manage them. A
-- user may create a conversation they are part of.
drop policy if exists "dm_conv_select" on public.dm_conversations;
create policy "dm_conv_select" on public.dm_conversations
  for select using (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id or public.is_admin()
  );
drop policy if exists "dm_conv_insert" on public.dm_conversations;
create policy "dm_conv_insert" on public.dm_conversations
  for insert with check (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id
  );
drop policy if exists "dm_conv_update" on public.dm_conversations;
create policy "dm_conv_update" on public.dm_conversations
  for update using (
    auth.uid() = participant_1_id or auth.uid() = participant_2_id or public.is_admin()
  );

-- Messages: participants can read; a participant can insert as themselves; the
-- author (or an admin) can edit/soft-delete.
drop policy if exists "dm_msg_select" on public.dm_messages;
create policy "dm_msg_select" on public.dm_messages
  for select using (public.is_dm_participant(conversation_id) or public.is_admin());
drop policy if exists "dm_msg_insert" on public.dm_messages;
create policy "dm_msg_insert" on public.dm_messages
  for insert with check (
    auth.uid() = user_id and public.is_dm_participant(conversation_id)
  );
drop policy if exists "dm_msg_update" on public.dm_messages;
create policy "dm_msg_update" on public.dm_messages
  for update using (auth.uid() = user_id or public.is_admin());

-- Reactions: participants can read; users add/remove only their own.
drop policy if exists "dm_react_select" on public.dm_reactions;
create policy "dm_react_select" on public.dm_reactions
  for select using (
    public.is_admin() or exists (
      select 1 from public.dm_messages m
      where m.id = message_id and public.is_dm_participant(m.conversation_id)
    )
  );
drop policy if exists "dm_react_insert" on public.dm_reactions;
create policy "dm_react_insert" on public.dm_reactions
  for insert with check (
    auth.uid() = user_id and exists (
      select 1 from public.dm_messages m
      where m.id = message_id and public.is_dm_participant(m.conversation_id)
    )
  );
drop policy if exists "dm_react_delete" on public.dm_reactions;
create policy "dm_react_delete" on public.dm_reactions
  for delete using (auth.uid() = user_id);

-- ── Trigger: keep conversation "last activity" fresh on each new message ─────
create or replace function public.dm_touch_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.dm_conversations
     set last_message_at      = new.created_at,
         last_message_preview = left(coalesce(nullif(new.body, ''), '📷 Photo'), 140),
         last_message_sender  = new.user_id
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_dm_touch_conversation on public.dm_messages;
create trigger trg_dm_touch_conversation
  after insert on public.dm_messages
  for each row execute function public.dm_touch_conversation();

-- ── Realtime ────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.dm_messages;
alter publication supabase_realtime add table public.dm_reactions;
