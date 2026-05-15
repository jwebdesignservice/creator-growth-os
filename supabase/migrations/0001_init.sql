-- =====================================================================
-- Creator Growth OS — initial schema (V3 MVP)
-- Run this once in the Supabase SQL Editor for project
--   mierwogzdiplwpksaoka
-- Safe to re-run: every object is created idempotently.
-- =====================================================================

-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type creator_category as enum ('starter', 'growth', 'monetization', 'scale');
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_plan as enum ('free', 'basic', 'pro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type social_platform as enum (
    'tiktok','instagram','youtube','snapchat','linkedin','multiple','other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type mission_status as enum (
    'pending','in_progress','completed','skipped','overdue'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum (
    'idea','planned','scripted','filmed','edited','posted','reviewed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type subscription_status as enum (
    'active','past_due','cancelled','trialing','incomplete'
  );
exception when duplicate_object then null; end $$;


-- PROFILES --------------------------------------------------------------
-- Extends auth.users one-to-one.

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  display_name    text,
  email           text not null,
  phone           text,
  avatar_url      text,
  category        creator_category not null default 'starter',
  plan            subscription_plan not null default 'free',

  primary_platform   social_platform,
  niche              text,
  follower_base      text,   -- bracket: '0-1k','1k-10k','10k-50k','50k+'
  main_goal          text,
  bottleneck         text,
  time_per_week      text,
  content_frequency  text,
  monetization_status text,
  confidence_score   smallint check (confidence_score between 1 and 10),

  onboarded         boolean not null default false,
  daily_streak      int not null default 0,
  last_active_date  date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_category on public.profiles (category);
create index if not exists idx_profiles_plan on public.profiles (plan);


-- SOCIAL ACCOUNTS -------------------------------------------------------
create table if not exists public.social_accounts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  platform        social_platform not null,
  handle          text,
  follower_count  int not null default 0,
  is_primary      boolean not null default false,
  updated_at      timestamptz not null default now(),
  unique (user_id, platform)
);

create index if not exists idx_social_accounts_user on public.social_accounts (user_id);


-- SUBSCRIPTIONS ---------------------------------------------------------
create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references public.profiles(id) on delete cascade,
  plan                     subscription_plan not null default 'free',
  status                   subscription_status not null default 'active',
  stripe_customer_id       text,
  stripe_subscription_id   text,
  current_period_end       timestamptz,
  cancel_at_period_end     boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);


-- PROGRAMS --------------------------------------------------------------
create table if not exists public.programs (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title             text not null,
  description       text,
  cover_image_url   text,
  category_access   creator_category[] not null default array['starter','growth','monetization','scale']::creator_category[],
  plan_access       subscription_plan not null default 'basic',
  total_lessons     int not null default 0,
  total_tasks       int not null default 0,
  estimated_days    int not null default 30,
  sort_order        int not null default 0,
  published         boolean not null default true,
  created_at        timestamptz not null default now()
);


-- LESSONS / TUTORIALS / DRILLS / TEMPLATES ------------------------------
create table if not exists public.lessons (
  id                uuid primary key default gen_random_uuid(),
  program_id        uuid references public.programs(id) on delete cascade,
  slug              text unique not null,
  title             text not null,
  description       text,
  video_url         text,
  cover_image_url   text,
  duration_seconds  int not null default 0,
  difficulty        text not null default 'intermediate',
  content_type      text not null default 'video',  -- video|drill|template|checklist|assignment
  category          creator_category,
  plan_access       subscription_plan not null default 'basic',
  sort_order        int not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists idx_lessons_program on public.lessons (program_id);


-- LESSON PROGRESS -------------------------------------------------------
create table if not exists public.lesson_progress (
  user_id          uuid not null references public.profiles(id) on delete cascade,
  lesson_id        uuid not null references public.lessons(id) on delete cascade,
  watched_seconds  int not null default 0,
  completed        boolean not null default false,
  completed_at     timestamptz,
  primary key (user_id, lesson_id)
);


-- PROGRAM PROGRESS (cached aggregate) -----------------------------------
create table if not exists public.program_progress (
  user_id           uuid not null references public.profiles(id) on delete cascade,
  program_id        uuid not null references public.programs(id) on delete cascade,
  lessons_completed int not null default 0,
  tasks_completed   int not null default 0,
  status            text not null default 'not_started', -- not_started|in_progress|completed
  started_at        timestamptz,
  completed_at      timestamptz,
  primary key (user_id, program_id)
);


-- MISSIONS --------------------------------------------------------------
create table if not exists public.mission_templates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  mission_type  text not null default 'posting',  -- posting|strategy|engagement|performance|monetization|confidence
  category      creator_category,
  plan_access   subscription_plan not null default 'basic',
  points        int not null default 10,
  created_at    timestamptz not null default now()
);

