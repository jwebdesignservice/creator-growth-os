/* ─────────────────────────────────────────────────────────────────────────
   Types specific to the dev-side support console.

   The user-facing support library (src/lib/support/types.ts) defines the
   raw DB shapes; the dev console layers on top with its own status
   options, escalation enum, and assignable-user list.
   ───────────────────────────────────────────────────────────────────────── */

import type { SupportTicketStatus as DbSupportTicketStatus } from "@/lib/support/types";

/** Dev-UI status values shown in the page (different from the raw DB
 *  enum to keep the visual language consistent with the queue page). */
export type DevTicketUiStatus =
  | "open"
  | "in-progress"
  | "investigating"
  | "waiting-client"
  | "escalated"
  | "resolved";

/** Escalation state stored on `support_tickets.escalation_state`. */
export const DEV_ESCALATION_OPTIONS = [
  "Escalated to Engineering",
  "Awaiting Client Reply",
  "Awaiting Internal Review",
] as const;
export type DevEscalationState = (typeof DEV_ESCALATION_OPTIONS)[number];

/** Options for the Change Status menu. Internal value maps to the DB
 *  enum; `uiStatus` is the value the visual layer renders. */
export type DevStatusOption = {
  value: DbSupportTicketStatus;
  uiStatus: DevTicketUiStatus;
  label: string;
};

export const DEV_STATUS_OPTIONS: DevStatusOption[] = [
  { value: "open",        uiStatus: "open",          label: "Open"          },
  { value: "in_progress", uiStatus: "in-progress",   label: "In Progress"   },
  { value: "waiting",     uiStatus: "waiting-client",label: "Waiting Client"},
  { value: "resolved",    uiStatus: "resolved",      label: "Resolved"      },
  { value: "closed",      uiStatus: "resolved",      label: "Closed"        },
];

/** Lightweight profile row used in the Assign menu. */
export type DevAssignableUser = {
  id: string;
  name: string;
  initials: string;
};

/** Result shape for every dev-support server action. */
export type DevSupportActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
