-- =====================================================================
-- Creator Growth OS — Dev-Dashboard Support extensions
-- Extends migration 0013_support.sql with the dev-only fields the
-- /dev/support console needs: SLA tracking, internal notes, assignee
-- (by user_id, not just email), affected area, reproduction steps,
-- category, source channel, escalation state, and CSAT.
--
-- Also introduces support_ticket_events for the dev-side audit timeline
-- (status changes, assignments, escalations, etc.) — distinct from
-- support_ticket_messages, which is end-user conversation only.
--
-- Access model:
--   • The dev console reads/writes via the service-role key from server
--     code only, gated by requireDevClient() in the application layer.
--   • User-facing RLS from 0013_support.sql is left intact: users still
--     read/write only their own tickets, admins still have full access.
--   • is_dev_user() (from 0011_dev_auth.sql) is granted SELECT on the
--     new events table for defense-in-depth; UI never reads it via the
--     anon-key client, but the policy guards against accidental misuse.
--
-- Safe to re-run.
-- =====================================================================

-- 1. Extend support_tickets with dev-only fields ------------------------
-- All additions are nullable so existing user-submitted tickets remain
-- valid; the dev console treats nulls as "not yet set".

alter table public.support_tickets
  add column if not exists internal_notes      text,
  add column if not exists sla_deadline        timestamptz,
  add column if not exists assignee_user_id    uuid references public.profiles(id) on delete set null,
  add column if not exists affected_area       text,
  add column if not exists reproduction_notes  text[],
  add column if not exists category            text,
  add column if not exists csat_rating         int check (csat_rating between 1 and 5),
  add column if not exists escalation_state    text check (escalation_state in
    ('Escalated to Engineering', 'Awaiting Client Reply', 'Awaiting Internal Review')),
  add column if not exists escalated_at        timestamptz,
  add column if not exists source              text check (source in
    ('Web Portal', 'Email', 'API', 'Chat'));

-- Helpful indexes for the dev-console filters and lists.
create index if not exists idx_support_tickets_assignee     on public.support_tickets (assignee_user_id);
create index if not exists idx_support_tickets_sla_deadline on public.support_tickets (sla_deadline) where sla_deadline is not null;
create index if not exists idx_support_tickets_category     on public.support_tickets (category);
create index if not exists idx_support_tickets_escalated    on public.support_tickets (escalation_state) where escalation_state is not null;


-- 2. support_ticket_events ---------------------------------------------
-- Append-only audit log for the dev-side timeline. One row per state
-- change. The /dev/support Communication Timeline reads BOTH this table
-- and support_ticket_messages (user/support conversation) interleaved
-- by created_at.

create table if not exists public.support_ticket_events (
  id            uuid primary key default gen_random_uuid(),
  ticket_id     uuid not null references public.support_tickets(id) on delete cascade,

  -- One of: status_change | assignment | escalation | internal_note |
  -- sla_update | priority_change | resolved | reopened
  kind          text not null,

  -- Actor: the dev user who triggered the event (null for system events).
  actor_user_id uuid references public.profiles(id) on delete set null,
  actor_email   text,

  -- Free-form body. For status/priority/escalation changes this is the
  -- human-readable summary the timeline renders. For internal_note it
  -- holds the note text.
  body          text not null,

  -- Optional structured payload — old/new values for status changes etc.
  meta          jsonb,

  created_at    timestamptz not null default now()
);

create index if not exists idx_support_ticket_events_ticket on public.support_ticket_events (ticket_id, created_at desc);
create index if not exists idx_support_ticket_events_kind   on public.support_ticket_events (kind);


-- 3. RLS for support_ticket_events -------------------------------------
-- Defense-in-depth: dev users + admins may select. Inserts come from
-- the service-role client (which bypasses RLS), so no insert policy is
-- defined for the anon-key path.

alter table public.support_ticket_events enable row level security;

do $$ begin
  drop policy if exists "support_ticket_events_select_dev"   on public.support_ticket_events;
  drop policy if exists "support_ticket_events_select_admin" on public.support_ticket_events;
end $$;

create policy "support_ticket_events_select_dev" on public.support_ticket_events
  for select using (public.is_dev_user());

