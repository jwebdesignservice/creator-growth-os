-- ════════════════════════════════════════════════════════════════════════
-- 0037_lesson_resources.sql
--
-- Backs the Resources tab on the tutorial editor
-- (/admin/tutorials/[id]?tab=resources). Each lesson can have any number
-- of attached resources — either an uploaded FILE (stored in the public
-- lesson-media bucket) or an external LINK.
--
-- RLS: read by any authenticated user (so the learner-side lesson page can
-- list downloads), write by admin only — matching the project pattern.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.lesson_resources (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references public.lessons(id) on delete cascade,

  kind         text not null default 'file',   -- 'file' | 'link'
  title        text not null,
  url          text not null,                   -- public storage URL or external link
  ext          text,                            -- pdf | docx | xlsx | png | link | …
  size_bytes   bigint,                          -- null for links
  placement    text not null default 'lesson-overview', -- where it surfaces
  sort_order   int  not null default 0,

  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_lesson_resources_lesson
  on public.lesson_resources (lesson_id, sort_order);

alter table public.lesson_resources enable row level security;

drop policy if exists "lesson_resources_read" on public.lesson_resources;
create policy "lesson_resources_read" on public.lesson_resources
  for select using (auth.role() = 'authenticated');

drop policy if exists "lesson_resources_admin_write" on public.lesson_resources;
create policy "lesson_resources_admin_write" on public.lesson_resources
  for all using (public.is_admin()) with check (public.is_admin());

-- Reuse the shared updated_at trigger (defined in migration 0029).
do $$ begin
  drop trigger if exists trg_lesson_resources_updated_at on public.lesson_resources;
  create trigger trg_lesson_resources_updated_at
    before update on public.lesson_resources
    for each row execute function public.set_updated_at();
exception when undefined_function then
  -- set_updated_at() ships in 0029; if that hasn't run yet, skip the
  -- trigger (updated_at simply won't auto-touch until 0029 is applied).
  null;
end $$;
