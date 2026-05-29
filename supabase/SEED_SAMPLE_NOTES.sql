-- ════════════════════════════════════════════════════════════════════════
-- SEED_SAMPLE_NOTES.sql   →  run once in Supabase Studio → SQL editor
--
-- Seeds sample lesson_notes so the notes UI renders with real content:
--   • Program "Start Here: Platform Introduction"  → 4 notes
--       (shows on the program's Resources tab → "My Notes")
--   • The "Ask" video tutorial                     → 3 notes
--       (shows on the tutorial's Notes tab → "Saved notes")
--
-- Notes are owner-scoped (RLS), so they're created for ONE account. Set
-- v_email below to the account you view the app as — it falls back to the
-- first admin if that email isn't found.
--
-- Safe to re-run: each section is skipped if that account already has notes
-- there, so you never get duplicates.
--
-- Requires migration 0043_lesson_notes.sql to be applied first.
-- ════════════════════════════════════════════════════════════════════════

do $$
declare
  -- ▼▼▼  EDIT this to the email of the account you're logged in as  ▼▼▼
  v_email     text := 'hei@bwstudio.no';
  -- ▲▲▲

  v_user      uuid;
  v_program   uuid;
  v_tut_id    uuid;
  v_tut_slug  text;
  v_tut_title text;
  v_tut_prog  uuid;
begin
  -- ── 1) Resolve the note author ─────────────────────────────────────────
  select id into v_user from public.profiles
   where lower(email) = lower(v_email)
   limit 1;

  if v_user is null then
    select user_id into v_user from public.admin_users limit 1;  -- fallback
  end if;

  if v_user is null then
    raise exception 'No author found. Set v_email to a real account email.';
  end if;

  -- ── 2) Program notes — "Start Here: Platform Introduction" ─────────────
  select id into v_program from public.programs
   where title ilike '%Platform Introduction%' or title ilike 'Start Here%'
   order by created_at
   limit 1;

  if v_program is null then
    raise notice 'Program "Start Here: Platform Introduction" not found — skipped.';
  elsif exists (
    select 1 from public.lesson_notes
     where user_id = v_user and program_id = v_program
  ) then
    raise notice 'Account already has notes for that program — skipped (no dupes).';
  else
    with lc as (
      select id, slug, title,
             (row_number() over (order by sort_order, created_at) - 1) as idx
      from public.lessons
      where program_id = v_program
    ),
    cnt as (select greatest(count(*), 1)::int as c from lc),
    seed(body, age, i) as (
      values
        ('<p>Reminder to update the example in this section before the next cohort.</p>'::text,
         interval '3 hours',   0),
        ('<p>This is just a note that I want to <strong>create</strong> while going through the intro.</p>'::text,
         interval '1 hour',    1),
        ('<p>So yeah — does this onboarding step actually make sense for brand-new members?</p>'::text,
         interval '2 minutes', 2),
        ('<p>This is another note for another video in the same module.</p>'::text,
         interval '20 seconds', 3)
    )
    insert into public.lesson_notes
      (user_id, program_id, lesson_id, lesson_slug, lesson_title, body, created_at, updated_at)
    select v_user, v_program, lc.id, lc.slug, lc.title, seed.body,
           now() - seed.age, now() - seed.age
    from seed
    cross join cnt
    left join lc on lc.idx = (seed.i % cnt.c);

    raise notice 'Inserted 4 program notes.';
  end if;

  -- ── 3) Tutorial notes — the "Ask" video ───────────────────────────────
  select id, slug, title, program_id
    into v_tut_id, v_tut_slug, v_tut_title, v_tut_prog
  from public.lessons
   where title ilike '%ask%'
   order by created_at
   limit 1;

  if v_tut_slug is null then
    raise notice 'No tutorial matching "Ask" found — skipped.';
  elsif exists (
    select 1 from public.lesson_notes
     where user_id = v_user and lesson_slug = v_tut_slug
  ) then
    raise notice 'Account already has notes for that tutorial — skipped (no dupes).';
  else
    insert into public.lesson_notes
      (user_id, program_id, lesson_id, lesson_slug, lesson_title, body, created_at, updated_at)
    values
      (v_user, v_tut_prog, v_tut_id, v_tut_slug, v_tut_title,
       '<p>Check this stat from last quarter — worth referencing in my own video.</p>',
       now() - interval '1 day',      now() - interval '1 day'),
      (v_user, v_tut_prog, v_tut_id, v_tut_slug, v_tut_title,
       '<p>Great hook in the first 5 seconds. Borrow this structure.</p>',
       now() - interval '3 hours',    now() - interval '3 hours'),
      (v_user, v_tut_prog, v_tut_id, v_tut_slug, v_tut_title,
       '<p>Testing the notes flow end-to-end — does it save and show here?</p>',
       now() - interval '45 seconds', now() - interval '45 seconds');

    raise notice 'Inserted 3 tutorial notes for "%".', v_tut_title;
  end if;
end $$;
