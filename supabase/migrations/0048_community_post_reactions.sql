-- 0048_community_post_reactions.sql
-- Emoji reactions on community discussion posts (separate from like/dislike
-- votes in 0047). One row per (post, user, emoji).

create table if not exists public.community_post_reactions (
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  emoji      text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, emoji)
);
create index if not exists idx_community_post_reactions_post
  on public.community_post_reactions(post_id);

alter table public.community_post_reactions enable row level security;

do $$ begin
  drop policy if exists "post_reactions_select_all" on public.community_post_reactions;
  drop policy if exists "post_reactions_insert_own" on public.community_post_reactions;
  drop policy if exists "post_reactions_delete_own" on public.community_post_reactions;
end $$;

-- Any signed-in user can read reactions (needed to render counts).
create policy "post_reactions_select_all" on public.community_post_reactions
  for select using (auth.uid() is not null);

-- Users can only add / remove their own reactions.
create policy "post_reactions_insert_own" on public.community_post_reactions
  for insert with check (auth.uid() = user_id);

create policy "post_reactions_delete_own" on public.community_post_reactions
  for delete using (auth.uid() = user_id);
