"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// ── Profile Settings ──────────────────────────────────────────────────────────

export async function saveProfileSettings(data: {
  full_name: string;
  phone:     string;
  follower_base: string;
}): Promise<{ ok: boolean; error?: string }> {
  // Authenticate via the user's session — we never trust the caller's claimed
  // identity, only auth.getUser() on the user-scoped client.
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  // Write via service role so the update is not silently swallowed by an RLS
  // edge case. Scope is bounded to .eq("id", user.id) so this can only ever
  // mutate the authenticated user's own profile.
  const admin = createServiceClient();

  const { data: updated, error } = await admin
    .from("profiles")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: error.message };
  }
  if (!updated) {
    return { ok: false, error: "Profile not found." };
  }

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
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  const admin = createServiceClient();

  // Update profile bio (stored in main_goal) + niche + platform
  const { error: profileErr } = await admin
    .from("profiles")
    .update({
      main_goal:        data.bio,
      niche:            data.niche,
      primary_platform: data.primary_platform ?? null,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileErr) return { ok: false, error: profileErr.message };

  // Replace content pillars atomically
  const { error: delErr } = await admin
    .from("content_pillars")
    .delete()
    .eq("user_id", user.id);
  if (delErr) return { ok: false, error: delErr.message };

  if (data.pillars.length > 0) {
    const { error: insErr } = await admin.from("content_pillars").insert(
      data.pillars.map((label, i) => ({
        user_id:    user.id,
        label,
        sort_order: i,
        weight:     Math.floor(100 / data.pillars.length),
      })),
    );
    if (insErr) return { ok: false, error: insErr.message };
  }

  revalidatePath("/settings");
  return { ok: true };
}
