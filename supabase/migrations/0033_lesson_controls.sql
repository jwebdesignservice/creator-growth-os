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
