-- =====================================================================
-- Dev Dashboard — Application logs + observability
-- Adds the schema that powers /dev/logs: structured application log
-- events, per-user saved filter views, and a derived trace-group view.
--
-- Read access is gated by public.is_dev_user() (from 0010_dev_dashboard.sql).
-- Writes to dev_log_events happen via the service-role client only (the
-- logger helper added in Phase 2). No public INSERT policy is exposed.
--
-- Schema is partition-ready: dev_log_events is a normal table for now,
-- but `ts` has a BRIN index so range scans stay cheap into the tens of
-- millions of rows. Move to declarative time-partitioning when volume
-- justifies it; the query layer is partition-agnostic.
--
-- Safe to re-run.
-- =====================================================================


-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type dev_log_level as enum ('INFO', 'WARN', 'ERROR', 'DEBUG');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_log_trace_status as enum ('OK', 'Warn', 'Error');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_log_saved_view_tone as enum ('danger', 'warning', 'success', 'info', 'neutral');
exception when duplicate_object then null; end $$;


-- LOG EVENTS ------------------------------------------------------------
-- Append-only structured log table. One row per emitted event from any
-- service. `ts` is the canonical event timestamp; `created_at` records
-- when the row landed in the database (useful for ingest-delay metric).

create table if not exists public.dev_log_events (
  id              bigserial primary key,
  ts              timestamptz not null default now(),
  level           dev_log_level not null,
  service         text not null,
  source          text not null,
  message         text not null,
  trace_id        text,
  request_id      text,
  user_id         uuid references auth.users(id) on delete set null,
  user_label      text,                                  -- shown in UI even after user deletion
  route           text,
  method          text,
  status_code     int2,
  duration_ms     int4,
  environment     text not null default 'Production',
  metadata        jsonb not null default '{}'::jsonb,    -- arbitrary structured payload + stack trace
  created_at      timestamptz not null default now()
);


-- INDEXES — tuned for the actual queries the page issues.
-- A note on BRIN: at small scale btree on ts is fine, but BRIN keeps
-- indexing cheap as the table grows. We keep both for now.

create index if not exists idx_dev_log_events_ts                on public.dev_log_events (ts desc);
create index if not exists idx_dev_log_events_ts_brin           on public.dev_log_events using brin (ts);
create index if not exists idx_dev_log_events_level_ts          on public.dev_log_events (level, ts desc);
create index if not exists idx_dev_log_events_service_ts        on public.dev_log_events (service, ts desc);
create index if not exists idx_dev_log_events_env_ts            on public.dev_log_events (environment, ts desc);
create index if not exists idx_dev_log_events_trace_id          on public.dev_log_events (trace_id) where trace_id is not null;
create index if not exists idx_dev_log_events_user_ts           on public.dev_log_events (user_id, ts desc) where user_id is not null;
create index if not exists idx_dev_log_events_status_code       on public.dev_log_events (status_code) where status_code is not null;
create index if not exists idx_dev_log_events_metadata_gin      on public.dev_log_events using gin (metadata);


-- TRACE GROUPS ----------------------------------------------------------
-- Derived rollup as a view. Aggregates events sharing a trace_id into a
-- single row showing service breadth, worst severity, total duration,
-- and recency. Computed on demand; promote to materialized view in
-- Phase 3 once trigger-driven refresh is in place.

create or replace view public.dev_log_trace_groups as
select
  trace_id,
  count(distinct service)::int as service_count,
  case
    when max(case level
               when 'ERROR' then 3
               when 'WARN'  then 2
               else 1
             end) = 3 then 'Error'::dev_log_trace_status
    when max(case level
               when 'ERROR' then 3
               when 'WARN'  then 2
               else 1
             end) = 2 then 'Warn'::dev_log_trace_status
    else 'OK'::dev_log_trace_status
  end as status,
  sum(coalesce(duration_ms, 0))::int as duration_total_ms,
  max(ts)                            as last_seen_at
from public.dev_log_events
where trace_id is not null
group by trace_id;


-- SAVED VIEWS -----------------------------------------------------------
-- Per-user filter presets shown in the Saved Views / Quick Filters card.
-- `filters` is a JSON blob so the schema doesn't fight UI evolution.

