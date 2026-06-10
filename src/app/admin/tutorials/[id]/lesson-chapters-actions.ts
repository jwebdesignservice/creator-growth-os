"use server";

import "server-only";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions backing the Lesson path tab on /admin/tutorials/[id].
   `getLessonChapters` is a service-role read (called from the server
   page); `saveLessonChapters` is admin-gated and rewrites the chapter
   set for one lesson via delete-then-insert. The client passes its own
   local ids only as React keys — server always issues new UUIDs.
   ───────────────────────────────────────────────────────────────────────── */

export type ChapterType =
  | "intro"
  | "lesson"
  | "activity"
  | "closing"
  | "checkpoint"
  | "video";

export type IconKey =
  | "hand"
  | "lightbulb"
  | "monitor"
  | "pencil"
  | "target"
  | "flag"
  | "square"
  | "play";

export type LessonChapter = {
  id: string;
  title: string;
  type: ChapterType;
  durationMinutes: number;
  iconKey: IconKey;
  /** Set on "video" steps — points at another (already uploaded) lesson. */
  linkedLessonId?: string | null;
};

/** A video the admin can link a path step to (Tutorials-library lessons). */
export type LinkableVideo = {
  id: string;
  title: string;
  durationSeconds: number;
  published: boolean;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const VALID_TYPES = new Set<ChapterType>([
  "intro", "lesson", "activity", "closing", "checkpoint", "video",
]);
const VALID_ICONS = new Set<IconKey>([
  "hand", "lightbulb", "monitor", "pencil", "target", "flag", "square", "play",
]);

const MIGRATION_HINT =
  "Video links need a database update — run supabase/migrations/" +
  "0056_lesson_chapter_video_link.sql in Supabase Studio, then retry.";

/* ─────────────────────────────────────────────────────────────────────── */

export async function getLessonChapters(
  lessonId: string,
): Promise<LessonChapter[]> {
  if (!lessonId) return [];
  const service = createServiceClient();
  // `select("*")` so the read degrades gracefully when the optional
  // linked_lesson_id column (migration 0056) hasn't been applied yet —
  // naming it explicitly would poison the whole query pre-migration.
  const { data, error } = await service
    .from("lesson_chapters")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id:              row.id as string,
    title:           row.title as string,
    type:            row.type as ChapterType,
    durationMinutes: row.duration_minutes as number,
    iconKey:         row.icon_key as IconKey,
    linkedLessonId:  (row.linked_lesson_id as string | null | undefined) ?? null,
  }));
}

export async function saveLessonChapters(
  lessonId: string,
  chapters: LessonChapter[],
): Promise<ActionResult> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  if (!lessonId) return { ok: false, error: "Missing lesson id." };

  /* Validate every row up-front so a single bad chapter rejects the
     whole save instead of leaving the DB half-applied. */
  for (const c of chapters) {
    if (!c.title.trim()) return { ok: false, error: "Each chapter needs a title." };
    if (c.title.length > 200) return { ok: false, error: "Chapter titles must be ≤ 200 chars." };
    if (!VALID_TYPES.has(c.type)) return { ok: false, error: `Unknown chapter type: ${c.type}` };
    if (!VALID_ICONS.has(c.iconKey)) return { ok: false, error: `Unknown icon: ${c.iconKey}` };
    if (!Number.isInteger(c.durationMinutes) || c.durationMinutes < 0) {
      return { ok: false, error: "Duration must be a non-negative integer." };
    }
    if (c.linkedLessonId != null && typeof c.linkedLessonId !== "string") {
      return { ok: false, error: "Invalid linked video reference." };
    }
  }

  /* Service client so the delete+insert bypasses the per-row admin
     policy check for each row (admin status already verified above). */
  const service = createServiceClient();

  /* The save is delete-then-insert, so when any step links a video we
     probe the optional column FIRST — failing before the delete keeps
     existing chapters intact when migration 0056 isn't applied yet. */
  const hasLinks = chapters.some((c) => c.linkedLessonId);
  if (hasLinks) {
    const probe = await service
      .from("lesson_chapters")
      .select("linked_lesson_id")
      .limit(1);
    if (probe.error) return { ok: false, error: MIGRATION_HINT };
  }

  const { error: delErr } = await service
    .from("lesson_chapters")
    .delete()
    .eq("lesson_id", lessonId);
  if (delErr) return { ok: false, error: delErr.message };

  if (chapters.length === 0) return { ok: true };

  const rows = chapters.map((c, i) => {
    const row: Record<string, unknown> = {
      lesson_id:        lessonId,
      position:         i,
      title:            c.title.trim(),
      type:             c.type,
      duration_minutes: c.durationMinutes,
      icon_key:         c.iconKey,
    };
    // Only ship the optional column when it's actually used, so ordinary
    // saves keep working before migration 0056 is applied.
    if (hasLinks) row.linked_lesson_id = c.linkedLessonId ?? null;
    return row;
  });

  const { error: insErr } = await service
    .from("lesson_chapters")
    .insert(rows);
  if (insErr) {
    if (/linked_lesson_id|lesson_chapters_type_check/i.test(insErr.message)) {
      return { ok: false, error: MIGRATION_HINT };
    }
    return { ok: false, error: insErr.message };
  }

  return { ok: true };
}

