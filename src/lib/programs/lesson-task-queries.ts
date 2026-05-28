import "server-only";
import { createClient } from "@/lib/supabase/server";

// LEGACY REMOVED: `getLessonTaskStates` + its types read the legacy
// `lesson_task_templates` table. Program-video task display now uses the
// unified task system — `getTaskTemplatesForSource("program_video", …)` +
// `getUserTasks(…)` from `@/lib/tasks/queries` (see program-video-tasks.tsx).
// `getProgramUserTasks` below still powers the program "Tasks" tab; it reads
// the `missions` store directly, so it is unchanged.

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
