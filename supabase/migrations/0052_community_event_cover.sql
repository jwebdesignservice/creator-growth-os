-- 0052_community_event_cover.sql
-- Optional cover image for community events. The file lives in the existing
-- public `community-media` Storage bucket (created for discussion media in
-- 0050); this column just stores its public URL.

alter table public.community_events
  add column if not exists cover_image_url text;
