import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import type { AssignTrigger, TaskSourceType } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   THE central assignment function. Every source — program video, tutorial,
   admin mission — funnels through here. There is exactly one code path that
   creates a UserTask (a row in `public.missions`).

   Guarantees:
   • Idempotent. Running it twice for the same (user, source) never creates
     a duplicate task. Protected three ways: pre-filter on existing
     task_template_id, a partial unique index on (user_id, task_template_id),
     and a per-row insert fallback that swallows unique-violation races.
   • Only ACTIVE templates assign. Draft / archived are ignored.
   • Snapshots title + description onto the mission so later template edits
     never mutate already-assigned tasks.
   • Resilient. If the task tables aren't applied yet it degrades to a no-op
     ({ ok:true, assigned:[], skipped:[] }) so learner flows never break, and
     it never throws.
   ───────────────────────────────────────────────────────────────────────── */

export type AssignResult =
  | { ok: true; assigned: string[]; skipped: string[] }
  | { ok: false; error: string };

const MISSING_TABLE = new Set(["42P01", "PGRST205", "PGRST204", "PGRST200"]);
function isMissingTable(err: { code?: string } | null | undefined): boolean {
  return !!err?.code && MISSING_TABLE.has(err.code);
}

type TemplateRow = {
  id: string;
  title: string | null;
  description: string | null;
  task_type: string | null;
  program_id: string | null;
  lesson_id: string | null;
  estimated_minutes: number | null;
  points: number | null;
  due_after_days: number | null;
};

/**
 * Assign every active task_template for a source to a user — once.
 *
 * @param userId      the user receiving the tasks
 * @param sourceType  program_video | tutorial | admin_mission | manual
 * @param sourceId    the lesson id (video/tutorial) — null for admin missions
 * @param opts.trigger optional: only assign templates whose auto_assign_trigger
 *                     matches (e.g. "on_start" vs "on_complete")
 */
export async function assignTasksFromSource(
  userId: string,
  sourceType: TaskSourceType,
  sourceId: string | null,
  opts?: { trigger?: AssignTrigger },
): Promise<AssignResult> {
  if (!userId) return { ok: false, error: "Missing user." };

  try {
    const db = createServiceClient();

    // 1. Active templates for this source (+ optional trigger filter).
    let query = db
      .from("task_templates")
      .select(
        "id, title, description, task_type, program_id, lesson_id, estimated_minutes, points, due_after_days",
      )
      .eq("source_type", sourceType)
      .eq("status", "active")
      .order("sort_order", { ascending: true });
    if (sourceId) query = query.eq("source_id", sourceId);
    if (opts?.trigger) query = query.eq("auto_assign_trigger", opts.trigger);

    const { data: templates, error: tErr } = await query;
    if (tErr) {
      if (isMissingTable(tErr)) return { ok: true, assigned: [], skipped: [] };
      return { ok: false, error: tErr.message };
    }
    const list = (templates ?? []) as TemplateRow[];
    if (list.length === 0) return { ok: true, assigned: [], skipped: [] };

    const templateIds = list.map((t) => t.id);

    // 2. Which of these does the user already have?
    const { data: existing, error: exErr } = await db
      .from("missions")
      .select("task_template_id")
      .eq("user_id", userId)
      .in("task_template_id", templateIds);
    if (exErr && !isMissingTable(exErr)) {
      return { ok: false, error: exErr.message };
    }
    const have = new Set(
      (existing ?? [])
        .map((m) => m.task_template_id as string | null)
        .filter((id): id is string => !!id),
    );

    const skipped: string[] = list
      .filter((t) => have.has(t.id))
      .map((t) => t.id);
    const fresh = list.filter((t) => !have.has(t.id));

    if (fresh.length === 0) {
      await logEvents(db, userId, sourceType, sourceId, [], skipped);
      return { ok: true, assigned: [], skipped };
    }

    // 3. Build mission rows — snapshot title/description, compute due_date.
    const now = Date.now();
    const rows = fresh.map((t) => {
      const title = (t.title ?? "").trim() || "Task";
      const description = t.description ?? "";
      const dueDate =
        t.due_after_days != null
          ? new Date(now + t.due_after_days * 86_400_000)
              .toISOString()
              .slice(0, 10)
          : null;
      return {
        user_id: userId,
        task_template_id: t.id,
        title,
        description,
        title_snapshot: title,
        description_snapshot: description,
        status: "pending",
        source: sourceType,
        source_id: sourceId,
        program_id: t.program_id ?? null,
        lesson_id: t.lesson_id ?? null,
        estimated_minutes: t.estimated_minutes ?? 15,
        points: t.points ?? 10,
        due_date: dueDate,
      };
    });

    // 4. Insert. Bulk first; on a unique-violation race fall back to per-row
    //    so one collision never blocks the rest.
    const assignedRows: { id: string; task_template_id: string }[] = [];
    const raced: string[] = [];

    const { data: inserted, error: insErr } = await db
      .from("missions")
      .insert(rows)
      .select("id, task_template_id");

    if (!insErr) {
      for (const r of inserted ?? []) {
        if (r.task_template_id) {
          assignedRows.push({ id: r.id, task_template_id: r.task_template_id });
        }
      }
    } else if (isMissingTable(insErr)) {
      return { ok: true, assigned: [], skipped };
    } else {
      for (const row of rows) {
        const { data: one, error: e1 } = await db
          .from("missions")
          .insert(row)
          .select("id, task_template_id")
          .maybeSingle();
        if (!e1 && one?.task_template_id) {
          assignedRows.push({
            id: one.id,
            task_template_id: one.task_template_id,
          });
        } else {
          raced.push(row.task_template_id);
        }
      }
    }

    await logEvents(db, userId, sourceType, sourceId, assignedRows, [
      ...skipped,
      ...raced,
    ]);

    return {
      ok: true,
      assigned: assignedRows.map((r) => r.task_template_id),
      skipped: [...skipped, ...raced],
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Assignment failed.",
    };
  }
}

/** Best-effort audit log. Never throws; a missing table is ignored. */
async function logEvents(
  db: ReturnType<typeof createServiceClient>,
  userId: string,
  sourceType: TaskSourceType,
  sourceId: string | null,
  assigned: { id: string; task_template_id: string }[],
  skippedTemplateIds: string[],
): Promise<void> {
  const events = [
    ...assigned.map((r) => ({
      user_id: userId,
      task_template_id: r.task_template_id,
      user_task_id: r.id,
      event_type: "assigned",
      source_type: sourceType,
      source_id: sourceId,
    })),
    ...skippedTemplateIds.map((tid) => ({
      user_id: userId,
      task_template_id: tid,
      event_type: "skipped_duplicate",
      source_type: sourceType,
      source_id: sourceId,
    })),
  ];
  if (events.length === 0) return;
  try {
    await db.from("task_event_logs").insert(events);
  } catch {
    /* logging is best-effort — never block assignment on it */
  }
}
