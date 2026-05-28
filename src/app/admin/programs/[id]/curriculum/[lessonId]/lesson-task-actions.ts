"use server";

import { requireAdminClient } from "@/lib/admin/require-admin";
import { getTaskTemplatesForSource } from "@/lib/tasks/queries";

/* ─────────────────────────────────────────────────────────────────────────
   Read helper for the lesson task composer. Admin-gated wrapper around the
   unified `getTaskTemplatesForSource` so the (client) composer can load this
   lesson's program-video tasks for its collapsed-row list without the parent
   server page having to thread the data through. Returns [] for non-admins
   or when the task tables aren't applied yet.
   ───────────────────────────────────────────────────────────────────────── */

export async function listLessonProgramTasks(lessonId: string): Promise<
  {
    id: string;
    title: string;
    description: string;
    taskType: string;
    difficulty: string;
    estimatedMinutes: number;
    points: number;
    isRequired: boolean;
    dueAfterDays: number | null;
  }[]
> {
  const ctx = await requireAdminClient();
  if (!ctx.ok) return [];
  if (!lessonId) return [];

  const templates = await getTaskTemplatesForSource("program_video", lessonId);
  return templates
    .filter((t) => t.status === "active")
    .map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      taskType: t.taskType,
      difficulty: t.difficulty,
      estimatedMinutes: t.estimatedMinutes,
      points: t.points,
      isRequired: t.isRequired,
      dueAfterDays: t.dueAfterDays,
    }));
}
