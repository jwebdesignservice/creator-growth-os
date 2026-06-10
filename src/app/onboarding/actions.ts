"use server";

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
  linkedin: "LinkedIn",
  multiple: "Multiple channels",
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

  // Server-side validation — mirrors the simplified one-question-per-screen
  // quiz: describe-yourself, stage, goal, platform, ≥1 pillar, plan.
  if (!draft.stage) {
    return { ok: false, error: "Please pick where you are in your journey." };
  }
  if (!draft.main_goal) {
    return { ok: false, error: "Please pick your main goal." };
  }
  if (!draft.primary_platform) {
    return { ok: false, error: "Please pick your primary platform." };
  }
  if (draft.content_pillars.length === 0) {
    return { ok: false, error: "Pick at least one content pillar." };
  }

  const category = STAGE_TO_CATEGORY[draft.stage];
  // The pace question was retired from the quiz — default to the balanced
  // plan; users can tune it later. Kept when a draft still carries one.
  const weeklyPace = draft.weekly_pace ?? "balanced";

  // Persist profile fields. Retired questions (frequency, bottleneck,
  // priorities, formats, help needs) are only written when answered, so we
  // never overwrite older answers with nulls.
  const { error: updateErr } = await supabase
    .from("profiles")
    .update({
      category,
      primary_platform: draft.primary_platform,
      main_goal: draft.main_goal,
      weekly_pace: weeklyPace,
      ...(draft.content_frequency
        ? { content_frequency: draft.content_frequency }
        : {}),
      ...(draft.bottleneck ? { bottleneck: draft.bottleneck } : {}),
      ...(draft.top_value_priorities.length > 0
        ? { top_value_priorities: draft.top_value_priorities }
        : {}),
      ...(draft.focus_formats.length > 0
        ? { focus_formats: draft.focus_formats }
        : {}),
      ...(draft.help_needs.length > 0 ? { help_needs: draft.help_needs } : {}),
      onboarded: true,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (updateErr) {
    console.error("[onboarding] profile update failed:", updateErr);
    return { ok: false, error: "Couldn't save your answers. Please try again." };
  }

  // "How would you describe yourself?" + the full channel selection — stored
  // on the auth user's metadata (no profiles columns exist for them; schema
  // changes need separate approval). Non-fatal if it fails.
  if (draft.creator_type || draft.focus_channels.length > 0) {
    const { error: metaErr } = await supabase.auth.updateUser({
      data: {
        ...(draft.creator_type ? { creator_type: draft.creator_type } : {}),
        ...(draft.focus_channels.length > 0
          ? { focus_channels: draft.focus_channels }
          : {}),
      },
    });
    if (metaErr) {
      console.error("[onboarding] metadata save failed:", metaErr);
    }
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
        weekly_pace: PACE_LABEL[weeklyPace] ?? weeklyPace,
      },
    });
  } catch (err) {
    console.error("[onboarding] welcome email send failed:", err);
  }

  // NB: intentionally no revalidatePath here. Revalidating the layout would
  // re-run the /onboarding server page, which redirects already-onboarded users
  // to /dashboard — that made the completion/intro screen flash for ~0.5s before
  // bouncing away. The dashboard + app shell are auth-dynamic, so they render
  // fresh on navigation anyway when the user clicks through.
  return { ok: true };
}
