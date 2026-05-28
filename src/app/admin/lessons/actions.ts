"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyTutorialUnlocked } from "@/lib/notifications/service";

type Result = { ok: true } | { ok: false; error: string };

export async function createLesson(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const programId = String(formData.get("program_id") ?? "").trim() || null;
  const planAccess = String(formData.get("plan_access") ?? "basic").trim();
  const durationSec = Number(formData.get("duration_seconds") ?? 0);
  const videoUrl = String(formData.get("video_url") ?? "").trim() || null;
  const moduleNumber = formData.get("module_number")
    ? Number(formData.get("module_number"))
    : null;
  const moduleTitle = String(formData.get("module_title") ?? "").trim() || null;
  const publish = formData.get("publish") === "1";

  if (!slug) return { ok: false, error: "Slug is required." };
  if (!title) return { ok: false, error: "Title is required." };

  const { error } = await ctx.supabase.from("lessons").insert({
    slug,
    title,
    description,
    program_id: programId,
    plan_access: planAccess,
    duration_seconds: durationSec,
    video_url: videoUrl,
    module_number: moduleNumber,
    module_title: moduleTitle,
    published: publish,
    content_type: "video",
  });
  if (error) return { ok: false, error: error.message };

  if (publish) {
    await broadcastUnlock(slug, title, planAccess);
  }

  revalidatePath("/admin/lessons");
  return { ok: true };
}

export async function toggleLessonPublished(
  lessonId: string,
  published: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const db = createServiceClient();
  const { data: lesson, error: readErr } = await db
    .from("lessons")
    .select("slug, title, plan_access, published, program_id")
    .eq("id", lessonId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!lesson) return { ok: false, error: "Lesson not found." };

  const { error } = await db
    .from("lessons")
    .update({ published })
    .eq("id", lessonId);
  if (error) return { ok: false, error: error.message };

  if (published && !lesson.published) {
    await broadcastUnlock(lesson.slug, lesson.title, lesson.plan_access);
  }

  revalidatePath("/admin/lessons");
  revalidatePath("/admin/tutorials");
  revalidatePath(`/admin/tutorials/${lessonId}`);
  if (lesson.program_id) {
    revalidatePath(`/admin/programs/${lesson.program_id}/curriculum`);
  }
  return { ok: true };
}

