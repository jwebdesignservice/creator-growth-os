-- ════════════════════════════════════════════════════════════════════════
-- 0036_lesson_video_content.sql
--
-- Backs the dedicated program-video editor at
-- /admin/programs/[id]/curriculum/[lessonId].
--
-- A program video IS a `lessons` row. The editor persists:
--   • overview      → lessons.description        (already exists)
--   • video         → lessons.video_url          (already exists)
--   • thumbnail     → lessons.cover_image_url     (already exists)
--   • duration      → lessons.duration_seconds    (already exists)
--   • what-you'll-learn → lessons.learning_points  (NEW jsonb)
--   • action steps      → lessons.action_steps     (NEW jsonb)
--
-- Shapes:
--   learning_points : ["Understand X", "Set up Y", …]                 (string[])
--   action_steps    : [{ id, title, description }]                    (object[])
--
-- Plus storage.objects RLS so admins can upload the lesson video +
-- custom thumbnail to the public `lesson-media` bucket (the bucket is
-- created in the dashboard / via the storage API; policies live here).
-- ════════════════════════════════════════════════════════════════════════

alter table public.lessons
  add column if not exists learning_points jsonb not null default '[]'::jsonb,
  add column if not exists action_steps    jsonb not null default '[]'::jsonb;

-- ── lesson-media storage policies ───────────────────────────────────────
-- Public read (bucket is public); admin-only write/update/delete.
do $$ begin
  -- Read: anyone (public bucket).
  drop policy if exists "lesson_media_public_read" on storage.objects;
  create policy "lesson_media_public_read" on storage.objects
    for select using (bucket_id = 'lesson-media');

  -- Insert / Update / Delete: admins only.
  drop policy if exists "lesson_media_admin_insert" on storage.objects;
  create policy "lesson_media_admin_insert" on storage.objects
    for insert with check (bucket_id = 'lesson-media' and public.is_admin());

  drop policy if exists "lesson_media_admin_update" on storage.objects;
  create policy "lesson_media_admin_update" on storage.objects
    for update using (bucket_id = 'lesson-media' and public.is_admin());

  drop policy if exists "lesson_media_admin_delete" on storage.objects;
  create policy "lesson_media_admin_delete" on storage.objects
    for delete using (bucket_id = 'lesson-media' and public.is_admin());
exception when others then
  -- Some hosted environments restrict DDL on storage.objects; ignore so
  -- the rest of the migration still applies. Configure the policies in
  -- the dashboard if this block is skipped.
  null;
end $$;
