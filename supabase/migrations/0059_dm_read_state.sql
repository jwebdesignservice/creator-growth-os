-- 0057_dm_read_state.sql
-- Per-participant read tracking for direct messages. Powers the unread badge
-- on the "Messages" nav item (mirrors the Tasks count). A conversation counts
-- as "unread" for a user when the latest message was sent by the OTHER person
-- after that user last opened the thread.

-- ── Read markers ─────────────────────────────────────────────────────────────
-- Default to now() so existing conversations start fully read (no badge spam
-- the moment this ships).
alter table public.dm_conversations
  add column if not exists participant_1_last_read_at timestamptz not null default now(),
  add column if not exists participant_2_last_read_at timestamptz not null default now();

-- ── Mark a conversation read for the current user ────────────────────────────
create or replace function public.mark_dm_read(conv uuid)
returns void
language sql volatile security definer set search_path = public as $$
  update public.dm_conversations
     set participant_1_last_read_at =
           case when auth.uid() = participant_1_id then now()
                else participant_1_last_read_at end,
         participant_2_last_read_at =
           case when auth.uid() = participant_2_id then now()
                else participant_2_last_read_at end
   where id = conv
     and (auth.uid() = participant_1_id or auth.uid() = participant_2_id);
$$;

-- ── Count of conversations with unread incoming messages (current user) ──────
create or replace function public.dm_unread_count()
returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int
    from public.dm_conversations c
   where (auth.uid() = c.participant_1_id or auth.uid() = c.participant_2_id)
     and c.last_message_sender is not null
     and c.last_message_sender <> auth.uid()
     and c.last_message_at > case
           when auth.uid() = c.participant_1_id then c.participant_1_last_read_at
           else c.participant_2_last_read_at end;
$$;

grant execute on function public.mark_dm_read(uuid) to authenticated;
grant execute on function public.dm_unread_count() to authenticated;
