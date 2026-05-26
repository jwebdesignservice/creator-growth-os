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

  const { data: lesson, error: readErr } = await ctx.supabase
    .from("lessons")
    .select("slug, title, plan_access, published")
    .eq("id", lessonId)
    .maybeSingle();
  if (readErr) return { ok: false, error: readErr.message };
  if (!lesson) return { ok: false, error: "Lesson not found." };

  const { error } = await ctx.supabase
    .from("lessons")
    .update({ published })
    .eq("id", lessonId);
  if (error) return { ok: false, error: error.message };

  if (published && !lesson.published) {
    await broadcastUnlock(lesson.slug, lesson.title, lesson.plan_access);
  }

  revalidatePath("/admin/lessons");
  return { ok: true };
}

export async function deleteLesson(lessonId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/lessons");
  revalidatePath("/admin/tutorials");
  return { ok: true };
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
};

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

  if (Object.keys(update).length === 0) return { ok: true };

  const { data: lesson, error } = await ctx.supabase
    .from("lessons")
    .update(update)
    .eq("id", lessonId)
    .select("program_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/lessons");
  revalidatePath("/admin/tutorials");
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

  const { data: lesson, error } = await ctx.supabase
    .from("lessons")
    .update({ archived })
    .eq("id", lessonId)
    .select("program_id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };

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
