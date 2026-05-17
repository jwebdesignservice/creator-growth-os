-- =====================================================================
-- Support — close the loop on the user side
-- Builds on 0013 (user tickets), 0016 (dev fields) and 0017 (user→dev
-- triggers) by completing the dev→user side of the conversation:
--
--   1. Adds 'support_reply' to the user-facing notification_type enum so
--      dev replies can land in the user's bell + /notifications page.
--   2. Adds support_tickets.first_response_at — populated automatically
--      the first time a 'support'-authored message lands on a ticket.
--      Powers the real "Avg First Response" metric on /dev/support
--      (was hardcoded "18m 42s" before this).
--   3. AFTER INSERT trigger on support_ticket_messages:
--        • author='support' → insert public.notifications row for the
--          ticket owner so they see "Support replied to <ticket>"
--          immediately in their bell + Notifications page.
--        • author='support' AND first_response_at IS NULL → set
--          first_response_at = now() on the parent ticket.
--
-- Trigger is security-definer so it can write rows for the ticket owner
-- without RLS friction. User submits remain RLS-checked on the underlying
-- insert (no change to the user-side write path).
--
-- Safe to re-run.
-- =====================================================================


-- 1. Add support_reply notification_type ------------------------------
-- ALTER TYPE ... ADD VALUE is non-transactional in PG, so we wrap it
-- in a guard and ignore if the value already exists.

do $$ begin
  alter type public.notification_type add value if not exists 'support_reply';
exception when others then null; end $$;


-- 2. first_response_at column ----------------------------------------

alter table public.support_tickets
  add column if not exists first_response_at timestamptz;

-- Backfill from existing support_ticket_messages so the metric is
-- accurate immediately after migration. Idempotent — re-runs over the
-- same data just reassert the same value.
update public.support_tickets t
   set first_response_at = sub.first_at
  from (
    select ticket_id, min(created_at) as first_at
    from public.support_ticket_messages
    where author = 'support'
    group by ticket_id
  ) sub
 where t.id = sub.ticket_id
   and t.first_response_at is null;

-- Quick lookup for the Avg First Response metric.
create index if not exists idx_support_tickets_first_response
  on public.support_tickets (first_response_at)
  where first_response_at is not null;


-- 3. Trigger: notify user + track first response on support replies ---

create or replace function public.trg_support_reply_to_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ticket public.support_tickets%rowtype;
  v_excerpt text;
begin
  -- Only fire for replies authored by the support side. User-authored
  -- follow-ups are visible to the dev console via Realtime already and
  -- don't need a self-notification.
  if NEW.author <> 'support' then
    return NEW;
  end if;

  -- Resolve the parent ticket once.
  select * into v_ticket
  from public.support_tickets
  where id = NEW.ticket_id;
  if not found then
    return NEW;
  end if;

  -- Stamp first_response_at on the parent ticket if this is the first
  -- support-side message. Powers the dev "Avg First Response" metric.
  if v_ticket.first_response_at is null then
    update public.support_tickets
       set first_response_at = NEW.created_at
     where id = NEW.ticket_id
       and first_response_at is null;
  end if;

  -- Short preview of the reply body for the notification card.
  v_excerpt := regexp_replace(NEW.body, E'[\\n\\r]+', ' ', 'g');
  if length(v_excerpt) > 140 then
    v_excerpt := substring(v_excerpt for 137) || '…';
  end if;

  -- Insert a user-facing notification. The public.notifications RLS
  -- restricts SELECT to auth.uid() = user_id; this row will only be
  -- visible to the ticket owner.
  insert into public.notifications (
    user_id, title, body, type, category, priority,
    action_label, action_url, metadata
  )
  values (
    v_ticket.user_id,
    'Support replied to ' || v_ticket.public_id,
    v_excerpt,
    'support_reply',
    'system',                   -- shows under the System filter in /notifications
    3,
    'View reply',
    '/support/tickets/' || v_ticket.public_id,
    jsonb_build_object(
      'ticket_id',        v_ticket.id,
      'ticket_public_id', v_ticket.public_id,
      'message_id',       NEW.id,
      'author_email',     NEW.author_email
    )
  );

  return NEW;
end;
$$;

drop trigger if exists trg_support_reply_user_notify on public.support_ticket_messages;
create trigger trg_support_reply_user_notify
  after insert on public.support_ticket_messages
  for each row execute function public.trg_support_reply_to_user();
