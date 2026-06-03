-- =====================================================================
-- Creator Growth OS — onboarding intro tutorials seed
-- Three STANDALONE tutorials (program_id NULL → they live in the Tutorial
-- Library, not a program) that introduce a brand-new user to the platform
-- in a Why → Where → How arc:
--   Step 1 — Welcome: what the platform is and the core promise.
--   Step 2 — Find your way around: a tour of the key surfaces.
--   Step 3 — Set your goal & take your first step: get momentum.
--
-- Seeded as FREE drafts (published = false) so an admin can attach a video
-- + thumbnail in /admin/tutorials and publish them.
--
-- Idempotent: only inserts a row when its slug doesn't already exist, so
-- any later admin edits (video_url, cover_image_url, published, etc.) are
-- never overwritten on re-run.
-- =====================================================================

insert into public.lessons
  (slug, title, description, plan_access, content_type, duration_seconds, difficulty, published, sort_order)
select
  s.slug, s.title, s.description, s.plan_access::subscription_plan, 'video',
  s.duration_seconds, s.difficulty, false, s.sort_order
from (values
  (
    'intro-step-1-welcome',
    'Step 1: Welcome — What Creator Growth OS Is',
    'Your 90-second welcome — what Creator Growth OS is, who it''s for, and how it turns "I want to grow" into a clear, guided daily system without the overwhelm.',
    'free', 90, 'Beginner', 1
  ),
  (
    'intro-step-2-find-your-way-around',
    'Step 2: Find Your Way Around the Platform',
    'A quick tour of the key areas — your Dashboard, Programs, Tutorials, Tasks & Missions, and Posting Plans — so you always know exactly where to go.',
    'free', 120, 'Beginner', 2
  ),
  (
    'intro-step-3-set-your-goal',
    'Step 3: Set Your Goal & Take Your First Step',
    'Set your #1 creator goal, see how daily missions turn it into action, and complete your very first step today — so you leave with real momentum.',
    'free', 150, 'Beginner', 3
  )
) as s(slug, title, description, plan_access, duration_seconds, difficulty, sort_order)
where not exists (
  select 1 from public.lessons l where l.slug = s.slug
);
