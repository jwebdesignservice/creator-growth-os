"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ManualEntryInput = {
  /** YYYY-MM-DD — the date this snapshot belongs to (stored as week_start). */
  date: string;
  followers?: number | null;
  engagement_rate?: number | null;
  profile_visits?: number | null;
  posts_published?: number | null;
};

/**
 * Upsert a hand-entered performance snapshot (platform='manual'). Only the
 * metrics the user actually filled in are written, so re-logging one number
 * never wipes the others. Revalidates /performance so the Overview chart +
 * stats pick it up immediately.
 */
export async function logPerformanceEntry(
  input: ManualEntryInput,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're not signed in." };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { ok: false, error: "Pick a valid date." };
  }

  const row: Record<string, unknown> = {
    user_id: user.id,
    week_start: input.date,
    platform: "manual",
  };
  if (input.followers != null && Number.isFinite(input.followers))
    row.followers = Math.max(0, Math.round(input.followers));
  if (input.engagement_rate != null && Number.isFinite(input.engagement_rate))
    row.engagement_rate = Number(Math.max(0, input.engagement_rate).toFixed(2));
  if (input.profile_visits != null && Number.isFinite(input.profile_visits))
    row.profile_visits = Math.max(0, Math.round(input.profile_visits));
  if (input.posts_published != null && Number.isFinite(input.posts_published))
    row.posts_published = Math.max(0, Math.round(input.posts_published));

  // Keys are user_id / week_start / platform — anything more means a metric.
  if (Object.keys(row).length <= 3) {
    return { ok: false, error: "Enter at least one metric." };
  }

  const { error } = await supabase
    .from("performance_entries")
    .upsert(row, { onConflict: "user_id,week_start,platform" });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/performance");
  return { ok: true };
}