create table if not exists public.missions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  template_id  uuid references public.mission_templates(id) on delete set null,
  title        text not null,
  description  text,
  due_date     date,
  status       mission_status not null default 'pending',
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists idx_missions_user_due on public.missions (user_id, due_date);


-- POSTING PLANS ---------------------------------------------------------
create table if not exists public.posting_plans (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade,
  category    creator_category,
  title       text not null,
  week_start  date not null,
  description text,
  status      text not null default 'active',  -- draft|active|archived
  created_at  timestamptz not null default now()
);

create table if not exists public.posting_plan_items (
  id            uuid primary key default gen_random_uuid(),
  plan_id       uuid not null references public.posting_plans(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete cascade,
  scheduled_for timestamptz,
  platform      social_platform,
  content_type  text,   -- reel|story|carousel|short|post|video
  topic         text,
  status        content_status not null default 'planned',
  created_at    timestamptz not null default now()
);

create index if not exists idx_posting_items_plan on public.posting_plan_items (plan_id);
create index if not exists idx_posting_items_user on public.posting_plan_items (user_id);


-- CONTENT PILLARS -------------------------------------------------------
create table if not exists public.content_pillars (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  label       text not null,
  weight      smallint not null default 25,
  sort_order  smallint not null default 0
);


-- PERFORMANCE ENTRIES (weekly manual metrics) ---------------------------
create table if not exists public.performance_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  week_start      date not null,
  followers       int,
  reach           int,
  views           int,
  posts_published int,
  engagement_rate numeric(5,2),
  profile_visits  int,
  clicks          int,
  revenue         numeric(12,2),
  best_post       text,
  lesson_learned  text,
  created_at      timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists idx_performance_user_week on public.performance_entries (user_id, week_start);


-- ANNOUNCEMENTS (admin broadcast) ---------------------------------------
create table if not exists public.announcements (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  body              text,
  audience_plan     subscription_plan,
  audience_category creator_category,
  published_at      timestamptz not null default now()
);


-- ADMIN ROLES -----------------------------------------------------------
-- Simple role table; main influencer/admin gets a row here.
create table if not exists public.admin_users (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'admin',
  created_at  timestamptz not null default now()
);


-- TRIGGERS --------------------------------------------------------------

-- updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_subscriptions_updated_at on public.subscriptions;
create trigger trg_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.touch_updated_at();


-- On signup, create profile + free subscription row
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ROW-LEVEL SECURITY ----------------------------------------------------

alter table public.profiles            enable row level security;
alter table public.social_accounts     enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.programs            enable row level security;
alter table public.lessons             enable row level security;
alter table public.lesson_progress     enable row level security;
alter table public.program_progress    enable row level security;
alter table public.mission_templates   enable row level security;
alter table public.missions            enable row level security;
alter table public.posting_plans       enable row level security;
alter table public.posting_plan_items  enable row level security;
alter table public.content_pillars     enable row level security;
alter table public.performance_entries enable row level security;
alter table public.announcements       enable row level security;
alter table public.admin_users         enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

-- Profiles
drop policy if exists "profiles_self_select" on public.profiles;
create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_admin_insert" on public.profiles;
create policy "profiles_admin_insert" on public.profiles
  for insert with check (auth.uid() = id or public.is_admin());

-- Social accounts
drop policy if exists "social_self_all" on public.social_accounts;
create policy "social_self_all" on public.social_accounts
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());

-- Subscriptions (read-only for user; admin can write)
drop policy if exists "subscriptions_self_select" on public.subscriptions;
create policy "subscriptions_self_select" on public.subscriptions
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "subscriptions_admin_write" on public.subscriptions;
create policy "subscriptions_admin_write" on public.subscriptions
  for all using (public.is_admin())
            with check (public.is_admin());

-- Programs & lessons: readable by all authenticated, writable by admin
drop policy if exists "programs_read_all" on public.programs;
create policy "programs_read_all" on public.programs
  for select using (auth.role() = 'authenticated');
drop policy if exists "programs_admin_write" on public.programs;
create policy "programs_admin_write" on public.programs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lessons_read_all" on public.lessons;
create policy "lessons_read_all" on public.lessons
  for select using (auth.role() = 'authenticated');
