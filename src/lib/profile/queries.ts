import "server-only";
import { createClient } from "@/lib/supabase/server";

export type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  category: string;
  plan: "free" | "basic" | "pro";
  primary_platform: string | null;
  niche: string | null;
  follower_base: string | null;
  bio: string | null;
  handle: string | null;
  notification_preferences: Record<string, boolean>;
  onboarded: boolean;
  created_at: string;
};

export type SocialSnapshotRow = {
  platform: string;
  follower_count: number;
  handle: string | null;
};

export const DEFAULT_NOTIFS = {
  email_updates: true,
  task_reminders: true,
  posting_alerts: true,
  coach_messages: true,
  product_announcements: false,
};

export async function getFullProfile(): Promise<{
  profile: ProfileRow;
  pillars: { label: string }[];
  socials: SocialSnapshotRow[];
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, display_name, phone, avatar_url, category, plan, primary_platform, niche, follower_base, bio, handle, notification_preferences, onboarded, created_at",
    )
    .eq("id", user.id)
    .maybeSingle();
  if (!profile) return null;

  const [{ data: pillars }, { data: socials }] = await Promise.all([
    supabase
      .from("content_pillars")
      .select("label, sort_order")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("social_accounts")
      .select("platform, follower_count, handle")
      .eq("user_id", user.id),
  ]);

  return {
    profile: {
      ...profile,
      notification_preferences: {
        ...DEFAULT_NOTIFS,
        ...(profile.notification_preferences ?? {}),
      },
    } as ProfileRow,
    pillars: pillars ?? [],
    socials: (socials ?? []) as SocialSnapshotRow[],
  };
}

export function computeProfileCompletion(p: ProfileRow, pillars: number) {
  const checks = [
    {
      label: "Profile information",
      done: !!(p.full_name && p.phone),
    },
    {
      label: "Bio & content pillars",
      done: !!(p.bio && pillars > 0),
    },
    {
      label: "Preferred platforms",
      done: !!p.primary_platform,
    },
    {
      label: "Connect more social accounts",
      done: false, // soft-default false until social_accounts has 3+ rows
    },
  ];
  const done = checks.filter((c) => c.done).length;
  const percent = Math.round((done / checks.length) * 100);
  return { percent, checks };
}

export const PILLAR_LABEL: Record<string, string> = {
  education: "Education",
  lifestyle: "Lifestyle",
  motivation: "Motivation",
  inspiration: "Inspiration",
  behind_the_scenes: "Behind the Scenes",
  personal_brand: "Personal Brand",
  business_monetization: "Business / Monetization",
  promotion: "Promotion",
};
