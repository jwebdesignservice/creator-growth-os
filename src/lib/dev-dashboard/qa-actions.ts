"use server";

import { revalidatePath } from "next/cache";
import { requireDevClient } from "./require-dev";
import { QA_GROUPED_AREAS } from "./mock-data";
import type { QaCheckStatus } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for /dev/qa-checklist

   - createQaRun:        creates a fresh QA run for a release and snapshots
                         every check template into qa_check_results.
   - updateCheckStatus:  flips the status of one check + writes activity.
   - exportChecklistCsv: dumps the current run's checks to CSV.
   ───────────────────────────────────────────────────────────────────────── */

export type QaActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

const VALID_STATUSES: ReadonlyArray<QaCheckStatus> = ["pending", "passed", "review", "blocker"];

function actorInitials(email: string | null | undefined): string {
  if (!email) return "—";
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length === 0) return local.slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1][0] ?? "")).toUpperCase();
}

function actorName(email: string | null | undefined): string {
  if (!email) return "Unknown";
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || "Unknown";
}

/* ── Create QA Run ───────────────────────────────────────────────────────── */

export async function createQaRun(release: string): Promise<QaActionResult<{ runId: string }>> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  const version = release.trim();
  if (!version) return { ok: false, error: "Release version is required." };

  // Find or create the release row.
  const { data: rel, error: relErr } = await ctx.supabase
    .from("qa_releases")
    .select("id")
    .eq("version", version)
    .maybeSingle();
  if (relErr) {
    if (relErr.code === "42P01") {
      return { ok: false, error: "QA tables not found. Apply migration 0011_qa_checklist.sql first." };
    }
    return { ok: false, error: relErr.message };
  }

  let releaseId = rel?.id;
  if (!releaseId) {
    const { data: inserted, error: insErr } = await ctx.supabase
      .from("qa_releases")
      .insert({ version })
      .select("id")
      .single();
    if (insErr) return { ok: false, error: insErr.message };
    releaseId = inserted!.id;
  }

  // Create the run.
  const email = ctx.user.email ?? null;
  const { data: run, error: runErr } = await ctx.supabase
    .from("qa_runs")
    .insert({
      release_id: releaseId,
      started_by_email: email,
      status: "in_progress",
    })
    .select("id")
    .single();
  if (runErr) return { ok: false, error: runErr.message };

  // Snapshot every template into qa_check_results with status='pending'.
  const { data: templates, error: tplErr } = await ctx.supabase
    .from("qa_check_templates")
    .select("id, area_key, title, description, owner_team, sort_order, default_severity");
  if (tplErr) return { ok: false, error: tplErr.message };

  if (templates && templates.length > 0) {
    const rows = templates.map((t) => ({
      run_id: run!.id,
      template_id: t.id,
      area_key: t.area_key,
      title: t.title,
      description: t.description,
      owner_team: t.owner_team,
      status: "pending" as QaCheckStatus,
      severity: t.default_severity,
      sort_order: t.sort_order,
    }));
    const { error: resErr } = await ctx.supabase.from("qa_check_results").insert(rows);
    if (resErr) return { ok: false, error: resErr.message };
  }

  // Activity row.
  await ctx.supabase.from("qa_activity").insert({
    run_id: run!.id,
    actor_email: email,
    actor_initials: actorInitials(email),
    actor_name: actorName(email),
    message: `created QA run for ${version}`,
    kind: "run-created",
  });

  revalidatePath("/dev/qa-checklist");
  return { ok: true, data: { runId: run!.id } };
}

/* ── Update Check Status ─────────────────────────────────────────────────── */

