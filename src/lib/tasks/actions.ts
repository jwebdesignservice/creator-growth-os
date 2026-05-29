"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyTaskCompleted } from "@/lib/notifications/service";
import { assignTasksFromSource, type AssignResult } from "./assign";
import type {
  AssignTrigger,
  CreateTaskTemplateInput,
  TaskFrequency,
  TaskSourceType,
  TaskTemplatePatch,
  TaskTemplateStatus,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server actions for the unified task/mission system.

   • Admin: task_template CRUD — the ONE editor backend shared by program
     videos, tutorials, and admin missions.
   • assignForCurrentUser — thin wrapper that runs the central assignment
     engine for the signed-in learner (used by start/complete triggers).
   • User: task lifecycle (start / complete / skip) on the missions store.
   ───────────────────────────────────────────────────────────────────────── */

type Result = { ok: true } | { ok: false; error: string };

const MISSING_TABLE = new Set(["42P01", "PGRST205", "PGRST204", "PGRST200"]);
function missingTable(err: { code?: string } | null | undefined): boolean {
  return !!err?.code && MISSING_TABLE.has(err.code);
}
const APPLY_HINT =
  "The unified task tables aren't applied yet — run supabase/APPLY_THIS_IN_SUPABASE_STUDIO.sql (migration 0038).";

const SOURCE_TYPES = new Set<TaskSourceType>([
  "program_video",
  "tutorial",
  "admin_mission",
  "manual",
]);
const TRIGGERS = new Set<AssignTrigger>([
  "on_unlock",
  "on_start",
  "on_complete",
  "manual",
]);
const STATUSES = new Set<TaskTemplateStatus>(["draft", "active", "archived"]);
const FREQUENCIES = new Set<TaskFrequency>([
  "once",
  "daily",
  "weekly",
  "monthly",
  "scheduled",
]);

function clampInt(v: number | undefined | null, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0
    ? Math.floor(v)
    : fallback;
}

/* ── Admin: task-template CRUD (shared editor for every source) ─────────── */

export async function createTaskTemplate(
  input: CreateTaskTemplateInput,
): Promise<Result & { id?: string }> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!SOURCE_TYPES.has(input.sourceType)) {
    return { ok: false, error: "Invalid source type." };
  }
  const title = (input.title ?? "").trim();
  if (!title) return { ok: false, error: "Task title is required." };

  const {
    data: { user },
  } = await ctx.supabase.auth.getUser();
  const db = createServiceClient();

  const trigger =
    input.autoAssignTrigger && TRIGGERS.has(input.autoAssignTrigger)
      ? input.autoAssignTrigger
      : "on_start";
  const status =
    input.status && STATUSES.has(input.status) ? input.status : "active";

  // Default sort_order to "last for this source".
  let sortOrder = 0;
  {
    let q = db
      .from("task_templates")
      .select("sort_order")
      .eq("source_type", input.sourceType)
      .order("sort_order", { ascending: false })
      .limit(1);
    if (input.sourceId) q = q.eq("source_id", input.sourceId);
    const { data: last } = await q.maybeSingle();
    sortOrder = ((last?.sort_order as number | undefined) ?? 0) + 1;
  }

  const { data, error } = await db
    .from("task_templates")
    .insert({
      title,
      description: (input.description ?? "").trim(),
      task_type: (input.taskType ?? "").trim() || "apply",
      source_type: input.sourceType,
      source_id: input.sourceId ?? null,
      program_id: input.programId ?? null,
      lesson_id: input.lessonId ?? null,
      created_by: user?.id ?? null,
      status,
      visibility: input.visibility ?? "default",
      sort_order: sortOrder,
      difficulty: input.difficulty ?? "medium",
      estimated_minutes: clampInt(input.estimatedMinutes, 15),
      due_after_days:
        input.dueAfterDays == null ? null : clampInt(input.dueAfterDays, 0),
      auto_assign_trigger: trigger,
      points: clampInt(input.points, 10),
      is_required: input.isRequired ?? true,
      frequency:
        input.frequency && FREQUENCIES.has(input.frequency)
          ? input.frequency
          : "once",
      schedule_time: input.scheduleTime?.trim() || null,
      timezone: input.timezone?.trim() || null,
      recurrence: input.recurrence?.trim() || null,
      auto_assign: input.autoAssign ?? false,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    if (missingTable(error)) return { ok: false, error: APPLY_HINT };
    return { ok: false, error: error.message };
  }
  return { ok: true, id: (data?.id as string) ?? undefined };
}

