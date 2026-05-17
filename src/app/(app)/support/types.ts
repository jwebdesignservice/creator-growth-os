import type { LucideIcon } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────
   Type defs scoped to the Support / Contact page.
   Pure shapes — components consume these without owning any data fetching.
   ───────────────────────────────────────────────────────────────────────── */

/** A picker card in the "Choose your support topic" grid. */
export type SupportTopic = {
  key: string;
  label: string;
  /** Short description shown under the title in the picker card. */
  description: string;
  icon: LucideIcon;
};

/** Severity choices for the Priority select. */
export type SupportPriority = "low" | "medium" | "high" | "urgent";

/** Step in the three-step header (1. Choose Topic → 2. Add Details → 3. Review & Send). */
export type StepperState = "completed" | "active" | "upcoming";
export type StepperStep = {
  index: number;
  label: string;
  state: StepperState;
};

/** Response-time row in the "Estimated response times" card. */
export type ResponseTimeRow = {
  label: string;
  range: string;
  badge?: {
    label: "Faster" | "Priority";
    tone: "rose" | "success";
  };
};

/** "Popular help articles" link row. */
export type HelpArticle = {
  key: string;
  title: string;
  href: string;
};

/** Recent ticket card row. */
export type TicketStatus = "Open" | "Waiting" | "Resolved" | "Closed" | "In Progress";
export type RecentTicket = {
  id: string;            // Full "#TK-48291"
  title: string;
  meta: string;          // "Created 2 days ago", "Updated 4 days ago", etc.
  status: TicketStatus;
};

/** Current step in the wizard. URL-driven via ?step=. */
export type SupportStepKey = "topic" | "details" | "review";

/** "What happens next" timeline row. */
export type NextStepRow = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  state: "done" | "current" | "upcoming";
};
