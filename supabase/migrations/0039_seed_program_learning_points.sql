-- =====================================================================
-- Seed per-lesson "What you'll learn" points (lessons.learning_points)
-- for the two shipped programs, so the program overview's "What You'll
-- Learn" — now aggregated from each video's section C — renders real
-- content instead of the static fallback.
--
-- Strategy: assign each MODULE a curated learning point (the program's
-- core outcomes), applied to every lesson in that module. The overview
-- aggregates + de-dupes by title, so it surfaces the distinct outcomes;
-- each lesson shows its module's point on the lesson page.
--
-- Idempotent / non-destructive: only fills lessons whose learning_points
-- is empty (null / [] / {}). Admin-authored points are never overwritten,
-- and re-running skips already-seeded rows. Requires migration 0036
-- (lessons.learning_points jsonb). Safe to re-run.
-- =====================================================================

-- ── Content That Connects ──────────────────────────────────────────────
update public.lessons l
set learning_points = (
  case coalesce(l.module_number, 1)
    when 1 then '[{"id":"ctc-lp-1","icon":"target","title":"Define your niche and unique positioning","description":"Get clear on who you help, how you help, and why it matters.","actionStep":null}]'::jsonb
    when 2 then '[{"id":"ctc-lp-2","icon":"layers","title":"Build content pillars that attract and convert","description":"Create focused content pillars that draw in your ideal audience.","actionStep":null}]'::jsonb
    when 3 then '[{"id":"ctc-lp-3","icon":"anchor","title":"Create hook-driven content that stops the scroll","description":"Write powerful hooks and content that grabs attention instantly.","actionStep":null}]'::jsonb
    when 4 then '[{"id":"ctc-lp-4","icon":"users","title":"Stay consistent and build a loyal community","description":"Show up consistently and turn followers into true fans.","actionStep":null}]'::jsonb
    else        '[{"id":"ctc-lp-5","icon":"trending-up","title":"Turn your personal brand into real income","description":"Monetize your message and build sustainable revenue streams.","actionStep":null}]'::jsonb
  end
)
from public.programs p
where l.program_id = p.id
  and p.slug = 'content-that-connects'
  and (
    l.learning_points is null
    or l.learning_points = '[]'::jsonb
    or l.learning_points = '{}'::jsonb
  );

-- ── Scale & Automate ───────────────────────────────────────────────────
update public.lessons l
set learning_points = (
  case coalesce(l.module_number, 1)
    when 1 then '[{"id":"sa-lp-1","icon":"layers","title":"Build the systems that let you scale","description":"Turn ad-hoc work into repeatable systems you can rely on.","actionStep":null}]'::jsonb
    when 2 then '[{"id":"sa-lp-2","icon":"zap","title":"Automate your content pipeline","description":"Set up workflows that publish and repurpose without you.","actionStep":null}]'::jsonb
    when 3 then '[{"id":"sa-lp-3","icon":"users","title":"Delegate and build a lean team","description":"Hand off the right work so you can focus on growth.","actionStep":null}]'::jsonb
    when 4 then '[{"id":"sa-lp-4","icon":"trending-up","title":"Compound your growth and revenue","description":"Stack systems that multiply your results over time.","actionStep":null}]'::jsonb
    else        '[{"id":"sa-lp-5","icon":"rocket","title":"Operate like a creator business","description":"Run your brand with the systems of a real company.","actionStep":null}]'::jsonb
  end
)
from public.programs p
where l.program_id = p.id
  and p.slug = 'scale-and-automate'
  and (
    l.learning_points is null
    or l.learning_points = '[]'::jsonb
    or l.learning_points = '{}'::jsonb
  );