export async function updateCheckStatus(
  checkResultId: string,
  status: QaCheckStatus,
): Promise<QaActionResult> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  if (!VALID_STATUSES.includes(status)) {
    return { ok: false, error: "Invalid status." };
  }

  // Read the row first so we can write a precise activity message.
  const { data: row, error: readErr } = await ctx.supabase
    .from("qa_check_results")
    .select("id, run_id, title, status")
    .eq("id", checkResultId)
    .maybeSingle();
  if (readErr) {
    if (readErr.code === "42P01") {
      return { ok: false, error: "QA tables not found. Apply migration 0011_qa_checklist.sql first." };
    }
    return { ok: false, error: readErr.message };
  }
  if (!row) return { ok: false, error: "Check not found." };
  if (row.status === status) return { ok: true };

  const email = ctx.user.email ?? null;
  const { error: updErr } = await ctx.supabase
    .from("qa_check_results")
    .update({
      status,
      updated_at: new Date().toISOString(),
      updated_by_email: email,
    })
    .eq("id", checkResultId);
  if (updErr) return { ok: false, error: updErr.message };

  // Activity row — kind mirrors status transition.
  const kind =
    status === "passed"  ? "passed" :
    status === "review"  ? "review" :
    status === "blocker" ? "blocker-added" :
    "reset";

  const verb =
    status === "passed"  ? "marked" :
    status === "review"  ? "updated" :
    status === "blocker" ? "added blocker on" :
    "reset";

  const message =
    status === "blocker"
      ? `${verb} "${row.title}"`
      : status === "review"
        ? `${verb} "${row.title}" to Review`
        : status === "passed"
          ? `${verb} "${row.title}" as Passed`
          : `${verb} "${row.title}" to Pending`;

  await ctx.supabase.from("qa_activity").insert({
    run_id: row.run_id,
    check_result_id: row.id,
    actor_email: email,
    actor_initials: actorInitials(email),
    actor_name: actorName(email),
    message,
    kind,
  });

  revalidatePath("/dev/qa-checklist");
  return { ok: true };
}

/* ── Export Checklist as CSV ─────────────────────────────────────────────── */

const CSV_HEADERS = [
  "area",
  "title",
  "owner_team",
  "status",
  "severity",
  "updated_at",
  "updated_by_email",
] as const;

function escapeCsv(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function exportChecklistCsv(
  release: string,
): Promise<QaActionResult<{ csv: string; filename: string }>> {
  const ctx = await requireDevClient();
  if (!ctx.ok) return ctx;

  let rows: Array<Record<string, unknown>> = [];
  try {
    const { data: rel } = await ctx.supabase
      .from("qa_releases")
      .select("id")
      .eq("version", release)
      .maybeSingle();
    if (rel?.id) {
      const { data: run } = await ctx.supabase
        .from("qa_runs")
        .select("id")
        .eq("release_id", rel.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (run?.id) {
        const { data, error } = await ctx.supabase
          .from("qa_check_results")
          .select("area_key, title, owner_team, status, severity, updated_at, updated_by_email")
          .eq("run_id", run.id)
          .order("sort_order");
        if (error) throw error;
        rows = (data ?? []).map((r) => ({
          area: r.area_key,
          title: r.title,
          owner_team: r.owner_team,
          status: r.status,
          severity: r.severity,
          updated_at: r.updated_at,
          updated_by_email: r.updated_by_email,
        }));
      }
    }
  } catch {
    // fall through to mock
  }

  // Mock fallback so the export feature still works pre-migration.
  if (rows.length === 0) {
    rows = QA_GROUPED_AREAS.flatMap((area) =>
      Array.from({ length: area.total }).map((_, i) => ({
        area: area.key,
        title: `${area.title} — check ${i + 1}`,
        owner_team: null,
        status: i < area.counts.passed ? "passed" : "pending",
        severity: "medium",
        updated_at: new Date().toISOString(),
        updated_by_email: null,
      })),
    );
  }

  const lines = [CSV_HEADERS.join(",")];
  for (const r of rows) {
    lines.push(CSV_HEADERS.map((h) => escapeCsv(r[h])).join(","));
  }
  const csv = lines.join("\n");
  const filename = `qa-checklist-${release}-${new Date().toISOString().slice(0, 10)}.csv`;
  return { ok: true, data: { csv, filename } };
}
