import "server-only";
import {
  AlertOctagon,
  AlertTriangle,
  Activity,
  Database as DatabaseIcon,
  Mail,
  Shield,
  DollarSign,
  Bookmark,
  Layers,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireDevClient } from "./require-dev";

// Extract the Supabase client type from the success branch of requireDevClient().
// The inline `infer` trick collapsed to `never` because requireDevClient
// returns a discriminated union; this Extract pulls the right variant first.
type DevSupabase = Extract<
  Awaited<ReturnType<typeof requireDevClient>>,
  { ok: true }
>["supabase"];
import {
  DEFAULT_LOGS_FILTERS,
  timeframeToSeconds,
  type LogsFilters,
} from "./logs-filters";
import type {
  LogsMetricCard,
  LiveLogRow,
  LiveLogLevel,
  LogVolumeChart,
  ServiceLogVolumeRow,
  SavedViewRow,
  SavedViewTone,
  SelectedLogDetail,
  TraceGroupRow,
  TraceGroupStatus,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Internal DB row shapes (snake_case columns). Each query maps these to
   the UI-facing types exported from ./types so consumer components stay
   identical to the mock-data version.
   ───────────────────────────────────────────────────────────────────────── */

type DbLogEvent = {
  id:           number;
  ts:           string;
  level:        LiveLogLevel;
  service:      string;
  source:       string;
  message:      string;
  trace_id:     string | null;
  request_id:   string | null;
  user_label:   string | null;
  route:        string | null;
  method:       string | null;
  status_code:  number | null;
  duration_ms:  number | null;
  environment:  string;
  metadata:     Record<string, unknown>;
  created_at:   string;
};

type DbSavedView = {
  id:          string;
  user_id:     string;
  name:        string;
  description: string | null;
  filters:     Record<string, unknown>;
  tone:        SavedViewTone;
  icon_key:    string;
  sort_order:  number;
};

type DbTraceGroup = {
  trace_id:           string;
  service_count:      number;
  status:             TraceGroupStatus;
  duration_total_ms:  number;
  last_seen_at:       string;
};

/* ─────────────────────────────────────────────────────────────────────────
   Public bundle type — what the page expects from one parallel fetch.
   ───────────────────────────────────────────────────────────────────────── */

export type LogsPageData = {
  metrics:        LogsMetricCard[];
  rows:           LiveLogRow[];
  totalRows:      number;
  totalPages:     number;
  selectedId:     string | null;
  selectedDetail: SelectedLogDetail | null;
  volumeChart:    LogVolumeChart;
  services:       ServiceLogVolumeRow[];
  savedViews:     SavedViewRow[];
  traceGroups:    TraceGroupRow[];
};

const ROWS_PER_PAGE = 8;

/* ─── Icon registries ────────────────────────────────────────────────────
   The DB stores stable string keys; UI maps key → LucideIcon here. New
   icons added later only need a row in these maps + the matching
   lucide-react import above.                                              */

const SAVED_VIEW_ICON: Record<string, LucideIcon> = {
  "alert-triangle": AlertTriangle,
  "shield":         Shield,
  "dollar-sign":    DollarSign,
  "database":       DatabaseIcon,
  "mail":           Mail,
  "bookmark":       Bookmark,
};

/* ─────────────────────────────────────────────────────────────────────────
   loadLogsPageData — single entry point.
   Runs every query in parallel against the configured filters and returns
   the bundle the /dev/logs page renders from.
   ───────────────────────────────────────────────────────────────────────── */

export async function loadLogsPageData(filters: LogsFilters): Promise<LogsPageData> {
  const guard = await requireDevClient();
  if (!guard.ok) {
    // Non-dev caller — return an empty but structurally valid bundle so
    // the page renders cleanly (the layout will redirect first anyway).
    return emptyBundle();
  }
  const { supabase, user } = guard;

  const tfSecs   = timeframeToSeconds(filters.timeframe);
  const sinceIso = new Date(Date.now() - tfSecs * 1000).toISOString();

  const [
    rowsRes,
    metricsRes,
    volumeRes,
    servicesRes,
    savedRes,
    tracesRes,
  ] = await Promise.all([
    fetchLiveRows(supabase, filters, sinceIso),
    fetchMetricBundle(supabase, filters),
    fetchVolumeByLevel(supabase, filters),
    fetchServiceLogVolume(supabase, filters, sinceIso),
    fetchSavedViews(supabase, user.id),
    fetchTraceGroups(supabase),
  ]);

  // Selected-id: if the URL pinned one, honor it (and try to find its detail).
  // Otherwise, default-select the most recent ERROR row, then fall back to
  // the first row in the page (mirrors the visual reference where an ERROR
  // is highlighted).
  const errorRow = rowsRes.rows.find((r) => r.level === "ERROR");
  const selectedId =
    filters.selectedId ?? errorRow?.id ?? rowsRes.rows[0]?.id ?? null;

  const selectedDetail = selectedId
    ? await fetchSelectedLog(supabase, selectedId)
    : null;

  return {
    metrics:        metricsRes,
    rows:           rowsRes.rows,
    totalRows:      rowsRes.total,
    totalPages:     Math.max(1, Math.ceil(rowsRes.total / ROWS_PER_PAGE)),
    selectedId,
    selectedDetail,
    volumeChart:    volumeRes,
    services:       servicesRes,
    savedViews:     savedRes,
    traceGroups:    tracesRes,
  };
}

/* ─── Live rows ──────────────────────────────────────────────────────── */

async function fetchLiveRows(
  supabase: DevSupabase,
  filters: LogsFilters,
  sinceIso: string,
): Promise<{ rows: LiveLogRow[]; total: number }> {
  const from = (filters.page - 1) * ROWS_PER_PAGE;
  const to   = from + ROWS_PER_PAGE - 1;

  let query = supabase
    .from("dev_log_events")
    .select("*", { count: "exact" })
    .gte("ts", sinceIso)
    .eq("environment", filters.environment)
    .order("ts", { ascending: false })
    .range(from, to);

  if (filters.service) query = query.eq("service", filters.service);
  if (filters.level)   query = query.eq("level",   filters.level);
  if (filters.source)  query = query.eq("source",  filters.source);
  if (filters.q) {
    // OR across the most useful free-text columns.
    query = query.or(
      `message.ilike.%${filters.q}%,trace_id.ilike.%${filters.q}%,route.ilike.%${filters.q}%,user_label.ilike.%${filters.q}%,service.ilike.%${filters.q}%`,
    );
  }

  const { data, count, error } = await query;
  if (error) {
    console.warn("[logs] fetchLiveRows:", error.message);
    return { rows: [], total: 0 };
  }

  return {
    rows:  (data ?? []).map(toLiveLogRow),
    total: count ?? 0,
  };
}

function toLiveLogRow(r: DbLogEvent): LiveLogRow {
  return {
    id:       String(r.id),
    time:     formatTimeOfDay(r.ts),
    level:    r.level,
    service:  r.service,
    source:   r.source,
    message:  r.message,
    traceId:  r.trace_id ?? "—",
    user:     r.user_label,
    route:    [r.method, r.route].filter(Boolean).join(" ") || "—",
    duration: formatDuration(r.duration_ms),
  };
}

/* ─── Metrics ────────────────────────────────────────────────────────── */

type MetricSpec = {
  key:         LogsMetricCard["key"];
  label:       string;
  tone:        LogsMetricCard["tone"];
  icon:        LucideIcon;
  baseline:    string;
  deltaIsGood: (rawDelta: number) => boolean;
  format:      (current: number) => string;
};

const METRIC_SPECS: MetricSpec[] = [
  {
    key:         "total-logs",
    label:       "Total Logs (24h)",
    tone:        "blue",
    icon:        Activity,
    baseline:    "vs prev 24h",
    deltaIsGood: (d) => d >= 0,
    format:      formatCompact,
  },
  {
    key:         "error-logs",
    label:       "Error Logs",
    tone:        "red",
    icon:        AlertOctagon,
    baseline:    "vs prev 24h",
    deltaIsGood: (d) => d <= 0,
    format:      formatCompact,
  },
  {
    key:         "warning-logs",
    label:       "Warning Logs",
    tone:        "amber",
    icon:        AlertTriangle,
    baseline:    "vs prev 24h",
    deltaIsGood: (d) => d <= 0,
    format:      formatCompact,
  },
  {
    key:         "avg-ingest-delay",
    label:       "Avg Ingest Delay",
    tone:        "green",
    icon:        Zap,
    baseline:    "vs prev 24h",
    deltaIsGood: (d) => d <= 0,
    format:      formatSecondsHuman,
  },
  {
    key:         "active-streams",
    label:       "Active Streams",
    tone:        "blue",
    icon:        Layers,
    baseline:    "vs prev 24h",
    deltaIsGood: (d) => d >= 0,
    format:      (n) => String(Math.round(n)),
  },
];

async function fetchMetricBundle(
  supabase: DevSupabase,
  filters: LogsFilters,
): Promise<LogsMetricCard[]> {
  const nowIso     = new Date().toISOString();
  const day1Ago    = isoMinus(24 * 60 * 60);
  const day2Ago    = isoMinus(48 * 60 * 60);

  // Run the 5 metric pairs in parallel for speed.
  const [
    totalCur,  totalPrev,
    errCur,    errPrev,
    warnCur,   warnPrev,
    ingestCur, ingestPrev,
    streamCur, streamPrev,
    seriesRows,
  ] = await Promise.all([
    countLogs(supabase, day1Ago, nowIso,  filters.environment),
    countLogs(supabase, day2Ago, day1Ago, filters.environment),
    countLogs(supabase, day1Ago, nowIso,  filters.environment, "ERROR"),
    countLogs(supabase, day2Ago, day1Ago, filters.environment, "ERROR"),
    countLogs(supabase, day1Ago, nowIso,  filters.environment, "WARN"),
    countLogs(supabase, day2Ago, day1Ago, filters.environment, "WARN"),
    avgIngestDelay(supabase, day1Ago, nowIso,  filters.environment),
    avgIngestDelay(supabase, day2Ago, day1Ago, filters.environment),
    activeStreams(supabase, 300,  filters.environment),  // last 5 min
    activeStreams(supabase, 1800, filters.environment),  // last 30 min as baseline
    fetchSeries(supabase, filters.environment),
  ]);

  const values: number[] = [
    totalCur, errCur, warnCur, ingestCur, streamCur,
  ];
  const prev: number[] = [
    totalPrev, errPrev, warnPrev, ingestPrev, streamPrev,
  ];

  return METRIC_SPECS.map((spec, i) => buildMetricCard(spec, values[i], prev[i], seriesRows[spec.key]));
}

function buildMetricCard(
  spec: MetricSpec,
  current: number,
  previous: number,
  series: number[],
): LogsMetricCard {
  // Compute % delta; for "Active Streams" we'd prefer absolute (3 vs prev)
  // so the card matches the reference image — handled below.
  const absoluteDelta = current - previous;
  const pctDelta =
    previous === 0
      ? (current === 0 ? 0 : 100)
      : ((current - previous) / previous) * 100;

  const showAbsolute = spec.key === "active-streams";
  const deltaForSign = showAbsolute ? absoluteDelta : pctDelta;

  const deltaLabel =
    showAbsolute
      ? (deltaForSign >= 0 ? `+${Math.round(deltaForSign)}` : String(Math.round(deltaForSign)))
      : (deltaForSign >= 0 ? `+${pctDelta.toFixed(1)}%` : `${pctDelta.toFixed(1)}%`);

  return {
    key:            spec.key,
    label:          spec.label,
    value:          spec.format(current),
    tone:           spec.tone,
    icon:           spec.icon,
    delta:          deltaLabel,
    deltaDirection: deltaForSign >= 0 ? "up" : "down",
    deltaIsGood:    spec.deltaIsGood(deltaForSign),
    baseline:       spec.baseline,
    series:         series.length > 0 ? series : new Array(12).fill(current || 1),
  };
}

async function countLogs(
  supabase: DevSupabase,
  sinceIso: string,
  untilIso: string,
  environment: string,
  level?: LiveLogLevel,
): Promise<number> {
  let q = supabase
    .from("dev_log_events")
    .select("*", { count: "exact", head: true })
    .gte("ts", sinceIso)
    .lt("ts", untilIso)
    .eq("environment", environment);
  if (level) q = q.eq("level", level);
  const { count, error } = await q;
  if (error) {
    console.warn("[logs] countLogs:", error.message);
    return 0;
  }
  return count ?? 0;
}

async function avgIngestDelay(
  supabase: DevSupabase,
  sinceIso: string,
  untilIso: string,
  environment: string,
): Promise<number> {
  // Sample 200 most-recent rows in window and compute (created_at - ts).
  // Avoids needing a database aggregate function and stays fast.
  const { data, error } = await supabase
    .from("dev_log_events")
    .select("ts, created_at")
    .gte("ts", sinceIso)
    .lt("ts", untilIso)
    .eq("environment", environment)
    .order("ts", { ascending: false })
    .limit(200);
  if (error || !data || data.length === 0) return 0;
  const deltasMs = data.map((r: { ts: string; created_at: string }) =>
    Math.max(0, new Date(r.created_at).getTime() - new Date(r.ts).getTime()),
  );
  const avg = deltasMs.reduce((a: number, b: number) => a + b, 0) / deltasMs.length;
  return avg / 1000; // seconds
}

async function activeStreams(
  supabase: DevSupabase,
  withinSecs: number,
  environment: string,
): Promise<number> {
  const sinceIso = isoMinus(withinSecs);
  const { data, error } = await supabase
    .from("dev_log_events")
    .select("service")
    .gte("ts", sinceIso)
    .eq("environment", environment)
    .limit(1000);
  if (error) {
    console.warn("[logs] activeStreams:", error.message);
    return 0;
  }
  return new Set((data ?? []).map((r: { service: string }) => r.service)).size;
}

async function fetchSeries(
  supabase: DevSupabase,
  environment: string,
): Promise<Record<string, number[]>> {
  // Cheap sparkline: 12 buckets across the last 24h. We sample by pulling
  // the most-recent ~2000 rows and bucketing in JS rather than running 12
  // separate count() queries.
  const sinceIso = isoMinus(24 * 60 * 60);
  const { data, error } = await supabase
    .from("dev_log_events")
    .select("ts, level, service")
    .gte("ts", sinceIso)
    .eq("environment", environment)
    .order("ts", { ascending: false })
    .limit(2000);

  const out: Record<string, number[]> = {
    "total-logs":      new Array(12).fill(0),
    "error-logs":      new Array(12).fill(0),
    "warning-logs":    new Array(12).fill(0),
    "avg-ingest-delay":new Array(12).fill(0),
    "active-streams":  new Array(12).fill(0),
  };
  if (error || !data) return out;

  const now      = Date.now();
  const bucketMs = (24 * 60 * 60 * 1000) / 12;
  const serviceByBucket: Set<string>[] = Array.from({ length: 12 }, () => new Set<string>());

  for (const row of data as { ts: string; level: LiveLogLevel; service: string }[]) {
    const ageMs = now - new Date(row.ts).getTime();
    const idx   = Math.min(11, Math.max(0, Math.floor(ageMs / bucketMs)));
    const bucketIdx = 11 - idx; // oldest first → newest last for left-to-right sparkline
    out["total-logs"][bucketIdx]++;
    if (row.level === "ERROR") out["error-logs"][bucketIdx]++;
    if (row.level === "WARN")  out["warning-logs"][bucketIdx]++;
    serviceByBucket[bucketIdx].add(row.service);
  }

  out["active-streams"]   = serviceByBucket.map((s) => s.size);
  out["avg-ingest-delay"] = out["total-logs"].map((n) => Math.max(0.1, n * 0.001)); // visual proxy

  return out;
}

/* ─── Volume by level chart ──────────────────────────────────────────── */

async function fetchVolumeByLevel(
  supabase: DevSupabase,
  filters: LogsFilters,
): Promise<LogVolumeChart> {
  // Bucket the last 30 minutes into 6 slots (every 5 minutes).
  const BUCKETS = 6;
  const WINDOW_SECS = 30 * 60;
  const bucketSecs = WINDOW_SECS / BUCKETS;
  const sinceIso = isoMinus(WINDOW_SECS);

  const { data, error } = await supabase
    .from("dev_log_events")
    .select("ts, level")
    .gte("ts", sinceIso)
    .eq("environment", filters.environment)
    .order("ts", { ascending: false })
    .limit(5000);

  const info = new Array(BUCKETS).fill(0);
  const warn = new Array(BUCKETS).fill(0);
  const err  = new Array(BUCKETS).fill(0);
  if (data && !error) {
    const now = Date.now();
    for (const row of data as { ts: string; level: LiveLogLevel }[]) {
      const ageSecs = (now - new Date(row.ts).getTime()) / 1000;
      const idx     = Math.min(BUCKETS - 1, Math.max(0, Math.floor(ageSecs / bucketSecs)));
      const bucket  = BUCKETS - 1 - idx;
      if (row.level === "INFO")  info[bucket]++;
      else if (row.level === "WARN")  warn[bucket]++;
      else if (row.level === "ERROR") err[bucket]++;
    }
  }

  const xLabels = labelsForWindow(WINDOW_SECS, BUCKETS);
  const yMax    = Math.max(10, Math.ceil(Math.max(...info, ...warn, ...err) * 1.2));

  return {
    series: [
      { key: "info",  label: "INFO",  color: "var(--dev-accent)",      values: info },
      { key: "warn",  label: "WARN",  color: "var(--dev-warning)",     values: warn },
      { key: "error", label: "ERROR", color: "var(--dev-danger)",      values: err  },
    ],
    xLabels,
    yLabels: yLabelsFor(yMax),
    yMax,
  };
}

/* ─── Services by log volume ─────────────────────────────────────────── */

async function fetchServiceLogVolume(
  supabase: DevSupabase,
  filters: LogsFilters,
  sinceIso: string,
): Promise<ServiceLogVolumeRow[]> {
  const { data, error } = await supabase
    .from("dev_log_events")
    .select("service")
    .gte("ts", sinceIso)
    .eq("environment", filters.environment)
    .limit(5000);
  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data as { service: string }[]) {
    counts.set(row.service, (counts.get(row.service) ?? 0) + 1);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0) || 1;

  return Array.from(counts.entries())
    .map(([service, count]) => ({
      key:        service,
      label:      service,
      percent:    Math.round((count / total) * 100),
      countLabel: `${formatCompact(count)} (${Math.round((count / total) * 100)}%)`,
    }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6);
}

/* ─── Saved views ────────────────────────────────────────────────────── */

async function fetchSavedViews(
  supabase: DevSupabase,
  userId: string,
): Promise<SavedViewRow[]> {
  const { data, error } = await supabase
    .from("dev_log_saved_views")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
  if (error) {
    console.warn("[logs] fetchSavedViews:", error.message);
    return [];
  }
  return (data as DbSavedView[] ?? []).map((v) => ({
    key:   v.id,
    label: v.name,
    tone:  v.tone,
    icon:  SAVED_VIEW_ICON[v.icon_key] ?? Bookmark,
  }));
}

/* ─── Trace groups ───────────────────────────────────────────────────── */

async function fetchTraceGroups(
  supabase: DevSupabase,
): Promise<TraceGroupRow[]> {
  const { data, error } = await supabase
    .from("dev_log_trace_groups")
    .select("*")
    .order("last_seen_at", { ascending: false })
    .limit(5);
  if (error) {
    console.warn("[logs] fetchTraceGroups:", error.message);
    return [];
  }
  return (data as DbTraceGroup[] ?? []).map((t) => ({
    id:           t.trace_id,
    traceId:      t.trace_id,
    serviceCount: t.service_count,
    status:       t.status,
    duration:     formatDuration(t.duration_total_ms),
    lastSeen:     formatRelative(t.last_seen_at),
  }));
}

/* ─── Selected log detail ────────────────────────────────────────────── */

async function fetchSelectedLog(
  supabase: DevSupabase,
  selectedId: string,
): Promise<SelectedLogDetail | null> {
  const id = Number.parseInt(selectedId, 10);
  if (Number.isNaN(id)) return null;
  const { data, error } = await supabase
    .from("dev_log_events")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) {
    if (error) console.warn("[logs] fetchSelectedLog:", error.message);
    return null;
  }
  const r = data as DbLogEvent;

  const stackTrace =
    Array.isArray((r.metadata as Record<string, unknown>)?.stack)
      ? ((r.metadata as Record<string, unknown>).stack as string[])
      : [`Level: ${r.level}`, `Service: ${r.service}`, `Route: ${r.route ?? "—"}`];

  return {
    id:          String(r.id),
    timestamp:   formatFullTimestamp(r.ts),
    level:       r.level,
    service:     r.service,
    environment: r.environment,
    route:       [r.method, r.route].filter(Boolean).join(" ") || "—",
    traceId:     r.trace_id ?? "—",
    requestId:   r.request_id ?? "—",
    userId:      r.user_label ?? "—",
    statusCode:  r.status_code ?? 0,
    duration:    formatDuration(r.duration_ms),
    message:     r.message,
    stackTrace,
  };
}

