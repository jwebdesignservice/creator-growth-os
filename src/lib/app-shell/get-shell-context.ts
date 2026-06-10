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

  // The four queries below only need user.id and are mutually independent,
  // so they run in parallel — one round trip of latency instead of four.
  // Supabase builders never reject (errors come back as { data: null,
  // count: null }), so the count fallbacks below keep the shell fail-soft
  // even if a table is missing (pre-migration).
  const [profileRes, notifRes, taskRes, socialRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "full_name, display_name, email, phone, avatar_url, category, plan, onboarded, primary_platform, follower_base, main_goal, niche, bottleneck",
      )
      .eq("id", user.id)
      .maybeSingle(),
    // Lightweight unread count for the bell badge — one cheap COUNT query.
    supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "unread"),
    // Open (unfinished) task/mission count for the sidebar "Tasks" badge —
    // one cheap COUNT query. Counts missions that aren't completed yet.
    supabase
      .from("missions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("status", "completed"),
    // Real per-platform follower counts from social_accounts.
    // Platforms not yet connected render as undefined (shown as — in the UI).
    supabase
      .from("social_accounts")
      .select("platform, follower_count")
      .eq("user_id", user.id),
  ]);

  const profile = profileRes.data;

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

  // Defaults to 0 on error so a missing table never breaks the shell.
  const unreadNotificationCount = notifRes.count ?? 0;
  const openTaskCount = taskRes.count ?? 0;
  const socialRows = socialRes.data;

  const socials: { instagram?: number; tiktok?: number; youtube?: number } = {};
  for (const row of socialRows ?? []) {
    if (row.platform === "instagram") socials.instagram = row.follower_count;
    else if (row.platform === "tiktok") socials.tiktok = row.follower_count;
    else if (row.platform === "youtube") socials.youtube = row.follower_count;
  }

  const topUser = {
    id: user.id,
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

  return { user, profile, name, plan, unreadNotificationCount, openTaskCount, topUser, railProfile };
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
