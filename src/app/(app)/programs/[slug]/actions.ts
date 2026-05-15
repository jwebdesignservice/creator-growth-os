"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

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

  revalidatePath(`/programs/${lesson.program_id}`, "layout");
  revalidatePath("/programs", "layout");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
