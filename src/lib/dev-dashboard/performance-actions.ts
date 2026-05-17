"use server";

import { requireDevClient } from "./require-dev";
import { loadPerformancePageData } from "./performance-queries";
import {
  DEFAULT_PERFORMANCE_FILTERS,
  type PerformanceFilters,
} from "./performance-filters";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for /dev/performance.

   - exportPerformanceMetricsCsv: returns a CSV string the client can
     download via a temporary blob URL. Honors the active filter state so
     the export matches what the dev is currently looking at.
   - createAlertRule: inserts into dev_perf_alert_rules. Validated server-
     side. Refuses with a typed error result when the dev is not on the
     allowlist or when the DB call fails.
   - deleteAlertRule: scopes the delete via RLS — non-dev callers will
     receive an empty result and we surface that as a clear error.
   ───────────────────────────────────────────────────────────────────────── */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/* ── CSV export ──────────────────────────────────────────────────────────── */

const CSV_HEADERS = [
  "service",
  "requests_per_min",
  "p50_ms",
  "p95_ms",
  "p99_ms",
  "error_rate_percent",
  "apdex",
  "cpu_percent",
  "memory_percent",
  "status",
] as const;

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function exportPerformanceMetricsCsv(
  filters?: Partial<PerformanceFilters>,
): Promise<ActionResult<{ csv: string; filename: string }>> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const merged: PerformanceFilters = { ...DEFAULT_PERFORMANCE_FILTERS, ...(filters ?? {}) };
  const data = await loadPerformancePageData(merged);

  const lines: string[] = [];
  lines.push(CSV_HEADERS.join(","));
  for (const row of data.services) {
    lines.push(
      [
        escapeCsv(row.service),
        escapeCsv(row.requestsPerMin ?? ""),
        escapeCsv(row.p50Ms),
        escapeCsv(row.p95Ms),
        escapeCsv(row.p99Ms),
        escapeCsv(row.errorRatePercent.toFixed(2)),
        escapeCsv(row.apdex.toFixed(2)),
        escapeCsv(row.cpuPercent),
        escapeCsv(row.memoryPercent),
        escapeCsv(row.status),
      ].join(","),
    );
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return {
    ok: true,
    data: {
      csv: lines.join("\n"),
      filename: `dev-performance-services-${stamp}.csv`,
    },
  };
}

/* ── Alert rules ─────────────────────────────────────────────────────────── */

export type AlertMetric =
  | "response_time_p95"
  | "response_time_p99"
  | "error_rate"
  | "requests_per_min"
  | "cpu_percent"
  | "memory_percent"
  | "apdex";

export type AlertOp = ">" | ">=" | "<" | "<=";

export type CreateAlertRuleInput = {
  name: string;
  metric: AlertMetric;
  op: AlertOp;
  threshold: number;
  service?: string | null;        // null / "" = any
  environment?: string;
  windowMinutes?: number;
  notifyEmail?: string | null;
};

const ALERT_METRICS: ReadonlyArray<AlertMetric> = [
  "response_time_p95",
  "response_time_p99",
  "error_rate",
  "requests_per_min",
  "cpu_percent",
  "memory_percent",
  "apdex",
];
const ALERT_OPS: ReadonlyArray<AlertOp> = [">", ">=", "<", "<="];

function validateAlertInput(input: CreateAlertRuleInput): string | null {
  if (!input.name || input.name.trim().length === 0) return "Name is required.";
  if (input.name.length > 120) return "Name is too long (max 120 chars).";
  if (!ALERT_METRICS.includes(input.metric)) return "Unknown metric.";
  if (!ALERT_OPS.includes(input.op)) return "Unknown operator.";
  if (!Number.isFinite(input.threshold)) return "Threshold must be a number.";
  const w = input.windowMinutes ?? 5;
  if (!Number.isInteger(w) || w < 1 || w > 1440) {
    return "Window must be an integer between 1 and 1440 minutes.";
  }
  if (input.notifyEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.notifyEmail)) {
    return "Notify email is not a valid email address.";
  }
  return null;
}

export async function createAlertRule(
  input: CreateAlertRuleInput,
): Promise<ActionResult<{ id: string }>> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const validationError = validateAlertInput(input);
  if (validationError) return { ok: false, error: validationError };

  const payload = {
    name:           input.name.trim(),
    metric:         input.metric,
    op:             input.op,
    threshold:      input.threshold,
    service:        input.service?.trim() || null,
    environment:    input.environment?.trim() || "Production",
    window_minutes: input.windowMinutes ?? 5,
    notify_email:   input.notifyEmail?.trim() || null,
    enabled:        true,
    created_by:     guard.user.id,
  };

  const { data, error } = await guard.supabase
    .from("dev_perf_alert_rules")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    // 42P01 = undefined_table — migration 0012 hasn't been applied yet.
    // 42501 = insufficient_privilege — RLS rejected us.
    // Surface the message verbatim; the modal renders it as-is.
    return { ok: false, error: error.message };
  }
  return { ok: true, data: { id: data.id as string } };
}

export async function deleteAlertRule(id: string): Promise<ActionResult> {
  const guard = await requireDevClient();
  if (!guard.ok) return { ok: false, error: guard.error };

  const { error } = await guard.supabase
    .from("dev_perf_alert_rules")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
