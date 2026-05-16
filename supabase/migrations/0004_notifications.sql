-- =====================================================================
-- Creator Growth OS — Notifications system (V4)
-- Run this in the Supabase SQL Editor after 0003_lessons_seed.sql
-- Safe to re-run: every object is created/replaced idempotently.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────

do $$ begin
  create type notification_type as enum (
    'task_assigned',
    'task_due',
    'task_completed',
    'milestone_reached',
    'posting_plan_updated',
    'post_reminder',
    'tutorial_unlocked',
    'program_available',
    'community_reply',
    'coach_message',
    'live_event',
    'upgrade_recommendation',
    'billing_update',
    'announcement'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_category as enum (
    'task',
    'program',
    'community',
    'event',
    'system'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_status as enum (
    'unread',
    'read',
    'archived'
  );
exception when duplicate_object then null; end $$;


-- ─────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS
-- The core table. One row per notification per user.
-- Admins and the service role insert rows; users only read/update their own.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.notifications (
  id           uuid             primary key default gen_random_uuid(),
  user_id      uuid             not null references public.profiles(id) on delete cascade,

  -- Content
  title        text             not null,
  body         text,

  -- Classification
  type         notification_type     not null,
  category     notification_category not null,

  -- 1 = most urgent (live events), 5 = lowest (system/info)
  priority     smallint         not null default 3
                                check (priority between 1 and 5),

  -- Lifecycle
  status       notification_status not null default 'unread',
  read_at      timestamptz,
  expires_at   timestamptz,                      -- null = never expires

  -- CTA
  action_label text,
  action_url   text,

  -- Flexible payload for future integrations (event ids, program slugs, etc.)
  metadata     jsonb            not null default '{}',

  created_at   timestamptz      not null default now(),
  updated_at   timestamptz      not null default now()
);

-- Indexes for the most common query patterns
create index if not exists idx_notif_user_status
  on public.notifications (user_id, status);

create index if not exists idx_notif_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notif_user_priority_created
  on public.notifications (user_id, priority asc, created_at desc);

create index if not exists idx_notif_type
  on public.notifications (type);

-- Partial index for expiry cleanup (cron / Edge Function can use this)
create index if not exists idx_notif_expires
  on public.notifications (expires_at)
  where expires_at is not null;


-- ─────────────────────────────────────────────────────────────────────
-- NOTIFICATION PREFERENCES
-- Per-user opt-in/out for each delivery channel and category.
-- Auto-created with defaults when a new profile is inserted.
-- ─────────────────────────────────────────────────────────────────────

create table if not exists public.notification_preferences (
  user_id              uuid primary key references public.profiles(id) on delete cascade,

  -- In-app channels (controls what appears in the bell dropdown + /notifications page)
  inapp_tasks          boolean not null default true,
  inapp_programs       boolean not null default true,
  inapp_community      boolean not null default true,
  inapp_events         boolean not null default true,
  inapp_system         boolean not null default false,

  -- Email channels (controls future email delivery)
  email_digest         boolean not null default true,   -- weekly summary
  email_alerts         boolean not null default false,  -- instant per-event
  email_product_updates boolean not null default true,

  updated_at           timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────────────
-- TRIGGERS
-- ─────────────────────────────────────────────────────────────────────

-- Auto-update updated_at on notifications
drop trigger if exists trg_notifications_updated_at on public.notifications;
create trigger trg_notifications_updated_at
  before update on public.notifications
  for each row execute function public.touch_updated_at();

-- Auto-update updated_at on notification_preferences
drop trigger if exists trg_notif_prefs_updated_at on public.notification_preferences;
create trigger trg_notif_prefs_updated_at
  before update on public.notification_preferences
  for each row execute function public.touch_updated_at();

-- Auto-create default preferences row when a new profile is inserted.
-- This means every new user starts with sensible defaults without any
-- extra application code.
create or replace function public.handle_new_profile_preferences()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end $$;

drop trigger if exists on_profile_created_preferences on public.profiles;
create trigger on_profile_created_preferences
  after insert on public.profiles
  for each row execute function public.handle_new_profile_preferences();


-- ─────────────────────────────────────────────────────────────────────
-- BROADCAST HELPER FUNCTION
-- Inserts one notification row per matching user in a single statement.
-- Used for:
--   • announce to all users         → p_plan = null, p_cat_filter = null
--   • announce to a plan tier       → p_plan = 'free'/'basic'/'pro'
--   • announce to a creator category → p_cat_filter = 'growth' etc.
--   • combine both filters          → p_plan = 'basic', p_cat_filter = 'growth'
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.notify_broadcast(
  p_title          text,
  p_body           text,
  p_type           notification_type,
  p_category       notification_category,
  p_priority       smallint              default 3,
  p_action_label   text                  default null,
  p_action_url     text                  default null,
  p_metadata       jsonb                 default '{}',
  p_plan           subscription_plan     default null,    -- null = all plans
  p_category_filter creator_category     default null     -- null = all categories
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    user_id, title, body, type, category,
    priority, action_label, action_url, metadata
  )
  select
    p.id,
    p_title,
    p_body,
    p_type,
    p_category,
    p_priority,
    p_action_label,
    p_action_url,
    p_metadata
  from public.profiles p
  where
    (p_plan            is null or p.plan     = p_plan)
    and
    (p_category_filter is null or p.category = p_category_filter);
end $$;


-- ─────────────────────────────────────────────────────────────────────
-- UNREAD COUNT FUNCTION
-- Lightweight helper — used in server components and the shell context.
-- Returns the unread notification count for the currently authenticated user.
-- ─────────────────────────────────────────────────────────────────────

create or replace function public.get_unread_notification_count(p_user_id uuid)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select count(*)
  from public.notifications
  where user_id = p_user_id
    and status  = 'unread'
    and (expires_at is null or expires_at > now());
$$;


-- ─────────────────────────────────────────────────────────────────────
-- ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────

alter table public.notifications            enable row level security;
alter table public.notification_preferences enable row level security;

-- ── notifications ──────────────────────────────────────────────────

-- Users may read their own non-archived notifications.
drop policy if exists "notif_select_own" on public.notifications;
create policy "notif_select_own" on public.notifications
  for select using (auth.uid() = user_id);

-- Users may update status/read_at on their own rows only.
drop policy if exists "notif_update_own" on public.notifications;
create policy "notif_update_own" on public.notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Only admins (or service role, which bypasses RLS) may insert notifications.
-- The application always uses the service-role client to create notifications.
drop policy if exists "notif_insert_admin" on public.notifications;
create policy "notif_insert_admin" on public.notifications
  for insert with check (public.is_admin());

-- Admins may delete (e.g. bulk cleanup of expired rows).
drop policy if exists "notif_delete_admin" on public.notifications;
create policy "notif_delete_admin" on public.notifications
  for delete using (public.is_admin());

-- ── notification_preferences ───────────────────────────────────────

-- Users read/write their own preferences; admins can read all.
drop policy if exists "notif_prefs_self" on public.notification_preferences;
create policy "notif_prefs_self" on public.notification_preferences
  for all
  using  (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────────
-- BACKFILL
-- Create default notification_preferences rows for every existing user
-- who signed up before this migration ran.
-- ─────────────────────────────────────────────────────────────────────

insert into public.notification_preferences (user_id)
select id from public.profiles
on conflict (user_id) do nothing;


-- ─────────────────────────────────────────────────────────────────────
-- SEED — sample notifications for existing users
-- Creates one realistic notification of each category so the UI renders
-- real data immediately after the migration. Safe to run multiple times
-- because we check for an existing row first via the DO block.
-- ─────────────────────────────────────────────────────────────────────

do $$
declare
  v_uid uuid;
begin
  -- Seed only if there is at least one real user and no notifications yet
  select id into v_uid from public.profiles limit 1;
  if v_uid is null then return; end if;
  if exists (select 1 from public.notifications where user_id = v_uid) then return; end if;

  insert into public.notifications
    (user_id, title, body, type, category, priority, action_label, action_url, metadata, created_at)
  values
    -- Today: task (priority 2)
    (v_uid,
     'New daily task assigned',
     'Create 3 content ideas for your niche and add them to your content bank.',
     'task_assigned', 'task', 2, 'View Task', '/missions', '{}',
     now() - interval '1 hour'),

    -- Today: task (priority 2)
    (v_uid,
     'Finish today''s posting plan item',
     'You have 1 scheduled post planned for today. Don''t let your streak break!',
     'post_reminder', 'task', 2, 'See Plan', '/posting', '{}',
     now() - interval '1.5 hours'),

    -- Today: program (priority 3)
    (v_uid,
     'New tutorial unlocked for you',
     '"Engaging Captions That Convert" is now available in your Growth Creator path.',
     'tutorial_unlocked', 'program', 3, 'Open Tutorial', '/tutorials', '{"lesson_slug":"engaging-captions-that-convert"}',
     now() - interval '2 hours'),

    -- Today: milestone (priority 3)
    (v_uid,
     'Milestone reached! 🎉',
     'You''ve completed 50% of the Growth Creator program. Keep it up!',
     'milestone_reached', 'program', 3, 'View Progress', '/programs', '{"percent":50}',
     now() - interval '2.5 hours'),

    -- This week: live event (priority 1) — highest urgency, sorts first
    (v_uid,
     'Live Workshop starts in 1 hour',
     'Content Strategy Masterclass with Isabelle Morgan begins at 2:00 PM (CEST).',
     'live_event', 'event', 1, 'Join Live', '/community',
     '{"event_title":"Content Strategy Masterclass","live":true}',
     now() - interval '4 days'),

    -- This week: community reply (priority 4)
    (v_uid,
     'Sophie Lee replied to your post',
     '"Love this breakdown! The hook examples were super helpful."',
     'community_reply', 'community', 4, 'Reply', '/community',
     '{"author_name":"Sophie Lee"}',
     now() - interval '4 days 1 hour'),

    -- This week: system/streak (priority 5)
    (v_uid,
     '7-day streak! 🔥',
     'You''ve posted every day this week. Amazing consistency!',
     'task_completed', 'system', 5, 'View Streak', '/performance', '{}',
     now() - interval '5 days'),

    -- Earlier: pro recommendation (priority 3)
    (v_uid,
     'Pro content recommended for you',
     'Unlock "Advanced Growth Tactics" – Pro-only lesson tailored to your goals.',
     'upgrade_recommendation', 'program', 3, 'Upgrade to Pro', '/billing?upgrade=pro', '{}',
     now() - interval '10 days'),

    -- Earlier: coach message (priority 2, already read)
    (v_uid,
     'Isabelle Morgan sent you a message',
     'Check out your latest feedback on your content strategy.',
     'coach_message', 'community', 2, 'View Message', '/community',
     '{"from_name":"Isabelle Morgan"}',
     now() - interval '11 days');

  -- Mark the coach message as already read (most recent one by type)
  update public.notifications
  set    status  = 'read',
         read_at = now() - interval '10 days 12 hours'
  where  user_id = v_uid
    and  type    = 'coach_message';
end $$;