export async function updateTaskTemplate(
  id: string,
  patch: TaskTemplatePatch,
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const db = createServiceClient();

  const update: Record<string, unknown> = {};
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false, error: "Task title cannot be empty." };
    update.title = t;
  }
  if (patch.description !== undefined)
    update.description = (patch.description ?? "").trim();
  if (patch.taskType !== undefined)
    update.task_type = patch.taskType.trim() || "apply";
  if (patch.difficulty !== undefined) update.difficulty = patch.difficulty;
  if (patch.estimatedMinutes !== undefined)
    update.estimated_minutes = clampInt(patch.estimatedMinutes, 15);
  if (patch.dueAfterDays !== undefined)
    update.due_after_days =
      patch.dueAfterDays == null ? null : clampInt(patch.dueAfterDays, 0);
  if (patch.autoAssignTrigger !== undefined) {
    if (!TRIGGERS.has(patch.autoAssignTrigger))
      return { ok: false, error: "Invalid assignment trigger." };
    update.auto_assign_trigger = patch.autoAssignTrigger;
  }
  if (patch.points !== undefined) update.points = clampInt(patch.points, 10);
  if (patch.isRequired !== undefined) update.is_required = patch.isRequired;
  if (patch.status !== undefined) {
    if (!STATUSES.has(patch.status))
      return { ok: false, error: "Invalid status." };
    update.status = patch.status;
  }
  if (patch.visibility !== undefined) update.visibility = patch.visibility;
  if (patch.sortOrder !== undefined)
    update.sort_order = clampInt(patch.sortOrder, 0);
  if (patch.frequency !== undefined) {
    if (!FREQUENCIES.has(patch.frequency))
      return { ok: false, error: "Invalid frequency." };
    update.frequency = patch.frequency;
  }
  if (patch.scheduleTime !== undefined)
    update.schedule_time = patch.scheduleTime?.trim() || null;
  if (patch.timezone !== undefined)
    update.timezone = patch.timezone?.trim() || null;
  if (patch.recurrence !== undefined)
    update.recurrence = patch.recurrence?.trim() || null;
  if (patch.autoAssign !== undefined) update.auto_assign = !!patch.autoAssign;

  if (Object.keys(update).length === 0) return { ok: true };

  const { error } = await db.from("task_templates").update(update).eq("id", id);
  if (error) {
    if (missingTable(error)) return { ok: false, error: APPLY_HINT };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function setTaskTemplateStatus(
  id: string,
  status: TaskTemplateStatus,
): Promise<Result> {
  if (!STATUSES.has(status)) return { ok: false, error: "Invalid status." };
  return updateTaskTemplate(id, { status });
}

export async function deleteTaskTemplate(id: string): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const db = createServiceClient();
  // Already-assigned user tasks survive: missions.task_template_id is
  // ON DELETE SET NULL and keeps its title/description snapshot.
  const { error } = await db.from("task_templates").delete().eq("id", id);
  if (error) {
    if (missingTable(error)) return { ok: false, error: APPLY_HINT };
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/** Replace a template's targeting rules (delete-then-insert). Admin-gated. */
export type AssignmentRuleInput = {
  ruleType: "include" | "exclude";
  targetType: string;
  targetValue: Record<string, unknown>;
};

export async function setAssignmentRules(
  templateId: string,
  rules: AssignmentRuleInput[],
): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!templateId) return { ok: false, error: "Missing template id." };
  const db = createServiceClient();

  const { error: delErr } = await db
    .from("task_assignment_rules")
    .delete()
    .eq("task_template_id", templateId);
  if (delErr) {
    if (missingTable(delErr)) return { ok: false, error: APPLY_HINT };
    return { ok: false, error: delErr.message };
  }

  if (rules.length === 0) return { ok: true };

  const rows = rules.map((r) => ({
    task_template_id: templateId,
    rule_type: r.ruleType === "exclude" ? "exclude" : "include",
    target_type: r.targetType,
    target_value: r.targetValue ?? {},
    active: true,
  }));
  const { error: insErr } = await db.from("task_assignment_rules").insert(rows);
  if (insErr) return { ok: false, error: insErr.message };
  return { ok: true };
}

export async function reorderTaskTemplates(ids: string[]): Promise<Result> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  if (!Array.isArray(ids) || ids.length === 0) return { ok: true };
  const db = createServiceClient();
  for (let i = 0; i < ids.length; i++) {
    const { error } = await db
      .from("task_templates")
      .update({ sort_order: i })
      .eq("id", ids[i]);
    if (error) {
      if (missingTable(error)) return { ok: false, error: APPLY_HINT };
      return { ok: false, error: error.message };
    }
  }
  return { ok: true };
}

