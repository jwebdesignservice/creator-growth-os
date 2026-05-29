-- ════════════════════════════════════════════════════════════════════════
-- 0044_posting_admin_review.sql
--
-- Admin review workflow for posting plans. Adds the columns behind the
-- /admin/posting "Content Operations" drawer:
--   • review_status  — admin review state (not_reviewed | reviewed | needs_changes)
--   • reviewed_by    — admin who set the current state
--   • reviewed_at    — when it was set
--   • admin_note     — internal, admin-only note (creators never see this)
--
-- Idempotent + safe to re-run. Writes happen via the service role from admin
-- server actions (src/app/admin/posting/actions.ts), each gated by an admin
-- check. The existing `posting_plans_self` RLS policy governs creator
-- self-access and is intentionally left untouched — these admin-only columns
-- are simply never selected by the creator-facing queries.
-- ════════════════════════════════════════════════════════════════════════

alter table public.posting_plans
  add column if not exists review_status text not null default 'not_reviewed',
  add column if not exists reviewed_by   uuid references public.profiles(id) on delete set null,
  add column if not exists reviewed_at   timestamptz,
  add column if not exists admin_note    text;

-- Constrain review_status to the known set.
do $$ begin
  alter table public.posting_plans
    add constraint posting_plans_review_status_chk
    check (review_status in ('not_reviewed', 'reviewed', 'needs_changes'));
exception when duplicate_object then null; end $$;
