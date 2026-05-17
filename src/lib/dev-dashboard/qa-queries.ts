import "server-only";
import { ClipboardList, CircleCheck, Search as SearchIcon, CircleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { QaFilterState } from "./qa-filters";
import {
  QA_BLOCKERS,
  QA_GROUPED_AREAS,
  QA_METRIC_CARDS,
  QA_PROGRESS_BY_AREA,
  QA_RECENT_ACTIVITY,
  QA_RELEASE_NOTES,
  QA_RELEASE_READINESS,
} from "./mock-data";
import type {
  QaActivityKind,
  QaActivityRow,
  QaBlocker,
  QaBlockerSeverity,
  QaCheckResultRow,
  QaCheckStatus,
  QaGroupedAreaWithChecks,
  QaMetricCard,
  QaProgressByAreaRow,
  QaReleaseNote,
  QaReleaseReadiness,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server queries for /dev/qa-checklist.

   Each query tries Supabase first; on any error (missing table, permission
   denied, network) it falls back to the centralized mock so the page never
   breaks before migration 0011 has been applied.
   ───────────────────────────────────────────────────────────────────────── */

/* ── Helpers ─────────────────────────────────────────────────────────────── */

async function getRunIdForRelease(release: string): Promise<string | null> {
  try {
    const supabase = await createClient();
    // Find the release row by version.
    const { data: rel } = await supabase
      .from("qa_releases")
      .select("id")
      .eq("version", release)
      .maybeSingle();
    if (!rel?.id) return null;

    // Most-recent in-progress run for that release.
    const { data: run } = await supabase
      .from("qa_runs")
      .select("id")
      .eq("release_id", rel.id)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return run?.id ?? null;
  } catch {
    return null;
  }
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ── Public queries ──────────────────────────────────────────────────────── */

/** Top-strip metric cards. Derived live from qa_check_results aggregates
 *  for the current run; sparkline/copy fall back to the mock shape. */
export async function getQaMetrics(filters: QaFilterState): Promise<QaMetricCard[]> {
  try {
    const supabase = await createClient();
    const runId = await getRunIdForRelease(filters.release);
    if (!runId) return QA_METRIC_CARDS;

    const { data: rows } = await supabase
      .from("qa_check_results")
      .select("status")
      .eq("run_id", runId);
    if (!rows) return QA_METRIC_CARDS;

    const total    = rows.length;
    const passed   = rows.filter((r) => r.status === "passed").length;
    const review   = rows.filter((r) => r.status === "review").length;
    const blockers = rows.filter((r) => r.status === "blocker").length;
    const readiness = total > 0 ? Math.round((passed / total) * 100) : 0;

    return [
      { key: "total-checks",      label: "Total Checks",      value: String(total),    tone: "blue",  icon: ClipboardList, note: "—",                  noteTone: "neutral" },
      { key: "passed",            label: "Passed",            value: String(passed),   tone: "green", icon: CircleCheck,   note: "↑ live count",       noteTone: "success" },
      { key: "needs-review",      label: "Needs Review",      value: String(review),   tone: "amber", icon: SearchIcon,    note: "live count",         noteTone: "warning" },
      { key: "blockers",          label: "Blockers",          value: String(blockers), tone: "red",   icon: CircleAlert,   note: blockers === 0 ? "All clear" : "Open",  noteTone: blockers === 0 ? "success" : "danger" },
      { key: "release-readiness", label: "Release Readiness", value: `${readiness}%`,  tone: "blue",  icon: ClipboardList, note: passed === total && total > 0 ? "Ready" : "In progress", noteTone: passed === total && total > 0 ? "success" : "neutral", donutPercent: readiness },
    ];
  } catch {
    return QA_METRIC_CARDS;
  }
}

/** Grouped areas with attached check-result rows for inline expansion. */
export async function getQaGroupedAreas(filters: QaFilterState): Promise<QaGroupedAreaWithChecks[]> {
  try {
    const supabase = await createClient();
    const runId = await getRunIdForRelease(filters.release);
    if (!runId) return QA_GROUPED_AREAS.map((a) => ({ ...a, checks: [] }));

    // Areas catalogue and all check results in one batch each.
    const [{ data: areas }, { data: rows }] = await Promise.all([
      supabase.from("qa_areas").select("key, letter, title, sort_order").order("sort_order"),
      supabase
        .from("qa_check_results")
        .select("id, area_key, title, owner_team, status, severity, sort_order")
        .eq("run_id", runId)
        .order("sort_order"),
    ]);
    if (!areas || !rows) return QA_GROUPED_AREAS.map((a) => ({ ...a, checks: [] }));

    // Apply free-text search across area title, check title, and owner.
    const term = filters.q.toLowerCase();
    const filteredRows = rows.filter((r) => {
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.owner !== "all" && r.owner_team !== filters.owner) return false;
      if (!term) return true;
      const blob = `${r.title} ${r.owner_team ?? ""}`.toLowerCase();
      return blob.includes(term);
    });

    return areas.map((area) => {
      const checks: QaCheckResultRow[] = filteredRows
        .filter((r) => r.area_key === area.key)
        .map((r) => ({
          id:        r.id,
          areaKey:   r.area_key,
          title:     r.title,
          ownerTeam: r.owner_team,
          status:    r.status as QaCheckStatus,
          severity:  r.severity as QaBlockerSeverity,
        }));

      // Counts derived from the unfiltered set so the summary stays stable
      // even when the user narrows the visible rows via filters.
      const areaRows = rows.filter((r) => r.area_key === area.key);
      const completed = areaRows.filter((r) => r.status === "passed").length;
      const passed       = areaRows.filter((r) => r.status === "passed").length;
      const needsReview  = areaRows.filter((r) => r.status === "review").length;
      const blockers     = areaRows.filter((r) => r.status === "blocker").length;
      const pending      = areaRows.filter((r) => r.status === "pending").length;

      return {
        key: area.key,
        letter: area.letter,
        title: area.title,
        completed,
        total: areaRows.length,
        counts: { passed, needsReview, blockers, pending },
        checks,
      };
    });
  } catch {
    return QA_GROUPED_AREAS.map((a) => ({ ...a, checks: [] }));
  }
}

/** Open blockers for the right-column Blockers card. */
export async function getQaBlockers(filters: QaFilterState): Promise<QaBlocker[]> {
  try {
    const supabase = await createClient();
    const runId = await getRunIdForRelease(filters.release);
    if (!runId) return QA_BLOCKERS;

    const { data } = await supabase
      .from("qa_check_results")
      .select("id, title, severity")
      .eq("run_id", runId)
      .eq("status", "blocker")
      .order("severity");
    if (!data) return QA_BLOCKERS;

    return data.map((r) => ({
      id: r.id,
      title: r.title,
      severity: r.severity as QaBlockerSeverity,
    }));
  } catch {
    return QA_BLOCKERS;
  }
}

/** Per-area progress percentages for the right column. */
export async function getQaProgressByArea(filters: QaFilterState): Promise<QaProgressByAreaRow[]> {
  try {
    const areas = await getQaGroupedAreas(filters);
    if (areas.length === 0) return QA_PROGRESS_BY_AREA;
    return areas.map((a) => ({
      key: a.key,
      label: a.title,
      percent: a.total > 0 ? Math.round((a.completed / a.total) * 100) : 0,
    }));
  } catch {
    return QA_PROGRESS_BY_AREA;
  }
}

/** Release readiness summary for the executive card. */
export async function getQaReleaseReadiness(filters: QaFilterState): Promise<QaReleaseReadiness> {
  try {
    const supabase = await createClient();
    const runId = await getRunIdForRelease(filters.release);
    if (!runId) return QA_RELEASE_READINESS;

    const [{ data: rows }, { data: run }] = await Promise.all([
      supabase.from("qa_check_results").select("status").eq("run_id", runId),
      supabase.from("qa_runs").select("started_at").eq("id", runId).maybeSingle(),
    ]);
    if (!rows) return QA_RELEASE_READINESS;

    const total  = rows.length;
    const passed = rows.filter((r) => r.status === "passed").length;
    const open   = rows.filter((r) => r.status !== "passed").length;
    const percent = total > 0 ? Math.round((passed / total) * 100) : 0;

    const headline =
      percent === 100 ? "All checks passed — ready to ship" :
      percent >= 90   ? "Ready for final review" :
      percent >= 70   ? "Making good progress" :
                        "Not ready — keep iterating";

    return {
      percent,
      headline,
      body:
        open === 0
          ? "All checks are green. Final approvers can sign off."
          : "Great progress! Address remaining review items and blockers to achieve 100% release readiness.",
      lastRun: run?.started_at ? relativeTime(run.started_at) : QA_RELEASE_READINESS.lastRun,
      release: filters.release,
    };
  } catch {
    return QA_RELEASE_READINESS;
  }
}

/** Recent activity / sign-offs feed. */
export async function getQaRecentActivity(filters: QaFilterState): Promise<QaActivityRow[]> {
  try {
    const supabase = await createClient();
    const runId = await getRunIdForRelease(filters.release);
    if (!runId) return QA_RECENT_ACTIVITY;

    const { data } = await supabase
      .from("qa_activity")
      .select("id, actor_initials, actor_name, message, kind, created_at")
      .eq("run_id", runId)
      .order("created_at", { ascending: false })
      .limit(8);
    if (!data) return QA_RECENT_ACTIVITY;

    return data.map((a) => ({
      id: a.id,
      actorInitials: a.actor_initials ?? "—",
      actorName: a.actor_name ?? "Unknown",
      message: a.message,
      timeLabel: relativeTime(a.created_at),
      kind: a.kind as QaActivityKind,
    }));
  } catch {
    return QA_RECENT_ACTIVITY;
  }
}

/** Release notes / context. */
export async function getQaReleaseNotes(filters: QaFilterState): Promise<QaReleaseNote[]> {
  try {
    const supabase = await createClient();
    const { data: rel } = await supabase
      .from("qa_releases")
      .select("target_at, environment, open_blockers_allowed, final_approvers")
      .eq("version", filters.release)
      .maybeSingle();
    if (!rel) return QA_RELEASE_NOTES;

    const target = rel.target_at
      ? new Date(rel.target_at).toLocaleString(undefined, {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "—";

    return [
      { label: "Target release",        value: target                                       },
      { label: "Environment",           value: rel.environment ?? "Production"              },
      { label: "Open blockers allowed", value: String(rel.open_blockers_allowed ?? 0)       },
      { label: "Final approvers",       value: rel.final_approvers ?? "—"                   },
    ];
  } catch {
    return QA_RELEASE_NOTES;
  }
}

/** List of releases for the filter bar. */
export async function getQaReleaseOptions(): Promise<{ value: string; label: string }[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("qa_releases")
      .select("version")
      .order("created_at", { ascending: false });
    if (!data || data.length === 0) return [{ value: "v1.4.2", label: "v1.4.2" }];
    return data.map((r) => ({ value: r.version, label: r.version }));
  } catch {
    return [{ value: "v1.4.2", label: "v1.4.2" }];
  }
}
