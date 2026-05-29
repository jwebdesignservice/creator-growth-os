-- ════════════════════════════════════════════════════════════════════════
-- 0041_task_scheduling.sql
--
-- Adds TIME-BASED scheduling to the unified task system (0038), and folds the
-- legacy `mission_templates` rows into `task_templates` so admin missions live
-- in the one central system. Idempotent + safe to re-run.
--
--   1. task_templates  + frequency / schedule_time / timezone / recurrence /
--                        auto_assign / last_run_at   (status already exists)
--   2. missions        + period_key  — makes recurrence dedup-safe
--   3. dedup index     → (user_id, task_template_id, period_key)
--                        (replaces the per-(user,template) index from 0038, so
--                         a daily task assigns once PER DAY, not once forever)
--   4. scheduled-query index
--   5. data fold: mission_templates → task_templates (+ assignment rules from
--                 the old category / plan_access). Legacy table is left intact
--                 for one release; a later migration drops it once verified.
-- ════════════════════════════════════════════════════════════════════════

-- ── 1. Scheduling fields on task_templates ──────────────────────────────
alter table public.task_templates
  add column if not exists frequency     text not null default 'once'
    check (frequency in ('once','daily','weekly','monthly','scheduled')),
  add column if not exists schedule_time text,           -- 'HH:MM' (24h), local to `timezone`
  add column if not exists timezone      text,           -- IANA tz, e.g. 'Europe/Vilnius'
  add column if not exists recurrence    text,           -- e.g. 'every_day' | 'every_monday' | 'day_1'
  add column if not exists auto_assign   boolean not null default false,
  add column if not exists last_run_at   timestamptz;    -- observability: last time the engine ran it

-- ── 2. period_key on missions — the recurrence dedup dimension ───────────
--    'once'        → one-shot tasks (program video, tutorial, ad-hoc admin)
--    'YYYY-MM-DD'  → daily      |  'YYYY-Www' → weekly  |  'YYYY-MM' → monthly
alter table public.missions
  add column if not exists period_key text not null default 'once';

-- ── 3. Period-aware dedup index (replaces 0038's (user,template) index) ──
do $$ begin
  -- 0038 created either of these names depending on history; drop both.
  drop index if exists public.uniq_missions_user_task_template;
  begin
    create unique index if not exists uniq_missions_user_task_template_period
      on public.missions (user_id, task_template_id, period_key)
      where task_template_id is not null;
  exception when others then
    -- Pre-existing duplicate data: skip the unique index (app layer also
    -- pre-filters + swallows races, matching the 0038 pattern).
    null;
  end;
end $$;

-- ── 4. Index for the scheduler's "which templates are due?" scan ─────────
create index if not exists idx_task_templates_scheduled
  on public.task_templates (source_type, status, auto_assign, frequency);

-- ── 5. Fold legacy mission_templates → task_templates ────────────────────
--    Idempotent: matched on (source_type='admin_mission', title) so re-running
--    never double-inserts. Targeting (old category + plan_access) becomes
--    task_assignment_rules so the unified engine can resolve eligible users.
do $$
declare
  mt     record;
  new_id uuid;
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'mission_templates'
  ) then
    for mt in select * from public.mission_templates loop
      -- Skip rows already folded.
      if exists (
        select 1 from public.task_templates tt
        where tt.source_type = 'admin_mission' and tt.title = mt.title
      ) then
        continue;
      end if;

      insert into public.task_templates
        (title, description, task_type, source_type, status, points,
         auto_assign_trigger, is_required, frequency, auto_assign)
      values
        (mt.title,
         coalesce(mt.description, ''),
         coalesce(mt.mission_type, 'apply'),
         'admin_mission',
         'active',
         coalesce(mt.points, 10),
         'manual',     -- legacy missions were manually bulk-assigned
         true,
         'once',       -- no schedule existed on the legacy rows
         false)        -- not auto-assigning until an admin opts in
      returning id into new_id;

      -- Preserve old targeting as include-rules.
      if mt.plan_access is not null then
        insert into public.task_assignment_rules
          (task_template_id, rule_type, target_type, target_value, active)
        values
          (new_id, 'include', 'plan',
           jsonb_build_object('plan', mt.plan_access::text), true);
      end if;

      if mt.category is not null then
        insert into public.task_assignment_rules
          (task_template_id, rule_type, target_type, target_value, active)
        values
          (new_id, 'include', 'category',
           jsonb_build_object('category', mt.category::text), true);
      end if;
    end loop;
  end if;
end $$;