drop policy if exists "lessons_admin_write" on public.lessons;
create policy "lessons_admin_write" on public.lessons
  for all using (public.is_admin()) with check (public.is_admin());

-- Lesson progress / program progress: per-user
drop policy if exists "lesson_progress_self" on public.lesson_progress;
create policy "lesson_progress_self" on public.lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "program_progress_self" on public.program_progress;
create policy "program_progress_self" on public.program_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Missions: user sees own; admin can assign
drop policy if exists "missions_self_select" on public.missions;
create policy "missions_self_select" on public.missions
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "missions_self_update" on public.missions;
create policy "missions_self_update" on public.missions
  for update using (auth.uid() = user_id);
drop policy if exists "missions_admin_write" on public.missions;
create policy "missions_admin_write" on public.missions
  for insert with check (public.is_admin() or auth.uid() = user_id);
drop policy if exists "missions_admin_delete" on public.missions;
create policy "missions_admin_delete" on public.missions
  for delete using (public.is_admin());

-- Mission templates: read by all, write by admin
drop policy if exists "mission_templates_read" on public.mission_templates;
create policy "mission_templates_read" on public.mission_templates
  for select using (auth.role() = 'authenticated');
drop policy if exists "mission_templates_admin_write" on public.mission_templates;
create policy "mission_templates_admin_write" on public.mission_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- Posting plans
drop policy if exists "posting_plans_self" on public.posting_plans;
create policy "posting_plans_self" on public.posting_plans
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());
drop policy if exists "posting_items_self" on public.posting_plan_items;
create policy "posting_items_self" on public.posting_plan_items
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());

-- Pillars
drop policy if exists "pillars_self" on public.content_pillars;
create policy "pillars_self" on public.content_pillars
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Performance entries
drop policy if exists "performance_self" on public.performance_entries;
create policy "performance_self" on public.performance_entries
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id);

-- Announcements: visible if audience matches user's plan/category
drop policy if exists "announcements_visible" on public.announcements;
create policy "announcements_visible" on public.announcements
  for select using (
    auth.role() = 'authenticated'
    and (audience_plan is null or audience_plan = (select plan from public.profiles where id = auth.uid()))
    and (audience_category is null or audience_category = (select category from public.profiles where id = auth.uid()))
  );

-- Admin users self read
drop policy if exists "admin_users_self" on public.admin_users;
create policy "admin_users_self" on public.admin_users
  for select using (auth.uid() = user_id or public.is_admin());


-- BACKFILL: create profile + subscription rows for any auth.users that
-- existed before the trigger was installed (e.g. the admin's own account).
insert into public.profiles (id, email, full_name, display_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data->>'avatar_url'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

insert into public.subscriptions (user_id, plan, status)
select u.id, 'free', 'active'
from auth.users u
left join public.subscriptions s on s.user_id = u.id
where s.user_id is null;


-- SEED: starter programs (matches dashboard mock cards) -----------------
insert into public.programs (slug, title, description, plan_access, sort_order, total_lessons, total_tasks, estimated_days)
values
  ('influencer-blueprint','The Influencer Blueprint','Build your personal brand, find your niche, and create a consistent content system from the ground up.','basic',1,24,18,30),
  ('content-that-connects','Content That Connects','Create content that attracts & converts your ideal audience.','basic',2,20,15,30),
  ('monetize-your-influence','Monetize Your Influence','Turn your audience into income with multiple revenue streams.','basic',3,22,16,30),
  ('scale-and-automate','Scale & Automate','Systemize your content, team and workflows to scale your impact.','pro',4,20,14,30)
on conflict (slug) do nothing;


-- SEED: mission templates (a few per category) --------------------------
insert into public.mission_templates (title, description, mission_type, category, plan_access) values
  ('Post a story and engage with 10 followers','Build daily connection. Reply to anyone who interacts.','engagement','starter','free'),
  ('Reply to DMs and comments','Spend 15 minutes replying to your DMs and last 3 posts'' comments.','engagement','growth','basic'),
  ('Plan tomorrow''s content (3 posts)','Outline tomorrow''s reel, story and carousel before bed.','strategy','growth','basic'),
  ('Watch lesson: Content Pillars That Work','Complete the Content Pillars lesson and capture 3 takeaways.','strategy','growth','basic'),
  ('Analyze top performing post','Open analytics, identify what made your best post work.','performance','growth','basic'),
  ('Send 3 brand outreach messages','Use the outreach template; aim for tone-matched personalization.','monetization','monetization','pro')
on conflict do nothing;
