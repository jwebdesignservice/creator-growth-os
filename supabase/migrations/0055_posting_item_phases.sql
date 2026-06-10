-- 0055_posting_item_phases.sql
-- Per-post production phases.
--
-- A post can either live on a single day (is_phased = false → it just uses
-- posting_plan_items.scheduled_for, exactly as before) OR be spread across
-- days as a set of pipeline-stage phases, each with its own date. Phases reuse
-- the existing `content_status` stages, so a post's current `status` lines up
-- with where it sits on its own timeline. Users can re-date phases as they go.

-- 1) Flag on the item: is this post scheduled as a single day, or phased?
alter table public.posting_plan_items
  add column if not exists is_phased boolean not null default false;

-- 2) One row per (post, stage) that the user has placed on a day.
create table if not exists public.posting_item_phases (
  id            uuid primary key default gen_random_uuid(),
  item_id       uuid not null references public.posting_plan_items(id) on delete cascade,
  user_id       uuid references public.profiles(id) on delete cascade,
  stage         content_status not null,
  scheduled_for timestamptz,
  created_at    timestamptz not null default now(),
  unique (item_id, stage)
);

create index if not exists idx_item_phases_item on public.posting_item_phases (item_id);
create index if not exists idx_item_phases_user on public.posting_item_phases (user_id);

-- 3) RLS — owner (or admin) can do everything with their own phases. Matches
--    the posting_plan_items policy style.
alter table public.posting_item_phases enable row level security;

drop policy if exists "item_phases_self" on public.posting_item_phases;
create policy "item_phases_self" on public.posting_item_phases
  for all using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());