export async function deleteLesson(lessonId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const db = createServiceClient();
  const { error } = await db.from("lessons").delete().eq("id", lessonId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/lessons");
  revalidatePath("/admin/tutorials");
  return { ok: true };
}

/**
 * Duplicate a tutorial/lesson in place — clones every core field with a
 * fresh unique slug + "(Copy)" title, as an unpublished draft. Used by
 * the tutorials list + editor "Duplicate" actions.
 */
export async function duplicateTutorial(
  lessonId: string,
): Promise<Result & { id?: string }> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const db = createServiceClient();
  const { data: src, error: readErr } = await db
    .from("lessons")
    .select(
      "program_id, title, description, video_url, cover_image_url, duration_seconds, plan_access, module_number, module_title, content_type, difficulty, category, sort_order",
    )
    .eq("id", lessonId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!src) return { ok: false, error: "Tutorial not found." };

  const title = `${src.title} (Copy)`;
  const base = String(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || `tutorial-${Date.now().toString(36)}`;

  for (let attempt = 0; attempt < 8; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const { data, error } = await db
      .from("lessons")
      .insert({
        slug,
        title,
        description: src.description ?? null,
        video_url: src.video_url ?? null,
        cover_image_url: src.cover_image_url ?? null,
        duration_seconds: src.duration_seconds ?? 0,
        plan_access: src.plan_access ?? "basic",
        program_id: src.program_id ?? null,
        module_number: src.module_number ?? null,
        module_title: src.module_title ?? null,
        content_type: src.content_type ?? "video",
        difficulty: src.difficulty ?? "intermediate",
        category: src.category ?? null,
        sort_order: ((src.sort_order as number | null) ?? 0) + 1,
        published: false,
      })
      .select("id")
      .maybeSingle();
    if (!error && data) {
      revalidatePath("/admin/tutorials");
      revalidatePath("/admin/lessons");
      if (src.program_id) {
        revalidatePath(`/admin/programs/${src.program_id}/curriculum`);
      }
      return { ok: true, id: data.id as string };
    }
    if (error && error.code === "23505") continue;
    if (error) return { ok: false, error: error.message };
  }
  return { ok: false, error: "Could not generate a unique slug for the copy." };
}

/* ───────────────────────────────────────────────────────────────────── */

export type LessonPatch = {
  title?: string;
  description?: string | null;
  video_url?: string | null;
  cover_image_url?: string | null;
  duration_seconds?: number;
  plan_access?: "free" | "basic" | "pro";
  module_number?: number;
  module_title?: string;
  sort_order?: number;

  /* Editor-only fields backed by migration 0034. All optional so the
   *  existing call sites (legacy /admin/lessons) keep working unchanged. */
  tags?: string[];
  visibility?: "public" | "unlisted" | "private";
  internal_notes?: string | null;
  cta_link?: string | null;
  editor_category?: string | null;
  learning_outcomes?: string[];
  publishing_notes_internal?: string | null;
};

const VISIBILITY_VALUES = new Set(["public", "unlisted", "private"]);
const TAG_MAX_LEN     = 40;
const TAGS_MAX_COUNT  = 20;
const OUTCOMES_MAX    = 20;
const OUTCOME_MAX_LEN = 200;
const NOTES_MAX_LEN   = 4000;
const CTA_MAX_LEN     = 2000;

/**
 * Partial update on a lesson. Empty text fields become null.
 */
export async function updateLesson(
  lessonId: string,
  patch: LessonPatch,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!lessonId) return { ok: false, error: "Missing lesson id." };

  const update: Record<string, unknown> = {};

  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false, error: "Title cannot be empty." };
    update.title = t;
  }
  if (patch.description !== undefined) {
    const v = (patch.description ?? "").trim();
    update.description = v.length > 0 ? v : null;
  }
  if (patch.video_url !== undefined) {
    const v = (patch.video_url ?? "").trim();
    if (v && !/^https?:\/\//i.test(v)) {
      return { ok: false, error: "Video URL must start with http(s)://" };
    }
    update.video_url = v.length > 0 ? v : null;
  }
  if (patch.cover_image_url !== undefined) {
    const v = (patch.cover_image_url ?? "").trim();
    if (v && !/^https?:\/\//i.test(v)) {
      return { ok: false, error: "Cover image must be a valid URL." };
    }
    update.cover_image_url = v.length > 0 ? v : null;
  }
  if (patch.duration_seconds !== undefined) {
    if (
      !Number.isFinite(patch.duration_seconds) ||
      patch.duration_seconds < 0
    ) {
      return { ok: false, error: "Duration must be ≥ 0 seconds." };
    }
    update.duration_seconds = Math.floor(patch.duration_seconds);
  }
  if (patch.plan_access !== undefined) {
    if (!["free", "basic", "pro"].includes(patch.plan_access)) {
      return { ok: false, error: "Invalid plan access." };
    }
    update.plan_access = patch.plan_access;
  }
  if (patch.module_number !== undefined) {
    if (
      !Number.isFinite(patch.module_number) ||
      patch.module_number < 1
    ) {
      return { ok: false, error: "Module number must be ≥ 1." };
    }
    update.module_number = Math.floor(patch.module_number);
  }
  if (patch.module_title !== undefined) {
    const t = patch.module_title.trim();
    update.module_title = t.length > 0 ? t : null;
  }
  if (patch.sort_order !== undefined) {
    if (!Number.isFinite(patch.sort_order)) {
      return { ok: false, error: "Sort order must be a number." };
    }
    update.sort_order = Math.floor(patch.sort_order);
  }

  /* ── Editor fields (migration 0034) ─────────────────────────────── */

  if (patch.tags !== undefined) {
    if (!Array.isArray(patch.tags)) {
      return { ok: false, error: "Tags must be a list of strings." };
    }
    const cleaned = patch.tags
      .map((t) => String(t ?? "").slice(0, TAG_MAX_LEN).trim())
      .filter((t) => t.length > 0)
      .slice(0, TAGS_MAX_COUNT);
    // De-duplicate case-insensitively while preserving original casing.
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const t of cleaned) {
      const k = t.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      unique.push(t);
    }
    update.tags = unique;
  }

  if (patch.visibility !== undefined) {
    if (!VISIBILITY_VALUES.has(patch.visibility)) {
      return { ok: false, error: "Visibility must be public, unlisted, or private." };
    }
    update.visibility = patch.visibility;
  }

  if (patch.internal_notes !== undefined) {
    const v = (patch.internal_notes ?? "").trim().slice(0, NOTES_MAX_LEN);
    update.internal_notes = v.length > 0 ? v : null;
  }

  if (patch.cta_link !== undefined) {
    const v = (patch.cta_link ?? "").trim().slice(0, CTA_MAX_LEN);
    if (v && !/^https?:\/\//i.test(v)) {
      return { ok: false, error: "CTA link must start with http(s)://" };
    }
    update.cta_link = v.length > 0 ? v : null;
  }

  if (patch.editor_category !== undefined) {
    const v = (patch.editor_category ?? "").trim().slice(0, 60);
    update.editor_category = v.length > 0 ? v : null;
  }

  if (patch.learning_outcomes !== undefined) {
    if (!Array.isArray(patch.learning_outcomes)) {
      return { ok: false, error: "Learning outcomes must be a list of strings." };
    }
    const cleaned = patch.learning_outcomes
      .map((s) => String(s ?? "").slice(0, OUTCOME_MAX_LEN).trim())
      .filter((s) => s.length > 0)
      .slice(0, OUTCOMES_MAX);
    update.learning_outcomes = cleaned;
  }

  if (patch.publishing_notes_internal !== undefined) {
    const v = (patch.publishing_notes_internal ?? "").trim().slice(0, NOTES_MAX_LEN);
    update.publishing_notes_internal = v.length > 0 ? v : null;
  }

  if (Object.keys(update).length === 0) return { ok: true };

  // Admin verified — write with the service client so RLS session quirks
  // in server actions can't silently block the save.
  const db = createServiceClient();

  // The editor fields below ship with migration 0034. If that migration
  // hasn't been applied to the live DB, including them makes PostgREST
  // reject the ENTIRE update (42703). So on that error we retry with just
  // the core columns — title / description / plan_access / video / cover /
  // duration always persist, and the 0034 fields fill in once migrated.
  const EXTRA_KEYS = new Set([
    "tags",
    "visibility",
    "internal_notes",
    "cta_link",
    "editor_category",
    "learning_outcomes",
    "publishing_notes_internal",
  ]);

  let result = await db
    .from("lessons")
    .update(update)
    .eq("id", lessonId)
    .select("program_id")
    .maybeSingle();

  if (result.error && result.error.code === "42703") {
    const core: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(update)) {
      if (!EXTRA_KEYS.has(k)) core[k] = v;
    }
    if (Object.keys(core).length === 0) {
      // Only editor-only fields were dirty and none exist yet — nothing to
      // persist until 0034 is applied. Treat as a no-op success.
      return { ok: true };
    }
    result = await db
      .from("lessons")
      .update(core)
      .eq("id", lessonId)
      .select("program_id")
      .maybeSingle();
  }

  if (result.error) return { ok: false, error: result.error.message };

  const lesson = result.data;
  revalidatePath("/admin/lessons");
  revalidatePath("/admin/tutorials");
  revalidatePath(`/admin/tutorials/${lessonId}`);
  if (lesson?.program_id) {
    revalidatePath(`/admin/programs/${lesson.program_id}`);
    revalidatePath(`/admin/programs/${lesson.program_id}/curriculum`);
  }
  return { ok: true };
}

