"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Profile Settings ──────────────────────────────────────────────────────────

export async function saveProfileSettings(data: {
  full_name: string;
  phone:     string;
  follower_base: string;
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/settings");
  return { ok: true };
}

// ── Creator Info ──────────────────────────────────────────────────────────────

export async function saveCreatorInfo(data: {
  bio:              string;
  niche:            string;
  primary_platform: string | null;
  pillars:          string[];
}): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  // Update profile bio (stored in main_goal) + niche + platform
  await supabase
    .from("profiles")
    .update({
      main_goal:        data.bio,
      niche:            data.niche,
      primary_platform: data.primary_platform ?? null,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", user.id);

  // Replace content pillars atomically
  await supabase.from("content_pillars").delete().eq("user_id", user.id);
  if (data.pillars.length > 0) {
    await supabase.from("content_pillars").insert(
      data.pillars.map((label, i) => ({
        user_id:    user.id,
        label,
        sort_order: i,
        weight:     Math.floor(100 / data.pillars.length),
      })),
    );
  }

  revalidatePath("/settings");
  return { ok: true };
}
