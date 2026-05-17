"use server";

import { requireDevClient } from "./require-dev";
import { RECENT_AUTH_EVENTS } from "./mock-data";
import {
  AUTH_EVENTS_PAGE_SIZE,
  type AuthFilterState,
  DEFAULT_AUTH_FILTERS,
} from "./auth-filters";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for /dev/auth.

   - exportAuthEventsCsv: returns a CSV string the client can download via
     a temporary blob URL. Honors the same filter state as the table so
     the export matches what the dev is currently looking at.
   ───────────────────────────────────────────────────────────────────────── */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const CSV_HEADERS = [
  "occurred_at",
  "event_kind",
  "status",
  "status_label",
  "user_label",
  "provider",
  "route",
  "device",
  "region",
  "environment",
  "failure_reason",
  "suspicious",
] as const;

function escapeCsv(value: unknown): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildIsoCutoff(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

export async function exportAuthEventsCsv(
  filters?: Partial<AuthFilterState>,
): Promise<ActionResult<{ csv: string; filename: string }>> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  const f: AuthFilterState = {
    ...DEFAULT_AUTH_FILTERS,
    ...(filters ?? {}),
    // Ignore pagination on export — we always export everything matching
    // the filters, capped at 10k rows below.
    page: 1,
  };

  // Cap export at 10 000 rows. Anything larger should go through a
  // dedicated background job.
  const MAX_ROWS = 10_000;
  let rows: Array<Record<string, unknown>> = [];

  try {
    let q = ctx.supabase
      .from("dev_auth_events")
      .select(
        "occurred_at, event_kind, status, status_label, user_label, provider, route, device, region, environment, failure_reason, suspicious",
      )
      .gte("occurred_at", buildIsoCutoff(f.timeframeHours));

    if (f.provider !== "all")    q = q.eq("provider", f.provider);
    if (f.status !== "all")      q = q.eq("status", f.status);
    if (f.environment)           q = q.eq("environment", f.environment);
    if (f.suspiciousOnly)        q = q.eq("suspicious", true);
    if (f.q) {
      const term = f.q.replace(/[%_]/g, "\\$&");
      q = q.or(
        `user_label.ilike.%${term}%,provider.ilike.%${term}%,route.ilike.%${term}%,event_kind.ilike.%${term}%,status_label.ilike.%${term}%`,
      );
    }

    const { data, error } = await q
      .order("occurred_at", { ascending: false })
      .limit(MAX_ROWS);

    if (error) throw error;
    rows = data ?? [];
  } catch {
    // Fallback so the export still works on environments where migration
    // 0011 hasn't been applied yet.
    rows = RECENT_AUTH_EVENTS.map((r) => ({
      occurred_at:    new Date().toISOString(),
      event_kind:     r.event,
      status:         r.statusKind,
      status_label:   r.statusLabel,
      user_label:     r.user,
      provider:       r.provider,
      route:          r.route,
      device:         r.device,
      region:         null,
      environment:    "Production",
      failure_reason: null,
      suspicious:     r.statusKind === "danger" || r.statusKind === "warning",
    }));
  }

  // Limit to what's actually relevant if the table has more than the cap.
  if (rows.length > MAX_ROWS) rows = rows.slice(0, MAX_ROWS);

  const lines: string[] = [CSV_HEADERS.join(",")];
  for (const r of rows) {
    lines.push(CSV_HEADERS.map((h) => escapeCsv(r[h])).join(","));
  }
  const csv = lines.join("\n");
  const filename = `dev-auth-events-${new Date().toISOString().slice(0, 10)}.csv`;
  // `page` referenced just to keep f live for future filter additions.
  void AUTH_EVENTS_PAGE_SIZE;

  return { ok: true, data: { csv, filename } };
}
