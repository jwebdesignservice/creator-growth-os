import type { ErrorSeverity, ErrorStatus } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   URL-state for /dev/errors filters + pagination.

   Search params are the single source of truth — server queries read them,
   the client filter bar writes them, and "Reset filters" wipes them. This
   keeps the page shareable, refresh-safe, and re-renders correctly under
   Next.js streaming.
   ───────────────────────────────────────────────────────────────────────── */

export const ERRORS_PAGE_SIZE = 8;

export type ErrorsRawSearchParams = Record<string, string | string[] | undefined>;

export type ErrorsFilterState = {
  /** Free-text search across message / id / route / owner. */
  q: string;
  severity: "all" | ErrorSeverity;
  /** Service / source label (case-insensitive equality). "all" = unfiltered. */
  source: string;
  status: "all" | ErrorStatus;
  environment: string;
  /** Inclusive lookback window in hours. */
  timeframeHours: 24 | 168 | 720;
  groupedByFingerprint: boolean;
  /** 1-based page index. */
  page: number;
};

export const DEFAULT_ERRORS_FILTERS: ErrorsFilterState = {
  q: "",
  severity: "all",
  source: "all",
  status: "open",
  environment: "Production",
  timeframeHours: 24,
  groupedByFingerprint: true,
  page: 1,
};

/* ── String/number parsing helpers ───────────────────────────────────────── */

function pickString(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function isSeverity(v: string): v is ErrorSeverity {
  return v === "critical" || v === "high" || v === "medium" || v === "low";
}
function isStatus(v: string): v is ErrorStatus {
  return v === "open" || v === "investigating" || v === "resolved";
}
function parseTimeframe(v: string | null): ErrorsFilterState["timeframeHours"] {
  if (v === "1h" || v === "1") return 24; // tolerant: only valid windows below
  if (v === "168" || v === "7d") return 168;
  if (v === "720" || v === "30d") return 720;
  return 24;
}

/** Parse Next.js searchParams into the canonical filter state. */
export function parseErrorsFilters(raw: ErrorsRawSearchParams): ErrorsFilterState {
  const sevRaw    = pickString(raw.severity)?.toLowerCase() ?? "";
  const statusRaw = pickString(raw.status)?.toLowerCase() ?? "";
  const groupRaw  = pickString(raw.grouped);
  const pageRaw   = pickString(raw.page);

  const pageNum = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  return {
    q:                    (pickString(raw.q) ?? "").trim(),
    severity:             sevRaw === "all" || sevRaw === "" ? "all" : isSeverity(sevRaw) ? sevRaw : "all",
    source:               pickString(raw.source) ?? "all",
    status:               statusRaw === "all" ? "all" : isStatus(statusRaw) ? statusRaw : "open",
    environment:          pickString(raw.environment) ?? "Production",
    timeframeHours:       parseTimeframe(pickString(raw.timeframe)),
    groupedByFingerprint: groupRaw === null ? true : groupRaw !== "0" && groupRaw !== "false",
    page:                 pageNum,
  };
}

/* ── Building URLSearchParams (client side) ──────────────────────────────── */

export function buildErrorsSearch(filters: Partial<ErrorsFilterState>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q)                            params.set("q", filters.q);
  if (filters.severity && filters.severity !== "all")     params.set("severity", filters.severity);
  if (filters.source && filters.source !== "all")         params.set("source", filters.source);
  if (filters.status && filters.status !== "open")        params.set("status", filters.status);
  if (filters.environment && filters.environment !== "Production") params.set("environment", filters.environment);
  if (filters.timeframeHours && filters.timeframeHours !== 24) {
    params.set("timeframe", filters.timeframeHours === 168 ? "7d" : "30d");
  }
  if (filters.groupedByFingerprint === false) params.set("grouped", "0");
  if (filters.page && filters.page > 1)       params.set("page", String(filters.page));
  return params;
}

/* ── Dropdown option lists for the filter bar UI ─────────────────────────── */

export const SEVERITY_OPTIONS: { value: ErrorsFilterState["severity"]; label: string }[] = [
  { value: "all",      label: "All"      },
  { value: "critical", label: "Critical" },
  { value: "high",     label: "High"     },
  { value: "medium",   label: "Medium"   },
  { value: "low",      label: "Low"      },
];

export const SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "all",          label: "All services" },
  { value: "Frontend",     label: "Frontend"     },
  { value: "Backend API",  label: "Backend API"  },
  { value: "Database",     label: "Database"     },
  { value: "Auth",         label: "Auth"         },
  { value: "Notifications",label: "Notifications"},
  { value: "Payments",     label: "Payments"     },
  { value: "Storage",      label: "Storage"      },
];

export const STATUS_OPTIONS: { value: ErrorsFilterState["status"]; label: string }[] = [
  { value: "all",           label: "All"           },
  { value: "open",          label: "Open"          },
  { value: "investigating", label: "Investigating" },
  { value: "resolved",      label: "Resolved"      },
];

export const ENVIRONMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "Production", label: "Production" },
  { value: "Staging",    label: "Staging"    },
  { value: "Preview",    label: "Preview"    },
];

export const TIMEFRAME_OPTIONS: { value: ErrorsFilterState["timeframeHours"]; label: string }[] = [
  { value: 24,  label: "Last 24 hours" },
  { value: 168, label: "Last 7 days"   },
  { value: 720, label: "Last 30 days"  },
];

/* ── Misc ────────────────────────────────────────────────────────────────── */

export const ERROR_TRENDS_METRIC_OPTIONS = [
  { value: "total",   label: "Total Errors" },
  { value: "users",   label: "Affected Users" },
  { value: "critical",label: "Critical Only" },
] as const;
export type ErrorTrendsMetric = (typeof ERROR_TRENDS_METRIC_OPTIONS)[number]["value"];
