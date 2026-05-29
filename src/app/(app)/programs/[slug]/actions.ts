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
  // Completing the Start Here program lifts the onboarding gate, which also
  // unlocks the Tutorials library — refresh it too.
  revalidatePath("/tutorials", "layout");
  return { ok: true };
}

/* ─────────────────────────────────────────────────────────────────────
 * Lesson notes — learner-authored notes tied to a lesson + program.
 * Surfaces on the program Resources tab ("My Notes"). All owner-scoped.
 * If migration 0043 hasn't been applied yet, the table is missing (42P01)
 * — we return a friendly error instead of crashing.
 * ───────────────────────────────────────────────────────────────────── */

type NoteResult = { ok: true; id?: string } | { ok: false; error: string };

const NOTES_UNAVAILABLE =
  "Notes aren't available yet — the database update is still pending.";

function isMissingNotesTable(code?: string) {
  // 42P01 = undefined_table, 42703 = undefined_column
  return code === "42P01" || code === "42703";
}

/** Create a note for the given lesson. Resolves program/lesson metadata
 *  server-side from the slug so the client can't spoof ownership links. */
export async function createLessonNote(
  lessonSlug: string,
  body: string,
): Promise<NoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Write something before saving." };
  if (text.length > 5000)
    return { ok: false, error: "Notes are limited to 5000 characters." };

  // Resolve lesson → program + title (denormalized onto the note).
  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, program_id, title")
    .eq("slug", lessonSlug)
    .maybeSingle();

  let programSlug: string | null = null;
  if (lesson?.program_id) {
    const { data: program } = await supabase
      .from("programs")
      .select("slug")
      .eq("id", lesson.program_id)
      .maybeSingle();
    programSlug = program?.slug ?? null;
  }

  const { data, error } = await supabase
    .from("lesson_notes")
    .insert({
      user_id: user.id,
      program_id: lesson?.program_id ?? null,
      lesson_id: lesson?.id ?? null,
      lesson_slug: lessonSlug,
      lesson_title: lesson?.title ?? null,
      body: text,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingNotesTable(error.code)) return { ok: false, error: NOTES_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  if (programSlug) revalidatePath(`/programs/${programSlug}`, "layout");
  return { ok: true, id: data.id };
}

/** Edit the body of an existing note (owner-only). */
export async function updateLessonNote(
  noteId: string,
  body: string,
): Promise<NoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Note can't be empty." };
  if (text.length > 5000)
    return { ok: false, error: "Notes are limited to 5000 characters." };

  const { data, error } = await supabase
    .from("lesson_notes")
    .update({ body: text })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select("program_id")
    .maybeSingle();

  if (error) {
    if (isMissingNotesTable(error.code)) return { ok: false, error: NOTES_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  await revalidateNoteProgram(supabase, data?.program_id ?? null);
  return { ok: true, id: noteId };
}

/** Delete a note (owner-only). */
export async function deleteLessonNote(noteId: string): Promise<NoteResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  // Capture program_id before deletion so we can revalidate the right page.
  const { data: existing } = await supabase
    .from("lesson_notes")
    .select("program_id")
    .eq("id", noteId)
    .eq("user_id", user.id)
    .maybeSingle();

  const { error } = await supabase
    .from("lesson_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  if (error) {
    if (isMissingNotesTable(error.code)) return { ok: false, error: NOTES_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  await revalidateNoteProgram(supabase, existing?.program_id ?? null);
  return { ok: true, id: noteId };
}

/** Revalidate the program page a note belongs to, looked up by program UUID. */
async function revalidateNoteProgram(
  supabase: Awaited<ReturnType<typeof createClient>>,
  programId: string | null,
) {
  if (!programId) return;
  const { data: program } = await supabase
    .from("programs")
    .select("slug")
    .eq("id", programId)
    .maybeSingle();
  if (program?.slug) revalidatePath(`/programs/${program.slug}`, "layout");
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
