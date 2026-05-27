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
