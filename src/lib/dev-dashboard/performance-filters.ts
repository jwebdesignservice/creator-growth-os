/**
 * URL-state plumbing for /dev/performance filters + table sort.
 *
 * Filters live in the query string so the page is shareable / bookmarkable
 * and a saved-view application is just a URL push. Defaults match the
 * visible select values in the filter bar; empty / "all" values are
 * dropped from the URL so it stays clean.
 */

export type PerfTimeRange =
  | "Last 1 hour"
  | "Last 6 hours"
  | "Last 24 hours"
  | "Last 7 days"
  | "Last 30 days";

export type PerfGranularity = "1m" | "5m" | "15m" | "1h" | "1d";

export type PerfEnvironment = "Production" | "Staging" | "Preview" | "Development";

export type ServiceSortKey =
  | "service"
  | "rpm"
  | "p50"
  | "p95"
  | "p99"
  | "errorRate"
  | "apdex"
  | "cpu"
  | "memory"
  | "status";

export type SortDirection = "asc" | "desc";

export type PerformanceFilters = {
  q: string;
  service: string;           // "" = all
  route: string;             // "" = all
  environment: PerfEnvironment;
  timeRange: PerfTimeRange;
  granularity: PerfGranularity;
  compare: boolean;
  sortBy: ServiceSortKey;
  sortDir: SortDirection;
};

export const DEFAULT_PERFORMANCE_FILTERS: PerformanceFilters = {
  q: "",
  service: "",
  route: "",
  environment: "Production",
  timeRange: "Last 24 hours",
  granularity: "5m",
  compare: false,
  sortBy: "service",
  sortDir: "asc",
};

const TIME_RANGES: readonly PerfTimeRange[] = [
  "Last 1 hour",
  "Last 6 hours",
  "Last 24 hours",
  "Last 7 days",
  "Last 30 days",
];

const GRANULARITIES: readonly PerfGranularity[] = ["1m", "5m", "15m", "1h", "1d"];

const ENVIRONMENTS: readonly PerfEnvironment[] = [
  "Production",
  "Staging",
  "Preview",
  "Development",
];

const SORT_KEYS: readonly ServiceSortKey[] = [
  "service", "rpm", "p50", "p95", "p99",
  "errorRate", "apdex", "cpu", "memory", "status",
];

/** Map "Last X" → number of seconds for `now() - interval`. */
export function timeRangeToSeconds(tr: PerfTimeRange): number {
  switch (tr) {
    case "Last 1 hour":   return 60 * 60;
    case "Last 6 hours":  return 6 * 60 * 60;
    case "Last 24 hours": return 24 * 60 * 60;
    case "Last 7 days":   return 7 * 24 * 60 * 60;
    case "Last 30 days":  return 30 * 24 * 60 * 60;
  }
}

/** Map granularity label → bucket size in seconds. */
export function granularityToSeconds(g: PerfGranularity): number {
  switch (g) {
    case "1m":  return 60;
    case "5m":  return 5 * 60;
    case "15m": return 15 * 60;
    case "1h":  return 60 * 60;
    case "1d":  return 24 * 60 * 60;
  }
}

/** How many buckets fit in the selected time range at the selected granularity. */
export function bucketCount(filters: Pick<PerformanceFilters, "timeRange" | "granularity">): number {
  return Math.max(2, Math.ceil(timeRangeToSeconds(filters.timeRange) / granularityToSeconds(filters.granularity)));
}

/** Parse Next.js search params (or URLSearchParams) into a validated filter object. */
export function parsePerformanceFilters(
  sp: Record<string, string | string[] | undefined> | URLSearchParams,
): PerformanceFilters {
  const get = (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const env  = (get("env") ?? DEFAULT_PERFORMANCE_FILTERS.environment) as PerfEnvironment;
  const tr   = (get("tr")  ?? DEFAULT_PERFORMANCE_FILTERS.timeRange)   as PerfTimeRange;
  const gran = (get("g")   ?? DEFAULT_PERFORMANCE_FILTERS.granularity) as PerfGranularity;
  const sb   = (get("sb")  ?? DEFAULT_PERFORMANCE_FILTERS.sortBy)      as ServiceSortKey;
  const sd   = (get("sd")  ?? DEFAULT_PERFORMANCE_FILTERS.sortDir)     as SortDirection;

  return {
    q:           get("q")       ?? "",
    service:     get("service") ?? "",
    route:       get("route")   ?? "",
    environment: ENVIRONMENTS.includes(env)     ? env  : DEFAULT_PERFORMANCE_FILTERS.environment,
    timeRange:   TIME_RANGES.includes(tr)       ? tr   : DEFAULT_PERFORMANCE_FILTERS.timeRange,
    granularity: GRANULARITIES.includes(gran)   ? gran : DEFAULT_PERFORMANCE_FILTERS.granularity,
    compare:     get("cmp") === "1",
    sortBy:      SORT_KEYS.includes(sb)         ? sb   : DEFAULT_PERFORMANCE_FILTERS.sortBy,
    sortDir:     sd === "desc" ? "desc" : "asc",
  };
}

/**
 * Serialize a partial filter update into a new search-param string.
 * Empty / default values are dropped so the URL stays clean — a "Reset
 * filters" produces `/dev/performance` with no params.
 */
export function buildPerformanceSearch(filters: Partial<PerformanceFilters>): string {
  const sp = new URLSearchParams();
  if (filters.q)       sp.set("q",       filters.q);
  if (filters.service) sp.set("service", filters.service);
  if (filters.route)   sp.set("route",   filters.route);
  if (filters.environment && filters.environment !== DEFAULT_PERFORMANCE_FILTERS.environment) {
    sp.set("env", filters.environment);
  }
  if (filters.timeRange && filters.timeRange !== DEFAULT_PERFORMANCE_FILTERS.timeRange) {
    sp.set("tr", filters.timeRange);
  }
  if (filters.granularity && filters.granularity !== DEFAULT_PERFORMANCE_FILTERS.granularity) {
    sp.set("g", filters.granularity);
  }
  if (filters.compare) sp.set("cmp", "1");
  if (filters.sortBy && filters.sortBy !== DEFAULT_PERFORMANCE_FILTERS.sortBy) {
    sp.set("sb", filters.sortBy);
  }
  if (filters.sortDir && filters.sortDir !== DEFAULT_PERFORMANCE_FILTERS.sortDir) {
    sp.set("sd", filters.sortDir);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/** Pretty time labels for the chart x-axis based on filters. */
export function buildXAxisLabels(filters: Pick<PerformanceFilters, "timeRange" | "granularity">): string[] {
  const buckets = bucketCount(filters);
  // Show roughly 7 labels max — fewer for long ranges, denser for short ones.
  const labelCount = Math.min(7, buckets);
  const now = Date.now();
  const totalSec = timeRangeToSeconds(filters.timeRange);
  const stepSec = totalSec / (labelCount - 1);

  const labels: string[] = [];
  for (let i = 0; i < labelCount; i++) {
    const ts = new Date(now - (labelCount - 1 - i) * stepSec * 1000);
    labels.push(formatTimeLabel(ts, filters.timeRange));
  }
  return labels;
}

function formatTimeLabel(ts: Date, tr: PerfTimeRange): string {
  if (tr === "Last 7 days" || tr === "Last 30 days") {
    return ts.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  }
  return ts.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}
