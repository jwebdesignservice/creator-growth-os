-- 0057_posting_item_media.sql
-- Media attachment for posting-plan items (the composer's image/video).
--
-- Files are uploaded client-side to the EXISTING public `community-media`
-- Storage bucket under {user_id}/post-media-* — the same bucket + RLS the
-- avatar and banner uploads use, so no new bucket or storage policy is
-- required. This column stores the resulting public URL.
--
-- To apply: run this in Supabase Studio → SQL editor. Idempotent.

alter table public.posting_plan_items
  add column if not exists media_url text;

notify pgrst, 'reload schema';
