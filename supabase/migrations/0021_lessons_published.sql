-- =====================================================================
-- Lessons: add published flag so admin can stage drafts before broadcast.
-- Existing rows default to published = true (backwards-compatible).
-- =====================================================================

alter table public.lessons
  add column if not exists published boolean not null default true;

create index if not exists idx_lessons_published on public.lessons (published);
