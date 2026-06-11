-- =====================================================================
-- 0060_posting_publish_lifecycle.sql
--
-- The Posts queue's three-stage publish control:
--   draft → "Que to publish" → queued → auto/now-publish → published
--   ("View post" opens published_url).
--
-- Adds to posting_plan_items:
--   • publish_state — draft | queued | publishing | published | failed
--   • queued_at / published_at — lifecycle timestamps
--   • published_url — where the live post can be viewed (the connected
--     account's profile until per-platform deep links are available)
--   • publish_error — last failure message, cleared on retry
--
-- Purely additive; existing rows default to 'draft'.
-- =====================================================================

alter table public.posting_plan_items
  add column if not exists publish_state text not null default 'draft'
    check (publish_state in ('draft','queued','publishing','published','failed')),
  add column if not exists queued_at     timestamptz,
  add column if not exists published_at  timestamptz,
  add column if not exists published_url text,
  add column if not exists publish_error text;

-- The queue processor scans for due items: (user, state, time).
create index if not exists idx_posting_items_publish_queue
  on public.posting_plan_items (user_id, publish_state, scheduled_for)
  where publish_state = 'queued';
