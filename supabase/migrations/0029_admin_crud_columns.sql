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
