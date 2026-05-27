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
  | "checkpoint";

export type IconKey =
  | "hand"
  | "lightbulb"
  | "monitor"
  | "pencil"
  | "target"
  | "flag"
  | "square";

export type LessonChapter = {
  id: string;
  title: string;
  type: ChapterType;
  durationMinutes: number;
  iconKey: IconKey;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const VALID_TYPES = new Set<ChapterType>([
  "intro", "lesson", "activity", "closing", "checkpoint",
]);
const VALID_ICONS = new Set<IconKey>([
  "hand", "lightbulb", "monitor", "pencil", "target", "flag", "square",
]);

/* ─────────────────────────────────────────────────────────────────────── */

export async function getLessonChapters(
  lessonId: string,
): Promise<LessonChapter[]> {
  if (!lessonId) return [];
  const service = createServiceClient();
  const { data, error } = await service
    .from("lesson_chapters")
    .select("id, title, type, duration_minutes, icon_key, position")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data.map((row) => ({
    id:              row.id as string,
    title:           row.title as string,
    type:            row.type as ChapterType,
    durationMinutes: row.duration_minutes as number,
    iconKey:         row.icon_key as IconKey,
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
  }

  /* Service client so the delete+insert bypasses the per-row admin
     policy check for each row (admin status already verified above). */
  const service = createServiceClient();

  const { error: delErr } = await service
    .from("lesson_chapters")
    .delete()
    .eq("lesson_id", lessonId);
  if (delErr) return { ok: false, error: delErr.message };

  if (chapters.length === 0) return { ok: true };

  const rows = chapters.map((c, i) => ({
    lesson_id:        lessonId,
    position:         i,
    title:            c.title.trim(),
    type:             c.type,
    duration_minutes: c.durationMinutes,
    icon_key:         c.iconKey,
  }));

  const { error: insErr } = await service
    .from("lesson_chapters")
    .insert(rows);
  if (insErr) return { ok: false, error: insErr.message };

  return { ok: true };
}
