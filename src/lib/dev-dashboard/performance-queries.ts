import "server-only";
import { AlertTriangle, Clock, Cpu, MemoryStick, Zap } from "lucide-react";
import { requireDevClient } from "./require-dev";
import {
  bucketCount,
  buildXAxisLabels,
  timeRangeToSeconds,
  type PerformanceFilters,
} from "./performance-filters";
import type {
  ApdexBand,
  ApdexSummary,
  PerfDbQueryRow,
  PerfErrorRateChart,
  PerfLatencyChart,
  PerfMetricCard,
  PerfSlowestRouteRow,
  PerfThroughputChart,
  ResourceUsageRow,
  ServicePerfRow,
  ServicePerfStatus,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server-side data loader for /dev/performance.

   Strategy mirrors errors-queries / auth-queries / logs-queries:
   - Try Supabase first (canonical source after migration 0012).
   - On any error (table missing, permission denied, network) fall back to
     centralized mock generators so the page never breaks — useful while
     the migration hasn't been applied or the ingestion pipeline isn't
     wired up yet.
   - All exports return the same typed shapes the components already expect.

   The whole page bundles into one `loadPerformancePageData(filters)` call
   so the page itself stays a thin async server component.
   ───────────────────────────────────────────────────────────────────────── */

export type PerformancePageData = {
  metrics:           PerfMetricCard[];
  latency:           PerfLatencyChart;
  latencyCompare:    PerfLatencyChart | null;
  throughput:        PerfThroughputChart;
  throughputCompare: PerfThroughputChart | null;
  errorRate:         PerfErrorRateChart;
  errorRateCompare:  PerfErrorRateChart | null;
  slowestRoutes:     PerfSlowestRouteRow[];
  apdex:             ApdexSummary;
  resourceUsage:     ResourceUsageRow[];
  dbQueries:         PerfDbQueryRow[];
  services:          ServicePerfRow[];
};

/* ── DB row shapes ───────────────────────────────────────────────────────── */

type DbMetricSample = {
  ts:                string;
  service:           string;
  environment:       string;
  p50_ms:            number;
  p95_ms:            number;
  p99_ms:            number;
  requests_per_min:  number | null;
  error_rate:        number;
  cpu_percent:       number;
  memory_percent:    number;
  apdex:             number;
  status:            ServicePerfStatus;
};

type DbRouteSample = {
  method:        PerfSlowestRouteRow["method"];
  path:          string;
  p95_ms:        number;
};

type DbDbQuerySample = {
  query_pattern: string;
  p95_ms:        number;
};

/* ── Public bundle loader ────────────────────────────────────────────────── */

export async function loadPerformancePageData(
  filters: PerformanceFilters,
): Promise<PerformancePageData> {
  const guard = await requireDevClient();
  const supabase = guard.ok ? guard.supabase : null;

  // Fire everything in parallel. Each branch already has its own try-catch
  // so one slow / missing table never blocks the rest of the page.
  const [
    metrics,
    latency,
    throughput,
    errorRate,
    slowestRoutes,
    dbQueries,
    services,
  ] = await Promise.all([
    fetchMetrics(supabase, filters),
    fetchLatencyChart(supabase, filters, 0),
    fetchThroughputChart(supabase, filters, 0),
    fetchErrorRateChart(supabase, filters, 0),
    fetchSlowestRoutes(supabase, filters),
    fetchDbQueries(supabase, filters),
    fetchServices(supabase, filters),
  ]);

  // Compare period — shifted back by one full window. Skipped when toggle
  // is off so we don't waste a round-trip.
  const offsetSec = filters.compare ? timeRangeToSeconds(filters.timeRange) : 0;
  const [latencyCompare, throughputCompare, errorRateCompare] = filters.compare
    ? await Promise.all([
        fetchLatencyChart(supabase, filters, offsetSec),
        fetchThroughputChart(supabase, filters, offsetSec),
        fetchErrorRateChart(supabase, filters, offsetSec),
      ])
    : [null, null, null];

  return {
    metrics,
    latency,
    latencyCompare,
    throughput,
    throughputCompare,
    errorRate,
    errorRateCompare,
    slowestRoutes,
    apdex: deriveApdex(services),
    resourceUsage: deriveResourceUsage(services),
    dbQueries,
    services: sortServices(services, filters.sortBy, filters.sortDir),
  };
}

/* ── Section: top metric cards ───────────────────────────────────────────── */

type RequireOk = Extract<Awaited<ReturnType<typeof requireDevClient>>, { ok: true }>;
type SbClient  = RequireOk["supabase"];

async function fetchMetrics(
  supabase: SbClient | null,
  filters: PerformanceFilters,
): Promise<PerfMetricCard[]> {
  // Build the strip from current + prior-period rollups so the delta is
  // honest. When DB is unavailable we synthesize from generated series.
  try {
    if (!supabase) throw new Error("No supabase client");
    const current  = await fetchMetricSamples(supabase, filters, 0);
    const previous = await fetchMetricSamples(supabase, filters, timeRangeToSeconds(filters.timeRange));
    if (current.length === 0) throw new Error("No current samples");

    const curAgg = aggregateMetricSamples(current);
    const prvAgg = aggregateMetricSamples(previous);
    return buildMetricCards(curAgg, prvAgg);
  } catch {
    // Fallback — synth from the latency / throughput / error-rate series
    // we'd generate anyway.
    return buildMockMetricCards();
  }
}

/* ── Section: latency multi-line chart ───────────────────────────────────── */

async function fetchLatencyChart(
  supabase: SbClient | null,
  filters: PerformanceFilters,
  offsetSec: number,
): Promise<PerfLatencyChart> {
  const buckets = bucketCount(filters);
  const xLabels = buildXAxisLabels(filters);

  try {
    if (!supabase) throw new Error("No supabase client");
    const samples = await fetchMetricSamples(supabase, filters, offsetSec);
    if (samples.length === 0) throw new Error("No samples");

    const p50 = bucketize(samples, buckets, (s) => s.p50_ms);
    const p95 = bucketize(samples, buckets, (s) => s.p95_ms);
    const p99 = bucketize(samples, buckets, (s) => s.p99_ms);
    const yMax = niceYMax(Math.max(...p99));
    return {
      xLabels,
      yLabels: yAxisLabels(yMax, " ms"),
      yMax,
      series: [
        { key: "p50", label: "p50", color: "var(--dev-chart-blue)",   values: p50 },
        { key: "p95", label: "p95", color: "var(--dev-chart-violet)", values: p95 },
        { key: "p99", label: "p99", color: "var(--dev-chart-red)",    values: p99 },
      ],
    };
  } catch {
    return buildMockLatencyChart(filters, offsetSec);
  }
}

/* ── Section: throughput line chart ──────────────────────────────────────── */

async function fetchThroughputChart(
  supabase: SbClient | null,
  filters: PerformanceFilters,
  offsetSec: number,
): Promise<PerfThroughputChart> {
  const buckets = bucketCount(filters);
  const xLabels = buildXAxisLabels(filters);

  try {
    if (!supabase) throw new Error("No supabase client");
    const samples = await fetchMetricSamples(supabase, filters, offsetSec);
    if (samples.length === 0) throw new Error("No samples");

    const rpm = bucketize(samples, buckets, (s) => s.requests_per_min ?? 0);
    // Sum across services per bucket — throughput is platform-wide.
    const summed = sumByBucket(samples, buckets, (s) => s.requests_per_min ?? 0);
    const yMax = niceYMax(Math.max(...summed));
    return {
      xLabels,
      yLabels: yAxisLabels(yMax, "", kFormat),
      yMax,
      values: summed.length > 0 ? summed : rpm,
    };
  } catch {
    return buildMockThroughputChart(filters, offsetSec);
  }
}

/* ── Section: error rate chart ───────────────────────────────────────────── */

async function fetchErrorRateChart(
  supabase: SbClient | null,
  filters: PerformanceFilters,
  offsetSec: number,
): Promise<PerfErrorRateChart> {
  const buckets = bucketCount(filters);
  const xLabels = buildXAxisLabels(filters);

  try {
    if (!supabase) throw new Error("No supabase client");
    const samples = await fetchMetricSamples(supabase, filters, offsetSec);
    if (samples.length === 0) throw new Error("No samples");

    // Error rate per bucket → average across services in that bucket, then
    // convert from 0–1 to percent.
    const buckRates = bucketize(samples, buckets, (s) => s.error_rate * 100);
    const yMax = niceErrYMax(Math.max(...buckRates));
    return {
      xLabels,
      yLabels: errYAxisLabels(yMax),
      yMax,
      values: buckRates,
    };
  } catch {
    return buildMockErrorRateChart(filters, offsetSec);
  }
}

/* ── Section: slowest routes ─────────────────────────────────────────────── */

async function fetchSlowestRoutes(
  supabase: SbClient | null,
  filters: PerformanceFilters,
): Promise<PerfSlowestRouteRow[]> {
  try {
    if (!supabase) throw new Error("No supabase client");
    const cutoff = isoCutoff(timeRangeToSeconds(filters.timeRange));
    const { data, error } = await supabase
      .from("dev_perf_route_samples")
      .select("method, path, p95_ms")
      .gte("ts", cutoff)
      .eq("environment", filters.environment)
      .order("p95_ms", { ascending: false })
      .limit(50);
    if (error) throw error;
    const rows = (data ?? []) as DbRouteSample[];
    if (rows.length === 0) throw new Error("No route samples");

    // Pick max p95 per route across the window.
    const byKey = new Map<string, PerfSlowestRouteRow>();
    for (const r of rows) {
      const key = `${r.method} ${r.path}`;
      const existing = byKey.get(key);
      if (!existing || r.p95_ms > existing.p95Ms) {
        byKey.set(key, {
          key:    slugify(key),
          method: r.method,
          path:   r.path,
          p95Ms:  r.p95_ms,
        });
      }
    }
    return Array.from(byKey.values())
      .sort((a, b) => b.p95Ms - a.p95Ms)
      .slice(0, 5);
  } catch {
    return MOCK_SLOWEST_ROUTES;
  }
}

/* ── Section: largest DB queries ─────────────────────────────────────────── */

async function fetchDbQueries(
  supabase: SbClient | null,
  filters: PerformanceFilters,
): Promise<PerfDbQueryRow[]> {
  try {
    if (!supabase) throw new Error("No supabase client");
    const cutoff = isoCutoff(timeRangeToSeconds(filters.timeRange));
    const { data, error } = await supabase
      .from("dev_perf_db_query_samples")
      .select("query_pattern, p95_ms")
      .gte("ts", cutoff)
      .eq("environment", filters.environment)
      .order("p95_ms", { ascending: false })
      .limit(50);
    if (error) throw error;
    const rows = (data ?? []) as DbDbQuerySample[];
    if (rows.length === 0) throw new Error("No query samples");

    const byKey = new Map<string, PerfDbQueryRow>();
    for (const r of rows) {
      const existing = byKey.get(r.query_pattern);
      if (!existing || r.p95_ms > existing.p95Ms) {
        byKey.set(r.query_pattern, {
          key:   slugify(r.query_pattern),
          query: r.query_pattern,
          p95Ms: r.p95_ms,
        });
      }
    }
    return Array.from(byKey.values())
      .sort((a, b) => b.p95Ms - a.p95Ms)
      .slice(0, 5);
  } catch {
    return MOCK_DB_QUERIES;
  }
}

/* ── Section: service performance table ──────────────────────────────────── */

async function fetchServices(
  supabase: SbClient | null,
  filters: PerformanceFilters,
): Promise<ServicePerfRow[]> {
  try {
    if (!supabase) throw new Error("No supabase client");
    const samples = await fetchMetricSamples(supabase, filters, 0);
    if (samples.length === 0) throw new Error("No samples");

    // Take the most recent sample per service.
    const latest = new Map<string, DbMetricSample>();
    for (const s of samples) {
      const prev = latest.get(s.service);
      if (!prev || s.ts > prev.ts) latest.set(s.service, s);
    }
    return Array.from(latest.values()).map((s) => ({
      key:              s.service,
      service:          s.service,
      requestsPerMin:   s.requests_per_min,
      p50Ms:            s.p50_ms,
      p95Ms:            s.p95_ms,
      p99Ms:            s.p99_ms,
      errorRatePercent: s.error_rate * 100,
      apdex:            s.apdex,
      cpuPercent:       s.cpu_percent,
      memoryPercent:    s.memory_percent,
      status:           s.status,
    }));
  } catch {
    return MOCK_SERVICES;
  }
}

/* ── Underlying DB sample fetcher ────────────────────────────────────────── */

async function fetchMetricSamples(
  supabase: SbClient,
  filters: PerformanceFilters,
  offsetSec: number,
): Promise<DbMetricSample[]> {
  const windowSec = timeRangeToSeconds(filters.timeRange);
  const fromIso   = isoCutoff(windowSec + offsetSec);
  const toIso     = offsetSec === 0 ? new Date().toISOString() : isoCutoff(offsetSec);

  let q = supabase
    .from("dev_perf_metric_samples")
    .select(
      "ts, service, environment, p50_ms, p95_ms, p99_ms, requests_per_min, error_rate, cpu_percent, memory_percent, apdex, status",
    )
    .gte("ts", fromIso)
    .lt("ts", toIso)
    .eq("environment", filters.environment)
    .order("ts", { ascending: true })
    .limit(5000);
  if (filters.service) q = q.eq("service", filters.service);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as DbMetricSample[];
}

/* ── Aggregation helpers ─────────────────────────────────────────────────── */

type Aggregated = {
  p95: number;
  p99: number;
  rpm: number;
  errorRate: number; // 0–1
  cpu: number;
  memory: number;
};

function aggregateMetricSamples(samples: DbMetricSample[]): Aggregated | null {
  if (samples.length === 0) return null;
  // Latest snapshot per service, then average for the strip.
  const latest = new Map<string, DbMetricSample>();
  for (const s of samples) {
    const prev = latest.get(s.service);
    if (!prev || s.ts > prev.ts) latest.set(s.service, s);
  }
  const rows = Array.from(latest.values());
  const sum = rows.reduce(
    (a, r) => ({
      p95: a.p95 + r.p95_ms,
      p99: a.p99 + r.p99_ms,
      rpm: a.rpm + (r.requests_per_min ?? 0),
      errorRate: a.errorRate + r.error_rate,
      cpu: a.cpu + r.cpu_percent,
      memory: a.memory + r.memory_percent,
    }),
    { p95: 0, p99: 0, rpm: 0, errorRate: 0, cpu: 0, memory: 0 },
  );
  const n = rows.length;
  return {
    p95: sum.p95 / n,
    p99: sum.p99 / n,
    rpm: sum.rpm,
    errorRate: sum.errorRate / n,
    cpu: sum.cpu / n,
    memory: sum.memory / n,
  };
}

function buildMetricCards(cur: Aggregated | null, prev: Aggregated | null): PerfMetricCard[] {
  if (!cur) return buildMockMetricCardsBase();
  return [
    metricCard({
      key: "p95-response-time",
      label: "p95 Response Time",
      value: `${Math.round(cur.p95)} ms`,
      tone: "blue",
      icon: Clock,
      cur: cur.p95,
      prv: prev?.p95,
      inverted: true,
    }),
    metricCard({
      key: "p99-response-time",
      label: "p99 Response Time",
      value: `${Math.round(cur.p99)} ms`,
      tone: "blue",
      icon: Clock,
      cur: cur.p99,
      prv: prev?.p99,
      inverted: true,
    }),
    metricCard({
      key: "requests-per-min",
      label: "Requests / Min",
      value: cur.rpm.toLocaleString(),
      tone: "blue",
      icon: Zap,
      cur: cur.rpm,
      prv: prev?.rpm,
      inverted: false,
    }),
    metricCard({
      key: "error-rate",
      label: "Error Rate",
      value: `${(cur.errorRate * 100).toFixed(2)}%`,
      tone: "red",
      icon: AlertTriangle,
      cur: cur.errorRate,
      prv: prev?.errorRate,
      inverted: true,
    }),
    metricCard({
      key: "cpu-usage",
      label: "CPU Usage",
      value: `${Math.round(cur.cpu)}%`,
      tone: "blue",
      icon: Cpu,
      cur: cur.cpu,
      prv: prev?.cpu,
      inverted: true,
    }),
    metricCard({
      key: "memory-usage",
      label: "Memory Usage",
      value: `${Math.round(cur.memory)}%`,
      tone: "blue",
      icon: MemoryStick,
      cur: cur.memory,
      prv: prev?.memory,
      inverted: true,
    }),
  ];
}

function metricCard(args: {
  key: string;
  label: string;
  value: string;
  tone: PerfMetricCard["tone"];
  icon: PerfMetricCard["icon"];
  cur: number;
  prv: number | undefined;
  inverted: boolean;
}): PerfMetricCard {
  const delta = computeDelta(args.cur, args.prv);
  const deltaIsGood = args.inverted ? delta.direction === "down" : delta.direction === "up";
  return {
    key: args.key,
    label: args.label,
    value: args.value,
    tone: args.tone,
    icon: args.icon,
    delta: delta.label,
    deltaDirection: delta.direction,
    deltaIsGood,
    baseline: "vs prev period",
    series: synthSparkline(args.cur, args.prv ?? args.cur),
  };
}

function computeDelta(cur: number, prv: number | undefined): { label: string; direction: "up" | "down" } {
  if (prv == null || prv === 0) return { label: "—", direction: "up" };
  const pct = ((cur - prv) / Math.abs(prv)) * 100;
  const direction = pct >= 0 ? "up" : "down";
  const sign = pct > 0 ? "+" : "";
  return { label: `${sign}${pct.toFixed(1)}%`, direction };
}

function synthSparkline(cur: number, prv: number, n = 13): number[] {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const base = prv + (cur - prv) * t;
    const wobble = base * 0.04 * Math.sin(i * 1.2);
    out.push(base + wobble);
  }
  return out;
}

