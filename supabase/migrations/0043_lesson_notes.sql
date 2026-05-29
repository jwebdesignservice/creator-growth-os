-- ════════════════════════════════════════════════════════════════════════
-- 0043_lesson_notes.sql
--
-- Backs the per-program lesson Notes feature:
--   • Learner writes a note from a lesson page ("Create Notes" popup).
--   • All notes for a program surface on that program's Resources tab
--     ("My Notes" card), replacing the old static "Replays & Workshops"
--     placeholder.
--
-- One row per note. `lesson_slug` / `lesson_title` are denormalized so a note
-- still renders even if the lesson row is later removed (lesson_id → null).
-- `program_id` is nullable so the same lesson reached standalone (a tutorial
-- with no program) can still capture notes.
--
-- RLS: strictly owner-only — a user can only ever see or touch their own notes.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.lesson_notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  program_id    uuid references public.programs(id) on delete cascade,
  lesson_id     uuid references public.lessons(id) on delete set null,

  lesson_slug   text,                 -- denormalized for display + linking
  lesson_title  text,                 -- denormalized lesson title at write time
  body          text not null,        -- the note content

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- List "my notes for this program", newest first.
create index if not exists idx_lesson_notes_user_program
  on public.lesson_notes (user_id, program_id, created_at desc);

alter table public.lesson_notes enable row level security;

drop policy if exists "lesson_notes_owner_all" on public.lesson_notes;
create policy "lesson_notes_owner_all" on public.lesson_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Reuse the shared updated_at trigger (defined in migration 0029).
do $$ begin
  drop trigger if exists trg_lesson_notes_updated_at on public.lesson_notes;
  create trigger trg_lesson_notes_updated_at
    before update on public.lesson_notes
    for each row execute function public.set_updated_at();
exception when undefined_function then
  -- set_updated_at() ships in 0029; if that hasn't run yet, skip the trigger
  -- (updated_at simply won't auto-touch until 0029 is applied).
  null;
end $$;
