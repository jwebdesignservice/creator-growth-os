-- ════════════════════════════════════════════════════════════════════════
-- 0045_lesson_note_pin.sql
--
-- Adds pin-to-top for lesson notes. A pinned note floats above the rest in
-- the redesigned notes list (program "My Notes" + tutorial "Saved notes").
--
-- Idempotent + safe to re-run. RLS is unchanged — notes stay owner-only
-- (policy from 0043_lesson_notes.sql).
-- ════════════════════════════════════════════════════════════════════════

alter table public.lesson_notes
  add column if not exists pinned boolean not null default false;

-- Pinned-first, newest-next is the list's read order.
create index if not exists idx_lesson_notes_user_pinned
  on public.lesson_notes (user_id, pinned desc, created_at desc);
