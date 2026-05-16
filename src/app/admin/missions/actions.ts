"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";

type Result = { ok: true } | { ok: false; error: string };

export async function createMissionTemplate(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const mission_type = String(formData.get("mission_type") ?? "posting").trim();
  const categoryRaw = String(formData.get("category") ?? "").trim();
  const planRaw = String(formData.get("plan_access") ?? "basic").trim();
  const pointsRaw = String(formData.get("points") ?? "10").trim();

  if (!title) return { ok: false, error: "Title is required." };

  const points = Number(pointsRaw);

  const { error } = await ctx.supabase.from("mission_templates").insert({
    title,
    description,
    mission_type,
    category: categoryRaw && categoryRaw !== "all" ? categoryRaw : null,
    plan_access: planRaw,
    points: Number.isFinite(points) ? points : 10,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/missions");
  return { ok: true };
}

export async function deleteMissionTemplate(id: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("mission_templates")
    .delete()
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/missions");
  return { ok: true };
}

/**
 * Bulk-assign a mission template as a fresh per-user mission row to
 * every member matching the template's category + plan.
 */
export async function assignTemplateToCategory(
  templateId: string,
  options: { dueInDays?: number },
): Promise<Result & { assigned?: number }> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { data: tmpl, error: tErr } = await ctx.supabase
    .from("mission_templates")
    .select("id, title, description, category, plan_access, points")
    .eq("id", templateId)
    .maybeSingle();
  if (tErr || !tmpl) return { ok: false, error: tErr?.message ?? "Template not found." };

  // Find target users
  let userQuery = ctx.supabase
    .from("profiles")
    .select("id")
    .eq("plan", tmpl.plan_access);
  if (tmpl.category) userQuery = userQuery.eq("category", tmpl.category);

  const { data: targets } = await userQuery;
  if (!targets || targets.length === 0) {
    return { ok: true, assigned: 0 };
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + (options.dueInDays ?? 7));
  const dueISO = dueDate.toISOString().slice(0, 10);

  const rows = targets.map((u: { id: string }) => ({
    user_id: u.id,
    template_id: tmpl.id,
    title: tmpl.title,
    description: tmpl.description,
    due_date: dueISO,
    status: "pending" as const,
  }));

  const { error: insErr } = await ctx.supabase.from("missions").insert(rows);
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath("/admin/missions");
  return { ok: true, assigned: rows.length };
}
