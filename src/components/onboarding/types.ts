/**
 * Single source of truth for onboarding answers.
 * Mirrors the columns updated in saveOnboarding().
 */
export type CreatorType =
  | "solo_creator"
  | "small_business"
  | "company_team"
  | "freelancer"
  | "agency"
  | "nonprofit"
  | "other";
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

/** Channels offered on the multi-select "social channels in focus" screen. */
export type FocusChannel =
  | "instagram"
  | "tiktok"
  | "youtube"
  | "snapchat"
  | "linkedin";

/** One quick question per screen, in order. */
export type StepKey =
  | "describe"
  | "stage"
  | "platform"
  | "goals"
  | "content"
  | "plan";
export const STEPS: StepKey[] = [
  "describe",
  "stage",
  "platform",
  "goals",
  "content",
  "plan",
];

export type OnboardingDraft = {
  // Q1 — How would you describe yourself?
  creator_type: CreatorType | null;

  // Q2 — Where are you in your journey?
  stage: CreatorStage | null;

  // Q3 — Main goal
  main_goal: PrimaryGoal | null;

  // Q3 — Social channels in focus (multi-select). primary_platform is
  // derived from it: the single pick, or "multiple" when 2+ are chosen.
  focus_channels: FocusChannel[];
  primary_platform: PrimaryPlatform | null;

  // Q5 — Content pillars (multi-select)
  content_pillars: string[];

  // Q6 — Plan
  selected_plan: PlanChoice | null;

  // Retired questions — kept on the draft (and saved when present) so
  // returning users with partial answers lose nothing, but no longer asked.
  content_frequency: string | null;
  bottleneck: string | null;
  weekly_pace: WeeklyPace | null;
  top_value_priorities: string[];
  focus_formats: string[];
  help_needs: string[];
};

export const EMPTY_DRAFT: OnboardingDraft = {
  creator_type: null,
  stage: null,
  main_goal: null,
  focus_channels: [],
  primary_platform: null,
  content_pillars: [],
  selected_plan: null,
  content_frequency: null,
  bottleneck: null,
  weekly_pace: null,
  top_value_priorities: [],
  focus_formats: [],
  help_needs: [],
};

/**
 * Returns true if the given step has the minimum required fields filled
 * to advance — exactly one answer per screen.
 */
export function isStepComplete(step: StepKey, d: OnboardingDraft): boolean {
  switch (step) {
    case "describe":
      return Boolean(d.creator_type);
    case "stage":
      return Boolean(d.stage);
    case "goals":
      return Boolean(d.main_goal);
    case "platform":
      return d.focus_channels.length > 0;
    case "content":
      return d.content_pillars.length > 0;
    case "plan":
      return Boolean(d.selected_plan);
  }
}
