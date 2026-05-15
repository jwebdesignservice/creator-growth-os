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

  const topUser = {
    name,
    avatar_url: profile?.avatar_url ?? null,
    plan,
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
    socials: {
      instagram: 52300,
      tiktok: 28700,
      youtube: 12100,
    },
  };

  return { user, profile, name, plan, topUser, railProfile };
});

function computeProfileCompletion(
  profile:
    | {
        full_name: string | null;
        phone: string | null;
        avatar_url: string | null;
        category: string | null;
        plan: string | null;
      }
    | null
    | undefined,
) {
  if (!profile) return 25;
  const checks = [
    !!profile.full_name,
    !!profile.phone,
    !!profile.avatar_url,
    !!profile.category,
    !!profile.plan,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
