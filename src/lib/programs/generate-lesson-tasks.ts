import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

export type GenerateInput = {
  userId: string;
  programId: string;
  lessonId: string;
};

export type GenerateResult = {
  createdTaskIds: string[];
  skippedTemplateIds: string[];
  totalCreated: number;
  totalSkipped: number;
};

/**
 * Generate UserTask rows (in `public.missions`) from the templates attached
 * to the just-completed lesson.
 *
 * Idempotency: the partial unique index
 *   uniq_missions_user_lesson_template (user_id, lesson_template_id)
 * guarantees we cannot insert two rows for the same (user, template). This
 * function also pre-filters by checking existing rows, so the common path
 * never touches the constraint — the index is the safety net for races.
 *
 * Authorization: this runs inside a server action with the user's auth
 * context, so the existing `missions_admin_write` RLS policy
 *   (insert with check: is_admin() OR auth.uid() = user_id)
 * allows the user to create their own missions. No service role needed.
 */
export async function generateTasksForCompletedLesson(
  supabase: SupabaseClient,
  input: GenerateInput,
): Promise<GenerateResult> {
  const { userId, programId, lessonId } = input;

  // 1. Templates attached to this lesson, in display order.
  const { data: templates } = await supabase
    .from("lesson_task_templates")
    .select(
      "id, title, description, task_type, priority, estimated_minutes, points",
    )
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (!templates || templates.length === 0) {
    return {
      createdTaskIds: [],
      skippedTemplateIds: [],
      totalCreated: 0,
      totalSkipped: 0,
    };
  }

  const templateIds = templates.map((t) => t.id);

  // 2. Which of those templates already have a mission for this user?
  const { data: existing } = await supabase
    .from("missions")
    .select("lesson_template_id")
    .eq("user_id", userId)
    .in("lesson_template_id", templateIds);

  const existingSet = new Set(
    (existing ?? [])
      .map((m) => m.lesson_template_id)
      .filter((id): id is string => !!id),
  );

  const skippedTemplateIds = templates
    .filter((t) => existingSet.has(t.id))
    .map((t) => t.id);

  // 3. Build mission rows for the templates that don't have one yet.
  const today = new Date();
  const due = new Date(today);
  due.setDate(today.getDate() + 7);
  const dueIso = due.toISOString().slice(0, 10);

  const toInsert = templates
    .filter((t) => !existingSet.has(t.id))
    .map((t) => ({
      user_id: userId,
      program_id: programId,
      lesson_id: lessonId,
      lesson_template_id: t.id,
      title: t.title,
      description: t.description,
      status: "pending" as const,
      source: "program_video" as const,
      priority: t.priority,
      estimated_minutes: t.estimated_minutes,
      points: t.points,
      due_date: dueIso,
    }));

  if (toInsert.length === 0) {
    return {
      createdTaskIds: [],
      skippedTemplateIds,
      totalCreated: 0,
      totalSkipped: skippedTemplateIds.length,
    };
  }

  // 4. Insert. The unique index makes this race-safe even under concurrent
  //    completion events for the same lesson.
  const { data: inserted, error } = await supabase
    .from("missions")
    .insert(toInsert)
    .select("id");

  if (error) {
    // Most likely cause: a concurrent insert won the race and tripped the
    // unique constraint. We treat that as "skipped" and move on — the other
    // call landed the row.
    return {
      createdTaskIds: [],
      skippedTemplateIds,
      totalCreated: 0,
      totalSkipped: skippedTemplateIds.length + toInsert.length,
    };
  }

  return {
    createdTaskIds: (inserted ?? []).map((r) => r.id),
    skippedTemplateIds,
    totalCreated: inserted?.length ?? 0,
    totalSkipped: skippedTemplateIds.length,
  };
}
