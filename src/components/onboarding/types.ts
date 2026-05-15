/**
 * Single source of truth for onboarding answers.
 * Mirrors the columns updated in saveOnboarding().
 */
export type CreatorStage = "starter" | "growth" | "authority" | "monetization";
export type PrimaryPlatform =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "snapchat"
  | "linkedin"
  | "multiple";
export type WeeklyPace = "light" | "balanced" | "growth" | "intensive";
export type PrimaryGoal =
  | "grow_audience"
  | "improve_consistency"
  | "build_authority"
  | "monetize";

export type OnboardingDraft = {
  // Step 1 — Stage
  stage: CreatorStage | null;
  follower_base: string | null; // 0-1k | 1k-10k | 10k-50k | 50k+

  // Step 2 — Platform
  primary_platform: PrimaryPlatform | null;
  content_frequency: string | null; // just_starting | 1-2/week | 3-5/week | daily
  bottleneck: string | null; // no_ideas | inconsistent | low_reach | no_monetization

  // Step 3 — Goals
  main_goal: PrimaryGoal | null;
  weekly_pace: WeeklyPace | null;
  top_value_priorities: string[];

  // Step 4 — Content
  content_pillars: string[];
  focus_formats: string[];
  help_needs: string[];
};

export const EMPTY_DRAFT: OnboardingDraft = {
  stage: null,
  follower_base: null,
  primary_platform: null,
  content_frequency: null,
  bottleneck: null,
  main_goal: null,
  weekly_pace: null,
  top_value_priorities: [],
  content_pillars: [],
  focus_formats: [],
  help_needs: [],
};

/**
 * Returns true if the given step has the minimum required fields filled
 * to advance.
 */
export function isStepComplete(
  step: "stage" | "platform" | "goals" | "content",
  d: OnboardingDraft,
): boolean {
  switch (step) {
    case "stage":
      return Boolean(d.stage && d.follower_base);
    case "platform":
      return Boolean(d.primary_platform && d.content_frequency && d.bottleneck);
    case "goals":
      return Boolean(d.main_goal && d.weekly_pace);
    case "content":
      return d.content_pillars.length > 0 && d.focus_formats.length > 0;
  }
}
