"use server";

import { revalidatePath } from "next/cache";
import { requireAdminClient } from "@/lib/admin/require-admin";
import {
  createTaskTemplate,
  updateTaskTemplate,
  setTaskTemplateStatus,
  deleteTaskTemplate,
  duplicateTaskTemplate,
  setAssignmentRules,
  type AssignmentRuleInput,
} from "@/lib/tasks/actions";
import { runTemplateAssignment } from "@/lib/tasks/schedule";
import type { TaskFrequency, TaskTemplateStatus } from "@/lib/tasks/types";

/* ─────────────────────────────────────────────────────────────────────────
   Admin mission actions — thin wrappers over the UNIFIED task system
   (`task_templates` with source_type='admin_mission'). The legacy
   `mission_templates` table is no longer written here; its rows were folded
   into task_templates by migration 0041.
   ───────────────────────────────────────────────────────────────────────── */

type Result = { ok: true } | { ok: false; error: string };

const REVALIDATE = "/admin/missions";

export type AdminMissionInput = {
  title: string;
  description?: string;
  taskType?: string;
  points?: number;
  status?: TaskTemplateStatus;
  frequency?: TaskFrequency;
  scheduleTime?: string | null;
  timezone?: string | null;
  recurrence?: string | null;
  autoAssign?: boolean;
  dueAfterDays?: number | null;
  // Targeting → becomes task_assignment_rules.
  plan?: string | null; // 'free' | 'basic' | 'pro' | 'all' | null
  category?: string | null; // 'starter' | 'growth' | … | 'all' | null
};

/** Map the form's plan/category pickers to include-rules. */
function buildRules(
  plan?: string | null,
  category?: string | null,
): AssignmentRuleInput[] {
  const rules: AssignmentRuleInput[] = [];
  if (plan && plan !== "all") {
    rules.push({ ruleType: "include", targetType: "plan", targetValue: { plan } });
  }
  if (category && category !== "all") {
    rules.push({
      ruleType: "include",
      targetType: "category",
      targetValue: { category },
    });
  }
  // No narrowing chosen → everyone is eligible.
  if (rules.length === 0) {
    rules.push({ ruleType: "include", targetType: "all", targetValue: {} });
  }
  return rules;
}

export async function createAdminMission(
  input: AdminMissionInput,
): Promise<Result & { id?: string }> {
  const res = await createTaskTemplate({
    sourceType: "admin_mission",
    title: input.title,
    description: input.description,
    taskType: input.taskType,
    points: input.points,
    status: input.status ?? "active",
    frequency: input.frequency ?? "once",
    scheduleTime: input.scheduleTime ?? null,
    timezone: input.timezone ?? null,
    recurrence: input.recurrence ?? null,
    autoAssign: input.autoAssign ?? false,
    dueAfterDays: input.dueAfterDays ?? null,
    autoAssignTrigger: "manual",
  });
  if (!res.ok) return res;
  if (res.id) {
    const ruleRes = await setAssignmentRules(
      res.id,
      buildRules(input.plan, input.category),
    );
    if (!ruleRes.ok) return ruleRes;
  }
  revalidatePath(REVALIDATE);
  return { ok: true, id: res.id };
}

export async function updateAdminMission(
  id: string,
  input: AdminMissionInput,
): Promise<Result> {
  const res = await updateTaskTemplate(id, {
    title: input.title,
    description: input.description,
    taskType: input.taskType,
    points: input.points,
    status: input.status,
    frequency: input.frequency,
    scheduleTime: input.scheduleTime,
    timezone: input.timezone,
    recurrence: input.recurrence,
    autoAssign: input.autoAssign,
    dueAfterDays: input.dueAfterDays,
  });
  if (!res.ok) return res;
  const ruleRes = await setAssignmentRules(
    id,
    buildRules(input.plan, input.category),
  );
  if (!ruleRes.ok) return ruleRes;
  revalidatePath(REVALIDATE);
  return { ok: true };
}

export async function setAdminMissionStatus(
  id: string,
  status: TaskTemplateStatus,
): Promise<Result> {
  const res = await setTaskTemplateStatus(id, status);
  if (res.ok) revalidatePath(REVALIDATE);
  return res;
}

export async function deleteAdminMission(id: string): Promise<Result> {
  const res = await deleteTaskTemplate(id);
  if (res.ok) revalidatePath(REVALIDATE);
  return res;
}

export async function duplicateAdminMission(id: string): Promise<Result> {
  const res = await duplicateTaskTemplate(id);
  if (res.ok) revalidatePath(REVALIDATE);
  return res.ok ? { ok: true } : res;
}

/** Manual "Assign now" — force-assign the current period to eligible users. */
export async function assignAdminMissionNow(
  id: string,
): Promise<Result & { assigned?: number; skipped?: number }> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return { ok: false, error: ctx.error };
  const res = await runTemplateAssignment(id, { force: true });
  if (!res.ok) return { ok: false, error: res.error ?? "Assignment failed." };
  revalidatePath(REVALIDATE);
  revalidatePath("/missions");
  revalidatePath("/", "layout"); // refresh sidebar Tasks badge
  return { ok: true, assigned: res.assigned, skipped: res.skipped };
}
