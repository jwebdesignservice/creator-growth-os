-- =====================================================================
-- 0025_community_chat_extras.sql
-- Reactions table + edited_at / image_url / link_preview columns.
-- =====================================================================

-- REACTIONS ------------------------------------------------------------
create table if not exists public.community_chat_reactions (
  message_id uuid        not null references public.community_chat_messages(id) on delete cascade,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  emoji      text        not null check (length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id, emoji)
);

create index if not exists idx_reactions_message
  on public.community_chat_reactions (message_id);

-- Realtime broadcast for reactions
alter publication supabase_realtime add table public.community_chat_reactions;

-- RLS
alter table public.community_chat_reactions enable row level security;

drop policy if exists "reactions_select" on public.community_chat_reactions;
create policy "reactions_select" on public.community_chat_reactions
  for select using (auth.role() = 'authenticated');

drop policy if exists "reactions_insert" on public.community_chat_reactions;
create policy "reactions_insert" on public.community_chat_reactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "reactions_delete" on public.community_chat_reactions;
create policy "reactions_delete" on public.community_chat_reactions
  for delete using (auth.uid() = user_id);

-- EDIT + IMAGE + LINK PREVIEW COLUMNS ----------------------------------
alter table public.community_chat_messages
  add column if not exists edited_at    timestamptz,
  add column if not exists image_url    text,
  add column if not exists link_preview jsonb;

-- Relax body length constraint so image-only messages (empty body) are allowed.
-- The action layer ensures at least one of body/image_url is present.
alter table public.community_chat_messages
  drop constraint if exists community_chat_messages_body_check;
alter table public.community_chat_messages
  add constraint community_chat_messages_body_check
    check (length(body) between 0 and 2000);
