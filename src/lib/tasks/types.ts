/* ─────────────────────────────────────────────────────────────────────────
   Shared types for the ONE central task/mission system.

   Model: a `task_template` (authored by a source — a program video, a
   tutorial, or an admin mission) is assigned to a user as a row in
   `public.missions` (the UserTask store the /missions page reads). Programs,
   tutorials and admin missions are just `source_type` values — never separate
   systems.
   ───────────────────────────────────────────────────────────────────────── */

export type TaskSourceType =
  | "program_video"
  | "tutorial"
  | "admin_mission"
  | "manual";

export type TaskTemplateStatus = "draft" | "active" | "archived";

export type AssignTrigger = "on_unlock" | "on_start" | "on_complete" | "manual";

/**
 * UI-facing user-task status. The DB column `missions.status` is a legacy enum
 * that stores `pending` for "not started" (plus a derived `overdue`); every
 * other value matches 1:1. Use the mappers below at the persistence boundary.
 */
export type UserTaskStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped";

export type TaskDifficulty = "easy" | "medium" | "advanced";

/** Map the legacy DB status to the UI status. */
export function toUiStatus(dbStatus: string | null | undefined): UserTaskStatus {
  switch (dbStatus) {
    case "in_progress":
      return "in_progress";
    case "completed":
      return "completed";
    case "skipped":
      return "skipped";
    // `pending` (not started) and the derived `overdue` both read as active.
    case "overdue":
      return "in_progress";
    default:
      return "not_started";
  }
}

/** Map a UI status back to what we persist in `missions.status`. */
export function toDbStatus(ui: UserTaskStatus): string {
  return ui === "not_started" ? "pending" : ui;
}

/** A unified template authored by any source. Mirrors `public.task_templates`. */
export type TaskTemplate = {
  id: string;
  title: string;
  description: string;
  taskType: string;
  sourceType: TaskSourceType;
  sourceId: string | null;
  programId: string | null;
  lessonId: string | null;
  createdBy: string | null;
  status: TaskTemplateStatus;
  visibility: string;
  sortOrder: number;
  difficulty: string;
  estimatedMinutes: number;
  dueAfterDays: number | null;
  autoAssignTrigger: AssignTrigger;
  points: number;
  isRequired: boolean;
  createdAt: string;
  updatedAt: string;
};

/** A task assigned to a user. Mirrors the unified-system view of `missions`. */
export type UserTask = {
  id: string;
  taskTemplateId: string | null;
  userId: string;
  title: string;
  description: string;
  status: UserTaskStatus;
  sourceType: TaskSourceType;
  sourceId: string | null;
  programId: string | null;
  lessonId: string | null;
  dueDate: string | null;
  estimatedMinutes: number;
  points: number;
  difficulty: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
};

/** Input for the shared task-template editor (create). Used by the program
 *  curriculum editor, tutorial editor, and admin missions alike. */
export type CreateTaskTemplateInput = {
  sourceType: TaskSourceType;
  sourceId?: string | null;
  programId?: string | null;
  lessonId?: string | null;
  title: string;
  description?: string;
  taskType?: string;
  difficulty?: string;
  estimatedMinutes?: number;
  dueAfterDays?: number | null;
  autoAssignTrigger?: AssignTrigger;
  points?: number;
  isRequired?: boolean;
  status?: TaskTemplateStatus;
  visibility?: string;
};

/** Partial patch for the shared task-template editor (update). */
export type TaskTemplatePatch = Partial<{
  title: string;
  description: string;
  taskType: string;
  difficulty: string;
  estimatedMinutes: number;
  dueAfterDays: number | null;
  autoAssignTrigger: AssignTrigger;
  points: number;
  isRequired: boolean;
  status: TaskTemplateStatus;
  visibility: string;
  sortOrder: number;
}>;
