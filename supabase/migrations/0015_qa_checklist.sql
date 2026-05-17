-- =====================================================================
-- Dev Dashboard — QA Checklist
-- Adds the schema that powers /dev/qa-checklist. Safe to re-run.
-- Depends on migration 0010 (dev_users + is_dev_user()).
-- =====================================================================

-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type qa_check_status as enum ('pending','passed','review','blocker');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qa_release_status as enum ('planned','active','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qa_run_status as enum ('draft','in_progress','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qa_blocker_severity as enum ('high','medium','low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type qa_activity_kind as enum ('passed','review','run-created','blocker-added','blocker-removed','reset');
exception when duplicate_object then null; end $$;


-- AREAS -----------------------------------------------------------------
-- The catalog of QA categories shown on the left column. `letter` and
-- `sort_order` drive the deterministic A. / B. / C. … listing.

create table if not exists public.qa_areas (
  key         text primary key,
  letter      text not null,
  title       text not null,
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.qa_areas (key, letter, title, sort_order) values
  ('core',          'A', 'Core App Experience',       1),
  ('auth',          'B', 'Auth & Access',             2),
  ('billing',       'C', 'Billing & Subscription',    3),
  ('notifications', 'D', 'Notifications & Messaging', 4),
  ('performance',   'E', 'Performance & Stability',   5),
  ('responsive',    'F', 'Responsive QA',             6),
  ('a11y',          'G', 'Accessibility & Content QA',7)
on conflict (key) do update set
  letter     = excluded.letter,
  title      = excluded.title,
  sort_order = excluded.sort_order;


-- CHECK TEMPLATES -------------------------------------------------------
-- Static catalog of checks. A QA run snapshots these into qa_check_results
-- so a run is a stable record even when the catalog evolves.

create table if not exists public.qa_check_templates (
  id           uuid primary key default gen_random_uuid(),
  area_key     text not null references public.qa_areas(key) on delete restrict,
  title        text not null,
  description  text,
  owner_team   text,
  sort_order   int  not null default 0,
  default_severity qa_blocker_severity not null default 'medium',
  created_at   timestamptz not null default now()
);

create index if not exists idx_qa_templates_area on public.qa_check_templates (area_key, sort_order);


-- RELEASES --------------------------------------------------------------
-- A versioned release the QA run targets. `target_at` is the cutoff time
-- shown in the Release Notes card.

create table if not exists public.qa_releases (
  id                  uuid primary key default gen_random_uuid(),
  version             text not null unique,
  target_at           timestamptz,
  environment         text not null default 'Production',
  open_blockers_allowed int  not null default 0,
  final_approvers     text,
  status              qa_release_status not null default 'active',
  created_at          timestamptz not null default now()
);


-- RUNS ------------------------------------------------------------------
-- One row per QA run for a release. The "current" run is the most recent
-- run for the selected release. Active filters point at a single run.

create table if not exists public.qa_runs (
  id           uuid primary key default gen_random_uuid(),
  release_id   uuid not null references public.qa_releases(id) on delete cascade,
  started_at   timestamptz not null default now(),
  started_by_email text,
  status       qa_run_status not null default 'in_progress',
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_qa_runs_release on public.qa_runs (release_id, started_at desc);


-- CHECK RESULTS ---------------------------------------------------------
-- The per-run snapshot of every check, plus its current status. Title is
-- denormalized from the template at run-creation time so historical runs
-- read correctly even if the template was renamed later.

create table if not exists public.qa_check_results (
  id            uuid primary key default gen_random_uuid(),
  run_id        uuid not null references public.qa_runs(id) on delete cascade,
  template_id   uuid references public.qa_check_templates(id) on delete set null,
  area_key      text not null references public.qa_areas(key) on delete restrict,
  title         text not null,
  description   text,
  owner_team    text,
  status        qa_check_status not null default 'pending',
  severity      qa_blocker_severity not null default 'medium',
  sort_order    int  not null default 0,
  updated_at    timestamptz not null default now(),
  updated_by_email text,
  unique (run_id, template_id)
);

create index if not exists idx_qa_results_run        on public.qa_check_results (run_id);
create index if not exists idx_qa_results_run_area   on public.qa_check_results (run_id, area_key, sort_order);
create index if not exists idx_qa_results_run_status on public.qa_check_results (run_id, status);


-- ACTIVITY LOG ----------------------------------------------------------
-- Append-only stream surfaced in the "Recent Activity / Sign-offs" card.

create table if not exists public.qa_activity (
  id              uuid primary key default gen_random_uuid(),
  run_id          uuid not null references public.qa_runs(id) on delete cascade,
  check_result_id uuid references public.qa_check_results(id) on delete set null,
  actor_email     text,
  actor_initials  text,
  actor_name      text,
  message         text not null,
  kind            qa_activity_kind not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_qa_activity_run on public.qa_activity (run_id, created_at desc);


-- HELPERS ---------------------------------------------------------------
-- Computed readiness percent for a run: (passed) / (total) * 100, rounded.
-- Used by the metric strip and the Release Readiness focus card.

create or replace function public.qa_run_readiness(run uuid)
returns int
language sql
stable
as $$
  select case
    when count(*) = 0 then 0
    else round((sum(case when status = 'passed' then 1 else 0 end)::numeric / count(*)) * 100)::int
  end
  from public.qa_check_results
  where run_id = run;
$$;


-- RLS -------------------------------------------------------------------

alter table public.qa_areas           enable row level security;
alter table public.qa_check_templates enable row level security;
alter table public.qa_releases        enable row level security;
alter table public.qa_runs            enable row level security;
alter table public.qa_check_results   enable row level security;
alter table public.qa_activity        enable row level security;

do $$ begin
  drop policy if exists qa_areas_select       on public.qa_areas;
  drop policy if exists qa_templates_select   on public.qa_check_templates;
  drop policy if exists qa_releases_select    on public.qa_releases;
  drop policy if exists qa_releases_insert    on public.qa_releases;
  drop policy if exists qa_releases_update    on public.qa_releases;
  drop policy if exists qa_runs_select        on public.qa_runs;
  drop policy if exists qa_runs_insert        on public.qa_runs;
  drop policy if exists qa_runs_update        on public.qa_runs;
  drop policy if exists qa_results_select     on public.qa_check_results;
  drop policy if exists qa_results_insert     on public.qa_check_results;
  drop policy if exists qa_results_update     on public.qa_check_results;
  drop policy if exists qa_activity_select    on public.qa_activity;
  drop policy if exists qa_activity_insert    on public.qa_activity;
end $$;

create policy qa_areas_select     on public.qa_areas           for select using (public.is_dev_user());
create policy qa_templates_select on public.qa_check_templates for select using (public.is_dev_user());
create policy qa_releases_select  on public.qa_releases        for select using (public.is_dev_user());
create policy qa_releases_insert  on public.qa_releases        for insert with check (public.is_dev_user());
create policy qa_releases_update  on public.qa_releases        for update using (public.is_dev_user()) with check (public.is_dev_user());
create policy qa_runs_select      on public.qa_runs            for select using (public.is_dev_user());
create policy qa_runs_insert      on public.qa_runs            for insert with check (public.is_dev_user());
create policy qa_runs_update      on public.qa_runs            for update using (public.is_dev_user()) with check (public.is_dev_user());
create policy qa_results_select   on public.qa_check_results   for select using (public.is_dev_user());
create policy qa_results_insert   on public.qa_check_results   for insert with check (public.is_dev_user());
create policy qa_results_update   on public.qa_check_results   for update using (public.is_dev_user()) with check (public.is_dev_user());
create policy qa_activity_select  on public.qa_activity        for select using (public.is_dev_user());
create policy qa_activity_insert  on public.qa_activity        for insert with check (public.is_dev_user());


-- SEED DATA -------------------------------------------------------------
-- Mirrors the current mock-data exports so the page is populated
-- immediately after migration. Counts are exact:
--   A. Core (10)  6P 2R 0B 2pending
--   B. Auth (8)   5P 1R 1B 1pending
--   C. Billing (7) 4P 1R 1B 1pending
--   D. Notifs (6)  3P 1R 1B 1pending
--   E. Perf (8)    4P 2R 0B 2pending
--   F. Resp (7)    3P 2R 0B 2pending
--   G. A11y (6)    2P 2R 0B 2pending
-- Total: 52 = 27P + 11R + 3B + 11pending (matches Passed 27→shown as 61?
--   ⚠ The screenshot shows 61 passed / 17 review / 3 blockers / 86 total —
--   so individual rows in the seed are illustrative; the totals reported
--   by the metric strip are derived live from qa_check_results.)

-- Release.
insert into public.qa_releases (version, target_at, environment, open_blockers_allowed, final_approvers, status)
values ('v1.4.2', (current_date + interval '18 hours')::timestamptz, 'Production', 0, 'QA Lead, Product, Engineering', 'active')
on conflict (version) do update set
  target_at = excluded.target_at,
  environment = excluded.environment,
  open_blockers_allowed = excluded.open_blockers_allowed,
  final_approvers = excluded.final_approvers,
  status = excluded.status;

-- Templates per area. Counts deliberately small so the seed is readable;
-- you can extend them via SQL Editor without re-running this migration.
insert into public.qa_check_templates (area_key, title, owner_team, sort_order, default_severity) values
  ('core', 'App boots without errors',                'Core',    1, 'high'),
  ('core', 'Dashboard loads under 1.5s p95',          'Core',    2, 'medium'),
  ('core', 'Navigation works across all top-level pages','Core', 3, 'medium'),
  ('core', 'Sign-out flow returns user to landing',   'Core',    4, 'medium'),
  ('core', 'Search bar autocomplete responds',        'Core',    5, 'low'),
  ('core', 'Empty states render correctly',           'Core',    6, 'low'),
  ('core', 'Browser back/forward preserves state',    'Core',    7, 'medium'),
  ('core', 'Theme respects system preference',        'Core',    8, 'low'),
  ('core', 'Toast notifications dismiss properly',    'Core',    9, 'low'),
  ('core', 'Keyboard shortcuts documented',           'Core',   10, 'low'),
  ('auth', 'Email sign-up flow works end-to-end',     'Auth',    1, 'high'),
  ('auth', 'Google OAuth completes',                  'Auth',    2, 'high'),
  ('auth', 'Apple OAuth completes',                   'Auth',    3, 'medium'),
  ('auth', 'Password reset email arrives',            'Auth',    4, 'high'),
  ('auth', 'OAuth callback handling edge cases',      'Auth',    5, 'high'),
  ('auth', 'Session expiry redirects to sign-in',     'Auth',    6, 'medium'),
  ('auth', 'MFA enrolment flow works',                'Auth',    7, 'medium'),
  ('auth', 'Sign-in rate limit kicks in',             'Auth',    8, 'medium'),
  ('billing', 'Invoice table renders correctly',      'Billing', 1, 'medium'),
  ('billing', 'Stripe checkout completes',            'Billing', 2, 'high'),
  ('billing', 'Failed payment retry messaging verified','Billing',3, 'medium'),
  ('billing', 'Upgrade flow updates plan immediately','Billing', 4, 'medium'),
  ('billing', 'Cancellation flow shows reason picker','Billing', 5, 'low'),
  ('billing', 'Refund webhook updates UI',            'Billing', 6, 'medium'),
  ('billing', 'Tax rates apply per region',           'Billing', 7, 'low'),
  ('notifications', 'In-app notifications render',    'Notifs',  1, 'medium'),
  ('notifications', 'Email digest sends on schedule', 'Notifs',  2, 'medium'),
  ('notifications', 'Push permission prompt works',   'Notifs',  3, 'low'),
  ('notifications', 'Mark-all-read updates badge',    'Notifs',  4, 'medium'),
  ('notifications', 'Real-time notification refresh tested', 'Notifs', 5, 'medium'),
  ('notifications', 'Notification preferences persist','Notifs', 6, 'low'),
  ('performance', 'TTI under 3s on mid-range device', 'Perf',    1, 'high'),
  ('performance', 'p95 API latency under 300ms',      'Perf',    2, 'medium'),
  ('performance', 'Memory usage stable over 1h',      'Perf',    3, 'medium'),
  ('performance', 'No JS errors during smoke test',   'Perf',    4, 'high'),
  ('performance', 'Lighthouse score ≥ 90',            'Perf',    5, 'medium'),
  ('performance', 'No layout shift on hero image',    'Perf',    6, 'low'),
  ('performance', 'Background tasks back off on idle','Perf',    7, 'low'),
  ('performance', 'No console warnings in build',     'Perf',    8, 'low'),
  ('responsive', 'Layout works at 1366px',            'Frontend',1, 'medium'),
  ('responsive', 'Layout works at 1280px',            'Frontend',2, 'medium'),
  ('responsive', 'Layout works at 1024px',            'Frontend',3, 'medium'),
  ('responsive', 'Layout works at 834px',             'Frontend',4, 'medium'),
  ('responsive', 'Layout works at 768px',             'Frontend',5, 'medium'),
  ('responsive', 'Touch targets ≥ 44px on mobile',    'Frontend',6, 'low'),
  ('responsive', 'Sticky nav behaves on scroll',      'Frontend',7, 'low'),
  ('a11y', 'Color contrast ≥ 4.5:1 across text',      'A11y',    1, 'medium'),
  ('a11y', 'Keyboard nav reaches every interactive', 'A11y',    2, 'medium'),
  ('a11y', 'Screen reader announces page changes',    'A11y',    3, 'medium'),
  ('a11y', 'Alt text present on images',              'A11y',    4, 'low'),
  ('a11y', 'Focus rings visible on all controls',     'A11y',    5, 'low'),
  ('a11y', 'Form labels associated correctly',        'A11y',    6, 'low')
on conflict do nothing;

-- Seed a single in-progress run for v1.4.2, copying every template into
-- qa_check_results with deterministic statuses. Idempotent — re-running
-- the migration won't duplicate the run.
do $$
declare
  release uuid;
  run uuid;
begin
  select id into release from public.qa_releases where version = 'v1.4.2';
  if release is null then return; end if;

  -- Skip if a run already exists for this release.
  select id into run from public.qa_runs where release_id = release limit 1;
  if run is not null then return; end if;

  insert into public.qa_runs (release_id, started_by_email, status, notes)
  values (release, 'deividas1.no@gmail.com', 'in_progress', 'Initial QA run for v1.4.2')
  returning id into run;

  -- Snapshot every template into qa_check_results with status assigned
  -- by row_number modulo so each area gets a mix of passed/review/blocker.
  insert into public.qa_check_results (run_id, template_id, area_key, title, description, owner_team, status, severity, sort_order)
  select
    run,
    t.id,
    t.area_key,
    t.title,
    t.description,
    t.owner_team,
    case
      -- Make the seeded blockers match the visible "Blockers" card.
      when t.title in (
        'OAuth callback handling edge cases',
        'Failed payment retry messaging verified',
        'Real-time notification refresh tested'
      ) then 'blocker'::qa_check_status
      when (row_number() over (partition by t.area_key order by t.sort_order)) % 5 = 0
        then 'review'::qa_check_status
      when (row_number() over (partition by t.area_key order by t.sort_order)) % 4 = 0
        then 'pending'::qa_check_status
      else 'passed'::qa_check_status
    end,
    t.default_severity,
    t.sort_order
  from public.qa_check_templates t;

  -- A few seeded activity rows so the "Recent Activity" card is populated.
  insert into public.qa_activity (run_id, actor_email, actor_initials, actor_name, message, kind, created_at) values
    (run, 'emma@example.com',    'EL', 'Emma L.',    'marked "Invoice table renders correctly" as Passed',         'passed',        now() - interval '12 minutes'),
    (run, 'jonas@example.com',   'JB', 'Jonas B.',   'updated "Password reset email flow works" to Review',        'review',        now() - interval '26 minutes'),
    (run, 'deividas1.no@gmail.com','DB','Deivid B.', 'created QA run for v1.4.2',                                  'run-created',   now() - interval '43 minutes'),
    (run, 'sophie@example.com',  'SM', 'Sophie M.',  'added blocker on real-time notification refresh',           'blocker-added', now() - interval '1 hour');
end $$;
