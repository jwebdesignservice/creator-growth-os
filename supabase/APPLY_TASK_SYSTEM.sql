-- ════════════════════════════════════════════════════════════════════════
-- 0038_unified_task_system.sql
--
-- ONE central task/mission system. Programs, tutorials, and admin missions
-- are just SOURCES that author `task_templates`; every task assigned to a
-- user lives in `public.missions` (the existing per-user store the
-- /missions page already reads). The user only ever sees `missions`.
--
--   task_templates        — unified template layer for ALL sources
--                           (supersedes the program-only lesson_task_templates;
--                            tutorials + admin missions write here too)
--   missions (extended)   — the per-user UserTask store (+ snapshot + source)
--   task_assignment_rules — admin-mission targeting rules
--   task_event_logs       — audit trail of why/how a task was assigned
--
-- RLS matches the project pattern (read by authenticated, write by admin;
-- rules + logs are admin-only). Fully idempotent + safe to re-run.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. task_templates — unified template for program videos, tutorials and
--      admin missions. `source_type` disambiguates; `source_id` points at the
--      lesson (a program video and a tutorial are both `lessons` rows) or is
--      null for ad-hoc admin missions. ───────────────────────────────────
create table if not exists public.task_templates (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null default '',
  description         text not null default '',
  task_type           text not null default 'apply',

  source_type         text not null default 'admin_mission'
                        check (source_type in ('program_video','tutorial','admin_mission','manual')),
  source_id           uuid,                                  -- lesson id, or null (admin)
  program_id          uuid references public.programs(id) on delete cascade,
  lesson_id           uuid references public.lessons(id)  on delete cascade,

  created_by          uuid references public.profiles(id) on delete set null,

  status              text not null default 'active'
                        check (status in ('draft','active','archived')),
  visibility          text not null default 'default',
  sort_order          int  not null default 0,
  difficulty          text not null default 'medium',
  estimated_minutes   int  not null default 15,
  due_after_days      int,                                   -- null = no due date
  auto_assign_trigger text not null default 'on_start'
                        check (auto_assign_trigger in ('on_unlock','on_start','on_complete','manual')),
  points              int  not null default 10,
  is_required         boolean not null default true,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_task_templates_source
  on public.task_templates (source_type, source_id, status, sort_order);
create index if not exists idx_task_templates_lesson
  on public.task_templates (lesson_id);
create index if not exists idx_task_templates_program
  on public.task_templates (program_id);

alter table public.task_templates enable row level security;

drop policy if exists "task_templates_read" on public.task_templates;
create policy "task_templates_read" on public.task_templates
  for select using (auth.role() = 'authenticated');

drop policy if exists "task_templates_admin_write" on public.task_templates;
create policy "task_templates_admin_write" on public.task_templates
  for all using (public.is_admin()) with check (public.is_admin());

-- Reuse the shared updated_at trigger (set_updated_at() ships in 0029).
do $$ begin
  drop trigger if exists trg_task_templates_updated_at on public.task_templates;
  create trigger trg_task_templates_updated_at
    before update on public.task_templates
    for each row execute function public.set_updated_at();
exception when undefined_function then null;
end $$;

-- ── 2. Extend `missions` to fully serve as the UserTask store ────────────
--      (existing columns already cover user_id, title, description, status,
--       source, program_id, lesson_id, priority, estimated_minutes, points,
--       due_date, completed_at — we add the unified-system fields.)
alter table public.missions
  add column if not exists task_template_id     uuid references public.task_templates(id) on delete set null,
  add column if not exists title_snapshot       text,
  add column if not exists description_snapshot text,
  add column if not exists started_at           timestamptz,
  add column if not exists source_id            uuid,
  add column if not exists metadata             jsonb not null default '{}'::jsonb;

-- Duplicate protection for the unified system: at most one mission per
-- (user, task_template). Partial so legacy rows (task_template_id null) are
-- unaffected. Guarded: if pre-existing data somehow has a duplicate, skip the
-- unique index — the app layer also pre-filters + swallows races.
do $$ begin
  begin
    create unique index if not exists uniq_missions_user_task_template
      on public.missions (user_id, task_template_id)
      where task_template_id is not null;
  exception when others then
    null;
  end;
end $$;

create index if not exists idx_missions_user_status
  on public.missions (user_id, status);
create index if not exists idx_missions_source_id
  on public.missions (source, source_id);

-- ── 3. Migrate existing program task templates into the unified table.
--      Matched on (lesson_id, title) so re-running never double-inserts.
--      Existing program tasks keep their CURRENT behavior (assign on lesson
--      complete), so migrated rows use auto_assign_trigger='on_complete'. ──
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'lesson_task_templates'
  ) then
    insert into public.task_templates
      (title, description, task_type, source_type, source_id, program_id, lesson_id,
       status, sort_order, estimated_minutes, points, is_required, auto_assign_trigger, difficulty)
    select
      ltt.title,
      coalesce(ltt.description, ''),
      coalesce(ltt.task_type, 'apply'),
      'program_video',
      ltt.lesson_id,
      ltt.program_id,
      ltt.lesson_id,
      'active',
      coalesce(ltt.sort_order, 0),
      coalesce(ltt.estimated_minutes, 15),
      coalesce(ltt.points, 10),
      coalesce(ltt.is_required, true),
      'on_complete',
      'medium'
    from public.lesson_task_templates ltt
    where not exists (
      select 1 from public.task_templates tt
      where tt.source_type = 'program_video'
        and tt.lesson_id = ltt.lesson_id
        and tt.title = ltt.title
    );
  end if;
