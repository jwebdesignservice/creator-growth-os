-- 0050_community_post_media.sql
-- Image / video attachments on discussion posts.
--
-- Attachments are stored as a jsonb array on the post, each item shaped:
--   { "url": "https://…", "type": "image" | "video", "name": "clip.mp4" }
-- The files themselves live in a PUBLIC `community-media` Storage bucket.
--
-- IMPORTANT — create the bucket first (this SQL only adds the column + the
-- storage.objects RLS policies; it does NOT create the bucket):
--   Supabase Dashboard → Storage → New bucket
--     • Name:   community-media
--     • Public: ON
--     • File size limit: 50 MB   (raise the project-wide limit too if videos
--       are larger — Settings → Storage → "Upload file size limit")
--     • Allowed MIME types (optional):
--         image/png, image/jpeg, image/webp, image/gif,
--         video/mp4, video/webm, video/quicktime

alter table public.community_posts
  add column if not exists attachments jsonb not null default '[]'::jsonb;

-- ── community-media storage policies ──────────────────────────────────
-- Public read; signed-in users may upload into their own {user_id}/ folder
-- and manage only their own objects. Wrapped so hosted environments that
-- restrict DDL on storage.objects don't fail the whole migration — set the
-- policies in the dashboard if this block is skipped.
do $$ begin
  drop policy if exists "community_media_public_read" on storage.objects;
  create policy "community_media_public_read" on storage.objects
    for select using (bucket_id = 'community-media');

  drop policy if exists "community_media_auth_insert" on storage.objects;
  create policy "community_media_auth_insert" on storage.objects
    for insert with check (
      bucket_id = 'community-media'
      and auth.uid() is not null
      and (storage.foldername(name))[1] = auth.uid()::text
    );

  drop policy if exists "community_media_owner_update" on storage.objects;
  create policy "community_media_owner_update" on storage.objects
    for update using (
      bucket_id = 'community-media'
      and (storage.foldername(name))[1] = auth.uid()::text
    );

  drop policy if exists "community_media_owner_delete" on storage.objects;
  create policy "community_media_owner_delete" on storage.objects
    for delete using (
      bucket_id = 'community-media'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
exception when others then
  null;
end $$;
