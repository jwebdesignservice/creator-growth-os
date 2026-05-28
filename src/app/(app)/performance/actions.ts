"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

function parseNumber(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (s === "") return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

export async function savePerformanceEntry(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const weekStart = String(formData.get("week_start") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
    return { ok: false, error: "Invalid week." };
  }

  // Check user's plan — revenue is Pro-only
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .maybeSingle();
  const isPro = profile?.plan === "pro";

  const row = {
    user_id: user.id,
    week_start: weekStart,
    // Manual entries from the weekly form live under platform='manual'
    // so they don't collide with rows written by social-account syncs.
    platform: "manual",
    followers: parseNumber(formData.get("followers")),
    reach: parseNumber(formData.get("reach")),
    views: parseNumber(formData.get("views")),
    posts_published: parseNumber(formData.get("posts_published")),
    engagement_rate: parseNumber(formData.get("engagement_rate")),
    profile_visits: parseNumber(formData.get("profile_visits")),
    clicks: parseNumber(formData.get("clicks")),
    revenue: isPro ? parseNumber(formData.get("revenue")) : null,
    best_post: (String(formData.get("best_post") ?? "").trim() || null),
    lesson_learned: (String(formData.get("lesson_learned") ?? "").trim() || null),
  };

  const { error } = await supabase
    .from("performance_entries")
    .upsert(row, { onConflict: "user_id,week_start,platform" });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/performance");
  revalidatePath("/dashboard");
  return { ok: true };
}
