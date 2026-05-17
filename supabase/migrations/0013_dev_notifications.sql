-- =====================================================================
-- Dev Dashboard — internal notifications / alerts
-- Powers the bell dropdown in the dev topbar and the full
-- /dev/notifications page. Distinct from the user-facing notifications
-- system in public.notifications (which lives behind the main app shell).
--
-- Each row represents an operational signal the dev/ops team should
-- see — error spikes, failed deploys, billing webhook issues, security
-- signals, audit events, etc. Reads are gated by public.is_dev_user()
-- from 0010_dev_dashboard.sql; writes happen via the service-role
-- client (logger helpers come in a follow-up).
--
-- Safe to re-run.
-- =====================================================================


-- ENUMS -----------------------------------------------------------------

do $$ begin
  create type dev_notification_category as enum (
    'incident',     -- production errors, outages, spikes
    'deploy',       -- build/deploy success/failure
    'security',     -- suspicious activity, MFA, allowlist
    'billing',      -- stripe webhooks, payment failures
    'system',       -- platform/infra events
    'audit'         -- admin actions, config changes
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_notification_severity as enum (
    'critical',
    'high',
    'medium',
    'low',
    'info'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type dev_notification_status as enum ('unread', 'read', 'archived');
exception when duplicate_object then null; end $$;


-- TABLE -----------------------------------------------------------------

create table if not exists public.dev_notifications (
  id           uuid primary key default gen_random_uuid(),
  occurred_at  timestamptz not null default now(),
  title        text not null,
  body         text,                                       -- short detail line
  category     dev_notification_category not null,
  severity     dev_notification_severity not null default 'info',
  status       dev_notification_status not null default 'unread',
  source       text,                                       -- e.g. "stripe-webhook" / "deploy-runner"
  trace_id     text,                                       -- link to /dev/logs if relevant
  action_label text,                                       -- CTA label, e.g. "View incident"
  action_url   text,                                       -- in-app URL, never external secrets
  metadata     jsonb not null default '{}'::jsonb,
  read_at      timestamptz,
  archived_at  timestamptz,
  created_at   timestamptz not null default now()
);


-- INDEXES ---------------------------------------------------------------

create index if not exists idx_dev_notifications_occurred_at on public.dev_notifications (occurred_at desc);
create index if not exists idx_dev_notifications_status      on public.dev_notifications (status);
create index if not exists idx_dev_notifications_category    on public.dev_notifications (category);
create index if not exists idx_dev_notifications_severity    on public.dev_notifications (severity);

-- Partial index for the bell dropdown query (unread, recent).
create index if not exists idx_dev_notifications_unread_recent
  on public.dev_notifications (occurred_at desc)
  where status = 'unread';


-- RLS -------------------------------------------------------------------
-- Read: any dev allowlisted user. Writes: service role (bypasses RLS).
-- For ops/audit clarity these are shared across all devs, not per-user.

alter table public.dev_notifications enable row level security;

do $$ begin
  drop policy if exists dev_notifications_select on public.dev_notifications;
  drop policy if exists dev_notifications_update on public.dev_notifications;
end $$;

create policy dev_notifications_select
  on public.dev_notifications
  for select
  using (public.is_dev_user());

-- Devs can update status (mark read, archive). Other columns are
-- effectively immutable at the policy level — the actions layer only
-- exposes status mutations.
create policy dev_notifications_update
  on public.dev_notifications
  for update
  using (public.is_dev_user())
  with check (public.is_dev_user());


-- SEED ------------------------------------------------------------------
-- 12 realistic items so the bell badge reads "12" and the page is
-- populated immediately. Offsets are relative to now() so the data
-- always looks fresh after a migration apply. Re-runs delete the prior
-- seed batch (tagged via metadata.seed) and re-insert.

delete from public.dev_notifications where (metadata ->> 'seed') = '0013';

insert into public.dev_notifications
  (occurred_at, title, body, category, severity, source, trace_id, action_label, action_url, metadata)
values
  (now() - interval '2 minutes',  'Error spike on /api/notifications',     '503 Upstream service unavailable — 42 events in 5 min',  'incident', 'critical', 'monitor',         '8f2a1d4b6e7c4f9a', 'Open in Logs',     '/dev/logs?sel=3',                jsonb_build_object('seed','0013')),
  (now() - interval '4 minutes',  'Stripe webhook signature mismatch',     '3 events failed signature verification',                  'billing',  'high',     'stripe-webhook',  null,               'Open Billing',    '/dev/billing',                   jsonb_build_object('seed','0013')),
  (now() - interval '6 minutes',  '28 repeated failed logins from same IP','Likely credential-stuffing attempt — auto-throttled',     'security', 'high',     'auth-monitor',    null,               'Open Auth',       '/dev/auth',                      jsonb_build_object('seed','0013')),
  (now() - interval '11 minutes', 'Slow query detected on public.missions','1.24s exec — consider adding index',                      'incident', 'medium',   'postgres',        'a3b0e7f1',         'Open in Logs',    '/dev/logs?service=database',     jsonb_build_object('seed','0013')),
  (now() - interval '14 minutes', 'Deploy v1.4.2 succeeded',               'main @ a1b2c3d — 1m 42s — by Deividas B.',                'deploy',   'info',     'deploy-runner',   null,               'View deployment', '/dev/deployments',               jsonb_build_object('seed','0013')),
  (now() - interval '19 minutes', '11 suspicious geo-switch logins',       'Multiple sessions across regions in <5 min',              'security', 'medium',   'auth-monitor',    null,               'Open Auth',       '/dev/auth',                      jsonb_build_object('seed','0013')),
  (now() - interval '24 minutes', 'Rate limit threshold reached',          'backend-api /api/data — 429s served to user_9012',        'incident', 'medium',   'monitor',         'e6d4b2c1',         'Open in Logs',    '/dev/logs?service=backend-api',  jsonb_build_object('seed','0013')),
  (now() - interval '38 minutes', 'Admin updated mission template',        'Deividas B. published "weekly-baseline"',                 'audit',    'info',     'admin-cms',       null,               'View audit log',  '/dev/logs?service=admin',        jsonb_build_object('seed','0013')),
  (now() - interval '52 minutes', 'New dev account added to allowlist',    'hei@bwstudio.no',                                         'audit',    'info',     'admin-allowlist', null,               'View users',      '/dev/users',                     jsonb_build_object('seed','0013')),
  (now() - interval '1 hour 10 minutes', 'Storage egress 12% above baseline','Last hour vs 7-day median',                            'system',   'low',      'monitor',         null,               'Open Analytics',  '/dev/analytics',                 jsonb_build_object('seed','0013')),
  (now() - interval '2 hours',    'Feature flag toggled: posting-plans-v2','100% rollout to Pro plan',                                'audit',    'low',      'feature-flags',   null,               'View flags',      '/dev/feature-flags',             jsonb_build_object('seed','0013')),
  (now() - interval '3 hours',    'Database replication lag normal',       '≈0.2s — fully recovered from earlier spike',              'system',   'info',     'postgres',        null,               null,               null,                            jsonb_build_object('seed','0013'));
