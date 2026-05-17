-- =====================================================================
-- Dev Dashboard — error monitoring, incidents, alert rules
-- Adds the schema that powers /dev/errors. Safe to re-run.
-- Access is gated by an allowlist of dev emails (see dev_users table).
-- =====================================================================

-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type dev_error_severity as enum ('critical','high','medium','low');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_error_status as enum ('open','investigating','resolved');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_incident_status as enum ('open','investigating','resolved');
exception when duplicate_object then null; end $$;


-- DEV USER ALLOWLIST ----------------------------------------------------
-- Mirrors the in-code DEV_ALLOWLIST in src/lib/dev-dashboard/dev-access.ts.
-- Keeping a DB table lets RLS gate the dev_* tables without trusting the
-- session payload alone. Add/remove rows here to grant or revoke access.

create table if not exists public.dev_users (
  email      text primary key,
  added_at   timestamptz not null default now()
);

insert into public.dev_users (email) values
  ('deividas1.no@gmail.com'),
  ('hei@bwstudio.no')
on conflict (email) do nothing;

-- Helper: is the current authenticated user on the dev allowlist?
-- security definer + stable lets RLS policies call it cheaply.
create or replace function public.is_dev_user() returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.dev_users du
    join auth.users u on u.email = du.email
    where u.id = auth.uid()
  );
$$;


-- ERRORS ----------------------------------------------------------------
-- One row per fingerprint. `id` is the human-friendly identifier shown in
-- the UI ('ERR-5042'); the underlying fingerprint is the unique key.

create table if not exists public.dev_errors (
  id                text primary key,
  fingerprint       text not null unique,
  message           text not null,
  source            text not null,
  route             text,
  severity          dev_error_severity not null,
  status            dev_error_status not null default 'open',
  occurrences       integer not null default 0,
  affected_users    integer not null default 0,
  release           text,
  environment       text not null default 'Production',
  type              text,
  status_code       integer,
  owner             text,
  impact            text,
  suggested_action  text,
  first_seen        timestamptz not null default now(),
  last_seen         timestamptz not null default now(),
  created_at        timestamptz not null default now()
);

create index if not exists idx_dev_errors_status     on public.dev_errors (status);
create index if not exists idx_dev_errors_severity   on public.dev_errors (severity);
create index if not exists idx_dev_errors_source     on public.dev_errors (source);
create index if not exists idx_dev_errors_last_seen  on public.dev_errors (last_seen desc);


-- STACK TRACES ----------------------------------------------------------

