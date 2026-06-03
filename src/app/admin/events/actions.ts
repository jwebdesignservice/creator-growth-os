"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { EVENT_KIND_VALUES } from "@/lib/community/event-kinds";

type Result = { ok: true } | { ok: false; error: string };

export async function createEvent(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = String(formData.get("title") ?? "").trim();
  const kind = String(formData.get("kind") ?? "").trim() || "other";
  const description = String(formData.get("description") ?? "").trim() || null;
  const host_name = String(formData.get("host_name") ?? "").trim() || null;
  const startsRaw = String(formData.get("starts_at") ?? "").trim();
  const durationRaw = String(formData.get("duration_min") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim() || null;
  const cover = String(formData.get("cover_image_url") ?? "").trim() || null;

  if (!title) return { ok: false, error: "Title is required." };
  if (!EVENT_KIND_VALUES.includes(kind))
    return { ok: false, error: "Pick a valid event type." };
  if (!startsRaw)
    return { ok: false, error: "Start date & time is required." };

  const startsDate = new Date(startsRaw);
  if (Number.isNaN(startsDate.getTime()))
    return { ok: false, error: "That start date & time isn't valid." };
  const starts_at = startsDate.toISOString();

  const duration_min = durationRaw
    ? Math.max(5, Math.min(600, parseInt(durationRaw, 10) || 60))
    : 60;

  if (url && !/^https?:\/\//i.test(url))
    return { ok: false, error: "Join link must start with http:// or https://" };

  const payload: Record<string, unknown> = {
    title,
    kind,
    description,
    host_name,
    starts_at,
    duration_min,
    url,
  };
  if (cover) payload.cover_image_url = cover;

  const { error } = await ctx.supabase
    .from("community_events")
    .insert(payload);
  if (error) {
    if (error.code === "42703")
      return {
        ok: false,
        error:
          "A database update is still pending — run the latest migrations (0051–0052) in the SQL editor, then try again.",
      };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/events");
  revalidatePath("/community");
  return { ok: true };
}

export async function deleteEvent(id: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("community_events")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/events");
  revalidatePath("/community");
  return { ok: true };
}
