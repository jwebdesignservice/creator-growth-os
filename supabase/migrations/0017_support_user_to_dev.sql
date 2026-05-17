-- =====================================================================
-- Support — wire user submissions through to the dev console end-to-end
-- This connects the user-facing /support page to the /dev/support
-- console so a ticket submitted on one side immediately surfaces on
-- the other — with dev fields auto-populated, a dev notification
-- emitted, and Realtime enabled so the dev queue updates without a
-- manual refresh.
--
-- Both sides already read/write the same public.support_tickets table
-- (per 0013_support.sql + 0016_dev_support.sql extension); this migration
-- adds the connective tissue:
--
--   1. BEFORE INSERT trigger — fills in dev-side defaults
--        source           ← "Web Portal"
--        category         ← initcap(topic)            (if not set)
--        sla_deadline     ← priority-based SLA window (if not set)
--   2. AFTER INSERT trigger — emits a dev notification via
--      notify_dev_event() (from 0014) so the bell badge bumps and the
--      Notifications page surfaces the new ticket. Deduped by
--      ticket public_id so re-runs / amended inserts collapse cleanly.
--   3. Adds support_tickets + support_ticket_messages to the
--      supabase_realtime publication so the dev page can subscribe.
--
-- All triggers are security-definer so they run with elevated rights
-- — necessary because notify_dev_event() inserts into dev_notifications,
-- which is service-role only for writes. User submits remain RLS-checked
-- on the underlying insert.
--
-- Safe to re-run.
-- =====================================================================


-- 1. BEFORE INSERT trigger — dev-side defaults ------------------------

create or replace function public.trg_support_ticket_dev_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Source: every user submit comes through the web portal unless
  -- explicitly overridden by an admin/API insert.
  if NEW.source is null then
    NEW.source := 'Web Portal';
  end if;

  -- Category: the dev queue filters by category; default to a
  -- humanized form of the topic so the filter has something to bind.
  if NEW.category is null then
    NEW.category := initcap(NEW.topic::text);
  end if;

  -- SLA deadline: standard support-tier windows by priority. Admins
  -- can override after the fact via updateInternalNotes / assignTicket
  -- in src/lib/dev-dashboard/support-actions.ts.
  if NEW.sla_deadline is null then
    NEW.sla_deadline := case NEW.priority
      when 'urgent' then now() + interval '2 hours'
      when 'high'   then now() + interval '4 hours'
      when 'medium' then now() + interval '24 hours'
      when 'low'    then now() + interval '72 hours'
    end;
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_support_tickets_dev_defaults on public.support_tickets;
create trigger trg_support_tickets_dev_defaults
  before insert on public.support_tickets
  for each row execute function public.trg_support_ticket_dev_defaults();


-- 2. AFTER INSERT trigger — emit dev notification --------------------

create or replace function public.trg_support_ticket_notify_dev()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_severity     dev_notification_severity;
  v_client_name  text;
begin
  -- Map ticket priority → dev-notification severity. Urgent maps to
  -- critical so it competes for attention at the top of the bell.
  v_severity := case NEW.priority
    when 'urgent' then 'critical'::dev_notification_severity
    when 'high'   then 'high'::dev_notification_severity
    when 'medium' then 'medium'::dev_notification_severity
    else               'low'::dev_notification_severity
  end;

  -- Resolve the client name once. Fall back to local-part of email,
  -- then to a generic label, so the notification body never reads
  -- "null submitted ticket".
  select coalesce(
           nullif(trim(p.full_name), ''),
           initcap(split_part(p.email, '@', 1)),
           'A client'
         )
  into v_client_name
  from public.profiles p
  where p.id = NEW.user_id;

  perform public.notify_dev_event(
    p_title        => 'New support ticket · ' || NEW.subject,
    p_category     => 'incident'::dev_notification_category,
    p_severity     => v_severity,
    p_body         => coalesce(v_client_name, 'A client') ||
                      ' submitted ticket ' || NEW.public_id ||
                      ' (' || NEW.priority::text || ' priority)',
    p_source       => 'support-portal',
    p_action_label => 'Open ticket',
    -- Deep-link straight to the ticket inside the dev console.
    p_action_url   => '/dev/support?ticket=' || NEW.public_id,
    -- One notification per ticket — repeated inserts (e.g. test seed
    -- re-runs) collapse into the same row with metadata.dedup_hits.
    p_dedup_key    => 'support-submit:' || NEW.public_id,
    p_metadata     => jsonb_build_object(
                        'ticket_public_id', NEW.public_id,
                        'ticket_id',        NEW.id,
                        'priority',         NEW.priority::text,
                        'topic',            NEW.topic::text,
                        'user_id',          NEW.user_id,
                        'source',           'support-portal'
                      )
  );

  return NEW;
end;
$$;

drop trigger if exists trg_support_tickets_notify_dev on public.support_tickets;
create trigger trg_support_tickets_notify_dev
  after insert on public.support_tickets
  for each row execute function public.trg_support_ticket_notify_dev();


-- 3. Realtime publication --------------------------------------------
-- Add the two ticket-related tables to the supabase_realtime publication
-- so the dev /dev/support page can subscribe for live updates. RLS still
-- applies at the channel level — a non-dev viewer can't tap into events
-- they aren't allowed to see.

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'support_tickets'
    ) then
      alter publication supabase_realtime add table public.support_tickets;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'support_ticket_messages'
    ) then
      alter publication supabase_realtime add table public.support_ticket_messages;
    end if;
  end if;
end $$;
