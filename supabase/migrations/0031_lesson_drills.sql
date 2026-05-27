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
