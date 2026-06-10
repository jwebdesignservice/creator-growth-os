import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

export type IntroVideo = { videoUrl: string; coverUrl: string | null };

/**
 * The "Welcome to Creator Growth OS" lesson video — Start-Here program, lesson 1
 * (slug `start-here-welcome`) — surfaced on the public marketing hero.
 *
 * Why the service client: the `lessons` table is gated to authenticated users by
 * RLS (`for select using (auth.role() = 'authenticated')`), so the anonymous
 * landing page can't read it with the normal client. This is a read-only,
 * single-row, two-column fetch of one intro lesson's *already-public* assets —
 * lesson videos live in the `lesson-media` bucket, which is public-read (see
 * migration 0036 / the `lesson_media_public_read` storage policy and the app's
 * use of `getPublicUrl`). So the returned URL is safe to render on an
 * unauthenticated page; nothing private is exposed and no policy is changed.
 *
 * Returns null (→ the static dashboard mockup is shown instead) when the video
 * hasn't been uploaded in this environment, or on any read error.
 */
export async function getIntroVideo(): Promise<IntroVideo | null> {
  try {
    const svc = createServiceClient();
    const { data } = await svc
      .from("lessons")
      .select("video_url, cover_image_url")
      .eq("slug", "start-here-welcome")
      .maybeSingle();

    if (!data?.video_url) return null;
    return {
      videoUrl: data.video_url as string,
      coverUrl: (data.cover_image_url as string | null) ?? null,
    };
  } catch {
    return null;
  }
}
