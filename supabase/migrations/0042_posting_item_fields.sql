-- ════════════════════════════════════════════════════════════════════════
-- 0042_posting_item_fields.sql
--
-- Adds the optional Goal + Notes fields to planned posts, backing the richer
-- "Add a planned post" modal. Idempotent + safe to re-run. RLS is already
-- handled by the existing `posting_items_self` policy (for all, self-scoped).
-- ════════════════════════════════════════════════════════════════════════

alter table public.posting_plan_items
  add column if not exists goal  text,  -- primary objective: awareness | engagement | growth | …
  add column if not exists notes text;  -- caption direction / creative notes