export async function duplicateTaskTemplate(
  id: string,
): Promise<Result & { id?: string }> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const db = createServiceClient();
  const { data: src, error: readErr } = await db
    .from("task_templates")
    .select(
      "title, description, task_type, source_type, source_id, program_id, lesson_id, difficulty, estimated_minutes, due_after_days, auto_assign_trigger, points, is_required, visibility, sort_order, frequency, schedule_time, timezone, recurrence, auto_assign",
    )
    .eq("id", id)
    .maybeSingle();
  if (readErr) {
    if (missingTable(readErr)) return { ok: false, error: APPLY_HINT };
    return { ok: false, error: readErr.message };
  }
  if (!src) return { ok: false, error: "Template not found." };

  const { data, error } = await db
    .from("task_templates")
    .insert({
      ...src,
      title: `${(src.title as string) || "Task"} (Copy)`,
      status: "draft",
      sort_order: ((src.sort_order as number | undefined) ?? 0) + 1,
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: (data?.id as string) ?? undefined };
}

/* ── Assignment trigger wrapper (learner start / complete) ──────────────── */

export async function assignForCurrentUser(
  sourceType: TaskSourceType,
  sourceId: string | null,
  trigger?: AssignTrigger,
): Promise<AssignResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };
  const result = await assignTasksFromSource(user.id, sourceType, sourceId, {
    trigger,
  });
  // When new tasks were actually assigned, refresh the missions page and the
  // cached app-shell layout so the sidebar "Tasks" badge reflects them at once.
  if (result.ok && result.assigned.length > 0) {
    revalidatePath("/missions");
    revalidatePath("/", "layout");
  }
  return result;
}

/* ── User: task lifecycle (start / complete / skip) ─────────────────────── */

type LifecycleRow = {
  status: string | null;
  task_template_id: string | null;
  source: string | null;
  source_id: string | null;
  title: string | null;
  title_snapshot: string | null;
};

async function loadOwnTask(missionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, supabase, row: null as LifecycleRow | null };
  const { data } = await supabase
    .from("missions")
    .select("status, task_template_id, source, source_id, title, title_snapshot")
    .eq("id", missionId)
    .eq("user_id", user.id)
    .maybeSingle();
  return { user, supabase, row: (data as LifecycleRow | null) ?? null };
}

export async function startUserTask(missionId: string): Promise<Result> {
  const { user, supabase, row } = await loadOwnTask(missionId);
  if (!user) return { ok: false, error: "Not signed in." };
  if (!row) return { ok: false, error: "Task not found." };
  if (row.status === "completed") return { ok: true };

  const { error } = await supabase
    .from("missions")
    .update({ status: "in_progress", started_at: new Date().toISOString() })
    .eq("id", missionId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  await logUserEvent(user.id, missionId, row, "started");
  revalidatePath("/missions");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function completeUserTask(
  missionId: string,
  completed = true,
): Promise<Result> {
  const { user, supabase, row } = await loadOwnTask(missionId);
  if (!user) return { ok: false, error: "Not signed in." };
  if (!row) return { ok: false, error: "Task not found." };

  const { error } = await supabase
    .from("missions")
    .update({
      status: completed ? "completed" : "in_progress",
      completed_at: completed ? new Date().toISOString() : null,
    })
    .eq("id", missionId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  if (completed && row.status !== "completed") {
    await notifyTaskCompleted(
      user.id,
      row.title_snapshot ?? row.title ?? "Task",
    );
    await logUserEvent(user.id, missionId, row, "completed");
  }
  revalidatePath("/missions");
  revalidatePath("/dashboard");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function skipUserTask(missionId: string): Promise<Result> {
  const { user, supabase, row } = await loadOwnTask(missionId);
  if (!user) return { ok: false, error: "Not signed in." };
  if (!row) return { ok: false, error: "Task not found." };

  const { error } = await supabase
    .from("missions")
    .update({ status: "skipped" })
    .eq("id", missionId)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  await logUserEvent(user.id, missionId, row, "skipped");
  revalidatePath("/missions");
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Best-effort lifecycle log (service client; task_event_logs is admin-RLS). */
async function logUserEvent(
  userId: string,
  missionId: string,
  row: LifecycleRow,
  eventType: string,
): Promise<void> {
  try {
    const db = createServiceClient();
    await db.from("task_event_logs").insert({
      user_id: userId,
      task_template_id: row.task_template_id ?? null,
      user_task_id: missionId,
      event_type: eventType,
      source_type: row.source ?? null,
      source_id: row.source_id ?? null,
    });
  } catch {
    /* best-effort — never block the user action on logging */
  }
}
