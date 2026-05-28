"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for the dedicated program-video editor at
   /admin/programs/[id]/curriculum/[lessonId].

   A program video is a `lessons` row. We persist:
     overview          → description
     video / duration  → video_url / duration_seconds
     thumbnail         → cover_image_url
     what you'll learn → learning_points  (jsonb, migration 0036)
     action steps      → action_steps     (jsonb, migration 0036)

   Writes go through the service client (admin verified first) so RLS
   session quirks in server actions can't block them. The jsonb columns
   are written resiliently — if migration 0036 isn't applied yet, the
   core fields still save and the result flags `partial`.
   ───────────────────────────────────────────────────────────────────────── */

export type ActionStep = { id: string; title: string; description: string };

export type VideoLessonData = {
  description:      string;
  videoUrl:        string | null;
  durationSeconds: number;
  coverImageUrl:   string | null;
  learningPoints:  string[];
  actionSteps:     ActionStep[];
};

export type SaveResult =
  | { ok: true; partial?: boolean }
  | { ok: false; error: string };

export type SimpleResult = { ok: true } | { ok: false; error: string };

const OVERVIEW_MAX = 5000;

export async function saveVideoLesson(
  lessonId: string,
  programId: string,
  data: VideoLessonData,
): Promise<SaveResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };
  if (!lessonId) return { ok: false, error: "Missing lesson id." };

  const db = createServiceClient();

  const core = {
    description:      data.description.slice(0, OVERVIEW_MAX) || null,
    video_url:        data.videoUrl?.trim() || null,
    duration_seconds: clampInt(data.durationSeconds, 0, 360000),
    cover_image_url:  data.coverImageUrl?.trim() || null,
  };

  const learning = sanitizeLearning(data.learningPoints);
  const steps    = sanitizeSteps(data.actionSteps);

  // Try the full update (core + jsonb).
  const full = await db
    .from("lessons")
    .update({ ...core, learning_points: learning, action_steps: steps })
    .eq("id", lessonId);

  if (!full.error) {
    revalidate(programId, lessonId);
    return { ok: true };
  }

  // 42703 = undefined_column → jsonb columns not migrated yet. Save the
  // core fields so the admin's work isn't lost, and flag partial.
  if (full.error.code === "42703") {
    const coreOnly = await db.from("lessons").update(core).eq("id", lessonId);
    if (coreOnly.error) return { ok: false, error: coreOnly.error.message };
    revalidate(programId, lessonId);
    return { ok: true, partial: true };
  }

  return { ok: false, error: full.error.message };
}

export async function publishVideoLesson(
  lessonId: string,
  programId: string,
  published: boolean,
): Promise<SimpleResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const db = createServiceClient();
  const { error } = await db
    .from("lessons")
    .update({ published })
    .eq("id", lessonId);
  if (error) return { ok: false, error: error.message };

  revalidate(programId, lessonId);
  return { ok: true };
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function revalidate(programId: string, lessonId: string) {
  revalidatePath(`/admin/programs/${programId}/curriculum`);
  revalidatePath(`/admin/programs/${programId}/curriculum/${lessonId}`);
  revalidatePath(`/admin/programs/${programId}`);
}

function clampInt(n: unknown, min: number, max: number): number {
  const x = Number(n);
  if (!Number.isFinite(x)) return min;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

function sanitizeLearning(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => String(v ?? "").slice(0, 300).trim())
    .filter((v) => v.length > 0)
    .slice(0, 30);
}

function sanitizeSteps(raw: unknown): ActionStep[] {
  if (!Array.isArray(raw)) return [];
  const out: ActionStep[] = [];
  for (let i = 0; i < raw.length && out.length < 30; i++) {
    const s = raw[i];
    if (!s || typeof s !== "object") continue;
    const o = s as Record<string, unknown>;
    const title = String(o.title ?? "").slice(0, 200).trim();
    if (!title) continue;
    out.push({
      id: typeof o.id === "string" && o.id ? o.id : `as-${Date.now()}-${i}`,
      title,
      description: String(o.description ?? "").slice(0, 600),
    });
  }
  return out;
}