function bucketize(
  samples: DbMetricSample[],
  buckets: number,
  pick: (s: DbMetricSample) => number,
): number[] {
  if (samples.length === 0) return new Array(buckets).fill(0);
  // Determine the time window from the samples themselves so missing
  // ranges still produce a smooth chart.
  const ts = samples.map((s) => new Date(s.ts).getTime());
  const minT = Math.min(...ts);
  const maxT = Math.max(...ts);
  const span = Math.max(1, maxT - minT);
  const slotSize = span / buckets;

  const sums    = new Array(buckets).fill(0);
  const counts  = new Array(buckets).fill(0);
  for (const s of samples) {
    const t = new Date(s.ts).getTime();
    const idx = Math.min(buckets - 1, Math.floor((t - minT) / slotSize));
    sums[idx]   += pick(s);
    counts[idx] += 1;
  }
  // Average per bucket; carry-forward across empty buckets so the line stays continuous.
  let last = 0;
  return sums.map((sum, i) => {
    if (counts[i] === 0) return last;
    last = sum / counts[i];
    return last;
  });
}

function sumByBucket(
  samples: DbMetricSample[],
  buckets: number,
  pick: (s: DbMetricSample) => number,
): number[] {
  if (samples.length === 0) return new Array(buckets).fill(0);
  const ts = samples.map((s) => new Date(s.ts).getTime());
  const minT = Math.min(...ts);
  const maxT = Math.max(...ts);
  const span = Math.max(1, maxT - minT);
  const slotSize = span / buckets;

  const out = new Array(buckets).fill(0);
  for (const s of samples) {
    const t = new Date(s.ts).getTime();
    const idx = Math.min(buckets - 1, Math.floor((t - minT) / slotSize));
    out[idx] += pick(s);
  }
  return out;
}

