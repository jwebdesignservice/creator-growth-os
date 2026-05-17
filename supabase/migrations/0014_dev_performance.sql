-- =====================================================================
-- Dev Dashboard — Performance telemetry
-- Adds the schema that powers /dev/performance: time-bucketed service
-- metrics, slowest route samples, DB query latency samples, and the
-- alert-rule store wired to the "Create Alert Rule" header button.
--
-- All tables are dev-only via RLS — gated by public.is_dev_user() which
-- was created in 0010_dev_dashboard.sql. The main app's request flow,
-- middleware, and observability stack are NOT touched.
--
-- NOTE on volume: production performance telemetry is high-cardinality
-- time-series data. The columns here are an aggregate-friendly shape
-- (one row per service per bucket per environment) so a downstream
-- retention/aggregation job can downsample older rows without losing
-- the chart utility. See `cleanup_perf_samples()` at the bottom.
--
-- Safe to re-run.
-- =====================================================================

-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type dev_perf_service_status as enum ('Healthy', 'Degraded', 'Down');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_perf_http_method as enum ('GET', 'POST', 'PUT', 'PATCH', 'DELETE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_perf_alert_metric as enum (
    'response_time_p95',
    'response_time_p99',
    'error_rate',
    'requests_per_min',
    'cpu_percent',
    'memory_percent',
    'apdex'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_perf_alert_op as enum ('>', '>=', '<', '<=');
exception when duplicate_object then null; end $$;


-- SERVICE METRIC SAMPLES ------------------------------------------------
-- One row per (service, environment, ts-bucket). Bucket size is set by
-- the ingestion writer, not the schema — the granularity selector in the
-- UI just re-aggregates whatever buckets are present.

create table if not exists public.dev_perf_metric_samples (
  id                bigserial primary key,
  ts                timestamptz not null,
  service           text        not null,
  environment       text        not null default 'Production',
  p50_ms            integer     not null,
  p95_ms            integer     not null,
  p99_ms            integer     not null,
  requests_per_min  integer,
  error_rate        numeric(6,4) not null default 0,  -- 0–1
  cpu_percent       integer     not null default 0,   -- 0–100
  memory_percent    integer     not null default 0,   -- 0–100
  apdex             numeric(4,2) not null default 1,  -- 0–1
  status            dev_perf_service_status not null default 'Healthy',
  created_at        timestamptz not null default now(),
  unique (service, environment, ts)
);

create index if not exists idx_dev_perf_metric_samples_ts
  on public.dev_perf_metric_samples (ts desc);
create index if not exists idx_dev_perf_metric_samples_service_ts
  on public.dev_perf_metric_samples (service, ts desc);
create index if not exists idx_dev_perf_metric_samples_env_ts
  on public.dev_perf_metric_samples (environment, ts desc);


-- ROUTE LATENCY SAMPLES -------------------------------------------------
-- p95 per (method, path, ts-bucket). Drives the "Top Slowest Routes"
-- panel and the route dropdown autocomplete.

create table if not exists public.dev_perf_route_samples (
  id            bigserial primary key,
  ts            timestamptz not null,
  method        dev_perf_http_method not null,
  path          text        not null,
  environment   text        not null default 'Production',
  p95_ms        integer     not null,
  request_count integer     not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists idx_dev_perf_route_samples_ts
  on public.dev_perf_route_samples (ts desc);
create index if not exists idx_dev_perf_route_samples_path_ts
  on public.dev_perf_route_samples (path, ts desc);


-- DB QUERY LATENCY SAMPLES ----------------------------------------------
-- p95 per normalized query pattern (constants stripped) per bucket.

create table if not exists public.dev_perf_db_query_samples (
  id              bigserial primary key,
  ts              timestamptz not null,
  query_pattern   text        not null,
  environment     text        not null default 'Production',
  p95_ms          integer     not null,
  execution_count integer     not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_dev_perf_db_query_samples_ts
  on public.dev_perf_db_query_samples (ts desc);


-- ALERT RULES -----------------------------------------------------------
-- Backs the "Create Alert Rule" header button. Rules are evaluated by a
-- separate background worker (not part of this migration).

create table if not exists public.dev_perf_alert_rules (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  metric       dev_perf_alert_metric not null,
  op           dev_perf_alert_op not null,
  threshold    numeric not null,
  service      text,
  environment  text not null default 'Production',
  window_minutes integer not null default 5 check (window_minutes between 1 and 1440),
  enabled      boolean not null default true,
  notify_email text,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_dev_perf_alert_rules_enabled
  on public.dev_perf_alert_rules (enabled);
create index if not exists idx_dev_perf_alert_rules_service
  on public.dev_perf_alert_rules (service);


-- updated_at trigger ----------------------------------------------------

create or replace function public.dev_perf_alert_rules_touch()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_dev_perf_alert_rules_touch on public.dev_perf_alert_rules;
create trigger trg_dev_perf_alert_rules_touch
  before update on public.dev_perf_alert_rules
  for each row execute function public.dev_perf_alert_rules_touch();


-- RLS -------------------------------------------------------------------

alter table public.dev_perf_metric_samples    enable row level security;
alter table public.dev_perf_route_samples     enable row level security;
alter table public.dev_perf_db_query_samples  enable row level security;
alter table public.dev_perf_alert_rules       enable row level security;

-- Read access: any dev-allowlisted user.
drop policy if exists "dev_perf_metric_samples_select" on public.dev_perf_metric_samples;
create policy "dev_perf_metric_samples_select"
  on public.dev_perf_metric_samples for select
  to authenticated
  using (public.is_dev_user());

drop policy if exists "dev_perf_route_samples_select" on public.dev_perf_route_samples;
create policy "dev_perf_route_samples_select"
  on public.dev_perf_route_samples for select
  to authenticated
  using (public.is_dev_user());

drop policy if exists "dev_perf_db_query_samples_select" on public.dev_perf_db_query_samples;
create policy "dev_perf_db_query_samples_select"
  on public.dev_perf_db_query_samples for select
  to authenticated
  using (public.is_dev_user());

-- Alert rules: dev users can read, insert, update, delete their own rules.
drop policy if exists "dev_perf_alert_rules_select" on public.dev_perf_alert_rules;
create policy "dev_perf_alert_rules_select"
  on public.dev_perf_alert_rules for select
  to authenticated
  using (public.is_dev_user());

drop policy if exists "dev_perf_alert_rules_insert" on public.dev_perf_alert_rules;
create policy "dev_perf_alert_rules_insert"
  on public.dev_perf_alert_rules for insert
  to authenticated
  with check (public.is_dev_user());

drop policy if exists "dev_perf_alert_rules_update" on public.dev_perf_alert_rules;
create policy "dev_perf_alert_rules_update"
  on public.dev_perf_alert_rules for update
  to authenticated
  using (public.is_dev_user())
  with check (public.is_dev_user());

drop policy if exists "dev_perf_alert_rules_delete" on public.dev_perf_alert_rules;
create policy "dev_perf_alert_rules_delete"
  on public.dev_perf_alert_rules for delete
  to authenticated
  using (public.is_dev_user());


-- RETENTION HELPER ------------------------------------------------------
-- Called by a scheduled job (pg_cron / Supabase scheduled function).
-- Keeps last 30 days of raw samples; older rows should be downsampled
-- into a rollup table by the ingestion service before being purged here.

create or replace function public.dev_perf_cleanup_old_samples(keep_days int default 30)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.dev_perf_metric_samples
   where ts < now() - (keep_days || ' days')::interval;
  delete from public.dev_perf_route_samples
   where ts < now() - (keep_days || ' days')::interval;
  delete from public.dev_perf_db_query_samples
   where ts < now() - (keep_days || ' days')::interval;
end;
$$;


-- SEED — last 24h of demo data so /dev/performance has something to render
-- even when no real ingestion pipeline is connected. Idempotent: keyed on
-- (service, environment, ts) so re-runs are no-ops.
-- ---------------------------------------------------------------------

with hours as (
  select generate_series(0, 23) as h
),
services as (
  select * from (values
    ('frontend',     60,  180, 320, 1245, 0.0015, 38, 62, 0.92, 'Healthy'::dev_perf_service_status),
    ('backend-api',  85,  210, 412, 842,  0.0028, 46, 68, 0.87, 'Healthy'::dev_perf_service_status),
    ('auth-service', 45,  120, 210, 312,  0.0005, 22, 48, 0.95, 'Healthy'::dev_perf_service_status),
    ('notifications',120, 310, 512, 156,  0.0142, 34, 58, 0.65, 'Degraded'::dev_perf_service_status),
    ('payments',     200, 420, 690, 98,   0.0023, 28, 54, 0.89, 'Healthy'::dev_perf_service_status),
    ('database',     15,  85,  140, null, 0.0002, 42, 70, 0.98, 'Healthy'::dev_perf_service_status)
  ) as t(service, p50, p95, p99, rpm, err, cpu, mem, apdex, status)
)
insert into public.dev_perf_metric_samples (
  ts, service, environment, p50_ms, p95_ms, p99_ms,
  requests_per_min, error_rate, cpu_percent, memory_percent, apdex, status
)
select
  date_trunc('hour', now()) - (h.h || ' hours')::interval                       as ts,
  s.service,
  'Production',
  -- Add a small per-bucket sinusoidal wobble so charts look alive.
  greatest(1, s.p50  + (10 * sin(h.h::float / 4.0))::int)                       as p50_ms,
  greatest(1, s.p95  + (24 * sin(h.h::float / 4.0))::int)                       as p95_ms,
  greatest(1, s.p99  + (48 * sin(h.h::float / 4.0))::int)                       as p99_ms,
  case when s.rpm is null then null
       else greatest(1, s.rpm + (s.rpm * 0.08 * sin(h.h::float / 3.0))::int) end as requests_per_min,
  greatest(0, s.err + (0.001 * sin(h.h::float / 5.0)))::numeric(6,4)            as error_rate,
  greatest(0, least(100, s.cpu + (4 * sin(h.h::float / 4.0))::int))             as cpu_percent,
  greatest(0, least(100, s.mem + (3 * sin(h.h::float / 4.5))::int))             as memory_percent,
  s.apdex                                                                       as apdex,
  s.status
from services s
cross join hours h
on conflict (service, environment, ts) do nothing;

insert into public.dev_perf_route_samples (ts, method, path, environment, p95_ms, request_count)
select now() - (h.h || ' hours')::interval, t.method::dev_perf_http_method, t.path, 'Production', t.p95, t.count
from (values
  ('POST', '/api/upload',        812, 184),
  ('GET',  '/api/analytics',     642, 422),
  ('GET',  '/api/notifications', 512, 318),
  ('POST', '/api/webhooks',      421, 256),
  ('GET',  '/api/dashboard',     312, 1108)
) as t(method, path, p95, count)
cross join generate_series(0, 5) as h(h)
on conflict do nothing;

insert into public.dev_perf_db_query_samples (ts, query_pattern, environment, p95_ms, execution_count)
select now() - (h.h || ' hours')::interval, t.q, 'Production', t.p95, t.count
from (values
  ('SELECT * FROM missions …',  1240, 412),
  ('SELECT * FROM users …',      985, 1106),
  ('SELECT * FROM events …',     742, 5240),
  ('SELECT * FROM analytics …',  512, 982),
  ('SELECT * FROM payments …',   412, 218)
) as t(q, p95, count)
cross join generate_series(0, 5) as h(h)
on conflict do nothing;
