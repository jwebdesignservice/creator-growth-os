import type { QaCheckStatus } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   URL-state for /dev/qa-checklist filters and expand state.

   Source of truth: the URL search params. Filter changes write to the URL
   via router.replace(); the server component re-renders from the new URL.
   ───────────────────────────────────────────────────────────────────────── */

export type QaRawSearchParams = Record<string, string | string[] | undefined>;

export type QaFilterState = {
  /** Free-text search across area titles, check titles, and owners. */
  q: string;
  /** Selected release version (e.g. "v1.4.2"). */
  release: string;
  /** "All statuses" or one of pending/passed/review/blocker. */
  status: "all" | QaCheckStatus;
  /** Owner team. "All teams" = unfiltered. */
  owner: string;
  environment: string;
  /** View grouping. "area" = group by area; "flat" = ungrouped list. */
  view: "area" | "flat";
  /** Comma-separated set of expanded area keys (server-driven). */
  expanded: string[];
};

export const DEFAULT_QA_FILTERS: QaFilterState = {
  q: "",
  release: "v1.4.2",
  status: "all",
  owner: "all",
  environment: "Production",
  view: "area",
  expanded: [],
};

function pickString(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function isCheckStatus(v: string): v is QaCheckStatus {
  return v === "pending" || v === "passed" || v === "review" || v === "blocker";
}

export function parseQaFilters(raw: QaRawSearchParams): QaFilterState {
  const status = (pickString(raw.status) ?? "").toLowerCase();
  const view   = (pickString(raw.view)   ?? "").toLowerCase();
  const expanded = pickString(raw.expanded);
  return {
    q:           (pickString(raw.q) ?? "").trim(),
    release:     pickString(raw.release) ?? DEFAULT_QA_FILTERS.release,
    status:      status === "all" || status === "" ? "all" : isCheckStatus(status) ? status : "all",
    owner:       pickString(raw.owner) ?? "all",
    environment: pickString(raw.environment) ?? "Production",
    view:        view === "flat" ? "flat" : "area",
    expanded:    expanded ? expanded.split(",").filter(Boolean) : [],
  };
}

export function buildQaSearch(filters: Partial<QaFilterState>): URLSearchParams {
  const p = new URLSearchParams();
  if (filters.q)                                    p.set("q", filters.q);
  if (filters.release && filters.release !== DEFAULT_QA_FILTERS.release) p.set("release", filters.release);
  if (filters.status && filters.status !== "all")   p.set("status", filters.status);
  if (filters.owner && filters.owner !== "all")     p.set("owner", filters.owner);
  if (filters.environment && filters.environment !== "Production") p.set("environment", filters.environment);
  if (filters.view && filters.view !== "area")      p.set("view", filters.view);
  if (filters.expanded && filters.expanded.length)  p.set("expanded", filters.expanded.join(","));
  return p;
}

/* ── Dropdown option lists ───────────────────────────────────────────────── */

export const QA_STATUS_OPTIONS: { value: QaFilterState["status"]; label: string }[] = [
  { value: "all",     label: "All statuses" },
  { value: "passed",  label: "Passed"       },
  { value: "review",  label: "Needs Review" },
  { value: "blocker", label: "Blocker"      },
  { value: "pending", label: "Pending"      },
];

export const QA_OWNER_OPTIONS: { value: string; label: string }[] = [
  { value: "all",      label: "All teams" },
  { value: "Core",     label: "Core"      },
  { value: "Auth",     label: "Auth"      },
  { value: "Billing",  label: "Billing"   },
  { value: "Notifs",   label: "Notifs"    },
  { value: "Perf",     label: "Perf"      },
  { value: "Frontend", label: "Frontend"  },
  { value: "A11y",     label: "A11y"      },
];

export const QA_ENVIRONMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "Production", label: "Production" },
  { value: "Staging",    label: "Staging"    },
  { value: "Preview",    label: "Preview"    },
];

export const QA_VIEW_OPTIONS: { value: QaFilterState["view"]; label: string }[] = [
  { value: "area", label: "Grouped by area" },
  { value: "flat", label: "Flat list"       },
];
