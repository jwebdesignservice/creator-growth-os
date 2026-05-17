"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyMilestoneReached } from "@/lib/notifications/service";

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

  if (completed && program) {
    const afterPct = await programProgressPct(supabase, user.id, lesson.program_id);
    const crossed = MILESTONES.find((m) => beforePct < m && afterPct >= m);
    if (crossed) {
      await notifyMilestoneReached(user.id, program.slug, crossed);
    }
  }

  revalidatePath(`/programs/${lesson.program_id}`, "layout");
  revalidatePath("/programs", "layout");
  revalidatePath("/dashboard", "layout");
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
