import "server-only";
import { createClient } from "@/lib/supabase/server";

export type LessonTaskTemplate = {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  priority: string;
  estimated_minutes: number;
  points: number;
  sort_order: number;
};

export type LessonTaskState = LessonTaskTemplate & {
  /** True iff this template already has a generated mission for the current user. */
  generated: boolean;
};

/**
 * Templates for one lesson, annotated with per-user generated state. Returns
 * [] when the lesson has no templates configured (rendered as "no task" in
 * the UI so we don't show empty cards).
 */
export async function getLessonTaskStates(
  lessonId: string,
  userId: string | null,
): Promise<LessonTaskState[]> {
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from("lesson_task_templates")
    .select(
      "id, title, description, task_type, priority, estimated_minutes, points, sort_order",
    )
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

  if (!templates || templates.length === 0) return [];

  if (!userId) {
    return templates.map((t) => ({ ...t, generated: false }));
  }

  const templateIds = templates.map((t) => t.id);
  const { data: existing } = await supabase
    .from("missions")
    .select("lesson_template_id")
    .eq("user_id", userId)
    .in("lesson_template_id", templateIds);

  const generated = new Set(
    (existing ?? [])
      .map((m) => m.lesson_template_id)
      .filter((id): id is string => !!id),
  );

  return templates.map((t) => ({ ...t, generated: generated.has(t.id) }));
}

export type ProgramUserTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  priority: string;
  estimated_minutes: number;
  points: number;
  source: string;
  lesson_title: string | null;
  lesson_slug: string | null;
  module_number: number | null;
  module_title: string | null;
};

type ProgramUserTaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  priority: string | null;
  estimated_minutes: number | null;
  points: number | null;
  source: string | null;
  lessons:
    | {
        title: string;
        slug: string;
        module_number: number | null;
        module_title: string | null;
      }
    | {
        title: string;
        slug: string;
        module_number: number | null;
        module_title: string | null;
      }[]
    | null;
};

/**
 * All missions for a user belonging to a specific program, with lesson +
 * module context for the "From: Program / Lesson" source line.
 *
 * Used by the program detail "Tasks" tab.
 */
export async function getProgramUserTasks(
  programId: string,
  userId: string,
): Promise<ProgramUserTask[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("missions")
    .select(
      `
      id, title, description, status, due_date, completed_at,
      priority, estimated_minutes, points, source,
      lessons:lesson_id ( title, slug, module_number, module_title )
    `,
    )
    .eq("user_id", userId)
    .eq("program_id", programId)
    .order("created_at", { ascending: true });

  if (!data) return [];

  return (data as unknown as ProgramUserTaskRow[]).map((m): ProgramUserTask => {
    const lessonRaw = m.lessons;
    const lesson = Array.isArray(lessonRaw) ? lessonRaw[0] : lessonRaw;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      status: m.status,
      due_date: m.due_date,
      completed_at: m.completed_at,
      priority: m.priority ?? "normal",
      estimated_minutes: m.estimated_minutes ?? 15,
      points: m.points ?? 10,
      source: m.source ?? "manual",
      lesson_title: lesson?.title ?? null,
      lesson_slug: lesson?.slug ?? null,
      module_number: lesson?.module_number ?? null,
      module_title: lesson?.module_title ?? null,
    };
  });
}