/* ── Derived sections ────────────────────────────────────────────────────── */

function deriveApdex(services: ServicePerfRow[]): ApdexSummary {
  if (services.length === 0) {
    return {
      score: 0.87,
      band:  "Good",
      delta: "-0.04",
      deltaDirection: "down",
      deltaIsGood: false,
      baseline: "vs prev period",
    };
  }
  // Weighted average by RPM where available, else simple mean.
  const totalRpm = services.reduce((a, s) => a + (s.requestsPerMin ?? 0), 0);
  const weighted = totalRpm > 0;
  const score = weighted
    ? services.reduce((a, s) => a + s.apdex * (s.requestsPerMin ?? 0), 0) / totalRpm
    : services.reduce((a, s) => a + s.apdex, 0) / services.length;
  return {
    score: round2(score),
    band:  bandForApdex(score),
    delta: "-0.04",                 // Delta vs previous period — would need historical aggregate.
    deltaDirection: "down",
    deltaIsGood: false,
    baseline: "vs prev period",
  };
}

function bandForApdex(s: number): ApdexBand {
  if (s >= 0.94) return "Excellent";
  if (s >= 0.85) return "Good";
  if (s >= 0.70) return "Fair";
  if (s >= 0.50) return "Poor";
  return "Unacceptable";
}

