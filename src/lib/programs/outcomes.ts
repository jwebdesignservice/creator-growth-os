import {
  Target,
  Layers,
  Anchor,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type Outcome = {
  icon: LucideIcon;
  title: string;
  desc: string;
  /**
   * A concrete, single-sentence action a learner can take right after a lesson
   * in this outcome. Split into three parts so the middle phrase can render
   * bold/rose in the UI without parsing markup.
   */
  nextStep: { lead: string; bold: string; trail: string };
};

/**
 * The five "What You'll Learn" outcomes for the program. Surfaced on the
 * program overview ("What You'll Learn") AND on each lesson page (Lesson
 * Overview), so what you're learning stays connected to where you are in
 * the path.
 */
export const PROGRAM_OUTCOMES: readonly Outcome[] = [
  {
    icon: Target,
    title: "Define your niche and unique positioning",
    desc: "Get clear on who you help, how you help, and why it matters.",
    nextStep: {
      lead: "Best next step: write down ",
      bold: "3 audience pain points",
      trail: " before starting the next lesson.",
    },
  },
  {
    icon: Layers,
    title: "Build content pillars that attract and convert",
    desc: "Create focused content pillars that draw in your ideal audience.",
    nextStep: {
      lead: "Best next step: list ",
      bold: "3 content pillars",
      trail: " you'll commit to this week.",
    },
  },
  {
    icon: Anchor,
    title: "Create hook-driven content that stops the scroll",
    desc: "Write powerful hooks and content that grabs attention instantly.",
    nextStep: {
      lead: "Best next step: draft ",
      bold: "5 scroll-stopping hooks",
      trail: " before your next post.",
    },
  },
  {
    icon: Users,
    title: "Stay consistent and build a loyal community",
    desc: "Show up consistently and turn followers into true fans.",
    nextStep: {
      lead: "Best next step: set your ",
      bold: "7-day posting rhythm",
      trail: " in the planner.",
    },
  },
  {
    icon: TrendingUp,
    title: "Turn your personal brand into real income",
    desc: "Monetize your message and build sustainable revenue streams.",
    nextStep: {
      lead: "Best next step: outline ",
      bold: "1 offer or revenue stream",
      trail: " before moving on.",
    },
  },
];

/**
 * Returns the outcome that the given module's lessons primarily teach.
 *
 * Demo mapping: outcomes are cycled across modules so every lesson lands
 * on one — once real outcome→module data exists in the DB, this is the
 * single seam to swap.
 */
export function getOutcomeForModule(moduleNumber: number): Outcome {
  const safe = Math.max(1, moduleNumber);
  const idx = (safe - 1) % PROGRAM_OUTCOMES.length;
  return PROGRAM_OUTCOMES[idx] ?? PROGRAM_OUTCOMES[0]!;
}
