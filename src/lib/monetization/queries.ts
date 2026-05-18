import { createClient } from "@/lib/supabase/server";

export type MediaKit = {
  id: string;
  user_id: string;
  headline: string | null;
  bio: string | null;
  niche: string | null;
  audience_stats: Record<string, unknown>;
  rates: Record<string, unknown>;
  links: Array<{ label: string; url: string }>;
  published: boolean;
  share_slug: string | null;
};

export type PitchTemplate = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  subject: string;
  body: string;
  category: string | null;
  is_premium: boolean;
};

export type DealStage =
  | "lead"
  | "pitched"
  | "in_negotiation"
  | "agreed"
  | "live"
  | "paid"
  | "lost";

export type BrandDeal = {
  id: string;
  brand_name: string;
  contact_name: string | null;
  contact_email: string | null;
  stage: DealStage;
  value_amount: number | null;
  value_currency: string;
  deliverables: string | null;
  due_date: string | null;
  notes: string | null;
  updated_at: string;
};

export type RevenueEntry = {
  id: string;
  source: string;
  category: string | null;
  amount: number;
  currency: string;
  received_on: string;
  note: string | null;
};

export async function getMediaKit(userId: string): Promise<MediaKit | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media_kits")
    .select(
      "id, user_id, headline, bio, niche, audience_stats, rates, links, published, share_slug",
    )
    .eq("user_id", userId)
    .maybeSingle();
  return (data as MediaKit | null) ?? null;
}

export async function listPitchTemplates(): Promise<PitchTemplate[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pitch_templates")
    .select(
      "id, slug, title, description, subject, body, category, is_premium",
    )
    .order("sort_order", { ascending: true });
  return (data as PitchTemplate[] | null) ?? [];
}

export async function listBrandDeals(userId: string): Promise<BrandDeal[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_deals")
    .select(
      "id, brand_name, contact_name, contact_email, stage, value_amount, value_currency, deliverables, due_date, notes, updated_at",
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  return (data as BrandDeal[] | null) ?? [];
}

export async function listRevenueEntries(
  userId: string,
  limit = 20,
): Promise<RevenueEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("revenue_entries")
    .select("id, source, category, amount, currency, received_on, note")
    .eq("user_id", userId)
    .order("received_on", { ascending: false })
    .limit(limit);
  return (data as RevenueEntry[] | null) ?? [];
}

export type ReadinessSnapshot = {
  score: number;
  hasMediaKit: boolean;
  hasPublishedKit: boolean;
  hasFollowers: boolean;
  hasNiche: boolean;
  hasCompletedOnboarding: boolean;
  hasDealsTracked: number;
  hasPaidDeals: number;
  totalRevenue: number;
};

export async function getReadinessSnapshot(
  userId: string,
): Promise<ReadinessSnapshot> {
  const supabase = await createClient();
  const [profile, kit, deals, revenue] = await Promise.all([
    supabase
      .from("profiles")
      .select("onboarded, follower_base, primary_platform, category, bio")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("media_kits")
      .select("id, published, headline, bio, niche")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("brand_deals")
      .select("stage")
      .eq("user_id", userId),
    supabase
      .from("revenue_entries")
      .select("amount")
      .eq("user_id", userId),
  ]);

  const hasCompletedOnboarding = profile.data?.onboarded === true;
  const hasFollowers =
    Boolean(profile.data?.follower_base) &&
    profile.data?.follower_base !== "0-1k";
  const hasNiche = Boolean(profile.data?.category);
  const hasMediaKit = Boolean(kit.data);
  const hasPublishedKit = kit.data?.published === true;
  const dealsTracked = deals.data?.length ?? 0;
  const paidDeals =
    deals.data?.filter((d) => d.stage === "paid").length ?? 0;
  const totalRevenue =
    revenue.data?.reduce((sum, r) => sum + (r.amount ?? 0), 0) ?? 0;

  let score = 0;
  if (hasCompletedOnboarding) score += 15;
  if (hasFollowers) score += 15;
  if (hasNiche) score += 10;
  if (hasMediaKit) score += 15;
  if (hasPublishedKit) score += 10;
  if (dealsTracked >= 1) score += 10;
  if (dealsTracked >= 3) score += 5;
  if (paidDeals >= 1) score += 10;
  if (totalRevenue > 0) score += 10;

  return {
    score: Math.min(score, 100),
    hasMediaKit,
    hasPublishedKit,
    hasFollowers,
    hasNiche,
    hasCompletedOnboarding,
    hasDealsTracked: dealsTracked,
    hasPaidDeals: paidDeals,
    totalRevenue,
  };
}