function deriveResourceUsage(services: ServicePerfRow[]): ResourceUsageRow[] {
  // Average across services for CPU/Memory; disk + network are
  // not yet ingested per service, so we pin to representative values.
  // When you add disk/network columns to dev_perf_metric_samples,
  // surface them here.
  const n = services.length || 1;
  const cpu    = Math.round(services.reduce((a, s) => a + s.cpuPercent,    0) / n) || 43;
  const memory = Math.round(services.reduce((a, s) => a + s.memoryPercent, 0) / n) || 68;
  const memTone: ResourceUsageRow["tone"] = memory >= 65 ? "amber" : "blue";
  return [
    { key: "cpu",     label: "CPU Usage",    percent: cpu,    tone: "blue"  },
    { key: "memory",  label: "Memory Usage", percent: memory, tone: memTone },
    { key: "disk",    label: "Disk I/O",     percent: 35,     tone: "blue"  },
    { key: "network", label: "Network I/O",  percent: 58,     tone: "blue"  },
  ];
}

function sortServices(
  rows: ServicePerfRow[],
  by: PerformanceFilters["sortBy"],
  dir: PerformanceFilters["sortDir"],
): ServicePerfRow[] {
  const sign = dir === "asc" ? 1 : -1;
  const sorted = [...rows].sort((a, b) => {
    const va = sortValue(a, by);
    const vb = sortValue(b, by);
    if (va == null && vb == null) return 0;
    if (va == null) return  1;
    if (vb == null) return -1;
    if (typeof va === "string" && typeof vb === "string") {
      return va.localeCompare(vb) * sign;
    }
    return ((va as number) - (vb as number)) * sign;
  });
  return sorted;
}