create policy "support_ticket_events_select_admin" on public.support_ticket_events
  for select using (public.is_admin());


-- 4. Demo seed ---------------------------------------------------------
-- Insert a small fleet of demo tickets so /dev/support has data on a
-- fresh database. All seeded rows are tagged with a synthetic
-- ticket_ref starting with "DEV-DEMO-" so they're easy to identify
-- and prune in a real environment.
--
-- Each row is attached to the FIRST profile in the table — in
-- development that's the dev user themselves; in prod where seeding is
-- not desired the insert short-circuits if there are no profiles.

do $$
declare
  v_demo_user uuid;
  v_assignee  uuid;
  v_now       timestamptz := now();
begin
  select id into v_demo_user from public.profiles order by created_at asc limit 1;
  select id into v_assignee  from public.profiles order by created_at asc limit 1;
  if v_demo_user is null then
    return;
  end if;

  insert into public.support_tickets (
    public_id, user_id, subject, topic, page_affected, priority,
    device, description, ticket_ref, status, source, category,
    affected_area, sla_deadline, assignee_user_id, reproduction_notes,
    internal_notes, escalation_state, escalated_at, created_at, updated_at
  )
  values
    -- SUP-10482 (the highlighted ticket in the brief)
    ('SUP-10482', v_demo_user, 'API rate limits causing 429 errors',
     'technical', '/api/v1/orders', 'high',
     'Chrome 124 / macOS', 'Clients are receiving 429 responses from multiple API endpoints intermittently.',
     'DEV-DEMO-10482', 'open', 'Web Portal', 'API / Integrations',
     'API Gateway', v_now + interval '3 hours 17 minutes', v_assignee,
     array[
       'Send 100+ requests to /v1/orders within 10 seconds',
       'Observe 429 responses after ~60 requests',
       'Issue persists for ~60 seconds'
     ],
     'Likely related to new rate limiting config rolled out in v1.4.2. Monitoring and gathering additional logs.',
     null, null, v_now - interval '2 minutes', v_now - interval '2 minutes'),

    ('SUP-10483', v_demo_user, 'Webhook delivery delays',
     'technical', '/webhooks', 'medium',
     'Server-to-server', 'Customer webhooks delayed by 30s+ in production.',
     'DEV-DEMO-10483', 'open', 'API', 'Webhooks',
     'Webhook Worker', v_now + interval '5 hours', v_assignee,
     null, null, 'Awaiting Client Reply', v_now - interval '2 hours',
     v_now - interval '15 minutes', v_now - interval '15 minutes'),

    ('SUP-10484', v_demo_user, 'Login loop on SSO',
     'account', '/sign-in', 'high',
     'Safari 17 / macOS', 'SSO sign-in bounces user back to /sign-in after redirect.',
     'DEV-DEMO-10484', 'in_progress', 'Web Portal', 'Auth',
     'Auth Service', v_now + interval '1 hour 40 minutes', v_assignee,
     null, null, null, null,
     v_now - interval '32 minutes', v_now - interval '32 minutes'),

    ('SUP-10485', v_demo_user, 'Billing invoice mismatch',
     'billing', '/billing', 'medium',
     'Chrome 124 / Windows', 'Invoice total does not match the displayed subscription tier.',
     'DEV-DEMO-10485', 'open', 'Email', 'Billing',
     'Billing', v_now + interval '7 hours', v_assignee,
     null, null, null, null,
     v_now - interval '45 minutes', v_now - interval '45 minutes'),

    ('SUP-10486', v_demo_user, 'Database slow queries',
     'technical', '/dev/database', 'low',
     'Internal', 'Periodic spike in p99 query time on the reporting endpoints.',
     'DEV-DEMO-10486', 'in_progress', 'Web Portal', 'Database',
     'Database', v_now + interval '12 hours', v_assignee,
     null, 'Investigating index plan on reports schema.', null, null,
     v_now - interval '1 hour', v_now - interval '1 hour'),

    ('SUP-10487', v_demo_user, 'Feature flag not updating',
     'technical', '/dev/feature-flags', 'medium',
     'Chrome 124 / macOS', 'A flag toggle does not propagate to clients for ~3 minutes.',
     'DEV-DEMO-10487', 'waiting', 'API', 'Feature Flags',
     'Flag Service', v_now + interval '4 hours', v_assignee,
     null, null, 'Awaiting Client Reply', v_now - interval '3 hours',
     v_now - interval '1 hour', v_now - interval '1 hour'),

    ('SUP-10488', v_demo_user, 'Permission denied error',
     'account', '/dashboard', 'medium',
     'Firefox 125 / Windows', 'User reports 403 on an action that worked yesterday.',
     'DEV-DEMO-10488', 'in_progress', 'Web Portal', 'Auth / Permissions',
     'Auth Service', v_now + interval '6 hours', v_assignee,
     null, null, null, null,
     v_now - interval '2 hours', v_now - interval '2 hours'),

    ('SUP-10489', v_demo_user, 'CSV export fails with 500',
     'technical', '/dashboard', 'high',
     'Chrome 124 / macOS', 'Large CSV exports return 500 after ~30s.',
     'DEV-DEMO-10489', 'open', 'Web Portal', 'Data / Export',
     'Export Worker', v_now + interval '2 hours 30 minutes', v_assignee,
     null, null, null, null,
     v_now - interval '2 hours', v_now - interval '2 hours'),

    -- SUP-10490 — the escalated ticket
    ('SUP-10490', v_demo_user, 'Dashboard not loading',
     'technical', '/dashboard', 'high',
     'Chrome 124 / Windows', 'Dashboard hangs on the loading spinner for some users after the v1.4.2 deploy.',
     'DEV-DEMO-10490', 'in_progress', 'Web Portal', 'Frontend',
     'Frontend', v_now + interval '4 hours', v_assignee,
     null,
     'Suspect a stale CDN cache; cleared cache at 10:42.',
     'Escalated to Engineering', v_now - interval '1 hour',
     v_now - interval '3 hours', v_now - interval '3 hours'),

    ('SUP-10491', v_demo_user, 'Data sync inconsistency',
     'technical', '/integrations', 'low',
     'Internal', 'Two records out of sync between primary and replica.',
     'DEV-DEMO-10491', 'resolved', 'API', 'Data Sync',
     'Sync Worker', v_now + interval '10 hours', v_assignee,
     null, 'Resolved via reseed.', null, null,
     v_now - interval '4 hours', v_now - interval '4 hours')
  on conflict (public_id) do nothing;

  -- Seed a handful of timeline events for the highlighted ticket
  -- (SUP-10482) so the Communication Timeline card has content.
  insert into public.support_ticket_events (ticket_id, kind, actor_user_id, actor_email, body, meta, created_at)
  select
    t.id, 'internal_note', v_assignee, 'sarah@cgrowth.dev',
    'Investigating API Gateway logs. Not seeing any elevated error rates other than rate limit hits.',
    null, v_now - interval '2 minutes'
  from public.support_tickets t where t.public_id = 'SUP-10482'
  on conflict do nothing;

  insert into public.support_ticket_events (ticket_id, kind, actor_user_id, actor_email, body, meta, created_at)
  select
    t.id, 'sla_update', null, null,
    'SLA deadline updated to 20 May 2025, 14:00 (High priority response time: 4h). Assigned to Priya S. (Team Lead).',
    jsonb_build_object('sla_deadline', (v_now + interval '3 hours 17 minutes')::text),
    v_now - interval '15 minutes'
  from public.support_tickets t where t.public_id = 'SUP-10482'
  on conflict do nothing;

  -- Seed a user reply on SUP-10482 via support_ticket_messages.
  insert into public.support_ticket_messages (ticket_id, author, author_email, body, created_at)
  select
    t.id, 'user', 'john@acme.com',
    'Thanks for the quick response! This is impacting our checkout flow.',
    v_now - interval '32 minutes'
  from public.support_tickets t where t.public_id = 'SUP-10482'
  on conflict do nothing;

  insert into public.support_ticket_messages (ticket_id, author, author_email, body, created_at)
  select
    t.id, 'support', 'sarah@cgrowth.dev',
    'We''re looking into this now and will update shortly.',
    v_now - interval '45 minutes'
  from public.support_tickets t where t.public_id = 'SUP-10482'
  on conflict do nothing;
end $$;