create table if not exists public.dev_log_saved_views (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  description  text,
  filters      jsonb not null default '{}'::jsonb,
  tone         dev_log_saved_view_tone not null default 'neutral',
  icon_key     text not null default 'bookmark',         -- maps to a lucide icon name client-side
  sort_order   int4 not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_dev_log_saved_views_user
  on public.dev_log_saved_views (user_id, sort_order);


-- updated_at trigger
create or replace function public.touch_dev_log_saved_views_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  drop trigger if exists trg_dev_log_saved_views_touch on public.dev_log_saved_views;
end $$;

create trigger trg_dev_log_saved_views_touch
before update on public.dev_log_saved_views
for each row execute function public.touch_dev_log_saved_views_updated_at();


-- RLS -------------------------------------------------------------------

alter table public.dev_log_events      enable row level security;
alter table public.dev_log_saved_views enable row level security;

do $$ begin
  drop policy if exists dev_log_events_select          on public.dev_log_events;
  drop policy if exists dev_log_saved_views_select     on public.dev_log_saved_views;
  drop policy if exists dev_log_saved_views_insert     on public.dev_log_saved_views;
  drop policy if exists dev_log_saved_views_update     on public.dev_log_saved_views;
  drop policy if exists dev_log_saved_views_delete     on public.dev_log_saved_views;
end $$;

-- Events: read-only for dev users. Inserts happen via service role only.
create policy dev_log_events_select
  on public.dev_log_events
  for select
  using (public.is_dev_user());

-- Saved views: each dev sees, manages, and owns only their own rows.
create policy dev_log_saved_views_select
  on public.dev_log_saved_views
  for select
  using (public.is_dev_user() and user_id = auth.uid());

create policy dev_log_saved_views_insert
  on public.dev_log_saved_views
  for insert
  with check (public.is_dev_user() and user_id = auth.uid());

create policy dev_log_saved_views_update
  on public.dev_log_saved_views
  for update
  using (public.is_dev_user() and user_id = auth.uid())
  with check (public.is_dev_user() and user_id = auth.uid());

create policy dev_log_saved_views_delete
  on public.dev_log_saved_views
  for delete
  using (public.is_dev_user() and user_id = auth.uid());


-- SEED ------------------------------------------------------------------
-- ~200 realistic log rows spanning the last 30 minutes so the page
-- always lights up with fresh-looking data. Distribution roughly:
--   INFO ~70%, WARN ~20%, ERROR ~7%, DEBUG ~3%
-- Trace IDs are shared across multiple events so the trace-groups view
-- has meaningful rows. One trace (8f2a1d4b6e7c4f9a) intentionally drives
-- the seed selected-log row used in Selected Log Details.

-- Helper that generates one row. Inlined as a function to keep the
-- INSERT block readable.
create or replace function public._seed_dev_log(
  p_minutes_ago numeric,
  p_seconds     numeric,
  p_level       dev_log_level,
  p_service     text,
  p_source      text,
  p_message     text,
  p_trace       text,
  p_user_label  text,
  p_route       text,
  p_method      text,
  p_status      int,
  p_duration    int,
  p_metadata    jsonb
) returns void language sql as $$
  insert into public.dev_log_events
    (ts, level, service, source, message, trace_id, request_id, user_label, route, method, status_code, duration_ms, environment, metadata)
  values
    (
      now() - make_interval(mins => p_minutes_ago::int, secs => p_seconds),
      p_level, p_service, p_source, p_message, p_trace,
      'req_' || replace(gen_random_uuid()::text, '-', ''),
      p_user_label, p_route, p_method, p_status, p_duration,
      'Production',
      p_metadata
    );
$$;

-- Clear prior seed so re-runs stay deterministic. Only deletes the
-- specific marker we tag (so a future logger writing real rows is safe).
delete from public.dev_log_events where (metadata ->> 'seed') = '0012';

-- The 8 rows shown in the Live Log Stream + Selected Log Details.
-- Their offsets sum back into the 30-minute window so they appear at
-- the top of any "last 30 minutes" filter.
select public._seed_dev_log(0, 18.512, 'INFO',  'frontend',      'web',          'Webhook processed successfully',           'd1f7c9e2', 'user_1234', 'POST /api/webhooks',        'POST',    200, 342, jsonb_build_object('seed','0012'));
select public._seed_dev_log(0, 39.109, 'WARN',  'database',      'postgres',     'Slow query detected on public.missions',    'a3b0e7f1', null,        'SELECT * FROM missions',    'SELECT',  null, 1240, jsonb_build_object('seed','0012','query','SELECT * FROM missions WHERE user_id = $1'));
select public._seed_dev_log(0, 49.767, 'ERROR', 'notifications', 'api',          'Failed to fetch /api/notifications',        '8f2a1d4b6e7c4f9a', 'user_5678', 'GET /api/notifications',    'GET',     503, 2310, jsonb_build_object('seed','0012','stack', jsonb_build_array(
  'Error: Upstream service unavailable',
  '    at NotificationsService.getNotifications (notifications.service.ts:142:13)',
  '    at processTicksAndRejections (node:internal/process/task_queues:95:5)',
  '    at async handleRequest (api/middleware/request.ts:78:21)'
)));
select public._seed_dev_log(0, 50.018, 'INFO',  'auth',          'auth-service', 'Session refresh completed',                 'b7c9d3a8', 'user_5678', 'POST /api/auth/refresh',    'POST',    200, 184, jsonb_build_object('seed','0012'));
select public._seed_dev_log(0, 50.898, 'WARN',  'backend-api',   'api',          'Rate limit threshold reached',              'e6d4b2c1', 'user_9012', 'GET /api/data',             'GET',     429, 923, jsonb_build_object('seed','0012'));
select public._seed_dev_log(0, 51.328, 'INFO',  'storage',       's3',           'File upload retry scheduled',               'c4b2a9e6', 'user_3456', 'PUT /files/upload',         'PUT',     202, 512, jsonb_build_object('seed','0012'));
select public._seed_dev_log(0, 51.877, 'DEBUG', 'payments',      'stripe',       'Payment intent confirmed',                  'f9e8d7c6d5c3b8a1', 'user_7890', 'POST /api/payments',        'POST',    200, 263, jsonb_build_object('seed','0012'));
select public._seed_dev_log(0, 52.445, 'INFO',  'backend-api',   'worker',       'Email queued for delivery',                 'd5c3b8a1', null,        'POST /api/email/send',      'POST',    202, 167, jsonb_build_object('seed','0012'));

-- Bulk filler — generate ~200 additional rows spanning the last 30
-- minutes so the volume chart, services-by-volume, and metrics have
-- real signal. Uses generate_series + modular arithmetic so the data
-- is deterministic and replayable.
insert into public.dev_log_events (ts, level, service, source, message, trace_id, request_id, user_label, route, method, status_code, duration_ms, environment, metadata)
select
  now() - make_interval(secs => (i * 9)::int),  -- spread across last ~30 minutes
  case (i % 20)
    when 0 then 'ERROR'::dev_log_level
    when 1 then 'ERROR'::dev_log_level
    when 2 then 'WARN'::dev_log_level
    when 3 then 'WARN'::dev_log_level
    when 4 then 'WARN'::dev_log_level
    when 5 then 'WARN'::dev_log_level
    when 6 then 'DEBUG'::dev_log_level
    else        'INFO'::dev_log_level
  end,
  (array['frontend','backend-api','auth','database','notifications','payments','storage'])[(i % 7) + 1],
  (array['web','api','worker','auth-service','postgres','stripe','s3'])[(i % 7) + 1],
  (array[
    'Request handled',
    'Cache miss — repopulated from origin',
    'Background job started',
    'Background job completed',
    'Session validated',
    'Query plan refreshed',
    'Webhook accepted',
    'Email worker dequeued message',
    'Auth token refreshed',
    'Health check OK',
    'Connection pool resized',
    'Rate limit window reset'
  ])[(i % 12) + 1],
  -- Pin a fraction of rows onto the 5 visible trace IDs in Recent
  -- Trace Groups so the rollup view returns 5 meaningful groups.
  case (i % 13)
    when 0 then 'd1f7c9e2a3b0e7f1'
    when 1 then 'a3b0e7f1c4b2a9e6'
    when 2 then 'b7c9d3a8e6d4b2c1'
    when 3 then 'f9e8d7c6d5c3b8a1'
    else 'trace_' || (i % 60)
  end,
  'req_' || replace(gen_random_uuid()::text, '-', ''),
  case when i % 4 = 0 then null else 'user_' || (1000 + (i % 90))::text end,
  (array['/dashboard','/programs','/tutorials','/posting','/missions','/community','/billing','/settings','/api/data','/api/programs','/api/missions','/api/auth/refresh'])[(i % 12) + 1],
  (array['GET','POST','PUT','DELETE','PATCH'])[(i % 5) + 1],
  (array[200,200,200,200,200,201,202,204,304,400,401,403,404,429,500,502,503])[(i % 17) + 1],
  ((i * 37) % 1900 + 80)::int,
  'Production',
  jsonb_build_object('seed','0012','filler', true)
from generate_series(1, 200) as g(i);

drop function if exists public._seed_dev_log(numeric, numeric, dev_log_level, text, text, text, text, text, text, text, int, int, jsonb);


-- Seed two suggested saved views per dev — only inserts if the
-- allowlisted dev user actually exists in auth.users. on conflict
-- protects against re-runs.
insert into public.dev_log_saved_views (user_id, name, description, filters, tone, icon_key, sort_order)
select
  u.id,
  v.name, v.description, v.filters::jsonb, v.tone::dev_log_saved_view_tone, v.icon_key, v.sort_order
from auth.users u
join public.dev_users du on du.email = u.email
cross join (values
  ('Errors only',          'All ERROR-level events across services',  '{"level":"ERROR"}',                                 'danger',  'alert-triangle', 1),
  ('Auth events',          'Sign-in, refresh, MFA, session activity', '{"service":"auth"}',                                'info',    'shield',         2),
  ('Payment webhooks',     'Stripe webhook + payment-intent traffic', '{"service":"payments"}',                            'success', 'dollar-sign',    3),
  ('Slow queries',         'WARN-level postgres events',              '{"service":"database","level":"WARN"}',             'warning', 'database',       4),
  ('Notification failures','ERROR-level notification service issues', '{"service":"notifications","level":"ERROR"}',       'danger',  'mail',           5)
) as v(name, description, filters, tone, icon_key, sort_order)
on conflict do nothing;
