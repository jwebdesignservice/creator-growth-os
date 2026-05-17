"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { notifyAnnouncement } from "@/lib/notifications/service";

type Result = { ok: true } | { ok: false; error: string };

type PlanFilter = "free" | "basic" | "pro";
type CategoryFilter = "starter" | "growth" | "monetization" | "scale";

export async function createAnnouncement(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim() || null;
  const audienceCategory = String(formData.get("audience_category") ?? "").trim();
  const audiencePlan = String(formData.get("audience_plan") ?? "").trim();

  if (!title) return { ok: false, error: "Title is required." };

  const planAudience: PlanFilter | null =
    audiencePlan && audiencePlan !== "all"
      ? (audiencePlan as PlanFilter)
      : null;
  const categoryAudience: CategoryFilter | null =
    audienceCategory && audienceCategory !== "all"
      ? (audienceCategory as CategoryFilter)
      : null;

  const { error } = await ctx.supabase.from("announcements").insert({
    title,
    body,
    audience_category: categoryAudience,
    audience_plan: planAudience,
    published_at: new Date().toISOString(),
  });
  if (error) return { ok: false, error: error.message };

  await notifyAnnouncement(
    { title, body: body ?? "" },
    {
      ...(planAudience ? { plan: planAudience } : {}),
      ...(categoryAudience ? { category: categoryAudience } : {}),
    },
  );

  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function deleteAnnouncement(id: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("announcements")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/announcements");
  return { ok: true };
}
