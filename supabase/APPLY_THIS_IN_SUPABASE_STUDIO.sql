-- ════════════════════════════════════════════════════════════════════════
-- 0027_lesson_task_templates.sql
--
-- Per-lesson task templates + source-tracked user missions.
--
-- Adds:
--   • public.lesson_task_templates — admin-managed, lesson-scoped task definitions
--   • new columns on public.missions — program_id, lesson_id, lesson_template_id,
--     source, priority, estimated_minutes, points (so generated user tasks
--     remember which program/lesson/template they came from)
--   • partial unique index on (user_id, lesson_template_id) — race-safe
--     idempotency guard so re-completing the same lesson never duplicates
--     a generated mission
--   • seed templates for Module 1 + Module 2 of "influencer-blueprint"
--
-- The generator function lives in src/lib/programs/generate-lesson-tasks.ts;
-- it inserts into public.missions using the user's own auth context.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. lesson_task_templates ────────────────────────────────────────────
create table if not exists public.lesson_task_templates (
  id                uuid primary key default gen_random_uuid(),
  program_id        uuid not null references public.programs(id) on delete cascade,
  lesson_id         uuid not null references public.lessons(id)  on delete cascade,
  title             text not null,
  description       text,
  task_type         text not null default 'apply',  -- apply|strategy|content|research|reflection|posting|engagement|performance|monetization|confidence
  priority          text not null default 'normal', -- low|normal|high
  estimated_minutes int  not null default 15,
  sort_order        int  not null default 0,
  is_required       boolean not null default true,
  points            int  not null default 10,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_lesson_task_templates_lesson
  on public.lesson_task_templates (lesson_id);
create index if not exists idx_lesson_task_templates_program
  on public.lesson_task_templates (program_id);

alter table public.lesson_task_templates enable row level security;

-- Read by any authenticated user, write by admin (matches mission_templates pattern).
drop policy if exists "lesson_task_templates_read" on public.lesson_task_templates;
create policy "lesson_task_templates_read" on public.lesson_task_templates
  for select using (auth.role() = 'authenticated');

drop policy if exists "lesson_task_templates_admin_write" on public.lesson_task_templates;
create policy "lesson_task_templates_admin_write" on public.lesson_task_templates
  for all using (public.is_admin()) with check (public.is_admin());


-- ── 2. Extend missions with source tracking ─────────────────────────────
alter table public.missions
  add column if not exists program_id          uuid references public.programs(id) on delete set null,
  add column if not exists lesson_id           uuid references public.lessons(id)  on delete set null,
  add column if not exists lesson_template_id  uuid references public.lesson_task_templates(id) on delete set null,
  add column if not exists source              text not null default 'manual',  -- manual|program_video|admin
  add column if not exists priority            text not null default 'normal',  -- low|normal|high
  add column if not exists estimated_minutes   int  not null default 15,
  add column if not exists points              int  not null default 10;

-- Race-safe idempotency: at most one mission per (user, lesson_template).
-- Partial so it doesn't constrain manual missions where lesson_template_id is null.
create unique index if not exists uniq_missions_user_lesson_template
  on public.missions (user_id, lesson_template_id)
  where lesson_template_id is not null;

-- Helpful index for the program Tasks tab + missions page filters.
create index if not exists idx_missions_user_program
  on public.missions (user_id, program_id);
create index if not exists idx_missions_user_source
  on public.missions (user_id, source);


-- ── 3. Seed templates for the Influencer Blueprint demo ─────────────────
-- Lesson slugs reference rows from 0003_lessons_seed.sql. Idempotent via
-- NOT EXISTS — re-running the migration doesn't double-insert.
insert into public.lesson_task_templates
  (program_id, lesson_id, title, description, task_type, priority, estimated_minutes, sort_order, points)
select
  l.program_id, l.id, t.title, t.description, t.task_type, t.priority,
  t.estimated_minutes, t.sort_order, t.points
from public.lessons l
join (values
  ('defining-niche-sweet-spot',
    'Write your one-sentence niche statement',
    'Distill who you help, how you help them, and the change they get into one tweet-length sentence.',
    'strategy','normal',10,1,10),
  ('your-story-differentiator',
    'List 3 unique angles only you can bring',
    'Pin down the lived experiences and perspectives that no one else can replicate.',
    'reflection','normal',12,1,10),
  ('brand-values-positioning',
    'Define your top 3 brand values',
    'Pick the three values that guide every post you make and how you show up online.',
    'strategy','normal',15,1,10),
  ('ideal-audience-deep-dive',
    'Capture 3 audience pain points',
    'Write down three concrete struggles your ideal audience is dealing with — in their own words wherever possible.',
    'research','high',15,1,15),
  ('content-pillars-that-work',
    'Draft your 3 content pillars',
    'Pick three recurring themes that map directly to what your audience needs and what you can deliver consistently.',
    'strategy','normal',20,1,15),
  ('hooks-that-stop-the-scroll',
    'Draft 5 scroll-stopping hooks',
    'Write five different opening lines you can test on your next round of posts.',
    'content','normal',20,1,15)
) as t(slug, title, description, task_type, priority, estimated_minutes, sort_order, points)
  on l.slug = t.slug
where not exists (
  select 1 from public.lesson_task_templates ltt
  where ltt.lesson_id = l.id and ltt.title = t.title
);
-- ════════════════════════════════════════════════════════════════════════
-- 0029_admin_crud_columns.sql
--
-- Backs the full admin CRUD surface on /admin/programs and
-- /admin/programs/[id]:
--   • updated_at + archived columns on programs & lessons (so "Last edited"
--     is real and we have a non-destructive archive action)
--   • sales_page_url on programs (Step 3 on the program setup guide)
--   • a real program_modules table — modules become first-class records
--     so the curriculum editor can create / rename / reorder / delete them
--     without depending on lesson rows existing
--   • a shared set_updated_at() trigger function reused by every table
--     above
--
-- All net-new tables get RLS read-by-any-authenticated, write-by-admin —
-- matching the project's existing pattern.
-- ════════════════════════════════════════════════════════════════════════

-- ── Shared updated_at trigger function ──────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ── programs: updated_at / archived / sales_page_url ────────────────────
alter table public.programs
  add column if not exists updated_at     timestamptz not null default now(),
  add column if not exists archived       boolean not null default false,
  add column if not exists sales_page_url text;

create index if not exists idx_programs_archived on public.programs (archived);

drop trigger if exists trg_programs_updated_at on public.programs;
create trigger trg_programs_updated_at
  before update on public.programs
  for each row execute function public.set_updated_at();


-- ── lessons: updated_at / archived ──────────────────────────────────────
alter table public.lessons
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists archived   boolean not null default false;

create index if not exists idx_lessons_archived on public.lessons (archived);

drop trigger if exists trg_lessons_updated_at on public.lessons;
create trigger trg_lessons_updated_at
  before update on public.lessons
  for each row execute function public.set_updated_at();


-- ── program_modules: first-class module records ─────────────────────────
create table if not exists public.program_modules (
  id          uuid primary key default gen_random_uuid(),
  program_id  uuid not null references public.programs(id) on delete cascade,
  number      int  not null,
  title       text not null,
  bonus       boolean not null default false,
  pro_only    boolean not null default false,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (program_id, number)
);

create index if not exists idx_program_modules_program
  on public.program_modules (program_id, number);

alter table public.program_modules enable row level security;

drop policy if exists "program_modules_read" on public.program_modules;
create policy "program_modules_read" on public.program_modules
  for select using (auth.role() = 'authenticated');

drop policy if exists "program_modules_admin_write" on public.program_modules;
create policy "program_modules_admin_write" on public.program_modules
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_program_modules_updated_at on public.program_modules;
create trigger trg_program_modules_updated_at
  before update on public.program_modules
  for each row execute function public.set_updated_at();

-- Backfill modules from existing lessons (idempotent — re-runs are safe).
insert into public.program_modules (program_id, number, title)
select distinct
  l.program_id,
  l.module_number,
  coalesce(l.module_title, 'Module ' || l.module_number)
from public.lessons l
where l.program_id is not null
  and l.module_number is not null
on conflict (program_id, number) do nothing;


-- ── lesson_task_templates: timestamps + helpful trigger ─────────────────
-- (table itself was created by 0027; we just need updated_at to fire.)
drop trigger if exists trg_lesson_task_templates_updated_at on public.lesson_task_templates;
create trigger trg_lesson_task_templates_updated_at
  before update on public.lesson_task_templates
  for each row execute function public.set_updated_at();
-- ════════════════════════════════════════════════════════════════════════
-- 0030_email_messages_and_templates.sql
--
-- Backs the admin Email surface end-to-end:
--
--   • email_templates — admin-managed library of reusable email templates
--     the Compose page can save into and load from.
--
--   • email_messages — every send / schedule / draft is written here so
--     the History page surfaces real data instead of mocks, and so the
--     row kebab (Resend / Cancel / Delete) has something to act on.
--
-- Both tables follow the existing project pattern:
--   - RLS enabled
--   - Read = any authenticated user (templates) or admin only (messages)
--   - Write = admin only
--   - updated_at managed by the shared set_updated_at() trigger
--     (introduced in 0029)
-- ════════════════════════════════════════════════════════════════════════

-- ── email_templates ─────────────────────────────────────────────────────
create table if not exists public.email_templates (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,                  -- internal name
  subject              text not null,
  body                 text not null,
  use_branded_template boolean not null default false,
  track_opens          boolean not null default true,
  archived             boolean not null default false,
  created_by           uuid references public.profiles(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists idx_email_templates_archived
  on public.email_templates (archived);
create index if not exists idx_email_templates_created_at
  on public.email_templates (created_at desc);

alter table public.email_templates enable row level security;

drop policy if exists "email_templates_read" on public.email_templates;
create policy "email_templates_read" on public.email_templates
  for select using (auth.role() = 'authenticated');

drop policy if exists "email_templates_admin_write" on public.email_templates;
create policy "email_templates_admin_write" on public.email_templates
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_email_templates_updated_at on public.email_templates;
create trigger trg_email_templates_updated_at
  before update on public.email_templates
  for each row execute function public.set_updated_at();


-- ── email_messages ──────────────────────────────────────────────────────
do $$ begin
  create type email_message_status as enum (
    'draft','scheduled','sending','sent','failed','canceled'
  );
exception when duplicate_object then null; end $$;

create table if not exists public.email_messages (
  id                    uuid primary key default gen_random_uuid(),

  -- Auth / lineage
  sent_by               uuid references public.profiles(id) on delete set null,
  template_id           uuid references public.email_templates(id) on delete set null,

  -- Audience snapshot at send-time
  audience              text not null default 'all',
  program_id            uuid references public.programs(id) on delete set null,
  audience_label        text,

  -- Counts
  recipients_total      int  not null default 0,
  recipients_delivered  int  not null default 0,
  recipients_opened     int  not null default 0,
  recipients_clicked    int  not null default 0,
  recipients_bounced    int  not null default 0,

  -- Content snapshot (templates evolve; we keep what we actually sent)
  subject               text not null,
  body                  text not null,

  -- Lifecycle
  status                email_message_status not null default 'draft',
  scheduled_for         timestamptz,
  sent_at               timestamptz,
  canceled_at           timestamptz,

  -- Config snapshot
  use_branded_template  boolean not null default false,
  track_opens           boolean not null default true,

  -- Errors
  error_message         text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_email_messages_status
  on public.email_messages (status);
create index if not exists idx_email_messages_sent_by_created
  on public.email_messages (sent_by, created_at desc);
create index if not exists idx_email_messages_scheduled_for
  on public.email_messages (scheduled_for)
  where status = 'scheduled';

alter table public.email_messages enable row level security;

drop policy if exists "email_messages_admin_read" on public.email_messages;
create policy "email_messages_admin_read" on public.email_messages
  for select using (public.is_admin());

drop policy if exists "email_messages_admin_write" on public.email_messages;
create policy "email_messages_admin_write" on public.email_messages
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_email_messages_updated_at on public.email_messages;
create trigger trg_email_messages_updated_at
  before update on public.email_messages
  for each row execute function public.set_updated_at();
-- ════════════════════════════════════════════════════════════════════════
-- 0031_lesson_drills.sql
--
-- Backs the Creator drill tab on the admin tutorial editor
-- (/admin/tutorials/[id]?tab=creator-drill). Each lesson can have at
-- most ONE drill — the drill defines the hands-on action step learners
-- complete after watching the lesson.
--
-- Design choice: task steps, success criteria, and attached resources
-- live as `jsonb` arrays on this row rather than separate child tables.
-- They are small (typically 3–8 items), tightly coupled to the drill,
-- never queried independently, and the editor saves them as one unit
-- on every Save — so a single upsert keeps the whole drill consistent.
--
-- RLS pattern matches the rest of the project: read by any authenticated
-- user (so the public lesson page can show the drill to learners),
-- write by admin only.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.lesson_drills (
  id                    uuid primary key default gen_random_uuid(),
  lesson_id             uuid not null unique
                          references public.lessons(id) on delete cascade,

  -- Core content
  title                 text not null default '',
  linked_learning_point text not null default '',
  objective             text not null default '',
  instructions          text not null default '',

  -- Mechanics
  submission_type       text not null default 'text',   -- text|url|file|video|checkbox
  difficulty            text not null default 'easy',   -- easy|medium|advanced
  estimated_minutes     int  not null default 15,
  reward_points         int  not null default 10,
  required              boolean not null default true,

  -- Ordered arrays of small objects:
  --   task_steps        : [{ id: string, text: string }]
  --   success_criteria  : [string]
  --   resources         : [{ id, name, ext, size, url? }]
  task_steps            jsonb not null default '[]'::jsonb,
  success_criteria      jsonb not null default '[]'::jsonb,
  resources             jsonb not null default '[]'::jsonb,

  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_lesson_drills_lesson
  on public.lesson_drills (lesson_id);

alter table public.lesson_drills enable row level security;

drop policy if exists "lesson_drills_read" on public.lesson_drills;
create policy "lesson_drills_read" on public.lesson_drills
  for select using (auth.role() = 'authenticated');

drop policy if exists "lesson_drills_admin_write" on public.lesson_drills;
create policy "lesson_drills_admin_write" on public.lesson_drills
  for all using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_lesson_drills_updated_at on public.lesson_drills;
create trigger trg_lesson_drills_updated_at
  before update on public.lesson_drills
  for each row execute function public.set_updated_at();
-- =====================================================================
-- Lesson chapters — the structured "Lesson path" inside a tutorial.
-- Backs the /admin/tutorials/[id] editor's "Lesson path" tab.
--
-- Each row is a step in the learner's flow: an intro, a lesson, an
-- activity, a closing, or a checkpoint. Position controls order; ids
-- are server-side UUIDs so client-only ids are recreated on save.
--
-- Read-access is granted to any authenticated user for chapters that
-- belong to a published lesson (so the learner-side flow can render).
-- Write-access is admin-only.
-- =====================================================================

create table if not exists public.lesson_chapters (
  id                uuid        primary key default gen_random_uuid(),
  lesson_id         uuid        not null references public.lessons(id) on delete cascade,
  position          integer     not null,
  title             text        not null,
  type              text        not null
    check (type in ('intro','lesson','activity','closing','checkpoint')),
  duration_minutes  integer     not null default 0 check (duration_minutes >= 0),
  icon_key          text        not null default 'lightbulb',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists lesson_chapters_lesson_id_idx
  on public.lesson_chapters (lesson_id);
create index if not exists lesson_chapters_lesson_pos_idx
  on public.lesson_chapters (lesson_id, position);

-- updated_at autosync trigger ------------------------------------------
create or replace function public.lesson_chapters_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists lesson_chapters_set_updated_at on public.lesson_chapters;
create trigger lesson_chapters_set_updated_at
  before update on public.lesson_chapters
  for each row execute function public.lesson_chapters_touch_updated_at();

-- RLS ------------------------------------------------------------------
alter table public.lesson_chapters enable row level security;

-- Admins can do anything. `admin_users` already exists from earlier
-- migrations and is the single source of truth for admin identity.
drop policy if exists "lesson_chapters_admin_all" on public.lesson_chapters;
create policy "lesson_chapters_admin_all"
  on public.lesson_chapters
  for all
  to authenticated
  using (
    exists (
      select 1 from public.admin_users au where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users au where au.user_id = auth.uid()
    )
  );

-- Authenticated learners may read chapters for any published lesson, so
-- the learner-side flow can render the same path the admin built.
drop policy if exists "lesson_chapters_read_published" on public.lesson_chapters;
create policy "lesson_chapters_read_published"
  on public.lesson_chapters
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.lessons l
      where l.id = lesson_chapters.lesson_id
        and l.published = true
    )
  );
-- =====================================================================
-- Lesson controls — per-tutorial behavioural settings.
-- Backs the /admin/tutorials/[id] editor's "Controls" tab.
--
-- One row per lesson (1:1 via UNIQUE on lesson_id). A row is created on
-- demand the first time the admin opens the Controls tab; missing rows
-- are treated by the client as the default values defined below.
--
-- Read-access is granted to any authenticated user for controls that
-- belong to a published lesson (the learner-side player needs them).
-- Write-access is admin-only.
-- =====================================================================

create table if not exists public.lesson_controls (
  id                          uuid        primary key default gen_random_uuid(),
  lesson_id                   uuid        not null unique references public.lessons(id) on delete cascade,

  -- 1 · Playback
  autoplay_next_chapter       boolean     not null default false,
  allow_playback_speed        boolean     not null default true,
  loop_preview                boolean     not null default false,
  show_captions_default       boolean     not null default true,

  -- 2 · Progress & completion
  completion_threshold        integer     not null default 80
    check (completion_threshold in (50, 60, 70, 80, 90, 100)),
  require_chapters_in_order   boolean     not null default true,
  resume_from_last_position   boolean     not null default true,
  allow_skipping_ahead        boolean     not null default false,

  -- 3 · Learner experience
  show_chapter_list           boolean     not null default true,
  enable_notes                boolean     not null default true,
  enable_downloads            boolean     not null default true,
  show_cta_at_end             boolean     not null default true,

  -- 4 · Notifications & follow-ups
  reminder_timing             text        not null default '3d'
    check (reminder_timing in ('never','1d','3d','7d','14d')),
  notify_on_completion        boolean     not null default true,
  follow_up_task              text        not null default ''
    check (follow_up_task in ('','feedback','next','checkin','review')),

  -- Quick-status display-only fields. Authoring lives on other tabs
  -- (Access tab and Lesson path tab), but the Controls quick-status
  -- chips read them from here so a single GET hydrates the whole panel.
  access_mode                 text        not null default 'open'
    check (access_mode in ('open','private','scheduled')),
  cta_trigger                 text        not null default 'final-chapter'
    check (cta_trigger in ('immediate','final-chapter','after-completion')),

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists lesson_controls_lesson_id_idx
  on public.lesson_controls (lesson_id);

-- updated_at autosync trigger ------------------------------------------
create or replace function public.lesson_controls_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists lesson_controls_set_updated_at on public.lesson_controls;
create trigger lesson_controls_set_updated_at
  before update on public.lesson_controls
  for each row execute function public.lesson_controls_touch_updated_at();

-- RLS ------------------------------------------------------------------
alter table public.lesson_controls enable row level security;

-- Admins can do anything.
drop policy if exists "lesson_controls_admin_all" on public.lesson_controls;
create policy "lesson_controls_admin_all"
  on public.lesson_controls
  for all
  to authenticated
  using (
    exists (
      select 1 from public.admin_users au where au.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_users au where au.user_id = auth.uid()
    )
  );

-- Authenticated learners may read controls for any published lesson, so
-- the learner-side player can honour them (autoplay, captions default,
-- completion threshold, etc.).
drop policy if exists "lesson_controls_read_published" on public.lesson_controls;
create policy "lesson_controls_read_published"
  on public.lesson_controls
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.lessons l
      where l.id = lesson_controls.lesson_id
        and l.published = true
    )
  );
-- =====================================================================
-- Lesson editor fields — Metadata + Overview tab persistence
-- Adds the columns the /admin/tutorials/[id] editor needs to actually
-- save its Metadata + Overview tabs. Each is nullable / has a sensible
-- default so existing rows keep working unchanged.
--
-- Read/write inherit the existing RLS policies on `lessons` (admin-only
-- writes via service role; learner-side reads gated by `published`),
-- so this migration is purely additive.
-- Safe to re-run.
-- =====================================================================

alter table public.lessons
  -- Free-form taxonomy tags shown in the Metadata "Tags" chip input.
  add column if not exists tags text[] not null default '{}',

  -- "public" | "unlisted" | "private". Drives the Visibility select.
  -- Default 'public' so existing rows keep their current behavior.
  add column if not exists visibility text not null default 'public',

  -- Admin-only notes — never shown to learners.
  add column if not exists internal_notes text,

  -- Optional CTA link rendered next to the lesson in the player.
  add column if not exists cta_link text,

  -- Free-form editor category ("Growth", "Brand", "Dance", …). Distinct
  -- from the strict `category` enum (creator_category) so we don't have
  -- to evolve that enum every time the admin invents a new bucket.
  add column if not exists editor_category text,

  -- Overview tab — "What learners will get" bullet list.
  add column if not exists learning_outcomes text[] not null default '{}',

  -- Overview tab — "Publishing notes (internal)" body.
  add column if not exists publishing_notes_internal text;

-- Guard against bad visibility values via a check constraint. We can
-- swap this for a proper enum later — `text` keeps the migration cheap
-- without giving up validation.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_visibility_chk'
  ) then
    alter table public.lessons
      add constraint lessons_visibility_chk
      check (visibility in ('public', 'unlisted', 'private'));
  end if;
end $$;

-- Index for the most common Metadata-tab filter (find by visibility +
-- published). Useful once the admin queue grows past a few hundred rows.
create index if not exists idx_lessons_visibility_published
  on public.lessons (visibility, published);

-- Comments — makes the columns self-documenting in psql / DataGrip.
comment on column public.lessons.tags                      is 'Free-form tags shown in the Metadata editor (Metadata tab).';
comment on column public.lessons.visibility                is 'public | unlisted | private. Drives the Visibility select.';
comment on column public.lessons.internal_notes            is 'Admin-only notes; never shown to learners (Metadata tab).';
comment on column public.lessons.cta_link                  is 'Optional external CTA URL surfaced next to the lesson.';
comment on column public.lessons.editor_category           is 'Free-form admin-side category label (Metadata tab dropdown).';
comment on column public.lessons.learning_outcomes         is 'What learners will get — bullet list (Overview tab).';
comment on column public.lessons.publishing_notes_internal is 'Internal publishing notes — admin-only (Overview tab).';
-- =====================================================================
-- Program access settings — powers /admin/programs/[id]/access
-- Lets admins choose which membership tiers (Free / Basic / Pro /
-- Diamond) can access a program, plus a few enrollment-behavior rules
-- and an internal note.
--
-- `allowed_plans` is text[] (not the subscription_plan enum) on purpose:
-- it has to carry 'diamond', which isn't a billing tier yet. The legacy
-- single `plan_access` column is kept in sync by the save action (set to
-- the lowest allowed tier) so the existing access gating keeps working.
-- Safe to re-run.
-- =====================================================================

-- 1) Add allowed_plans nullable, backfill from the legacy plan_access tier
--    (hierarchical: a tier sees its own content + everything below it, and
--    Diamond — the top tier — sees everything), then lock it down.
alter table public.programs
  add column if not exists allowed_plans text[];

update public.programs
set allowed_plans = case plan_access
    when 'free'  then array['free','basic','pro','diamond']
    when 'basic' then array['basic','pro','diamond']
    when 'pro'   then array['pro','diamond']
    else array['free','basic','pro','diamond']
  end
where allowed_plans is null;

alter table public.programs
  alter column allowed_plans set default array['free','basic','pro','diamond']::text[];
alter table public.programs
  alter column allowed_plans set not null;

-- 2) Enrollment-behavior rules + internal note. Booleans default true to
--    match the "everything on" baseline the editor ships with.
alter table public.programs
  add column if not exists access_instant       boolean not null default true,
  add column if not exists access_while_valid   boolean not null default true,
  add column if not exists access_revoke_future boolean not null default true,
  add column if not exists access_admin_note    text;

