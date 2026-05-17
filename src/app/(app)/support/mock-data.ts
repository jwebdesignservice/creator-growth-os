import {
  CreditCard,
  Bug,
  UserCog,
  PlayCircle,
  CalendarDays,
  MessagesSquare,
  UserRound,
  Star,
  Mail,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import type {
  NextStepRow,
  ResponseTimeRow,
  SupportTopic,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Static option lists + side-panel content for the Support page.

   Ticket data and help articles are now sourced from Supabase via
   src/lib/support/queries.ts — see that module for the DB-backed reads.
   The constants below are pure UI metadata that doesn't change per-user.
   ───────────────────────────────────────────────────────────────────────── */

/* ── 8 topic cards in "Choose your support topic" ────────────────────── */
export const SUPPORT_TOPICS: SupportTopic[] = [
  { key: "billing",   label: "Billing & Subscription",  description: "Payments, invoices, plan changes and refunds.",         icon: CreditCard     },
  { key: "technical", label: "Technical Issue / Bug",   description: "Errors, broken features or unexpected behavior.",       icon: Bug            },
  { key: "account",   label: "Account Access",          description: "Login issues, password reset or account recovery.",     icon: UserCog        },
  { key: "content",   label: "Program Content",         description: "Lessons, modules and program materials.",               icon: PlayCircle     },
  { key: "posting",   label: "Posting Plans",           description: "Content scheduling, uploads and posting tools.",        icon: CalendarDays   },
  { key: "community", label: "Community & Messaging",   description: "Posts, replies, messages and notifications.",           icon: MessagesSquare },
  { key: "coaching",  label: "Coaching / 1:1 Help",     description: "Personal sessions and direct coach access.",            icon: UserRound      },
  { key: "feature",   label: "Feature Request",         description: "Suggest improvements or new functionality.",            icon: Star           },
];

/* ── "Page or area affected" select options ──────────────────────────── */
export const SUPPORT_PAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "dashboard",    label: "Dashboard"          },
  { value: "programs",     label: "Programs"           },
  { value: "tutorials",    label: "Tutorials"          },
  { value: "posting",      label: "Posting Plans"      },
  { value: "tasks",        label: "Tasks"              },
  { value: "performance",  label: "Performance"        },
  { value: "community",    label: "Community"          },
  { value: "billing",      label: "Billing"            },
  { value: "settings",     label: "Settings"           },
  { value: "profile",      label: "Profile"            },
  { value: "other",        label: "Other"              },
];

/* ── Priority select options ─────────────────────────────────────────── */
export const SUPPORT_PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: "low",    label: "Low – Just a question"                       },
  { value: "medium", label: "Medium – I need help, but it’s not urgent"   },
  { value: "high",   label: "High – Blocking me from working"             },
  { value: "urgent", label: "Urgent – Account / billing emergency"        },
];

/* ── Common device/browser presets — user can also free-type ─────────── */
export const SUPPORT_DEVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "MacBook Pro – Chrome (Version 124.0.6367.119)", label: "MacBook Pro – Chrome (Version 124.0.6367.119)" },
  { value: "MacBook Pro – Safari 17",                        label: "MacBook Pro – Safari 17"                       },
  { value: "Windows PC – Chrome",                            label: "Windows PC – Chrome"                           },
  { value: "Windows PC – Edge",                              label: "Windows PC – Edge"                             },
  { value: "iPhone – Safari",                                label: "iPhone – Safari"                               },
  { value: "Android – Chrome",                               label: "Android – Chrome"                              },
  { value: "iPad – Safari",                                  label: "iPad – Safari"                                 },
  { value: "Other / Not listed",                             label: "Other / Not listed"                            },
];

/* ── Right rail: "What happens next" timeline ────────────────────────── */
export const NEXT_STEPS: NextStepRow[] = [
  {
    key: "received",
    title: "Request received",
    description: "We’ll confirm we received your request.",
    icon: Mail,
    state: "done",
  },
  {
    key: "review",
    title: "Support review",
    description: "Our team reviews and investigates.",
    icon: ClipboardList,
    state: "current",
  },
  {
    key: "reply",
    title: "Reply or resolution",
    description: "You’ll get an email with an update or solution.",
    icon: CheckCircle2,
    state: "upcoming",
  },
];

/* ── Right rail: "Estimated response times" ──────────────────────────── */
export const RESPONSE_TIMES: ResponseTimeRow[] = [
  { label: "General Support",        range: "24 – 48 hours"                                                                  },
  { label: "Billing & Subscription", range: "24 – 48 hours"                                                                  },
  { label: "Technical Issues",       range: "12 – 24 hours", badge: { label: "Faster",   tone: "rose"    }                   },
  { label: "Urgent Access Issues",   range: "2 – 6 hours",   badge: { label: "Priority", tone: "success" }                   },
];

/* ── Initial draft seeded into the form when the user first lands on
 *    step 2 (matches the reference image). After a successful submit the
 *    fields reset; on first paint they make the layout believable. ───── */
export const SUPPORT_FORM_DRAFT = {
  selectedTopic:  "technical" as const,
  subject:        "Videos not uploading on Posting Plans",
  pageAffected:   "posting",
  priority:       "medium" as const,
  device:         "MacBook Pro – Chrome (Version 124.0.6367.119)",
  description:    "When I try to upload a video to my posting plan, the progress bar gets stuck at 90% and then shows an error message. I’ve tried different videos and browsers but the issue persists.",
  ticketRef:      "SUB-83921-PLN",
};
