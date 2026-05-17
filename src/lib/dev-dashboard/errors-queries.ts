import "server-only";
import { createClient } from "@/lib/supabase/server";
import { ERRORS_PAGE_SIZE, type ErrorsFilterState } from "./errors-filters";
import {
  ACTIVE_INCIDENTS,
  ERRORS_METRIC_CARDS,
  ERROR_TRENDS_CHART,
  GROUPED_ERRORS,
  GROUPED_ERRORS_TOTAL,
  HIGHEST_IMPACT_ERROR,
  LATEST_STACK_TRACE,
  SEVERITY_BREAKDOWN,
  TOP_AFFECTED_SERVICES,
} from "./mock-data";
import type {
  ActiveIncident,
  ErrorSeverity,
  ErrorStatus,
  ErrorTrendChart,
  ErrorsMetricCard,
  GroupedErrorRow,
  HighestImpactError,
  SeverityBreakdown,
  StackTracePreview,
  AffectedService,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server-side queries for /dev/errors.

   Strategy:
   - Try Supabase first (the canonical source after the 0010 migration).
   - On any error (table missing, permission denied, network) fall back to
     centralized mock data so the page never breaks — useful in environments
     where the migration hasn't been applied yet.
   - All exports return the same typed shapes the components already expect.
   ───────────────────────────────────────────────────────────────────────── */

/* ── DB row → component shape ────────────────────────────────────────────── */

type DbErrorRow = {
  id: string;
  message: string;
  source: string;
  route: string | null;
  severity: ErrorSeverity;
  status: ErrorStatus;
  occurrences: number;
  affected_users: number;
  release: string | null;
  last_seen: string;
  owner: string | null;
};

function rowToGroupedError(r: DbErrorRow): GroupedErrorRow {
  return {
    id:            r.id,
    message:       r.message,
    source:        r.source,
    route:         r.route ?? "—",
    severity:      r.severity,
    status:        r.status,
    occurrences:   r.occurrences,
    affectedUsers: r.affected_users,
    release:       r.release ?? "—",
    lastSeen:      relativeTime(r.last_seen),
    owner:         r.owner ?? "Unassigned",
  };
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function buildIsoCutoff(hours: number): string {
  return new Date(Date.now() - hours * 3600 * 1000).toISOString();
}

/* ── Public queries ──────────────────────────────────────────────────────── */

/** Top-strip metric cards. Currently a mix of derived counts + mock series
 *  (sparklines are not yet stored in the DB). Shape kept stable so the
 *  ErrorsMetricCards component doesn't need to change again. */
export async function getErrorsMetrics(filters: ErrorsFilterState): Promise<ErrorsMetricCard[]> {
  try {
    const supabase = await createClient();
    const cutoff = buildIsoCutoff(filters.timeframeHours);

    // Run the live aggregates in parallel.
    const [{ count: criticalCount }, { count: openCount }, { data: lastDeploy }] = await Promise.all([
      supabase.from("dev_errors").select("id", { count: "exact", head: true })
        .eq("severity", "critical").gte("last_seen", cutoff),
      supabase.from("dev_errors").select("id", { count: "exact", head: true })
        .eq("status", "open").gte("last_seen", cutoff),
      supabase.from("dev_errors").select("release").order("last_seen", { ascending: false }).limit(1),
    ]);

    // Affected users — sum across error rows in the window.
    const { data: affectedRows } = await supabase
      .from("dev_errors")
      .select("affected_users")
      .gte("last_seen", cutoff);
    const affectedUsers = (affectedRows ?? []).reduce((s, r) => s + (r.affected_users ?? 0), 0);

    // Patch live values onto the mock card shapes (sparklines/baselines preserved).
    return ERRORS_METRIC_CARDS.map((card) => {
      if (card.key === "critical-errors" && typeof criticalCount === "number") {
        return { ...card, value: String(criticalCount) };
      }
      if (card.key === "open-incidents" && typeof openCount === "number") {
        return { ...card, value: String(openCount) };
      }
      if (card.key === "affected-users") {
        return { ...card, value: affectedUsers.toLocaleString() };
      }
      if (card.key === "errors-after-deploy" && lastDeploy?.[0]?.release) {
        return {
          ...card,
          badge: { label: lastDeploy[0].release as string, tone: "info" as const },
        };
      }
      return card;
    });
  } catch {
    return ERRORS_METRIC_CARDS;
  }
}

/** Paginated grouped errors list. */
export async function getErrorsList(filters: ErrorsFilterState): Promise<{ rows: GroupedErrorRow[]; total: number; totalPages: number }> {
  try {
    const supabase = await createClient();
    const from = (filters.page - 1) * ERRORS_PAGE_SIZE;
    const to = from + ERRORS_PAGE_SIZE - 1;

    let q = supabase
      .from("dev_errors")
      .select(
        "id, message, source, route, severity, status, occurrences, affected_users, release, last_seen, owner",
        { count: "exact" },
      );

    if (filters.severity !== "all") q = q.eq("severity", filters.severity);
    if (filters.status !== "all")   q = q.eq("status", filters.status);
    if (filters.source !== "all")   q = q.eq("source", filters.source);
    if (filters.environment)        q = q.eq("environment", filters.environment);
    if (filters.q) {
      const term = filters.q.replace(/[%_]/g, "\\$&");
      q = q.or(`id.ilike.%${term}%,message.ilike.%${term}%,route.ilike.%${term}%,owner.ilike.%${term}%`);
    }
    q = q.gte("last_seen", buildIsoCutoff(filters.timeframeHours));

    // Postgres orders enums by declaration order — `dev_error_severity` is
    // declared critical→high→medium→low, which is exactly what we want here.
    const { data, error, count } = await q
      .order("severity", { ascending: true })
      .order("last_seen", { ascending: false })
      .range(from, to);

    if (error || !data) throw error ?? new Error("no data");

    const rows = data.map(rowToGroupedError);
    const total = count ?? rows.length;
    const totalPages = Math.max(1, Math.ceil(total / ERRORS_PAGE_SIZE));
    return { rows, total, totalPages };
  } catch {
    // Mock fallback — apply filters locally so the page still feels alive.
    const filtered = filterMockedRows(GROUPED_ERRORS, filters);
    const total = filtered.length || GROUPED_ERRORS_TOTAL;
    const start = (filters.page - 1) * ERRORS_PAGE_SIZE;
    const rows = filtered.slice(start, start + ERRORS_PAGE_SIZE);
    return {
      rows: rows.length > 0 ? rows : filtered,
      total,
      totalPages: Math.max(1, Math.ceil(total / ERRORS_PAGE_SIZE)),
    };
  }
}

function filterMockedRows(rows: GroupedErrorRow[], f: ErrorsFilterState): GroupedErrorRow[] {
  const term = f.q.toLowerCase();
  return rows.filter((r) => {
    if (f.severity !== "all" && r.severity !== f.severity) return false;
    if (f.status !== "all" && r.status !== f.status) return false;
    if (f.source !== "all" && r.source !== f.source) return false;
    if (term) {
      const blob = `${r.id} ${r.message} ${r.route} ${r.owner}`.toLowerCase();
      if (!blob.includes(term)) return false;
    }
    return true;
  });
}

/** Error trends chart. Currently mock — would aggregate hourly counts.
 *  Accepts the filter state for parity with the other queries; not yet wired
 *  through to the DB aggregate. */
export async function getErrorTrends(filters: ErrorsFilterState): Promise<ErrorTrendChart> {
  void filters;
  return ERROR_TRENDS_CHART;
}

/** Donut breakdown. Currently mock — would group by severity. */
export async function getSeverityBreakdown(filters: ErrorsFilterState): Promise<SeverityBreakdown> {
  void filters;
  return SEVERITY_BREAKDOWN;
}

/** Top affected services. Currently mock — would group by source. */
export async function getTopAffectedServices(filters: ErrorsFilterState): Promise<AffectedService[]> {
  void filters;
  return TOP_AFFECTED_SERVICES;
}

/** Focus card. Returns the highest-impact error in the window. */
export async function getHighestImpactError(): Promise<HighestImpactError> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_errors")
      .select("id, message, type, status_code, route, first_seen, last_seen, occurrences, affected_users, environment, release, owner, impact, suggested_action")
      .order("affected_users", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return HIGHEST_IMPACT_ERROR;
    return {
      id:                  data.id,
      title:               data.message,
      type:                data.type ?? "Error",
      statusCode:          data.status_code ?? 0,
      route:               data.route ?? "—",
      firstSeen:           new Date(data.first_seen).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
      lastSeen:            relativeTime(data.last_seen),
      occurrences:         data.occurrences,
      affectedUsers:       data.affected_users,
      environment:         data.environment,
      release:             data.release ?? "—",
      owner:               data.owner ?? "Unassigned",
      impact:              (data.impact as HighestImpactError["impact"]) ?? "Medium",
      suggestedNextAction: data.suggested_action ?? "Investigate root cause and assign an owner.",
    };
  } catch {
    return HIGHEST_IMPACT_ERROR;
  }
}

/** Active incidents list. */
export async function getActiveIncidents(): Promise<ActiveIncident[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_incidents")
      .select("id, title, severity")
      .neq("status", "resolved")
      .order("severity", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(8);
    if (error || !data) return ACTIVE_INCIDENTS;
    return data.map((r) => ({ id: r.id, title: r.title, severity: r.severity as ErrorSeverity }));
  } catch {
    return ACTIVE_INCIDENTS;
  }
}

/** Latest stack trace shown in the right rail. */
export async function getLatestStackTrace(): Promise<StackTracePreview> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_stack_traces")
      .select("file_path, lines")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return LATEST_STACK_TRACE;
    return { filePath: data.file_path ?? "", lines: (data.lines as string[]) ?? [] };
  } catch {
    return LATEST_STACK_TRACE;
  }
}

/** Full stack trace for a specific error — used by the modal. */
export async function getStackTraceForError(errorId: string): Promise<StackTracePreview | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("dev_stack_traces")
      .select("file_path, lines")
      .eq("error_id", errorId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return null;
    if (!data) return null;
    return { filePath: data.file_path ?? "", lines: (data.lines as string[]) ?? [] };
  } catch {
    return null;
  }
}
