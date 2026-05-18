import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type CategoryKey } from "@/lib/brand";

/**
 * Reads the current user + profile and computes the data needed by the
 * sidebar/topbar/right-rail. Cached per request so multiple callers in
 * the same render tree don't re-query Supabase.
 */
export const getShellContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, display_name, email, phone, avatar_url, category, plan, onboarded",
    )
    .eq("id", user.id)
    .maybeSingle();

  const fallbackName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split("@")[0] ||
    "Creator";

  const name = profile?.display_name ?? profile?.full_name ?? fallbackName;
  const plan = (profile?.plan ?? "free") as "free" | "basic" | "pro";
  const categoryKey = (profile?.category ?? "growth") as CategoryKey;
  const categoryMeta =
    CATEGORIES.find((c) => c.key === categoryKey) ?? CATEGORIES[1];

  // Lightweight unread count for the bell badge — one cheap COUNT query.
  // Defaults to 0 on error so a missing notifications table never breaks the shell.
  let unreadNotificationCount = 0;
  try {
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "unread");
    unreadNotificationCount = count ?? 0;
  } catch {
    // notifications table may not exist yet (pre-migration); safe to ignore
  }

  // Real per-platform follower counts from social_accounts.
  // Platforms not yet connected render as undefined (shown as — in the UI).
  const { data: socialRows } = await supabase
    .from("social_accounts")
    .select("platform, follower_count")
    .eq("user_id", user.id);

  const socials: { instagram?: number; tiktok?: number; youtube?: number } = {};
  for (const row of socialRows ?? []) {
    if (row.platform === "instagram") socials.instagram = row.follower_count;
    else if (row.platform === "tiktok") socials.tiktok = row.follower_count;
    else if (row.platform === "youtube") socials.youtube = row.follower_count;
  }

  const topUser = {
    name,
    avatar_url: profile?.avatar_url ?? null,
    plan,
    unreadNotificationCount,
  };

  const railProfile = {
    name,
    email: profile?.email ?? user.email ?? "",
    phone: profile?.phone ?? null,
    avatar_url: profile?.avatar_url ?? null,
    plan,
    category_label: categoryMeta.label,
    category_description: categoryMeta.focus,
    profile_completion: computeProfileCompletion(profile),
    socials,
  };

  return { user, profile, name, plan, unreadNotificationCount, topUser, railProfile };
});

function computeProfileCompletion(
  profile:
    | {
        full_name: string | null;
        phone: string | null;
        avatar_url: string | null;
        category: string | null;
        plan: string | null;
        niche?: string | null;
        primary_platform?: string | null;
        follower_base?: string | null;
        main_goal?: string | null;
        bottleneck?: string | null;
        onboarded?: boolean | null;
      }
    | null
    | undefined,
) {
  if (!profile) return 0;

  // Mix of profile basics (left rail facts) + creator brand info (set
  // during onboarding). Onboarded users land near 80%; filling in
  // optional phone + avatar gets them to 100%.
  const checks: boolean[] = [
    !!profile.full_name,
    !!profile.avatar_url,
    !!profile.phone,
    !!profile.category,
    !!profile.onboarded,
    !!profile.primary_platform,
    !!profile.follower_base,
    !!profile.main_goal,
    !!profile.niche,
    !!profile.bottleneck,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
