-- 0047_community_post_votes.sql
-- Like / dislike votes on community discussion posts.
-- One row per (post, user); value = 1 (like) or -1 (dislike).

create table if not exists public.community_post_votes (
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  value      smallint not null check (value in (1, -1)),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists idx_community_post_votes_post
  on public.community_post_votes(post_id);

alter table public.community_post_votes enable row level security;

do $$ begin
  drop policy if exists "post_votes_select_all" on public.community_post_votes;
  drop policy if exists "post_votes_insert_own" on public.community_post_votes;
  drop policy if exists "post_votes_update_own" on public.community_post_votes;
  drop policy if exists "post_votes_delete_own" on public.community_post_votes;
end $$;

-- Any signed-in user can read votes (needed to render like/dislike counts).
create policy "post_votes_select_all" on public.community_post_votes
  for select using (auth.uid() is not null);

-- Users can only cast / change / remove their own vote.
create policy "post_votes_insert_own" on public.community_post_votes
  for insert with check (auth.uid() = user_id);

create policy "post_votes_update_own" on public.community_post_votes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "post_votes_delete_own" on public.community_post_votes
  for delete using (auth.uid() = user_id);
