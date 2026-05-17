/**
 * URL-state plumbing for /dev/logs filters.
 *
 * Filters live in the query string so the page is shareable / bookmarkable
 * and a saved-view application is just a URL push. Defaults match the
 * visible select values in the filter bar; an empty string means "no
 * filter" so the URL stays clean.
 */

import type { LiveLogLevel } from "./types";

export type LogsTimeframe =
  | "Last 15 minutes"
  | "Last 30 minutes"
  | "Last 1 hour"
  | "Last 6 hours"
  | "Last 24 hours"
  | "Last 7 days";

export type LogsEnvironment = "Production" | "Staging" | "Preview" | "Development";

export type LogsFilters = {
  q: string;                   // free-text search
  service: string;             // empty | "frontend" | "backend-api" | …
  level: LiveLogLevel | "";    // empty | "INFO" | "WARN" | "ERROR" | "DEBUG"
  source: string;              // empty | "web" | "api" | …
  environment: LogsEnvironment;
  timeframe: LogsTimeframe;
  page: number;                // 1-indexed
  /** Selected log row id — drives the Selected Log Details panel. */
  selectedId: string | null;
};

export const DEFAULT_LOGS_FILTERS: LogsFilters = {
  q: "",
  service: "",
  level: "",
  source: "",
  environment: "Production",
  timeframe: "Last 30 minutes",
  page: 1,
  selectedId: null,
};

/** Map "Last X minutes/hours/days" → number of seconds for `now() - interval`. */
export function timeframeToSeconds(tf: LogsTimeframe): number {
  switch (tf) {
    case "Last 15 minutes": return 15 * 60;
    case "Last 30 minutes": return 30 * 60;
    case "Last 1 hour":     return 60 * 60;
    case "Last 6 hours":    return 6 * 60 * 60;
    case "Last 24 hours":   return 24 * 60 * 60;
    case "Last 7 days":     return 7 * 24 * 60 * 60;
  }
}

/** Parse search params (from Next.js page props) into a validated filter object. */
export function parseLogsFilters(
  sp: Record<string, string | string[] | undefined> | URLSearchParams,
): LogsFilters {
  const get = (k: string): string | undefined => {
    if (sp instanceof URLSearchParams) return sp.get(k) ?? undefined;
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const level = (get("level") ?? "") as LiveLogLevel | "";
  const env   = (get("env")   ?? DEFAULT_LOGS_FILTERS.environment) as LogsEnvironment;
  const tf    = (get("tf")    ?? DEFAULT_LOGS_FILTERS.timeframe)   as LogsTimeframe;

  return {
    q:           get("q")       ?? "",
    service:     get("service") ?? "",
    level:       (["INFO", "WARN", "ERROR", "DEBUG"] as const).includes(level as LiveLogLevel)
                  ? level : "",
    source:      get("source")  ?? "",
    environment: (["Production", "Staging", "Preview", "Development"] as const).includes(env)
                  ? env : DEFAULT_LOGS_FILTERS.environment,
    timeframe:   ([
                    "Last 15 minutes", "Last 30 minutes", "Last 1 hour",
                    "Last 6 hours",    "Last 24 hours",   "Last 7 days",
                  ] as const).includes(tf) ? tf : DEFAULT_LOGS_FILTERS.timeframe,
    page:        Math.max(1, Number.parseInt(get("page") ?? "1", 10) || 1),
    selectedId:  get("sel") ?? null,
  };
}

/** Serialize a partial filter update into a new search-param string. Empty
 *  values are dropped so the URL stays clean. Falls back to defaults so
 *  a "Reset filters" produces `/dev/logs` with no params. */
export function buildLogsSearch(filters: Partial<LogsFilters>): string {
  const sp = new URLSearchParams();
  if (filters.q)       sp.set("q",       filters.q);
  if (filters.service) sp.set("service", filters.service);
  if (filters.level)   sp.set("level",   filters.level);
  if (filters.source)  sp.set("source",  filters.source);
  if (filters.environment && filters.environment !== DEFAULT_LOGS_FILTERS.environment) {
    sp.set("env", filters.environment);
  }
  if (filters.timeframe && filters.timeframe !== DEFAULT_LOGS_FILTERS.timeframe) {
    sp.set("tf", filters.timeframe);
  }
  if (filters.page && filters.page > 1) sp.set("page", String(filters.page));
  if (filters.selectedId)               sp.set("sel",  filters.selectedId);
  const s = sp.toString();
  return s ? `?${s}` : "";
}
