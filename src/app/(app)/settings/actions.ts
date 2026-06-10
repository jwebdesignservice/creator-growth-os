"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// Log the raw Supabase/Postgres failure server-side and hand the client a
// generic message — raw error.message leaks schema internals (table/column/
// constraint names) to the UI.
function friendlyDbError(context: string, error: { message: string }): string {
  console.error(`[settings/actions] ${context}:`, error.message);
  return "Something went wrong. Please try again.";
}

// Accept only public URLs that point at our own Supabase storage, inside the
// `community-media` bucket and the signed-in user's own folder. Anything else
// (external hosts, other buckets, other users' folders) is rejected.
function isOwnCommunityMediaUrl(rawUrl: string, userId: string): boolean {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return false;
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.origin === new URL(base).origin &&
      parsed.pathname.startsWith(
        `/storage/v1/object/public/community-media/${userId}/`,
      )
    );
  } catch {
    return false;
  }
}

// After a profile write, refresh every surface that renders profile data: the
// settings subpages and the app-shell chrome (topbar/sidebar avatar + name).
function revalidateProfileSurfaces() {
  revalidatePath("/settings");
  revalidatePath("/", "layout");
}

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
    .update({
      full_name: data.full_name,
      phone:     data.phone,
      // "" is the "Select range…" placeholder — treat it as "no change" so an
      // accidental re-select + save can't silently wipe the stored range.
      ...(data.follower_base !== ""
        ? { follower_base: data.follower_base }
        : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { ok: false, error: friendlyDbError("saveProfileSettings", error) };
  }
  if (!updated) {
    return { ok: false, error: "Profile not found." };
  }

  revalidateProfileSurfaces();
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

  // Persist bio to its own `bio` column (added in 0005). It used to be stored
  // in `main_goal`, which collided with the onboarding "main goal" value and
  // showed up mislabelled on the profile page — fixed here.
  const { error: profileErr } = await admin
    .from("profiles")
    .update({
      bio:              data.bio,
      niche:            data.niche,
      primary_platform: data.primary_platform ?? null,
      updated_at:       new Date().toISOString(),
    })
    .eq("id", user.id);
  if (profileErr) {
    return {
      ok: false,
      error: friendlyDbError("saveCreatorInfo profile update", profileErr),
    };
  }

  // Replace content pillars atomically
  const { error: delErr } = await admin
    .from("content_pillars")
    .delete()
    .eq("user_id", user.id);
  if (delErr) {
    return {
      ok: false,
      error: friendlyDbError("saveCreatorInfo pillars delete", delErr),
    };
  }

  if (data.pillars.length > 0) {
    const { error: insErr } = await admin.from("content_pillars").insert(
      data.pillars.map((label, i) => ({
        user_id:    user.id,
        label,
        sort_order: i,
        weight:     Math.floor(100 / data.pillars.length),
      })),
    );
    if (insErr) {
      return {
        ok: false,
        error: friendlyDbError("saveCreatorInfo pillars insert", insErr),
      };
    }
  }

  revalidateProfileSurfaces();
  return { ok: true };
}

// ── Avatar ──────────────────────────────────────────────────────────────────

export async function saveAvatarUrl(
  avatarUrl: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  // `null` clears the photo; any other value must be one of our own
  // community-media public URLs inside the caller's folder.
  if (avatarUrl !== null && !isOwnCommunityMediaUrl(avatarUrl, user.id)) {
    return { ok: false, error: "Invalid image URL." };
  }

  // Service-role update, bounded to the caller's own row via .eq("id", user.id).
  const admin = createServiceClient();
  const { data: updated, error } = await admin
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: friendlyDbError("saveAvatarUrl", error) };
  if (!updated) return { ok: false, error: "Profile not found." };

  revalidateProfileSurfaces();
  return { ok: true };
}

// ── Banner ────────────────────────────────────────────────────────────────────

export async function saveBannerUrl(
  bannerUrl: string | null,
): Promise<{ ok: boolean; error?: string }> {
  const userClient = await createClient();
  const { data: { user } } = await userClient.auth.getUser();
  if (!user) return { ok: false, error: "Unauthenticated" };

  // `null` clears the banner; any other value must be one of our own
  // community-media public URLs inside the caller's folder.
  if (bannerUrl !== null && !isOwnCommunityMediaUrl(bannerUrl, user.id)) {
    return { ok: false, error: "Invalid image URL." };
  }

  // Service-role update, bounded to the caller's own row via .eq("id", user.id).
  const admin = createServiceClient();
  const { data: updated, error } = await admin
    .from("profiles")
    .update({ banner_url: bannerUrl, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: friendlyDbError("saveBannerUrl", error) };
  if (!updated) return { ok: false, error: "Profile not found." };

  revalidateProfileSurfaces();
  return { ok: true };
}