end $$;

-- ── 4. Backfill: link existing program-video missions to their new
--      task_template so the unified dedup recognizes already-assigned tasks
--      and never re-creates them. Also snapshot current title/description. ─
do $$ begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'lesson_task_templates'
  ) then
    update public.missions m
    set task_template_id = tt.id
    from public.lesson_task_templates ltt
    join public.task_templates tt
      on tt.source_type = 'program_video'
     and tt.lesson_id = ltt.lesson_id
     and tt.title = ltt.title
    where m.lesson_template_id = ltt.id
      and m.task_template_id is null;
  end if;
end $$;

update public.missions
set title_snapshot       = coalesce(title_snapshot, title),
    description_snapshot = coalesce(description_snapshot, description)
where title_snapshot is null;

-- ── 5. task_assignment_rules — how an admin mission targets users. Built
--      flexible (target_value jsonb) so we can target what exists today
--      (specific users, plan, category, onboarding answers, progress, streak)
--      and extend to groups / cohorts / tags / levels later without a
--      schema change. ─────────────────────────────────────────────────────
create table if not exists public.task_assignment_rules (
  id               uuid primary key default gen_random_uuid(),
  task_template_id uuid not null references public.task_templates(id) on delete cascade,
  rule_type        text not null default 'include'         -- include | exclude
                     check (rule_type in ('include','exclude')),
  target_type      text not null,                          -- all|user|plan|category|onboarding|progress|streak|program|tutorial|group|tag|level|cohort
  target_value     jsonb not null default '{}'::jsonb,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_task_assignment_rules_template
  on public.task_assignment_rules (task_template_id, active);

alter table public.task_assignment_rules enable row level security;

drop policy if exists "task_assignment_rules_admin_all" on public.task_assignment_rules;
create policy "task_assignment_rules_admin_all" on public.task_assignment_rules
  for all using (public.is_admin()) with check (public.is_admin());

do $$ begin
  drop trigger if exists trg_task_assignment_rules_updated_at on public.task_assignment_rules;
  create trigger trg_task_assignment_rules_updated_at
    before update on public.task_assignment_rules
    for each row execute function public.set_updated_at();
exception when undefined_function then null;
end $$;

-- ── 6. task_event_logs — audit trail of assignment + lifecycle events.
--      No FK on user_task_id so the log survives if a mission is deleted. ──
create table if not exists public.task_event_logs (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.profiles(id) on delete cascade,
  task_template_id uuid references public.task_templates(id) on delete set null,
  user_task_id     uuid,                                   -- missions.id (no FK on purpose)
  event_type       text not null,                          -- assigned|skipped_duplicate|started|completed|skipped|rule_matched|...
  source_type      text,
  source_id        uuid,
  metadata         jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now()
);

create index if not exists idx_task_event_logs_user
  on public.task_event_logs (user_id, created_at desc);
create index if not exists idx_task_event_logs_template
  on public.task_event_logs (task_template_id, created_at desc);

alter table public.task_event_logs enable row level security;

drop policy if exists "task_event_logs_admin_read" on public.task_event_logs;
create policy "task_event_logs_admin_read" on public.task_event_logs
  for select using (public.is_admin());

drop policy if exists "task_event_logs_admin_write" on public.task_event_logs;
create policy "task_event_logs_admin_write" on public.task_event_logs
  for all using (public.is_admin()) with check (public.is_admin());
-- (Writes go through the service-role client, which bypasses RLS.)
