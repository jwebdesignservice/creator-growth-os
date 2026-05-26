-- =====================================================================
-- 0027_community_chat_channels.sql
-- Multi-channel support for community chat.
-- =====================================================================

-- CHANNELS TABLE -------------------------------------------------------
create table if not exists public.community_chat_channels (
  id                uuid        primary key default gen_random_uuid(),
  slug              text        unique not null check (slug ~ '^[a-z0-9-]+$' and length(slug) between 1 and 40),
  name              text        not null check (length(name) between 1 and 80),
  description       text,
  icon              text, -- emoji or single-char glyph
  posts_admin_only  boolean     not null default false,
  sort_order        int         not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists idx_channels_sort
  on public.community_chat_channels (sort_order, name);

alter table public.community_chat_channels enable row level security;

drop policy if exists "channels_select" on public.community_chat_channels;
create policy "channels_select" on public.community_chat_channels
  for select using (auth.role() = 'authenticated');

-- Only admins can create / edit / delete channels
drop policy if exists "channels_admin_write" on public.community_chat_channels;
create policy "channels_admin_write" on public.community_chat_channels
  for all using (public.is_admin()) with check (public.is_admin());

-- MESSAGES.channel_id --------------------------------------------------
alter table public.community_chat_messages
  add column if not exists channel_id uuid references public.community_chat_channels(id) on delete cascade;

-- Index for per-channel listing
create index if not exists idx_chat_channel_created
  on public.community_chat_messages (channel_id, created_at desc)
  where deleted_at is null;

-- SEED -----------------------------------------------------------------
insert into public.community_chat_channels (slug, name, description, icon, posts_admin_only, sort_order)
values
  ('general',       'General',       'Open discussion for everyone',   '💬', false, 0),
  ('announcements', 'Announcements', 'Updates from the team',          '📣', true,  1),
  ('wins',          'Wins',          'Celebrate your milestones',      '🎉', false, 2)
on conflict (slug) do nothing;

-- Backfill existing messages to General so they remain visible
update public.community_chat_messages
set channel_id = (select id from public.community_chat_channels where slug = 'general')
where channel_id is null;

-- Now require channel_id on all messages going forward
alter table public.community_chat_messages
  alter column channel_id set not null;

-- UPDATED INSERT POLICY ------------------------------------------------
-- Replace existing chat_insert with one that also enforces admin-only channels.
drop policy if exists "chat_insert" on public.community_chat_messages;
create policy "chat_insert" on public.community_chat_messages
  for insert with check (
    auth.uid() = user_id
    and pinned = false
    and deleted_at is null
    and (
      -- Either the channel allows posts from anyone…
      not exists (
        select 1 from public.community_chat_channels c
        where c.id = channel_id and c.posts_admin_only = true
      )
      -- …or the caller is an admin.
      or public.is_admin()
    )
  );