/* ─── Format helpers ─────────────────────────────────────────────────── */

function isoMinus(secs: number): string {
  return new Date(Date.now() - secs * 1000).toISOString();
}

function formatTimeOfDay(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${hh}:${mm}:${ss}.${ms}`;
}

function formatFullTimestamp(iso: string): string {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" });
  return `${month} ${d.getDate()}, ${d.getFullYear()} ${formatTimeOfDay(iso)}`;
}

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

function formatSecondsHuman(sec: number): string {
  if (sec < 1) return `${(sec * 1000).toFixed(0)}ms`;
  return `${sec.toFixed(1)}s`;
}

function formatRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 10_000)            return "Just now";
  if (ms < 60_000)            return `${Math.round(ms / 1000)}s ago`;
  if (ms < 60 * 60_000)       return `${Math.round(ms / 60_000)}m ago`;
  if (ms < 24 * 60 * 60_000)  return `${Math.round(ms / (60 * 60_000))}h ago`;
  return `${Math.round(ms / (24 * 60 * 60_000))}d ago`;
}

function labelsForWindow(windowSecs: number, buckets: number): string[] {
  const out: string[] = [];
  const stepMs = (windowSecs * 1000) / buckets;
  const now = Date.now();
  for (let i = buckets - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    out.push(
      `${String(t.getHours()).padStart(2, "0")}:${String(t.getMinutes()).padStart(2, "0")}`,
    );
  }
  return out;
}

function yLabelsFor(yMax: number): string[] {
  // 5 evenly-spaced labels, top to bottom (visual order is reversed by CSS).
  const step = yMax / 4;
  return [0, step, step * 2, step * 3, yMax].map((n) => formatCompact(Math.round(n)));
}

function emptyBundle(): LogsPageData {
  return {
    metrics:        [],
    rows:           [],
    totalRows:      0,
    totalPages:     1,
    selectedId:     null,
    selectedDetail: null,
    volumeChart:    {
      series:  [
        { key: "info",  label: "INFO",  color: "var(--dev-accent)",  values: [] },
        { key: "warn",  label: "WARN",  color: "var(--dev-warning)", values: [] },
        { key: "error", label: "ERROR", color: "var(--dev-danger)",  values: [] },
      ],
      xLabels: [],
      yLabels: ["0"],
      yMax:    1,
    },
    services:       [],
    savedViews:     [],
    traceGroups:    [],
  };
}

export { DEFAULT_LOGS_FILTERS };
