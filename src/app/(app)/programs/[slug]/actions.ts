"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyMilestoneReached } from "@/lib/notifications/service";
import { assignTasksFromSource } from "@/lib/tasks/assign";

type Result = { ok: true } | { ok: false; error: string };

const MILESTONES = [25, 50, 75, 100] as const;

/**
 * Upsert lesson_progress for the current user. Safe to call even when the
 * lessons table hasn't been seeded — returns ok:false silently.
 */
export async function markLessonComplete(
  lessonSlug: string,
  completed: boolean,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, program_id")
    .eq("slug", lessonSlug)
    .maybeSingle();

  if (!lesson) return { ok: false, error: "Lesson not found (DB unseeded)." };

  const { data: program } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", lesson.program_id)
    .maybeSingle();

  const beforePct = await programProgressPct(supabase, user.id, lesson.program_id);

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lesson.id,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) return { ok: false, error: error.message };

  // Assign this lesson's tasks via the ONE central engine. Idempotent —
  // re-completing never duplicates. Templates whose trigger is "on_complete"
  // are assigned here; "on_start" ones are assigned when the lesson opens.
  if (completed) {
    await assignTasksFromSource(user.id, "program_video", lesson.id, {
      trigger: "on_complete",
    });
  }

  if (completed && program) {
    const afterPct = await programProgressPct(supabase, user.id, lesson.program_id);
    const crossed = MILESTONES.find((m) => beforePct < m && afterPct >= m);
    if (crossed) {
      await notifyMilestoneReached(user.id, program.slug, crossed);
    }
  }

  // Revalidate this program's pages by SLUG — the route is /programs/[slug],
  // not the program UUID. Using lesson.program_id (a UUID) here meant the
  // curriculum + lesson rail never refreshed after marking a lesson complete.
  // "layout" cascades to the nested lesson pages too.
  if (program) revalidatePath(`/programs/${program.slug}`, "layout");
  revalidatePath("/programs", "layout");
  revalidatePath("/dashboard", "layout");
  // Generated tasks land on the global Tasks/Missions page too.
  revalidatePath("/missions", "layout");
  return { ok: true };
}

async function programProgressPct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  programId: string,
): Promise<number> {
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("program_id", programId);
  const total = lessons?.length ?? 0;
  if (total === 0) return 0;

  const ids = lessons!.map((l) => l.id);
  const { data: done } = await supabase
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .in("lesson_id", ids);

  return Math.floor(((done?.length ?? 0) / total) * 100);
}
