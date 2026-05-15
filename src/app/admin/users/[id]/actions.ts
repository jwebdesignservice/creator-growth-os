"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";

type Result = { ok: true } | { ok: false; error: string };

export async function updateUserCategory(
  userId: string,
  category: "starter" | "growth" | "monetization" | "scale",
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ category })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function updateUserPlan(
  userId: string,
  plan: "free" | "basic" | "pro",
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error: pErr } = await ctx.supabase
    .from("profiles")
    .update({ plan })
    .eq("id", userId);
  if (pErr) return { ok: false, error: pErr.message };

  const { error: sErr } = await ctx.supabase
    .from("subscriptions")
    .upsert(
      { user_id: userId, plan, status: "active" },
      { onConflict: "user_id" },
    );
  if (sErr) return { ok: false, error: sErr.message };

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function resetOnboarding(userId: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return ctx;

  const { error } = await ctx.supabase
    .from("profiles")
    .update({ onboarded: false, onboarded_at: null })
    .eq("id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/users/${userId}`);
  return { ok: true };
}