/**
 * Archive (or un-archive) a lesson. Hidden from the public tutorials feed
 * + the active grid; appears under the Archived tab.
 */
export async function archiveLesson(
  lessonId: string,
  archived: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const db = createServiceClient();
  const { data: lesson, error } = await db
    .from("lessons")
    .update({ archived })
    .eq("id", lessonId)
    .select("program_id")
    .maybeSingle();
  if (error) {
    // `archived` column ships with migration 0029. If it isn't applied
    // yet, fall back to using `published=false` as an archive proxy so the
    // action still works against the existing schema.
    if (error.code === "42703") {
      const { data: fallback, error: fbErr } = await db
        .from("lessons")
        .update({ published: !archived ? true : false })
        .eq("id", lessonId)
        .select("program_id")
        .maybeSingle();
      if (fbErr) return { ok: false, error: fbErr.message };
      revalidatePath("/admin/tutorials");
      revalidatePath("/admin/lessons");
      if (fallback?.program_id) {
        revalidatePath(`/admin/programs/${fallback.program_id}/curriculum`);
      }
      return { ok: true };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/tutorials");
  revalidatePath("/admin/lessons");
  if (lesson?.program_id) {
    revalidatePath(`/admin/programs/${lesson.program_id}/curriculum`);
  }
  return { ok: true };
}

/**
 * Bulk-reorder lessons inside a program. Caller computes the new sort_order
 * values; we just write them. Used after drag-and-drop reorders later.
 */
export async function reorderLessons(
  programId: string,
  items: { id: string; sort_order: number }[],
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;
  if (!programId) return { ok: false, error: "Missing program id." };
  if (items.length === 0) return { ok: true };

  // Run updates serially to keep RLS / errors simple; the batch is small.
  for (const item of items) {
    const { error } = await ctx.supabase
      .from("lessons")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id)
      .eq("program_id", programId);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/programs/${programId}/curriculum`);
  revalidatePath("/admin/tutorials");
  return { ok: true };
}

async function broadcastUnlock(
  slug: string,
  title: string,
  planAccess: string,
) {
  const supabase = createServiceClient();
  const planTiers =
    planAccess === "free"
      ? ["free", "basic", "pro"]
      : planAccess === "basic"
        ? ["basic", "pro"]
        : ["pro"];

  const { data: subscribers } = await supabase
    .from("subscriptions")
    .select("user_id")
    .in("plan", planTiers);

  if (!subscribers?.length) return;

  await Promise.all(
    subscribers.map((s) =>
      notifyTutorialUnlocked(s.user_id, slug, title).catch(() => null),
    ),
  );
}
