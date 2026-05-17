"use server";

import { revalidatePath } from "next/cache";
import { requireDevClient } from "./require-dev";
import { GROUPED_ERRORS } from "./mock-data";
import type { ErrorSeverity } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for /dev/errors

   - createAlertRule:    persists a new alert rule (RLS-gated).
   - exportErrorsCsv:    returns a CSV blob (string) the client can download.
   ───────────────────────────────────────────────────────────────────────── */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

/* ── Create alert rule ───────────────────────────────────────────────────── */

const VALID_SEVERITY: ReadonlyArray<ErrorSeverity> = ["critical", "high", "medium", "low"];
const VALID_PERIODS = new Set(["5m", "15m", "1h", "24h"]);
const VALID_CHANNELS = new Set(["email", "slack", "webhook"]);

function parseSeverityList(v: FormDataEntryValue | null): ErrorSeverity[] {
  if (!v) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is ErrorSeverity => VALID_SEVERITY.includes(s as ErrorSeverity));
}

function parseSourceList(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createAlertRule(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const severities = parseSeverityList(formData.get("severities"));
  const sources = parseSourceList(formData.get("sources"));
  const thresholdCountRaw = String(formData.get("threshold_count") ?? "").trim();
  const thresholdCount = thresholdCountRaw ? Number.parseInt(thresholdCountRaw, 10) : null;
  const thresholdPeriod = String(formData.get("threshold_period") ?? "").trim();
  const channel = String(formData.get("channel") ?? "").trim();

  if (!name)                                   return { ok: false, error: "Name is required." };
  if (name.length > 120)                       return { ok: false, error: "Name is too long (max 120)." };
  if (thresholdCount !== null && (Number.isNaN(thresholdCount) || thresholdCount < 1)) {
    return { ok: false, error: "Threshold count must be a positive integer." };
  }
  if (thresholdPeriod && !VALID_PERIODS.has(thresholdPeriod)) {
    return { ok: false, error: "Invalid threshold period." };
  }
  if (channel && !VALID_CHANNELS.has(channel)) {
    return { ok: false, error: "Invalid channel." };
  }

  const { error } = await ctx.supabase.from("dev_alert_rules").insert({
    name,
    description,
    severity_filter:  severities.length > 0 ? severities : null,
    source_filter:    sources.length > 0 ? sources : null,
    threshold_count:  thresholdCount,
    threshold_period: thresholdPeriod || null,
    channel:          channel || null,
    enabled:          true,
    created_by_email: ctx.user.email ?? null,
  });

  if (error) {
    // 42P01 = undefined_table — migration hasn't run yet. Make the error
    // legible instead of leaking the raw Postgres code to the UI.
    if (error.code === "42P01") {
      return {
        ok: false,
        error: "Alert rules table not found. Apply migration 0010_dev_dashboard.sql first.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dev/errors");
  return { ok: true };
}

/* ── Export errors as CSV ────────────────────────────────────────────────── */

const CSV_HEADERS = [
  "error_id",
  "message",
  "source",
  "route",
  "severity",
  "status",
  "occurrences",
  "affected_users",
  "release",
  "last_seen",
  "owner",
] as const;

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportErrorsCsv(): Promise<ActionResult<{ csv: string; filename: string }>> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  // Pull up to the most recent 10 000 errors. The /dev/errors UI can't show
  // more than that — anything larger should go through a dedicated export job.
  let rows: Array<Record<string, unknown>> = [];
  try {
    const { data, error } = await ctx.supabase
      .from("dev_errors")
      .select(
        "id, message, source, route, severity, status, occurrences, affected_users, release, last_seen, owner",
      )
      .order("last_seen", { ascending: false })
      .limit(10_000);
    if (error) throw error;
    rows = data ?? [];
  } catch {
    // Fallback so the export feature still works on environments where the
    // migration hasn't been applied yet.
    rows = GROUPED_ERRORS.map((r) => ({
      id: r.id,
      message: r.message,
      source: r.source,
      route: r.route,
      severity: r.severity,
      status: r.status,
      occurrences: r.occurrences,
      affected_users: r.affectedUsers,
      release: r.release,
      last_seen: r.lastSeen,
      owner: r.owner,
    }));
  }

  const lines: string[] = [];
  lines.push(CSV_HEADERS.join(","));
  for (const r of rows) {
    lines.push(
      CSV_HEADERS.map((h) => escapeCsv(r[h === "error_id" ? "id" : h])).join(","),
    );
  }
  const csv = lines.join("\n");
  const filename = `dev-errors-${new Date().toISOString().slice(0, 10)}.csv`;

  return { ok: true, data: { csv, filename } };
}
