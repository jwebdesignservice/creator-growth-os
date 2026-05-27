/* ─────────────────────────────────────────────────────────────────────────
   Mock data + shared types for the Overview tab.
   No DB columns exist for "publishing notes", "learning outcomes", or
   "lesson components" yet — these shapes are UI-shaped so the cards
   render cleanly. Swap for real queries when the schema lands; the
   components don't need to change.
   ───────────────────────────────────────────────────────────────────────── */

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export type LessonOverview = {
  description:   string;
  skillLevel:    SkillLevel;
  category:      string;
  estCompletion: string;
};

export type ComponentStatus = "Ready" | "Draft" | "Empty";
export type LessonComponentKey = "lesson-path" | "creator-drill" | "resources";

export type LessonComponentRow = {
  key:    LessonComponentKey;
  label:  string;
  hint:   string;
  status: ComponentStatus;
  tab:    "lesson-path" | "creator-drill" | "resources";
};

export const LESSON_OVERVIEW: LessonOverview = {
  description:
    "This lesson helps creators define their niche, craft scroll-stopping hooks, and build repeatable content pillars. By the end, learners will leave with a clear strategy and one action step to publish today.",
  skillLevel:    "Beginner",
  category:      "Content strategy",
  estCompletion: "12 min",
};

export const LEARNING_OUTCOMES: string[] = [
  "Define your niche and angle clearly",
  "Create hooks that stop the scroll",
  "Turn ideas into repeatable content pillars",
  "Leave with one action step to publish today",
];

export const LESSON_COMPONENTS: LessonComponentRow[] = [
  { key: "lesson-path",   label: "Lesson path",   hint: "3 connected steps", status: "Ready", tab: "lesson-path"   },
  { key: "creator-drill", label: "Creator drill", hint: "1 practical task",  status: "Draft", tab: "creator-drill" },
  { key: "resources",     label: "Resources",     hint: "4 files attached",  status: "Ready", tab: "resources"     },
];

export const PUBLISHING_NOTE =
  "Strong structure and clear action step at the end. The creator drill reinforces niche clarity which is key. Consider adding one more real-world example in Step 2 to boost retention.";

/* "At a glance" right-rail strip — three count tiles. */
export type AtAGlanceStat = {
  key:   "creator-drill" | "resources" | "runtime";
  value: string;
  label: string;
};

export const AT_A_GLANCE: AtAGlanceStat[] = [
  { key: "creator-drill", value: "1",      label: "Creator drill" },
  { key: "resources",     value: "4",      label: "Resources"     },
  { key: "runtime",       value: "12 min", label: "Runtime"       },
];
