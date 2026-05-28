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
    'Distill who you help, how you help them, and the change you create, in a single tweet-length sentence.',
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
    'Write down three concrete struggles your ideal audience is dealing with, in their own words wherever possible.',
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
