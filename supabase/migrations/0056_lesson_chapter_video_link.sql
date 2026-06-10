-- =====================================================================
-- 0056_lesson_chapter_video_link.sql
--
-- "Link next video" in the Lesson path editor (/admin/tutorials/[id]).
--
-- Adds:
--   • lesson_chapters.linked_lesson_id — optional pointer from a path
--     step to another (already-uploaded) video lesson. Nullable; when
--     the target video is deleted the link clears (set null) instead of
--     deleting the chapter.
--   • 'video' as a valid chapter type (the linked-video step kind).
--
-- Purely additive — existing rows and saves are unaffected.
-- =====================================================================

alter table public.lesson_chapters
  add column if not exists linked_lesson_id uuid
    references public.lessons(id) on delete set null;

alter table public.lesson_chapters
  drop constraint if exists lesson_chapters_type_check;
alter table public.lesson_chapters
  add constraint lesson_chapters_type_check
    check (type in ('intro','lesson','activity','closing','checkpoint','video'));

create index if not exists lesson_chapters_linked_lesson_idx
  on public.lesson_chapters (linked_lesson_id);
