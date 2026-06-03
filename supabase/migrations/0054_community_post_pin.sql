-- 0054_community_post_pin.sql
-- Let admins pin discussion threads to the top of the feed.
-- pinned_at is null for normal posts; set to a timestamp when pinned (so the
-- feed can order the most-recently-pinned first).

alter table public.community_posts
  add column if not exists pinned_at timestamptz;

create index if not exists idx_community_posts_pinned
  on public.community_posts(pinned_at)
  where pinned_at is not null;