-- 3) GIN index so "which programs can plan X access" stays cheap once the
--    member-facing library starts filtering on it.
create index if not exists idx_programs_allowed_plans
  on public.programs using gin (allowed_plans);

comment on column public.programs.allowed_plans        is 'Membership tiers that can access this program: free | basic | pro | diamond (Access tab).';
comment on column public.programs.access_instant       is 'New members on eligible plans get access immediately.';
comment on column public.programs.access_while_valid   is 'Access stays active while the member''s plan remains eligible.';
comment on column public.programs.access_revoke_future is 'Losing an eligible plan hides future (not-yet-seen) lesson content.';
comment on column public.programs.access_admin_note    is 'Internal-only note about this program''s access rules (Access tab).';
-- ════════════════════════════════════════════════════════════════════════
-- 0036_lesson_video_content.sql
--
-- Backs the dedicated program-video editor at
-- /admin/programs/[id]/curriculum/[lessonId].
--
-- A program video IS a `lessons` row. The editor persists:
--   • overview      → lessons.description        (already exists)
--   • video         → lessons.video_url          (already exists)
--   • thumbnail     → lessons.cover_image_url     (already exists)
--   • duration      → lessons.duration_seconds    (already exists)
--   • what-you'll-learn → lessons.learning_points  (NEW jsonb)
--   • action steps      → lessons.action_steps     (NEW jsonb)
--
-- Shapes:
--   learning_points : ["Understand X", "Set up Y", …]                 (string[])
--   action_steps    : [{ id, title, description }]                    (object[])
--
-- Plus storage.objects RLS so admins can upload the lesson video +
-- custom thumbnail to the public `lesson-media` bucket (the bucket is
-- created in the dashboard / via the storage API; policies live here).
-- ════════════════════════════════════════════════════════════════════════

