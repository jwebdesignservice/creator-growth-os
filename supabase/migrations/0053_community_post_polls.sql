-- 0053_community_post_polls.sql
-- Polls on discussion posts. A post can carry an optional single-choice poll.
--
-- The poll definition lives on the post as jsonb:
--   { "options": [ { "id": "uuid", "text": "Yes" }, { "id": "uuid", "text": "No" } ] }
-- Votes live in their own table — one row per (post, user); option_id points at
-- an option id inside the post's poll jsonb.

alter table public.community_posts
  add column if not exists poll jsonb;

create table if not exists public.community_poll_votes (
  post_id    uuid not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  option_id  text not null,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
create index if not exists idx_community_poll_votes_post
  on public.community_poll_votes(post_id);

alter table public.community_poll_votes enable row level security;

do $$ begin
  drop policy if exists "poll_votes_select_all" on public.community_poll_votes;
  drop policy if exists "poll_votes_insert_own" on public.community_poll_votes;
  drop policy if exists "poll_votes_update_own" on public.community_poll_votes;
  drop policy if exists "poll_votes_delete_own" on public.community_poll_votes;
end $$;

create policy "poll_votes_select_all" on public.community_poll_votes
  for select using (auth.uid() is not null);

create policy "poll_votes_insert_own" on public.community_poll_votes
  for insert with check (auth.uid() = user_id);

create policy "poll_votes_update_own" on public.community_poll_votes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "poll_votes_delete_own" on public.community_poll_votes
  for delete using (auth.uid() = user_id);
