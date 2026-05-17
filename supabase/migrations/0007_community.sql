-- =====================================================================
-- Creator Growth OS — Community feature
-- Spaces, posts, replies, events. RLS allows any authenticated user
-- to read; only owners can mutate their own posts/replies.
-- =====================================================================

-- SPACES ---------------------------------------------------------------
create table if not exists public.community_spaces (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  description   text,
  category      creator_category,
  member_count  integer not null default 0,
  featured      boolean not null default false,
  sort_order    integer not null default 100,
  created_at    timestamptz not null default now()
);

-- POSTS ----------------------------------------------------------------
create table if not exists public.community_posts (
  id             uuid primary key default gen_random_uuid(),
  space_id       uuid not null references public.community_spaces(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  body           text not null,
  reply_count    integer not null default 0,
  last_reply_at  timestamptz,
  created_at     timestamptz not null default now()
);
create index if not exists idx_community_posts_space on public.community_posts(space_id, created_at desc);
create index if not exists idx_community_posts_user on public.community_posts(user_id);

-- REPLIES --------------------------------------------------------------
create table if not exists public.community_replies (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.community_posts(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_community_replies_post on public.community_replies(post_id, created_at);

-- EVENTS ---------------------------------------------------------------
create table if not exists public.community_events (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  host_name     text,
  starts_at     timestamptz not null,
  duration_min  integer not null default 60,
  joined_count  integer not null default 0,
  url           text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_community_events_start on public.community_events(starts_at);

-- TRIGGERS -------------------------------------------------------------
-- Keep reply_count + last_reply_at in sync on the parent post.
create or replace function public.touch_post_on_reply()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update public.community_posts
       set reply_count   = reply_count + 1,
           last_reply_at = new.created_at
     where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.community_posts
       set reply_count = greatest(reply_count - 1, 0)
     where id = old.post_id;
  end if;
  return null;
end $$;

drop trigger if exists trg_community_replies_count on public.community_replies;
create trigger trg_community_replies_count
  after insert or delete on public.community_replies
  for each row execute function public.touch_post_on_reply();

-- RLS ------------------------------------------------------------------
alter table public.community_spaces  enable row level security;
alter table public.community_posts   enable row level security;
alter table public.community_replies enable row level security;
alter table public.community_events  enable row level security;

-- Spaces: everyone signed in can read; admins manage.
drop policy if exists "spaces_select" on public.community_spaces;
create policy "spaces_select" on public.community_spaces
  for select using (auth.role() = 'authenticated');
drop policy if exists "spaces_admin_write" on public.community_spaces;
create policy "spaces_admin_write" on public.community_spaces
  for all using (public.is_admin()) with check (public.is_admin());

-- Posts: everyone signed in can read; owner can insert/update/delete own.
drop policy if exists "posts_select" on public.community_posts;
create policy "posts_select" on public.community_posts
  for select using (auth.role() = 'authenticated');
drop policy if exists "posts_owner_insert" on public.community_posts;
create policy "posts_owner_insert" on public.community_posts
  for insert with check (auth.uid() = user_id);
drop policy if exists "posts_owner_update" on public.community_posts;
create policy "posts_owner_update" on public.community_posts
  for update using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "posts_owner_delete" on public.community_posts;
create policy "posts_owner_delete" on public.community_posts
  for delete using (auth.uid() = user_id or public.is_admin());

-- Replies: same model as posts.
drop policy if exists "replies_select" on public.community_replies;
create policy "replies_select" on public.community_replies
  for select using (auth.role() = 'authenticated');
drop policy if exists "replies_owner_insert" on public.community_replies;
create policy "replies_owner_insert" on public.community_replies
  for insert with check (auth.uid() = user_id);
drop policy if exists "replies_owner_delete" on public.community_replies;
create policy "replies_owner_delete" on public.community_replies
  for delete using (auth.uid() = user_id or public.is_admin());

-- Events: everyone signed in can read; admins manage.
drop policy if exists "events_select" on public.community_events;
create policy "events_select" on public.community_events
  for select using (auth.role() = 'authenticated');
drop policy if exists "events_admin_write" on public.community_events;
create policy "events_admin_write" on public.community_events
  for all using (public.is_admin()) with check (public.is_admin());

-- SEED -----------------------------------------------------------------
-- Default spaces by creator category.
insert into public.community_spaces (slug, name, description, category, featured, sort_order, member_count)
values
  ('starter',      'Starter Creators',      'Find your niche, post your first videos, build the early habit.',  'starter',      true,  10, 142),
  ('growth',       'Growth Creators',       'Sharpen your content, grow your following, master consistency.',  'growth',       false, 20, 318),
  ('monetization', 'Monetization Creators', 'Brand deals, media kits, rate negotiation, sponsorships.',        'monetization', false, 30, 96),
  ('scale',        'Scale & Automate',      'Team workflows, systems, repurposing, audience compounding.',     'scale',        false, 40, 47)
on conflict (slug) do nothing;

-- A couple of upcoming events to make the page look alive.
insert into public.community_events (title, description, host_name, starts_at, duration_min, joined_count, url)
select 'Live: Hooks That Stop The Scroll',
       'Live workshop breaking down hooks that drive the highest retention.',
       'Coach Lia', now() + interval '3 days', 45, 38, '/community'
where not exists (select 1 from public.community_events where title = 'Live: Hooks That Stop The Scroll');

insert into public.community_events (title, description, host_name, starts_at, duration_min, joined_count, url)
select 'Q&A: Pitching Your First Brand Deal',
       'Bring your pitch — we''ll review live and rewrite together.',
       'Coach Marcus', now() + interval '7 days', 60, 24, '/community'
where not exists (select 1 from public.community_events where title = 'Q&A: Pitching Your First Brand Deal');
