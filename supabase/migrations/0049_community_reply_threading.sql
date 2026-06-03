-- 0049_community_reply_threading.sql
-- Two things for richer discussion threads:
--   1. Nested replies — a reply can be a reply to another reply.
--   2. Emoji reactions on replies (mirrors community_post_reactions / 0048).

-- 1. Nested replies ----------------------------------------------------
alter table public.community_replies
  add column if not exists parent_reply_id uuid
    references public.community_replies(id) on delete cascade;

create index if not exists idx_community_replies_parent
  on public.community_replies(parent_reply_id);

-- 2. Reply reactions ---------------------------------------------------
create table if not exists public.community_reply_reactions (
  reply_id   uuid not null references public.community_replies(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (reply_id, user_id, emoji)
);
create index if not exists idx_community_reply_reactions_reply
  on public.community_reply_reactions(reply_id);

alter table public.community_reply_reactions enable row level security;

do $$ begin
  drop policy if exists "reply_reactions_select_all" on public.community_reply_reactions;
  drop policy if exists "reply_reactions_insert_own" on public.community_reply_reactions;
  drop policy if exists "reply_reactions_delete_own" on public.community_reply_reactions;
end $$;

create policy "reply_reactions_select_all" on public.community_reply_reactions
  for select using (auth.uid() is not null);

create policy "reply_reactions_insert_own" on public.community_reply_reactions
  for insert with check (auth.uid() = user_id);

create policy "reply_reactions_delete_own" on public.community_reply_reactions
  for delete using (auth.uid() = user_id);
