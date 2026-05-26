// Read-side helpers for the referral program. Used by the UI to render
// the user's share link, progress toward milestones, and earned rewards.

import { createClient } from "@/lib/supabase/server";

export type ReferralStats = {
  referralCode: string | null;
  shareUrl: string | null;
  qualifiedCount: number;
  pendingCount: number;
  nextMilestone: { threshold: 3 | 9; monthsFree: 1 | 3 } | null;
  rewards: {
    milestone: number;
    monthsFree: number;
    grantedAt: string;
    appliedToSubscription: boolean;
  }[];
};

export async function getReferralStats(): Promise<ReferralStats | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, qualified, pending, { data: rewards }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user.id)
        .eq("status", "qualified"),
      supabase
        .from("referrals")
        .select("id", { count: "exact", head: true })
        .eq("referrer_id", user.id)
        .eq("status", "pending"),
      supabase
        .from("referral_rewards")
        .select("milestone, months_free, granted_at, applied_to_subscription")
        .eq("user_id", user.id)
        .order("granted_at", { ascending: false }),
    ]);

  const code = profile?.referral_code ?? null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8080";
  const shareUrl = code ? `${appUrl}/sign-up?ref=${code}` : null;

  const qualifiedCount = qualified.count ?? 0;
  const nextMilestone =
    qualifiedCount < 3
      ? { threshold: 3 as const, monthsFree: 1 as const }
      : qualifiedCount < 9
        ? { threshold: 9 as const, monthsFree: 3 as const }
        : null;

  return {
    referralCode: code,
    shareUrl,
    qualifiedCount,
    pendingCount: pending.count ?? 0,
    nextMilestone,
    rewards: (rewards ?? []).map((r) => ({
      milestone: r.milestone,
      monthsFree: r.months_free,
      grantedAt: r.granted_at,
      appliedToSubscription: r.applied_to_subscription,
    })),
  };
}