function sortValue(r: ServicePerfRow, by: PerformanceFilters["sortBy"]): number | string | null {
  switch (by) {
    case "service":   return r.service;
    case "rpm":       return r.requestsPerMin;
    case "p50":       return r.p50Ms;
    case "p95":       return r.p95Ms;
    case "p99":       return r.p99Ms;
    case "errorRate": return r.errorRatePercent;
    case "apdex":     return r.apdex;
    case "cpu":       return r.cpuPercent;
    case "memory":    return r.memoryPercent;
    case "status":    return r.status;
  }
}

/* ── Y-axis label helpers ────────────────────────────────────────────────── */

function niceYMax(raw: number): number {
  if (raw <= 0) return 100;
  const scale = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / scale;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 4 ? 4 : norm <= 5 ? 5 : 10;
  return nice * scale * 1.15; // headroom
}
function niceErrYMax(raw: number): number {
  if (raw <= 0.25) return 0.25;
  if (raw <= 0.5)  return 0.5;
  if (raw <= 1)    return 1;
  if (raw <= 2)    return 2;
  if (raw <= 5)    return 5;
  return Math.ceil(raw);
}
function yAxisLabels(yMax: number, suffix = "", format?: (v: number) => string): string[] {
  const steps = 5;
  return Array.from({ length: steps }, (_, i) => {
    const v = (i / (steps - 1)) * yMax;
    return `${format ? format(v) : Math.round(v).toString()}${suffix}`;
  });
}
function errYAxisLabels(yMaxPct: number): string[] {
  const steps = 5;
  return Array.from({ length: steps }, (_, i) => `${((i / (steps - 1)) * yMaxPct).toFixed(2)}%`);
}
function kFormat(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return Math.round(v).toString();
}
function isoCutoff(secAgo: number): string {
  return new Date(Date.now() - secAgo * 1000).toISOString();
}
function round2(n: number): number { return Math.round(n * 100) / 100; }
function slugify(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

/* ─────────────────────────────────────────────────────────────────────────
   Mock fallbacks. These run whenever the dev_perf_* tables aren't present
   yet or RLS denies the read — so the page is never empty during local
   dev or before migration 0012 is applied.
   ───────────────────────────────────────────────────────────────────────── */

function buildMockMetricCardsBase(): PerfMetricCard[] {
  return [
    {
      key: "p95-response-time", label: "p95 Response Time", value: "212 ms",
      tone: "blue", icon: Clock,
      delta: "-18.7%", deltaDirection: "down", deltaIsGood: true,
      baseline: "vs prev 24h",
      series: [280, 268, 256, 248, 240, 232, 226, 222, 218, 216, 214, 213, 212],
    },
    {
      key: "p99-response-time", label: "p99 Response Time", value: "412 ms",
      tone: "blue", icon: Clock,
      delta: "-15.3%", deltaDirection: "down", deltaIsGood: true,
      baseline: "vs prev 24h",
      series: [520, 504, 488, 472, 456, 444, 432, 424, 420, 418, 415, 413, 412],
    },
    {
      key: "requests-per-min", label: "Requests / Min", value: "2,842",
      tone: "blue", icon: Zap,
      delta: "+12.4%", deltaDirection: "up", deltaIsGood: true,
      baseline: "vs prev 24h",
      series: [2400, 2460, 2520, 2560, 2600, 2660, 2700, 2740, 2770, 2790, 2810, 2830, 2842],
    },
    {
      key: "error-rate", label: "Error Rate", value: "0.23%",
      tone: "red", icon: AlertTriangle,
      delta: "-31.2%", deltaDirection: "down", deltaIsGood: true,
      baseline: "vs prev 24h",
      series: [0.42, 0.40, 0.38, 0.36, 0.33, 0.31, 0.29, 0.28, 0.26, 0.25, 0.24, 0.235, 0.23],
    },
    {
      key: "cpu-usage", label: "CPU Usage", value: "42%",
      tone: "blue", icon: Cpu,
      delta: "-8.6%", deltaDirection: "down", deltaIsGood: true,
      baseline: "vs prev 24h",
      series: [50, 48, 47, 46, 45, 45, 44, 44, 43, 43, 42, 42, 42],
    },
    {
      key: "memory-usage", label: "Memory Usage", value: "68%",
      tone: "blue", icon: MemoryStick,
      delta: "+4.2%", deltaDirection: "up", deltaIsGood: false,
      baseline: "vs prev 24h",
      series: [62, 63, 64, 64, 65, 66, 66, 67, 67, 68, 68, 68, 68],
    },
  ];
}

function buildMockMetricCards(): PerfMetricCard[] {
  return buildMockMetricCardsBase();
}

function buildMockLatencyChart(filters: PerformanceFilters, offsetSec: number): PerfLatencyChart {
  const n = bucketCount(filters);
  // Simple deterministic generator with a clear morning spike. Shifting
  // `offsetSec` gives the compare-period a slightly flatter curve.
  const dampen = offsetSec === 0 ? 1 : 0.78;
  const p50: number[] = [];
  const p95: number[] = [];
  const p99: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const spike = Math.exp(-Math.pow((t - 0.55) * 4, 2)); // morning bump
    p50.push(160 + 60 * spike * dampen + 8 * Math.sin(i * 0.7));
    p95.push(420 + 200 * spike * dampen + 16 * Math.sin(i * 0.9));
    p99.push(540 + 340 * spike * dampen + 22 * Math.sin(i * 0.6));
  }
  const yMax = niceYMax(Math.max(...p99));
  return {
    xLabels: buildXAxisLabels(filters),
    yLabels: yAxisLabels(yMax, " ms"),
    yMax,
    series: [
      { key: "p50", label: "p50", color: "var(--dev-chart-blue)",   values: p50.map(Math.round) },
      { key: "p95", label: "p95", color: "var(--dev-chart-violet)", values: p95.map(Math.round) },
      { key: "p99", label: "p99", color: "var(--dev-chart-red)",    values: p99.map(Math.round) },
    ],
  };
}

