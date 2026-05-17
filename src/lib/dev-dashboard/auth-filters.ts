/* ─────────────────────────────────────────────────────────────────────────
   URL-state for /dev/auth filters + pagination.

   Search params are the single source of truth — server queries read them,
   the client filter bar writes them, and "Reset filters" wipes them. This
   keeps the page shareable, refresh-safe, and re-renders correctly under
   Next.js streaming.
   ───────────────────────────────────────────────────────────────────────── */

export const AUTH_EVENTS_PAGE_SIZE = 6;

export type AuthRawSearchParams = Record<string, string | string[] | undefined>;

/** Canonical filter values. Mirrors the DB enums where applicable. */
export type AuthFilterProvider =
  | "all"
  | "email"
  | "google"
  | "apple"
  | "magic_link"
  | "github"
  | "other";

export type AuthFilterStatus =
  | "all"
  | "success"
  | "tracked"
  | "warning"
  | "danger";

export type AuthFilterState = {
  /** Free-text search across event / user / provider / route / status. */
  q: string;
  provider: AuthFilterProvider;
  status: AuthFilterStatus;
  environment: string;
  /** Inclusive lookback window in hours. */
  timeframeHours: 1 | 24 | 168 | 720;
  /** When true, only events with the `suspicious` flag set are returned. */
  suspiciousOnly: boolean;
  /** 1-based page index. */
  page: number;
};

export const DEFAULT_AUTH_FILTERS: AuthFilterState = {
  q: "",
  provider: "all",
  status: "all",
  environment: "Production",
  timeframeHours: 24,
  suspiciousOnly: false,
  page: 1,
};

/* ── String/number parsing helpers ───────────────────────────────────────── */

function pickString(v: string | string[] | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function isProvider(v: string): v is AuthFilterProvider {
  return (
    v === "email" ||
    v === "google" ||
    v === "apple" ||
    v === "magic_link" ||
    v === "github" ||
    v === "other"
  );
}

function isStatus(v: string): v is Exclude<AuthFilterStatus, "all"> {
  return v === "success" || v === "tracked" || v === "warning" || v === "danger";
}

function parseTimeframe(v: string | null): AuthFilterState["timeframeHours"] {
  if (v === "1h" || v === "1")  return 1;
  if (v === "7d" || v === "168") return 168;
  if (v === "30d" || v === "720") return 720;
  return 24;
}

/** Parse Next.js searchParams into the canonical filter state. */
export function parseAuthFilters(raw: AuthRawSearchParams): AuthFilterState {
  const provRaw   = pickString(raw.provider)?.toLowerCase() ?? "";
  const statusRaw = pickString(raw.status)?.toLowerCase() ?? "";
  const susRaw    = pickString(raw.suspicious);
  const pageRaw   = pickString(raw.page);

  const pageNum = Math.max(1, Number.parseInt(pageRaw ?? "1", 10) || 1);

  return {
    q:              (pickString(raw.q) ?? "").trim(),
    provider:       provRaw === "all" || provRaw === "" ? "all" : isProvider(provRaw) ? provRaw : "all",
    status:         statusRaw === "all" || statusRaw === "" ? "all" : isStatus(statusRaw) ? statusRaw : "all",
    environment:    pickString(raw.environment) ?? "Production",
    timeframeHours: parseTimeframe(pickString(raw.timeframe)),
    suspiciousOnly: susRaw === "1" || susRaw === "true",
    page:           pageNum,
  };
}

/* ── Building URLSearchParams (client side) ──────────────────────────────── */

export function buildAuthSearch(filters: Partial<AuthFilterState>): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q)                                                   params.set("q", filters.q);
  if (filters.provider && filters.provider !== "all")              params.set("provider", filters.provider);
  if (filters.status   && filters.status   !== "all")              params.set("status", filters.status);
  if (filters.environment && filters.environment !== "Production") params.set("environment", filters.environment);
  if (filters.timeframeHours && filters.timeframeHours !== 24) {
    params.set(
      "timeframe",
      filters.timeframeHours === 1 ? "1h" : filters.timeframeHours === 168 ? "7d" : "30d",
    );
  }
  if (filters.suspiciousOnly)                  params.set("suspicious", "1");
  if (filters.page && filters.page > 1)        params.set("page", String(filters.page));
  return params;
}

/* ── Dropdown option lists for the filter bar UI ─────────────────────────── */

export const PROVIDER_OPTIONS: { value: AuthFilterProvider; label: string }[] = [
  { value: "all",        label: "All providers"  },
  { value: "email",      label: "Email / Password" },
  { value: "google",     label: "Google"         },
  { value: "apple",      label: "Apple"          },
  { value: "magic_link", label: "Magic Link"     },
  { value: "github",     label: "GitHub"         },
  { value: "other",      label: "Other"          },
];

export const STATUS_OPTIONS: { value: AuthFilterStatus; label: string }[] = [
  { value: "all",     label: "All statuses" },
  { value: "success", label: "Success"      },
  { value: "tracked", label: "Tracked"      },
  { value: "warning", label: "Warning"      },
  { value: "danger",  label: "Failure"      },
];

export const ENVIRONMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "Production", label: "Production" },
  { value: "Staging",    label: "Staging"    },
  { value: "Preview",    label: "Preview"    },
];

export const TIMEFRAME_OPTIONS: { value: AuthFilterState["timeframeHours"]; label: string }[] = [
  { value: 1,   label: "Last hour"    },
  { value: 24,  label: "Last 24 hours" },
  { value: 168, label: "Last 7 days"  },
  { value: 720, label: "Last 30 days" },
];

/* ── Display helpers (used by the events table + detail modal) ───────────── */

export function providerLabel(p: AuthFilterProvider | string): string {
  switch (p) {
    case "email":      return "Email / Password";
    case "google":     return "Google";
    case "apple":      return "Apple";
    case "magic_link": return "Magic Link";
    case "github":     return "GitHub";
    case "other":      return "Other";
    default:           return p;
  }
}
