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
/** Plan picked in the final onboarding step. "pro" routes into Stripe checkout. */
export type PlanChoice = "free" | "pro";

export type OnboardingDraft = {
  // Step 1 — Stage
  stage: CreatorStage | null;

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

  // Step 5 — Plan
  selected_plan: PlanChoice | null;
};

export const EMPTY_DRAFT: OnboardingDraft = {
  stage: null,
  primary_platform: null,
  content_frequency: null,
  bottleneck: null,
  main_goal: null,
  weekly_pace: null,
  top_value_priorities: [],
  content_pillars: [],
  focus_formats: [],
  help_needs: [],
  selected_plan: null,
};

/**
 * Returns true if the given step has the minimum required fields filled
 * to advance.
 */
export function isStepComplete(
  step: "stage" | "platform" | "goals" | "content" | "plan",
  d: OnboardingDraft,
): boolean {
  switch (step) {
    case "stage":
      return Boolean(d.stage && d.bottleneck);
    case "platform":
      return Boolean(d.primary_platform && d.content_frequency);
    case "goals":
      return Boolean(d.main_goal && d.weekly_pace);
    case "content":
      return d.content_pillars.length > 0;
    case "plan":
      return Boolean(d.selected_plan);
  }
}
