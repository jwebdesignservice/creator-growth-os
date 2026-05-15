"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { sendWelcomeEmail } from "@/lib/email/send";
import type { OnboardingDraft } from "@/components/onboarding/types";

const STAGE_TO_CATEGORY = {
  starter: "starter",
  growth: "growth",
  authority: "growth", // brief V3 only has starter/growth/monetization/scale; map authority to growth
  monetization: "monetization",
} as const;

const STAGE_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  authority: "Authority Creator",
  monetization: "Monetization Creator",
};
const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  snapchat: "Snapchat",
};
const GOAL_LABEL: Record<string, string> = {
  grow_audience: "Grow audience",
  improve_consistency: "Improve consistency",
  build_authority: "Build authority",
  monetize: "Monetize",
};
const PACE_LABEL: Record<string, string> = {
  light: "Light pace",
  balanced: "Balanced pace",
  growth: "Growth pace",
  intensive: "Intensive pace",
};

type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveOnboarding(draft: OnboardingDraft): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Server-side validation
  if (!draft.stage || !draft.follower_base) {
    return { ok: false, error: "Stage and follower base are required." };
  }
  if (!draft.primary_platform || !draft.content_frequency || !draft.bottleneck) {
    return { ok: false, error: "Platform answers are incomplete." };
  }
  if (!draft.main_goal || !draft.weekly_pace) {
    return { ok: false, error: "Goal and weekly pace are required." };
  }
  if (draft.content_pillars.length === 0 || draft.focus_formats.length === 0) {
    return { ok: false, error: "Pick at least one content pillar and one format." };
  }

  const category = STAGE_TO_CATEGORY[draft.stage];

  // Persist profile fields
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      category,
      follower_base: draft.follower_base,
      primary_platform: draft.primary_platform,
      content_frequency: draft.content_frequency,
      bottleneck: draft.bottleneck,
      main_goal: draft.main_goal,
      weekly_pace: draft.weekly_pace,
      top_value_priorities: draft.top_value_priorities,
      focus_formats: draft.focus_formats,
      help_needs: draft.help_needs,
      onboarded: true,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateErr) {
    console.error("[onboarding] profile update failed:", updateErr);
    return { ok: false, error: updateErr.message };
  }

  // Reset and re-insert content pillars for this user
  await supabase.from("content_pillars").delete().eq("user_id", user.id);
  if (draft.content_pillars.length > 0) {
    const rows = draft.content_pillars.map((label, idx) => ({
      user_id: user.id,
      label,
      sort_order: idx,
    }));
    const { error: pillarsErr } = await supabase
      .from("content_pillars")
      .insert(rows);
    if (pillarsErr) {
      console.error("[onboarding] pillars insert failed:", pillarsErr);
      // not fatal — continue
    }
  }

  // Fire the welcome email (non-blocking on failure)
  try {
    const hdrs = await headers();
    const host = hdrs.get("host") ?? "creator-growth-os-three.vercel.app";
    const proto = host.startsWith("localhost") ? "http" : "https";
    const dashboardUrl = `${proto}://${host}/dashboard`;

    const firstName =
      ((user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.display_name as string | undefined) ??
        user.email?.split("@")[0] ??
        "Creator")
        .split(" ")[0];

    await sendWelcomeEmail({
      to: user.email!,
      firstName,
      dashboardUrl,
      summary: {
        category: STAGE_LABEL[draft.stage] ?? category,
        primary_platform: PLATFORM_LABEL[draft.primary_platform] ?? draft.primary_platform,
        main_goal: GOAL_LABEL[draft.main_goal] ?? draft.main_goal,
        weekly_pace: PACE_LABEL[draft.weekly_pace] ?? draft.weekly_pace,
      },
    });
  } catch (err) {
    console.error("[onboarding] welcome email send failed:", err);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}
