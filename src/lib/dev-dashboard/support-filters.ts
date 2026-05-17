/* ─────────────────────────────────────────────────────────────────────────
   URL-state filters for /dev/support.

   Source of truth: the page's searchParams. The filter bar uses
   router.replace to mutate them; the page re-parses on every render.
   Defaults are picked so a bare /dev/support URL renders the full
   "all tickets, last 7 days" view that the brief mocks.
   ───────────────────────────────────────────────────────────────────────── */

export type SupportFilterPriority = "all" | "high" | "medium" | "low";
export type SupportFilterStatus =
  | "all"
  | "open"
  | "in-progress"
  | "waiting-client"
  | "escalated"
  | "resolved";

export type SupportFilterState = {
  q: string;
  priority: SupportFilterPriority;
  status: SupportFilterStatus;
  category: string;
  assignee: string;
  /** 0 means "all time"; otherwise a sliding window in days. */
  timeframeDays: 1 | 7 | 30 | 90 | 0;
  page: number;
  /** Public ID of the ticket selected in the centre / right columns. */
  ticket: string | null;
};

export const DEFAULT_SUPPORT_FILTERS: SupportFilterState = {
  q: "",
  priority: "all",
  status: "all",
  category: "all",
  assignee: "all",
  timeframeDays: 7,
  page: 1,
  ticket: null,
};

export const PRIORITY_OPTIONS: { value: SupportFilterPriority; label: string }[] = [
  { value: "all",    label: "All"    },
  { value: "high",   label: "High"   },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low"    },
];

export const STATUS_OPTIONS: { value: SupportFilterStatus; label: string }[] = [
  { value: "all",             label: "All"             },
  { value: "open",            label: "Open"            },
  { value: "in-progress",     label: "In Progress"     },
  { value: "waiting-client",  label: "Waiting Client"  },
  { value: "escalated",       label: "Escalated"       },
  { value: "resolved",        label: "Resolved"        },
];

export const TIMEFRAME_OPTIONS: { value: SupportFilterState["timeframeDays"]; label: string }[] = [
  { value: 1,  label: "Last 24 hours" },
  { value: 7,  label: "Last 7 days"   },
  { value: 30, label: "Last 30 days"  },
  { value: 90, label: "Last 90 days"  },
  { value: 0,  label: "All time"      },
];

export type SupportRawSearchParams = Partial<Record<keyof SupportFilterState, string | string[]>>;

function first(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export function parseSupportFilters(raw: SupportRawSearchParams): SupportFilterState {
  const q = (first(raw.q) ?? "").trim();
  const priority = (first(raw.priority) as SupportFilterPriority) ?? "all";
  const status   = (first(raw.status)   as SupportFilterStatus)   ?? "all";
  const category = first(raw.category) ?? "all";
  const assignee = first(raw.assignee) ?? "all";
  const timeframeRaw = Number(first(raw.timeframeDays) ?? 7);
  const allowedTimeframes: SupportFilterState["timeframeDays"][] = [1, 7, 30, 90, 0];
  const timeframeDays = (allowedTimeframes.includes(timeframeRaw as SupportFilterState["timeframeDays"])
    ? timeframeRaw
    : 7) as SupportFilterState["timeframeDays"];
  const page = Math.max(1, Number(first(raw.page) ?? 1) || 1);
  const ticket = first(raw.ticket) || null;

  return {
    q,
    priority: (["all", "high", "medium", "low"] as const).includes(priority) ? priority : "all",
    status: (["all", "open", "in-progress", "waiting-client", "escalated", "resolved"] as const).includes(status)
      ? status
      : "all",
    category,
    assignee,
    timeframeDays,
    page,
    ticket,
  };
}

export function buildSupportSearch(next: Partial<SupportFilterState>): URLSearchParams {
  const sp = new URLSearchParams();
  const merged = { ...DEFAULT_SUPPORT_FILTERS, ...next };
  if (merged.q)                                                          sp.set("q",             merged.q);
  if (merged.priority !== DEFAULT_SUPPORT_FILTERS.priority)              sp.set("priority",      merged.priority);
  if (merged.status   !== DEFAULT_SUPPORT_FILTERS.status)                sp.set("status",        merged.status);
  if (merged.category !== DEFAULT_SUPPORT_FILTERS.category)              sp.set("category",      merged.category);
  if (merged.assignee !== DEFAULT_SUPPORT_FILTERS.assignee)              sp.set("assignee",      merged.assignee);
  if (merged.timeframeDays !== DEFAULT_SUPPORT_FILTERS.timeframeDays)    sp.set("timeframeDays", String(merged.timeframeDays));
  if (merged.page     > 1)                                               sp.set("page",          String(merged.page));
  if (merged.ticket)                                                     sp.set("ticket",        merged.ticket);
  return sp;
}
