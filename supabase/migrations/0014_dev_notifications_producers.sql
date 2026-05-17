-- =====================================================================
-- Dev Dashboard — notification producers + dedup + realtime + retention
-- Completes the dev-notifications system from 0013 by adding:
--   • notify_dev_event()        — single canonical writer w/ built-in dedup
--   • dev_auth_events trigger   — auto-create notifications for warn/danger
--   • dev_log_events trigger    — auto-create notifications for ERROR level
--   • prune_dev_notifications() — retention helper for cron
--   • Realtime publication      — bell + page can subscribe to changes
--
-- Dedup window: 5 minutes per (category, dedup_key). Same source +
-- same title within the window collapses into the existing row instead
-- of spawning a duplicate notification. The notification's body is
-- refreshed and its occurred_at bumped so it floats back to the top.
--
-- All notification writes happen via this function — keeps the policy
-- in one place. Triggers run with elevated privileges (security definer)
-- so they bypass the RLS UPDATE policy on dev_notifications.
--
-- Safe to re-run.
-- =====================================================================


-- DEDUP MARKER COLUMN ---------------------------------------------------
-- A stable key per "kind of event" so we can collapse repeats. Optional
-- (existing rows leave it null and won't participate in dedup).

alter table public.dev_notifications
  add column if not exists dedup_key text;

create index if not exists idx_dev_notifications_dedup
  on public.dev_notifications (category, dedup_key, occurred_at desc)
  where dedup_key is not null;


-- CANONICAL WRITER ------------------------------------------------------
-- All producers (triggers, server actions, webhooks) route through this
-- function. Returns the id of either the newly-inserted notification or
-- the existing row that was bumped via dedup.

create or replace function public.notify_dev_event(
  p_title         text,
  p_category      dev_notification_category,
  p_severity      dev_notification_severity default 'info',
  p_body          text                       default null,
  p_source        text                       default null,
  p_trace_id      text                       default null,
  p_action_label  text                       default null,
  p_action_url    text                       default null,
  p_dedup_key     text                       default null,
  p_metadata      jsonb                      default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_id uuid;
  v_new_id      uuid;
begin
  -- Dedup window: 5 minutes per (category, dedup_key). Same key within
  -- the window → bump the existing row instead of inserting a new one.
  if p_dedup_key is not null then
    select id into v_existing_id
    from public.dev_notifications
    where category   = p_category
      and dedup_key  = p_dedup_key
      and occurred_at > now() - interval '5 minutes'
    order by occurred_at desc
    limit 1;

    if v_existing_id is not null then
      update public.dev_notifications
      set
        title       = p_title,
        body        = coalesce(p_body, body),
        severity    = greatest_severity(severity, p_severity),
        status      = case when status = 'archived' then 'archived' else 'unread' end,
        occurred_at = now(),
        metadata    = metadata || p_metadata || jsonb_build_object(
                        'dedup_hits', coalesce((metadata->>'dedup_hits')::int, 1) + 1
                      ),
        read_at     = null
      where id = v_existing_id;
      return v_existing_id;
    end if;
  end if;

  insert into public.dev_notifications
    (title, body, category, severity, source, trace_id, action_label, action_url, dedup_key, metadata)
  values
    (p_title, p_body, p_category, p_severity, p_source, p_trace_id,
     p_action_label, p_action_url, p_dedup_key,
     p_metadata || jsonb_build_object('dedup_hits', 1))
  returning id into v_new_id;

  return v_new_id;
end;
$$;

-- Helper: pick the more-urgent of two severities. Used by dedup so a
-- later "critical" event collapsed into an earlier "medium" row gets
-- promoted to critical, not silently downgraded.
create or replace function public.greatest_severity(
  a dev_notification_severity,
  b dev_notification_severity
) returns dev_notification_severity
language sql immutable as $$
  select case
    when a = 'critical' or b = 'critical' then 'critical'::dev_notification_severity
    when a = 'high'     or b = 'high'     then 'high'::dev_notification_severity
    when a = 'medium'   or b = 'medium'   then 'medium'::dev_notification_severity
    when a = 'low'      or b = 'low'      then 'low'::dev_notification_severity
    else 'info'::dev_notification_severity
  end;
$$;

-- Lock down the writer: callable from triggers (security definer) and
-- from the service role only. Authenticated app users cannot call it
-- directly — they go through server actions that already have RLS.
revoke all on function public.notify_dev_event(
  text, dev_notification_category, dev_notification_severity,
  text, text, text, text, text, text, jsonb
) from public;
grant execute on function public.notify_dev_event(
  text, dev_notification_category, dev_notification_severity,
  text, text, text, text, text, text, jsonb
) to service_role;


-- TRIGGER: dev_auth_events --------------------------------------------
-- Auth events at warn/danger status create a security notification.
-- Successes are intentionally skipped (too noisy for an inbox).

create or replace function public.trg_dev_auth_events_to_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_severity dev_notification_severity;
  v_title    text;
  v_dedup    text;
begin
  if new.status not in ('warning', 'danger') then
    return new;
  end if;

  v_severity := case new.status
    when 'danger'  then 'high'::dev_notification_severity
    when 'warning' then 'medium'::dev_notification_severity
    else 'low'::dev_notification_severity
  end;

  v_title := initcap(replace(new.event_kind::text, '_', ' '))
             || coalesce(' · ' || new.user_label, '');

  -- Dedup by event_kind + user, so 50 failed-login attempts from the
  -- same account collapse into one notification with a dedup_hits count.
  v_dedup := 'auth:' || new.event_kind::text || ':' || coalesce(new.user_label, 'anon');

  perform public.notify_dev_event(
    p_title        => v_title,
    p_category     => 'security'::dev_notification_category,
    p_severity     => v_severity,
    p_body         => coalesce(new.failure_reason, new.status_label),
    p_source       => 'auth-monitor',
    p_action_label => 'Open Auth',
    p_action_url   => '/dev/auth',
    p_dedup_key    => v_dedup,
    p_metadata     => jsonb_build_object(
                        'event_kind',     new.event_kind,
                        'provider',       new.provider,
                        'route',          new.route,
                        'device',         new.device,
                        'region',         new.region,
                        'auth_event_id',  new.id
                      )
  );

  return new;
end;
$$;

drop trigger if exists trg_dev_auth_events_notify on public.dev_auth_events;
create trigger trg_dev_auth_events_notify
  after insert on public.dev_auth_events
  for each row execute function public.trg_dev_auth_events_to_notification();


-- TRIGGER: dev_log_events ---------------------------------------------
-- ERROR-level log events become incident notifications. WARN/INFO/DEBUG
-- intentionally skipped — they live in the Logs page, not the inbox.

create or replace function public.trg_dev_log_events_to_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_severity dev_notification_severity;
  v_dedup    text;
begin
  if new.level <> 'ERROR' then
    return new;
  end if;

  -- 5xx → critical, others (4xx, no-status) → high.
  v_severity := case
    when new.status_code is not null and new.status_code >= 500 then 'critical'::dev_notification_severity
    else 'high'::dev_notification_severity
  end;

  -- Dedup by service + route so a burst of identical 503s collapses.
  v_dedup := 'log:' || new.service || ':' || coalesce(new.route, '-');

  perform public.notify_dev_event(
    p_title        => new.message,
    p_category     => 'incident'::dev_notification_category,
    p_severity     => v_severity,
    p_body         => coalesce(new.method, '') || ' ' || coalesce(new.route, '')
                      || case when new.status_code is not null then ' · HTTP ' || new.status_code else '' end,
    p_source       => 'monitor',
    p_trace_id     => new.trace_id,
    p_action_label => 'Open in Logs',
    p_action_url   => '/dev/logs?sel=' || new.id,
    p_dedup_key    => v_dedup,
    p_metadata     => jsonb_build_object(
                        'service',     new.service,
                        'route',       new.route,
                        'status_code', new.status_code,
                        'log_event_id', new.id
                      )
  );

  return new;
end;
$$;

drop trigger if exists trg_dev_log_events_notify on public.dev_log_events;
create trigger trg_dev_log_events_notify
  after insert on public.dev_log_events
  for each row execute function public.trg_dev_log_events_to_notification();


-- RETENTION -------------------------------------------------------------
-- Drop archived notifications older than 30 days. Run from pg_cron or
-- a Supabase Edge Function on a daily schedule; callable from the
-- service role only.

create or replace function public.prune_dev_notifications(p_days int default 30)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  with del as (
    delete from public.dev_notifications
    where status = 'archived'
      and (archived_at is not null and archived_at < now() - make_interval(days => p_days))
    returning 1
  )
  select count(*) into v_deleted from del;

  return v_deleted;
end;
$$;

revoke all    on function public.prune_dev_notifications(int) from public;
grant execute on function public.prune_dev_notifications(int) to service_role;


-- REALTIME --------------------------------------------------------------
-- Add dev_notifications to the supabase_realtime publication so clients
-- can subscribe. Wrapped in a guard so the migration is idempotent and
-- safe to re-apply if the publication doesn't exist (local dev).

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Add only if not already in the publication.
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename  = 'dev_notifications'
    ) then
      alter publication supabase_realtime add table public.dev_notifications;
    end if;
  end if;
end $$;