alter table public.lessons
  add column if not exists learning_points jsonb not null default '[]'::jsonb,
  add column if not exists action_steps    jsonb not null default '[]'::jsonb;

-- ── lesson-media storage policies ───────────────────────────────────────
-- Public read (bucket is public); admin-only write/update/delete.
do $$ begin
  -- Read: anyone (public bucket).
  drop policy if exists "lesson_media_public_read" on storage.objects;
  create policy "lesson_media_public_read" on storage.objects
    for select using (bucket_id = 'lesson-media');

  -- Insert / Update / Delete: admins only.
  drop policy if exists "lesson_media_admin_insert" on storage.objects;
  create policy "lesson_media_admin_insert" on storage.objects
    for insert with check (bucket_id = 'lesson-media' and public.is_admin());

  drop policy if exists "lesson_media_admin_update" on storage.objects;
  create policy "lesson_media_admin_update" on storage.objects
    for update using (bucket_id = 'lesson-media' and public.is_admin());

  drop policy if exists "lesson_media_admin_delete" on storage.objects;
  create policy "lesson_media_admin_delete" on storage.objects
    for delete using (bucket_id = 'lesson-media' and public.is_admin());
exception when others then
  -- Some hosted environments restrict DDL on storage.objects; ignore so
  -- the rest of the migration still applies. Configure the policies in
  -- the dashboard if this block is skipped.
  null;
end $$;
