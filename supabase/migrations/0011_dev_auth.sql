-- =====================================================================
-- Dev Dashboard — Auth monitoring telemetry
-- Adds the schema that powers /dev/auth: authentication events log,
-- derived security signals, and per-route health snapshots.
--
-- All tables are dev-only via RLS — gated by public.is_dev_user() which
-- was created in 0010_dev_dashboard.sql. The main app's auth flow,
-- middleware, and auth.* schema are NOT touched.
-- Safe to re-run.
-- =====================================================================

-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type dev_auth_event_kind as enum (
    'login_success',
    'login_failed',
    'signup_started',
    'signup_completed',
    'magic_link_sent',
    'password_reset_requested',
    'password_reset_completed',
    'mfa_challenge_sent',
    'mfa_challenge_succeeded',
    'mfa_challenge_failed',
    'session_revoked',
    'account_locked',
    'account_unlocked'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_auth_event_status as enum (
    'success',
    'tracked',
    'warning',
    'danger'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_auth_provider as enum (
    'email',
    'google',
    'apple',
    'magic_link',
    'github',
    'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_auth_device as enum ('Desktop', 'Mobile', 'Tablet');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_auth_route_status as enum ('Healthy', 'Warning', 'Critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_security_signal_tone as enum ('danger', 'warning', 'info');
exception when duplicate_object then null; end $$;


-- AUTH EVENTS -----------------------------------------------------------
-- Append-only log of authentication-related events. Population is meant
-- to come from a future trigger / edge function that mirrors auth.users
-- events; the dev dashboard only ever SELECTs.

create table if not exists public.dev_auth_events (
  id              uuid primary key default gen_random_uuid(),
  occurred_at     timestamptz not null default now(),
  event_kind      dev_auth_event_kind not null,
  status          dev_auth_event_status not null,
  status_label    text not null,
  user_label      text not null,   -- email or anonymized user_id; never raw PII
  provider        dev_auth_provider not null,
  route           text not null,
  device          dev_auth_device not null,
  environment     text not null default 'Production',
  region          text,            -- e.g. "Europe", "North America"
  ip_hash         text,            -- already hashed by the writer; no raw IPs
  failure_reason  text,            -- populated for login_failed / mfa_failed
  suspicious      boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_dev_auth_events_occurred_at on public.dev_auth_events (occurred_at desc);
create index if not exists idx_dev_auth_events_kind        on public.dev_auth_events (event_kind);
create index if not exists idx_dev_auth_events_status      on public.dev_auth_events (status);
create index if not exists idx_dev_auth_events_provider    on public.dev_auth_events (provider);
create index if not exists idx_dev_auth_events_suspicious  on public.dev_auth_events (suspicious) where suspicious = true;


-- SECURITY SIGNALS ------------------------------------------------------
-- Derived/static alerts displayed on the dashboard. A future job can
-- recompute these from dev_auth_events; for now they're seeded.

create table if not exists public.dev_auth_security_signals (
  id          uuid primary key default gen_random_uuid(),
  message     text not null,
  tone        dev_security_signal_tone not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_dev_auth_security_signals_active on public.dev_auth_security_signals (active) where active = true;


-- AUTH ROUTE HEALTH -----------------------------------------------------
-- Snapshot of per-route status + p95 latency. Updated periodically by a
-- future cron; the dashboard reads the latest row per route.

create table if not exists public.dev_auth_route_health (
  route       text primary key,
  status      dev_auth_route_status not null,
  p95_ms      integer not null,
  updated_at  timestamptz not null default now()
);


-- RLS -------------------------------------------------------------------

alter table public.dev_auth_events           enable row level security;
alter table public.dev_auth_security_signals enable row level security;
alter table public.dev_auth_route_health     enable row level security;

do $$ begin
  drop policy if exists dev_auth_events_select           on public.dev_auth_events;
  drop policy if exists dev_auth_security_signals_select on public.dev_auth_security_signals;
  drop policy if exists dev_auth_route_health_select     on public.dev_auth_route_health;
end $$;

-- Read-only for dev users. INSERTs come from server-side jobs that use
-- the service role (which bypasses RLS), so no write policy is exposed.
create policy dev_auth_events_select           on public.dev_auth_events           for select using (public.is_dev_user());
create policy dev_auth_security_signals_select on public.dev_auth_security_signals for select using (public.is_dev_user());
create policy dev_auth_route_health_select     on public.dev_auth_route_health     for select using (public.is_dev_user());


-- SEED DATA -------------------------------------------------------------
-- Mirrors the current mock content in src/lib/dev-dashboard/mock-data.ts
-- so the page is populated immediately after migration. Times are
-- relative to now() so the dashboard always shows fresh-looking data.

insert into public.dev_auth_events
  (event_kind, status, status_label, user_label, provider, route, device, region, suspicious, failure_reason, occurred_at)
values
  ('login_success',            'success', 'Success',          'emma.larsen@example.com', 'email',      '/auth/sign-in',         'Desktop', 'Europe',        false, null,                now() - interval '2 minutes'),
  ('signup_completed',         'success', 'Success',          'jonas.berg@example.com',  'google',     '/auth/sign-up',         'Mobile',  'North America', false, null,                now() - interval '3 minutes'),
  ('password_reset_requested', 'tracked', 'Tracked',          'sophie.dahl@example.com', 'email',      '/auth/reset-password',  'Desktop', 'Europe',        false, null,                now() - interval '4 minutes'),
  ('login_failed',             'danger',  'Invalid Password', 'user_6bb29f',             'email',      '/auth/sign-in',         'Mobile',  'Europe',        true,  'invalid_password',  now() - interval '5 minutes'),
  ('magic_link_sent',          'tracked', 'Sent',             'lucas.hansen@example.com','magic_link', '/auth/magic-link',      'Tablet',  'Asia',          false, null,                now() - interval '7 minutes'),
  ('mfa_challenge_failed',     'warning', 'Failed',           'nora.aasen@example.com',  'email',      '/auth/verify-mfa',      'Desktop', 'Europe',        true,  'mfa_code_mismatch', now() - interval '8 minutes')
on conflict do nothing;

insert into public.dev_auth_security_signals (message, tone, active) values
  ('28 repeated failed logins from same IP range', 'danger',  true),
  ('11 suspicious geo-switch logins detected',     'warning', true),
  ('6 admin accounts without MFA enabled',         'warning', true),
  ('3 locked accounts pending review',             'info',    true)
on conflict do nothing;

insert into public.dev_auth_route_health (route, status, p95_ms) values
  ('/auth/sign-in',        'Healthy', 182),
  ('/auth/sign-up',        'Healthy', 204),
  ('/auth/callback',       'Warning', 312),
  ('/auth/reset-password', 'Healthy', 196),
  ('/auth/magic-link',     'Warning', 338)
on conflict (route) do update
  set status     = excluded.status,
      p95_ms     = excluded.p95_ms,
      updated_at = now();
