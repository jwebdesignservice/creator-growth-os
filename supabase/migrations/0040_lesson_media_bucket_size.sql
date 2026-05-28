-- ════════════════════════════════════════════════════════════════════════
-- Raise the `lesson-media` bucket file-size limit to 50 GB so large lesson
-- videos can be uploaded. 50 GB is Supabase Storage's absolute maximum size
-- per object. The app uploads big files with resumable / TUS uploads (see
-- video-lesson-editor.tsx), which is required for anything over ~5 GB.
--
-- IMPORTANT — this migration only lifts the *bucket-level* cap. The project's
-- GLOBAL upload limit lives outside the database and must be raised too:
--   Dashboard → Settings → Storage → "Upload file size limit" = 50 GB.
-- That global value is the hard ceiling applied to every bucket. On Supabase
-- Cloud the ceiling you can choose there is governed by Supabase itself; if
-- you self-host Supabase you can set it freely.
--
-- Idempotent & non-destructive: only touches file_size_limit on the existing
-- bucket; wrapped so restricted hosted environments don't fail the migration.
-- 50 GB = 50 * 1024^3 = 53687091200 bytes.
-- ════════════════════════════════════════════════════════════════════════
do $$ begin
  update storage.buckets
     set file_size_limit = 53687091200
   where id = 'lesson-media';
exception when others then
  -- Some hosted environments restrict DML on the storage schema. If so,
  -- set the bucket's file size limit manually in the dashboard:
  -- Storage → lesson-media → Settings → "File size limit" = 50 GB.
  null;
end $$;
