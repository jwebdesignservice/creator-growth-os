"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

export async function updateProfileDetails(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const fullName = String(formData.get("full_name") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const followerBase = String(formData.get("follower_base") ?? "").trim() || null;
  const handle = String(formData.get("handle") ?? "").trim().replace(/^@/, "") || null;
  const niche = String(formData.get("niche") ?? "").trim() || null;
  const primaryPlatform =
    String(formData.get("primary_platform") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;

  if (bio && bio.length > 1000) {
    return { ok: false, error: "Bio is capped at 1000 characters." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      display_name: fullName ?? undefined,
      phone,
      follower_base: followerBase,
      handle,
      niche,
      primary_platform: primaryPlatform,
      bio,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export async function updateContentPillars(
  _prev: Result,
  formData: FormData,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const pillarsRaw = String(formData.get("pillars") ?? "").trim();
  const labels = pillarsRaw
    .split(",")
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"))
    .filter(Boolean);

  // Replace strategy: delete + insert
  await supabase.from("content_pillars").delete().eq("user_id", user.id);
  if (labels.length > 0) {
    const rows = labels.map((label, i) => ({
      user_id: user.id,
      label,
      sort_order: i,
    }));
    const { error } = await supabase.from("content_pillars").insert(rows);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/profile");
  return { ok: true };
}
