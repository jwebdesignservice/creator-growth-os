import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import { toUiStatus } from "./types";
import type { TaskSourceType, TaskTemplate, UserTask } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Read helpers for the unified task/mission system. Server-only. All degrade
   to safe empties if the task tables aren't applied yet, so pages never crash.
   ───────────────────────────────────────────────────────────────────────── */

const MISSING_TABLE = new Set(["42P01", "PGRST205", "PGRST204", "PGRST200"]);
function isMissingTable(err: { code?: string } | null | undefined): boolean {
  return !!err?.code && MISSING_TABLE.has(err.code);
}

const TEMPLATE_COLS =
  "id, title, description, task_type, source_type, source_id, program_id, lesson_id, created_by, status, visibility, sort_order, difficulty, estimated_minutes, due_after_days, auto_assign_trigger, points, is_required, created_at, updated_at";

function mapTemplate(r: Record<string, unknown>): TaskTemplate {
  return {
    id: r.id as string,
    title: (r.title as string) ?? "",
    description: (r.description as string) ?? "",
    taskType: (r.task_type as string) ?? "apply",
    sourceType: ((r.source_type as string) ?? "manual") as TaskSourceType,
    sourceId: (r.source_id as string | null) ?? null,
    programId: (r.program_id as string | null) ?? null,
    lessonId: (r.lesson_id as string | null) ?? null,
    createdBy: (r.created_by as string | null) ?? null,
    status: ((r.status as string) ?? "active") as TaskTemplate["status"],
    visibility: (r.visibility as string) ?? "default",
    sortOrder: (r.sort_order as number) ?? 0,
    difficulty: (r.difficulty as string) ?? "medium",
    estimatedMinutes: (r.estimated_minutes as number) ?? 15,
    dueAfterDays: (r.due_after_days as number | null) ?? null,
    autoAssignTrigger: ((r.auto_assign_trigger as string) ??
      "on_start") as TaskTemplate["autoAssignTrigger"],
    points: (r.points as number) ?? 10,
    isRequired: (r.is_required as boolean) ?? true,
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  };
}

/**
 * Every template authored by a source, ordered for the editor. Excludes
 * archived by default. Returns [] when the table isn't applied yet.
 */
export async function getTaskTemplatesForSource(
  sourceType: TaskSourceType,
  sourceId: string | null,
  opts?: { includeArchived?: boolean },
): Promise<TaskTemplate[]> {
  try {
    const db = createServiceClient();
    let query = db
      .from("task_templates")
      .select(TEMPLATE_COLS)
      .eq("source_type", sourceType)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (sourceId) query = query.eq("source_id", sourceId);
    if (!opts?.includeArchived) query = query.neq("status", "archived");
    const { data, error } = await query;
    if (error) return [];
    return (data ?? []).map((r) => mapTemplate(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

function mapUserTask(r: Record<string, unknown>): UserTask {
  const tpl = (r.task_templates as { difficulty?: string } | null) ?? null;
  return {
    id: r.id as string,
    taskTemplateId: (r.task_template_id as string | null) ?? null,
    userId: r.user_id as string,
    title:
      ((r.title_snapshot as string | null) ?? (r.title as string | null)) ??
      "Task",
    description:
      ((r.description_snapshot as string | null) ??
        (r.description as string | null)) ??
      "",
    status: toUiStatus(r.status as string | null),
    sourceType: ((r.source as string | null) ?? "manual") as TaskSourceType,
    sourceId: (r.source_id as string | null) ?? null,
    programId: (r.program_id as string | null) ?? null,
    lessonId: (r.lesson_id as string | null) ?? null,
    dueDate: (r.due_date as string | null) ?? null,
    estimatedMinutes: (r.estimated_minutes as number) ?? 15,
    points: (r.points as number) ?? 10,
    difficulty: (tpl?.difficulty as string) ?? "medium",
    startedAt: (r.started_at as string | null) ?? null,
    completedAt: (r.completed_at as string | null) ?? null,
    createdAt: (r.created_at as string) ?? "",
  };
}

/**
 * Every task assigned to a user (the UserTask store = `missions`), newest
 * first. Falls back to a core-column query on DBs where the unified columns /
 * embed aren't applied yet, so /missions always renders.
 */
export async function getUserTasks(userId: string): Promise<UserTask[]> {
  if (!userId) return [];
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("missions")
      .select(
        "id, task_template_id, user_id, title, title_snapshot, description, description_snapshot, status, source, source_id, program_id, lesson_id, due_date, estimated_minutes, points, started_at, completed_at, created_at, task_templates(difficulty)",
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingTable(error) || error.code === "42703") {
        const { data: basic } = await db
          .from("missions")
          .select(
            "id, user_id, title, description, status, source, program_id, lesson_id, due_date, estimated_minutes, points, completed_at, created_at",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        return (basic ?? []).map((r) =>
          mapUserTask(r as Record<string, unknown>),
        );
      }
      return [];
    }
    return (data ?? []).map((r) => mapUserTask(r as Record<string, unknown>));
  } catch {
    return [];
  }
}

export type TemplateAssignmentStats = {
  total: number;
  notStarted: number;
  inProgress: number;
  completed: number;
  skipped: number;
};

/** Assigned / completed / etc. counts for one template (admin mission stats). */
export async function getTemplateAssignmentStats(
  templateId: string,
): Promise<TemplateAssignmentStats> {
  const empty: TemplateAssignmentStats = {
    total: 0,
    notStarted: 0,
    inProgress: 0,
    completed: 0,
    skipped: 0,
  };
  if (!templateId) return empty;
  try {
    const db = createServiceClient();
    const { data, error } = await db
      .from("missions")
      .select("status")
      .eq("task_template_id", templateId);
    if (error || !data) return empty;
    const stats: TemplateAssignmentStats = { ...empty, total: data.length };
    for (const row of data) {
      const ui = toUiStatus((row as { status?: string }).status);
      if (ui === "not_started") stats.notStarted++;
      else if (ui === "in_progress") stats.inProgress++;
      else if (ui === "completed") stats.completed++;
      else if (ui === "skipped") stats.skipped++;
    }
    return stats;
  } catch {
    return empty;
  }
}
