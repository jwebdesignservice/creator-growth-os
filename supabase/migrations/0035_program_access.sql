-- =====================================================================
-- Program access settings — powers /admin/programs/[id]/access
-- Lets admins choose which membership tiers (Free / Basic / Pro /
-- Diamond) can access a program, plus a few enrollment-behavior rules
-- and an internal note.
--
-- `allowed_plans` is text[] (not the subscription_plan enum) on purpose:
-- it has to carry 'diamond', which isn't a billing tier yet. The legacy
-- single `plan_access` column is kept in sync by the save action (set to
-- the lowest allowed tier) so the existing access gating keeps working.
-- Safe to re-run.
-- =====================================================================

-- 1) Add allowed_plans nullable, backfill from the legacy plan_access tier
--    (hierarchical: a tier sees its own content + everything below it, and
--    Diamond — the top tier — sees everything), then lock it down.
alter table public.programs
  add column if not exists allowed_plans text[];

update public.programs
set allowed_plans = case plan_access
    when 'free'  then array['free','basic','pro','diamond']
    when 'basic' then array['basic','pro','diamond']
    when 'pro'   then array['pro','diamond']
    else array['free','basic','pro','diamond']
  end
where allowed_plans is null;

alter table public.programs
  alter column allowed_plans set default array['free','basic','pro','diamond']::text[];
alter table public.programs
  alter column allowed_plans set not null;

-- 2) Enrollment-behavior rules + internal note. Booleans default true to
--    match the "everything on" baseline the editor ships with.
alter table public.programs
  add column if not exists access_instant       boolean not null default true,
  add column if not exists access_while_valid   boolean not null default true,
  add column if not exists access_revoke_future boolean not null default true,
  add column if not exists access_admin_note    text;

-- 3) GIN index so "which programs can plan X access" stays cheap once the
--    member-facing library starts filtering on it.
create index if not exists idx_programs_allowed_plans
  on public.programs using gin (allowed_plans);

comment on column public.programs.allowed_plans        is 'Membership tiers that can access this program: free | basic | pro | diamond (Access tab).';
comment on column public.programs.access_instant       is 'New members on eligible plans get access immediately.';
comment on column public.programs.access_while_valid   is 'Access stays active while the member''s plan remains eligible.';
comment on column public.programs.access_revoke_future is 'Losing an eligible plan hides future (not-yet-seen) lesson content.';
comment on column public.programs.access_admin_note    is 'Internal-only note about this program''s access rules (Access tab).';