create table if not exists public.dev_stack_traces (
  id          uuid primary key default gen_random_uuid(),
  error_id    text references public.dev_errors(id) on delete cascade,
  file_path   text,
  lines       text[] not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_dev_stack_traces_error on public.dev_stack_traces (error_id, created_at desc);


-- INCIDENTS -------------------------------------------------------------

create table if not exists public.dev_incidents (
  id                text primary key,
  title             text not null,
  severity          dev_error_severity not null,
  status            dev_incident_status not null default 'open',
  related_error_id  text references public.dev_errors(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists idx_dev_incidents_status on public.dev_incidents (status);


-- ALERT RULES -----------------------------------------------------------

create table if not exists public.dev_alert_rules (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  description         text,
  severity_filter     dev_error_severity[],
  source_filter       text[],
  threshold_count     integer,
  threshold_period    text,
  channel             text,
  enabled             boolean not null default true,
  created_by_email    text,
  created_at          timestamptz not null default now()
);


-- RLS -------------------------------------------------------------------
-- All dev_* tables are dev-only. is_dev_user() is the single gate. The
-- main app's RLS is unaffected.

alter table public.dev_users        enable row level security;
alter table public.dev_errors       enable row level security;
alter table public.dev_stack_traces enable row level security;
alter table public.dev_incidents    enable row level security;
alter table public.dev_alert_rules  enable row level security;

-- Read access for any dev-allowlisted user.
do $$ begin
  drop policy if exists dev_users_select        on public.dev_users;
  drop policy if exists dev_errors_select       on public.dev_errors;
  drop policy if exists dev_stack_traces_select on public.dev_stack_traces;
  drop policy if exists dev_incidents_select    on public.dev_incidents;
  drop policy if exists dev_alert_rules_select  on public.dev_alert_rules;
  drop policy if exists dev_alert_rules_insert  on public.dev_alert_rules;
  drop policy if exists dev_alert_rules_update  on public.dev_alert_rules;
  drop policy if exists dev_alert_rules_delete  on public.dev_alert_rules;
end $$;

create policy dev_users_select        on public.dev_users        for select using (public.is_dev_user());
create policy dev_errors_select       on public.dev_errors       for select using (public.is_dev_user());
create policy dev_stack_traces_select on public.dev_stack_traces for select using (public.is_dev_user());
create policy dev_incidents_select    on public.dev_incidents    for select using (public.is_dev_user());

-- Alert rules: dev users can read AND manage their own rules.
create policy dev_alert_rules_select on public.dev_alert_rules for select using (public.is_dev_user());
create policy dev_alert_rules_insert on public.dev_alert_rules for insert with check (public.is_dev_user());
create policy dev_alert_rules_update on public.dev_alert_rules for update using (public.is_dev_user()) with check (public.is_dev_user());
create policy dev_alert_rules_delete on public.dev_alert_rules for delete using (public.is_dev_user());


-- SEED DATA -------------------------------------------------------------
-- Mirrors the current mock content in src/lib/dev-dashboard/mock-data.ts
-- so the page is populated immediately after migration.

insert into public.dev_errors (id, fingerprint, message, source, route, severity, status,
  occurrences, affected_users, release, environment, type, status_code, owner, impact, suggested_action,
  first_seen, last_seen)
values
  ('ERR-5042', 'fp_failed_fetch_notifications',  'Failed to fetch /api/notifications',         'Notifications', '/api/notifications',   'critical','open',          512, 842, 'v1.4.2', 'Production', 'Server Error', 500, 'Deividas B.', 'High',   'Check notification API handler and Supabase query response.', '2025-05-20 09:18:32+00', now() - interval '2 minutes'),
  ('ERR-5031', 'fp_failed_payments_webhook',     'Failed payments webhook: timeout',           'Payments',      '/api/webhooks/stripe', 'high',    'open',          387, 620, 'v1.4.2', 'Production', 'Webhook Error',504, 'Unassigned',  'High',   null, now() - interval '5 minutes',  now() - interval '5 minutes'),
  ('ERR-5021', 'fp_db_connection_timeout',       'Database query failed: connection timeout',  'Database',      'public.missions',      'high',    'investigating', 224, 418, 'v1.4.2', 'Production', 'Database',     null,'Backend',     'Medium', null, now() - interval '7 minutes',  now() - interval '7 minutes'),
  ('ERR-4011', 'fp_auth_token_refresh_failed',   'Auth token refresh failed',                  'Auth',          '/auth/callback',       'medium',  'open',           98, 221, 'v1.4.1', 'Production', 'Auth',         401, 'Auth',        'Low',    null, now() - interval '12 minutes', now() - interval '12 minutes'),
  ('ERR-4290', 'fp_rate_limit_exceeded_users',   'Rate limit exceeded for /api/users',         'Backend API',   '/api/users',           'medium',  'investigating',  42, 103, 'v1.4.2', 'Production', 'Rate Limit',   429, 'API',         'Low',    null, now() - interval '18 minutes', now() - interval '18 minutes'),
  ('ERR-5007', 'fp_null_pointer_user_service',   'Null pointer exception in user service',     'Backend API',   '/api/users/profile',   'low',     'resolved',       18,  37, 'v1.4.1', 'Production', 'Runtime',      500, 'Backend',     'Low',    null, now() - interval '1 hour',     now() - interval '1 hour'),
  ('ERR-5040', 'fp_s3_upload_timeout',           'S3 upload failed: network timeout',          'Storage',       '/api/storage/upload',  'low',     'resolved',       12,  28, 'v1.4.1', 'Production', 'Storage',      504, 'Storage',     'Low',    null, now() - interval '2 hours',    now() - interval '2 hours'),
  ('ERR-4004', 'fp_invalid_request_payload',     'Invalid request payload',                    'Frontend',      '/settings',            'low',     'resolved',        8,  16, 'v1.4.0', 'Production', 'Validation',   400, 'Frontend',    'Low',    null, now() - interval '3 hours',    now() - interval '3 hours')
on conflict (id) do nothing;

insert into public.dev_stack_traces (error_id, file_path, lines)
values
  ('ERR-5042', '/api/notifications/route.ts:42', array[
    'NotificationService.fetchUnread',
    '/api/notifications/route.ts:42',
    'Supabase query returned timeout after 10s',
    'at async handler (route.ts:38:15)'
  ])
on conflict do nothing;

insert into public.dev_incidents (id, title, severity, status, related_error_id) values
  ('INC-1042', 'Notifications service failing',     'high',   'open', 'ERR-5042'),
  ('INC-1039', 'Payments webhook timeouts',         'high',   'open', 'ERR-5031'),
  ('INC-1036', 'Database connection instability',   'medium', 'investigating', 'ERR-5021'),
  ('INC-1028', 'Auth refresh warnings',             'medium', 'open', 'ERR-4011')
on conflict (id) do nothing;