function buildMockThroughputChart(filters: PerformanceFilters, offsetSec: number): PerfThroughputChart {
  const n = bucketCount(filters);
  const dampen = offsetSec === 0 ? 1 : 0.82;
  const values: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    values.push(Math.round((4200 + 2300 * t + 380 * Math.sin(i * 0.45)) * dampen));
  }
  const yMax = niceYMax(Math.max(...values));
  return {
    xLabels: buildXAxisLabels(filters),
    yLabels: yAxisLabels(yMax, "", kFormat),
    yMax,
    values,
  };
}

function buildMockErrorRateChart(filters: PerformanceFilters, offsetSec: number): PerfErrorRateChart {
  const n = bucketCount(filters);
  const baselineShift = offsetSec === 0 ? 0 : 0.05;
  const values: number[] = [];
  for (let i = 0; i < n; i++) {
    const spike = i === Math.floor(n * 0.18) ? 0.6 : 0;
    values.push(Math.max(0, 0.18 + spike + baselineShift + 0.08 * Math.sin(i * 0.6)));
  }
  const yMax = niceErrYMax(Math.max(...values));
  return {
    xLabels: buildXAxisLabels(filters),
    yLabels: errYAxisLabels(yMax),
    yMax,
    values: values.map((v) => Number(v.toFixed(3))),
  };
}