/* ─────────────────────────────────────────────────────────────────────── */

/**
 * Resolve live details (title, status, duration) for videos that path steps
 * link to, so the editor always shows what a step actually points at. Ids
 * that no longer exist are simply absent from the result — the client
 * renders those steps in a "video deleted" state.
 */
export async function getLinkedVideoDetails(
  ids: string[],
): Promise<ActionResult<LinkableVideo[]>> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const clean = Array.from(
    new Set(ids.filter((s): s is string => typeof s === "string" && s.length > 0)),
  ).slice(0, 100);
  if (clean.length === 0) return { ok: true, data: [] };

  const service = createServiceClient();
  const { data, error } = await service
    .from("lessons")
    .select("id, title, duration_seconds, published")
    .in("id", clean);
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      id:              r.id as string,
      title:           r.title as string,
      durationSeconds: (r.duration_seconds as number | null) ?? 0,
      published:       Boolean(r.published),
    })),
  };
}

/** Learner-facing navigation target for a linked video step. */
export type LinkedVideoNavTarget = { id: string; slug: string; title: string };

/**
 * Resolve linked video steps to navigable tutorials for the LEARNER side.
 * Only published targets resolve — unpublished or deleted videos simply
 * drop out, so learners never see a dead or premature link. (No admin
 * guard: this returns nothing a learner couldn't already browse to.)
 */
export async function getLinkedVideoNavTargets(
  ids: (string | null | undefined)[],
): Promise<LinkedVideoNavTarget[]> {
  const clean = Array.from(
    new Set(ids.filter((s): s is string => typeof s === "string" && s.length > 0)),
  ).slice(0, 100);
  if (clean.length === 0) return [];
  const service = createServiceClient();
  const { data, error } = await service
    .from("lessons")
    .select("id, slug, title, published")
    .in("id", clean)
    .eq("published", true);
  if (error || !data) return [];
  return data.map((r) => ({
    id:    r.id as string,
    slug:  r.slug as string,
    title: r.title as string,
  }));
}

/**
 * Search the Tutorials library (standalone lessons) for a video to link a
 * path step to. Admin-gated; excludes the tutorial being edited.
 */
export async function searchLinkableVideos(
  currentLessonId: string,
  query: string,
): Promise<ActionResult<LinkableVideo[]>> {
  const guard = await requireAdminClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const service = createServiceClient();
  let q = service
    .from("lessons")
    .select("id, title, duration_seconds, published")
    .is("program_id", null)
    .order("created_at", { ascending: false })
    .limit(12);
  if (currentLessonId) q = q.neq("id", currentLessonId);
  const needle = query.trim().replace(/[%_]/g, "\\$&");
  if (needle) q = q.ilike("title", `%${needle}%`);

  const { data, error } = await q;
  if (error) return { ok: false, error: error.message };
  return {
    ok: true,
    data: (data ?? []).map((r) => ({
      id:              r.id as string,
      title:           r.title as string,
      durationSeconds: (r.duration_seconds as number | null) ?? 0,
      published:       Boolean(r.published),
    })),
  };
}
