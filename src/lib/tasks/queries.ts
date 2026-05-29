import "server-only";

import { createServiceClient } from "@/lib/supabase/server";
import { toUiStatus } from "./types";
import type {
  AssignmentRule,
  AssignmentRuleTargetType,
  TaskFrequency,
  TaskSourceType,
  TaskTemplate,
  UserTask,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Read helpers for the unified task/mission system. Server-only. All degrade
   to safe empties if the task tables aren't applied yet, so pages never crash.
   ───────────────────────────────────────────────────────────────────────── */

const MISSING_TABLE = new Set(["42P01", "PGRST205", "PGRST204", "PGRST200"]);
function isMissingTable(err: { code?: string } | null | undefined): boolean {
  return !!err?.code && MISSING_TABLE.has(err.code);
}

const TEMPLATE_COLS =
  "id, title, description, task_type, source_type, source_id, program_id, lesson_id, created_by, status, visibility, sort_order, difficulty, estimated_minutes, due_after_days, auto_assign_trigger, points, is_required, frequency, schedule_time, timezone, recurrence, auto_assign, last_run_at, created_at, updated_at";

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
    frequency: ((r.frequency as string) ?? "once") as TaskFrequency,
    scheduleTime: (r.schedule_time as string | null) ?? null,
    timezone: (r.timezone as string | null) ?? null,
    recurrence: (r.recurrence as string | null) ?? null,
    autoAssign: (r.auto_assign as boolean) ?? false,
    lastRunAt: (r.last_run_at as string | null) ?? null,
    createdAt: (r.created_at as string) ?? "",
    updatedAt: (r.updated_at as string) ?? "",
  };
}

function mapRule(r: Record<string, unknown>): AssignmentRule {
  return {
    id: r.id as string,
    taskTemplateId: r.task_template_id as string,
    ruleType: ((r.rule_type as string) ?? "include") as AssignmentRule["ruleType"],
    targetType: ((r.target_type as string) ?? "all") as AssignmentRuleTargetType,
    targetValue: (r.target_value as Record<string, unknown> | null) ?? {},
    active: (r.active as boolean) ?? true,
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

/* ── Admin missions: list rows + scheduling stats for the /admin/missions UI ─ */

export type AdminMissionRow = {
  template: TaskTemplate;
  rules: AssignmentRule[];
  /** Distinct users who have ever been assigned this template. */
  assignedUsers: number;
  /** Missions for this template marked completed. */
  completed: number;
};

/**
 * Every admin-mission template with its targeting rules + live assignment
 * counts. Powers the Mission Templates table. Degrades to [] pre-migration.
 */
export async function getAdminMissionTemplates(): Promise<AdminMissionRow[]> {
  try {
    const db = createServiceClient();
    const { data: tpls, error } = await db
      .from("task_templates")
      .select(TEMPLATE_COLS)
      .eq("source_type", "admin_mission")
      .order("created_at", { ascending: false });
    if (error || !tpls) return [];

    const templates = tpls.map((r) => mapTemplate(r as Record<string, unknown>));
    const ids = templates.map((t) => t.id);
    if (ids.length === 0) return [];

    const [{ data: ruleRows }, { data: missionRows }] = await Promise.all([
      db
        .from("task_assignment_rules")
        .select("id, task_template_id, rule_type, target_type, target_value, active")
        .in("task_template_id", ids),
      db
        .from("missions")
        .select("task_template_id, user_id, status")
        .in("task_template_id", ids),
    ]);

    const rulesByTemplate = new Map<string, AssignmentRule[]>();
    for (const r of ruleRows ?? []) {
      const mapped = mapRule(r as Record<string, unknown>);
      const arr = rulesByTemplate.get(mapped.taskTemplateId) ?? [];
      arr.push(mapped);
      rulesByTemplate.set(mapped.taskTemplateId, arr);
    }

    const usersByTemplate = new Map<string, Set<string>>();
    const completedByTemplate = new Map<string, number>();
    for (const m of missionRows ?? []) {
      const tid = m.task_template_id as string | null;
      if (!tid) continue;
      if (!usersByTemplate.has(tid)) usersByTemplate.set(tid, new Set());
      usersByTemplate.get(tid)!.add(m.user_id as string);
      if (toUiStatus(m.status as string | null) === "completed") {
        completedByTemplate.set(tid, (completedByTemplate.get(tid) ?? 0) + 1);
      }
    }

    return templates.map((template) => ({
      template,
      rules: rulesByTemplate.get(template.id) ?? [],
      assignedUsers: usersByTemplate.get(template.id)?.size ?? 0,
      completed: completedByTemplate.get(template.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export type MissionSchedulingStats = {
  activeTemplates: number;
  byFrequency: Record<TaskFrequency, number>;
  autoAssignTemplates: number;
  autoAssignedTasks: number; // missions created from admin-mission templates
  usersAffected: number; // distinct users with any admin-mission task
};

/** Right-rail "Scheduling overview" + "Automation summary" — all real data. */
export async function getMissionSchedulingStats(): Promise<MissionSchedulingStats> {
  const empty: MissionSchedulingStats = {
    activeTemplates: 0,
    byFrequency: { once: 0, daily: 0, weekly: 0, monthly: 0, scheduled: 0 },
    autoAssignTemplates: 0,
    autoAssignedTasks: 0,
    usersAffected: 0,
  };
  try {
    const db = createServiceClient();
    const { data: tpls, error } = await db
      .from("task_templates")
      .select("frequency, auto_assign, status")
      .eq("source_type", "admin_mission")
      .eq("status", "active");
    if (error || !tpls) return empty;

    const stats: MissionSchedulingStats = {
      ...empty,
      byFrequency: { once: 0, daily: 0, weekly: 0, monthly: 0, scheduled: 0 },
      activeTemplates: tpls.length,
    };
    for (const t of tpls) {
      const f = ((t.frequency as string) ?? "once") as TaskFrequency;
      if (f in stats.byFrequency) stats.byFrequency[f] += 1;
      if (t.auto_assign) stats.autoAssignTemplates += 1;
    }

    const { data: missionRows } = await db
      .from("missions")
      .select("user_id")
      .eq("source", "admin_mission");
    stats.autoAssignedTasks = missionRows?.length ?? 0;
    stats.usersAffected = new Set(
      (missionRows ?? []).map((m) => m.user_id as string),
    ).size;

    return stats;
  } catch {
    return empty;
  }
}
