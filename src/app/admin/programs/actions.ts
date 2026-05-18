"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";

type Result = { ok: true } | { ok: false; error: string };

export async function createProgram(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const planAccess = String(formData.get("plan_access") ?? "basic").trim();
  const estimatedDays = Number(formData.get("estimated_days") ?? 30);
  const sortOrder = Number(formData.get("sort_order") ?? 100);
  const coverImage =
    String(formData.get("cover_image_url") ?? "").trim() || null;
  const publish = formData.get("publish") === "1";

  const categoryAccess = (formData.getAll("category_access") as string[]).filter(
    Boolean,
  );

  if (!slug) return { ok: false, error: "Slug is required." };
  if (!title) return { ok: false, error: "Title is required." };

  const { error } = await ctx.supabase.from("programs").insert({
    slug,
    title,
    description,
    plan_access: planAccess,
    estimated_days: estimatedDays,
    sort_order: sortOrder,
    cover_image_url: coverImage,
    published: publish,
    category_access:
      categoryAccess.length > 0
        ? categoryAccess
        : ["starter", "growth", "monetization", "scale"],
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/programs");
  return { ok: true };
}

export async function toggleProgramPublished(
  programId: string,
  published: boolean,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("programs")
    .update({ published })
    .eq("id", programId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/programs");
  return { ok: true };
}

export async function deleteProgram(programId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("programs")
    .delete()
    .eq("id", programId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/programs");
  return { ok: true };
}
