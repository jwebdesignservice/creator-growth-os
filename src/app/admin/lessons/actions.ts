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
