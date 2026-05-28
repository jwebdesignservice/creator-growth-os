"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions backing the "New tutorial" upload flow.

   Real video upload uses a service-issued SIGNED UPLOAD URL: the browser
   uploads the (potentially large) file straight to Supabase Storage with
   a one-time token, so we never route the bytes through a server action
   (which has a ~1 MB payload cap) and we don't need a storage-RLS insert
   policy. The `lesson-media` bucket is public-read, so the resulting
   object has a stable public URL.

   `createTutorial` then inserts a real `lessons` row (draft, standalone)
   and returns its id so the form can redirect into the editor.
   ───────────────────────────────────────────────────────────────────────── */

const BUCKET = "lesson-media";

export type SignedUpload =
  | { ok: true; bucket: string; path: string; token: string }
  | { ok: false; error: string };

export type CreateResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string };

/** Issue a one-time signed upload URL for a tutorial video / image. */
export async function createSignedMediaUpload(
  fileName: string,
  kind: "video" | "image" = "video",
): Promise<SignedUpload> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const ext = (fileName.split(".").pop() || (kind === "video" ? "mp4" : "jpg"))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 8) || (kind === "video" ? "mp4" : "jpg");
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `tutorials/${kind}/${stamp}.${ext}`;

  const svc = createServiceClient();
  const { data, error } = await svc.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create an upload URL." };
  }
  return { ok: true, bucket: BUCKET, path: data.path, token: data.token };
}

/** Public URL for an object already uploaded to the lesson-media bucket. */
export async function publicMediaUrl(path: string): Promise<string> {
  const svc = createServiceClient();
  return svc.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Create a brand-new standalone tutorial (a draft `lessons` row). */
export async function createTutorial(input: {
  title: string;
  videoUrl: string | null;
  durationSeconds: number;
  programId?: string | null;
}): Promise<CreateResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const title = input.title.trim() || "Untitled tutorial";
  const svc = createServiceClient();
  const base = slugify(title);

  // Retry with a numeric suffix on slug collisions.
  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data, error } = await svc
      .from("lessons")
      .insert({
        slug,
        title,
        plan_access: "basic",
        content_type: "video",
        published: false,
        video_url: input.videoUrl,
        duration_seconds: Math.max(0, Math.floor(input.durationSeconds || 0)),
        program_id: input.programId ?? null,
        sort_order: 0,
      })
      .select("id, slug")
      .maybeSingle();

    if (!error && data) {
      revalidatePath("/admin/tutorials");
      return { ok: true, id: data.id as string, slug: data.slug as string };
    }
    if (error && error.code === "23505") continue; // unique slug clash
    if (error) return { ok: false, error: error.message };
  }
  return {
    ok: false,
    error: "Could not generate a unique slug — try a slightly different title.",
  };
}

function slugify(input: string): string {
  const s = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || `tutorial-${Date.now().toString(36)}`;
}
