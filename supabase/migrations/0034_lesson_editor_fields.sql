-- =====================================================================
-- Lesson editor fields — Metadata + Overview tab persistence
-- Adds the columns the /admin/tutorials/[id] editor needs to actually
-- save its Metadata + Overview tabs. Each is nullable / has a sensible
-- default so existing rows keep working unchanged.
--
-- Read/write inherit the existing RLS policies on `lessons` (admin-only
-- writes via service role; learner-side reads gated by `published`),
-- so this migration is purely additive.
-- Safe to re-run.
-- =====================================================================

alter table public.lessons
  -- Free-form taxonomy tags shown in the Metadata "Tags" chip input.
  add column if not exists tags text[] not null default '{}',

  -- "public" | "unlisted" | "private". Drives the Visibility select.
  -- Default 'public' so existing rows keep their current behavior.
  add column if not exists visibility text not null default 'public',

  -- Admin-only notes — never shown to learners.
  add column if not exists internal_notes text,

  -- Optional CTA link rendered next to the lesson in the player.
  add column if not exists cta_link text,

  -- Free-form editor category ("Growth", "Brand", "Dance", …). Distinct
  -- from the strict `category` enum (creator_category) so we don't have
  -- to evolve that enum every time the admin invents a new bucket.
  add column if not exists editor_category text,

  -- Overview tab — "What learners will get" bullet list.
  add column if not exists learning_outcomes text[] not null default '{}',

  -- Overview tab — "Publishing notes (internal)" body.
  add column if not exists publishing_notes_internal text;

-- Guard against bad visibility values via a check constraint. We can
-- swap this for a proper enum later — `text` keeps the migration cheap
-- without giving up validation.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'lessons_visibility_chk'
  ) then
    alter table public.lessons
      add constraint lessons_visibility_chk
      check (visibility in ('public', 'unlisted', 'private'));
  end if;
end $$;

-- Index for the most common Metadata-tab filter (find by visibility +
-- published). Useful once the admin queue grows past a few hundred rows.
create index if not exists idx_lessons_visibility_published
  on public.lessons (visibility, published);

-- Comments — makes the columns self-documenting in psql / DataGrip.
comment on column public.lessons.tags                      is 'Free-form tags shown in the Metadata editor (Metadata tab).';
comment on column public.lessons.visibility                is 'public | unlisted | private. Drives the Visibility select.';
comment on column public.lessons.internal_notes            is 'Admin-only notes; never shown to learners (Metadata tab).';
comment on column public.lessons.cta_link                  is 'Optional external CTA URL surfaced next to the lesson.';
comment on column public.lessons.editor_category           is 'Free-form admin-side category label (Metadata tab dropdown).';
comment on column public.lessons.learning_outcomes         is 'What learners will get — bullet list (Overview tab).';
comment on column public.lessons.publishing_notes_internal is 'Internal publishing notes — admin-only (Overview tab).';