const MOCK_SLOWEST_ROUTES: PerfSlowestRouteRow[] = [
  { key: "post-upload",       method: "POST", path: "/api/upload",        p95Ms: 812 },
  { key: "get-analytics",     method: "GET",  path: "/api/analytics",     p95Ms: 642 },
  { key: "get-notifications", method: "GET",  path: "/api/notifications", p95Ms: 512 },
  { key: "post-webhooks",     method: "POST", path: "/api/webhooks",      p95Ms: 421 },
  { key: "get-dashboard",     method: "GET",  path: "/api/dashboard",     p95Ms: 312 },
];

const MOCK_DB_QUERIES: PerfDbQueryRow[] = [
  { key: "missions",  query: "SELECT * FROM missions …",  p95Ms: 1240 },
  { key: "users",     query: "SELECT * FROM users …",     p95Ms: 985  },
  { key: "events",    query: "SELECT * FROM events …",    p95Ms: 742  },
  { key: "analytics", query: "SELECT * FROM analytics …", p95Ms: 512  },
  { key: "payments",  query: "SELECT * FROM payments …",  p95Ms: 412  },
];

const MOCK_SERVICES: ServicePerfRow[] = [
  { key: "frontend",     service: "frontend",     requestsPerMin: 1245, p50Ms: 60,  p95Ms: 180, p99Ms: 320, errorRatePercent: 0.15, apdex: 0.92, cpuPercent: 38, memoryPercent: 62, status: "Healthy"  },
  { key: "backend-api",  service: "backend-api",  requestsPerMin: 842,  p50Ms: 85,  p95Ms: 210, p99Ms: 412, errorRatePercent: 0.28, apdex: 0.87, cpuPercent: 46, memoryPercent: 68, status: "Healthy"  },
  { key: "auth-service", service: "auth-service", requestsPerMin: 312,  p50Ms: 45,  p95Ms: 120, p99Ms: 210, errorRatePercent: 0.05, apdex: 0.95, cpuPercent: 22, memoryPercent: 48, status: "Healthy"  },
  { key: "notifications",service: "notifications",requestsPerMin: 156,  p50Ms: 120, p95Ms: 310, p99Ms: 512, errorRatePercent: 1.42, apdex: 0.65, cpuPercent: 34, memoryPercent: 58, status: "Degraded" },
  { key: "payments",     service: "payments",     requestsPerMin: 98,   p50Ms: 200, p95Ms: 420, p99Ms: 690, errorRatePercent: 0.23, apdex: 0.89, cpuPercent: 28, memoryPercent: 54, status: "Healthy"  },
  { key: "database",     service: "database",     requestsPerMin: null, p50Ms: 15,  p95Ms: 85,  p99Ms: 140, errorRatePercent: 0.02, apdex: 0.98, cpuPercent: 42, memoryPercent: 70, status: "Healthy"  },
];
