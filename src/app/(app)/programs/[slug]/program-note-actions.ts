"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Result = { ok: true; id?: string } | { ok: false; error: string };

const NOTES_UNAVAILABLE =
  "Notes aren't available yet — the database update is still pending.";

function isMissingNotesTable(code?: string) {
  // 42P01 = undefined_table, 42703 = undefined_column
  return code === "42P01" || code === "42703";
}

/**
 * Create a free-standing note for a program — NOT tied to any lesson/video.
 * Powers the "+ New note" tile on the program's Notes board. Stored in
 * lesson_notes with the program set but lesson fields null.
 */
export async function createProgramNote(
  programSlug: string,
  body: string,
): Promise<Result> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const text = body.trim();
  if (!text) return { ok: false, error: "Write something before saving." };
  if (text.length > 5000)
    return { ok: false, error: "Notes are limited to 5000 characters." };

  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("slug", programSlug)
    .maybeSingle();
  if (!program) return { ok: false, error: "Program not found." };

  const { data, error } = await supabase
    .from("lesson_notes")
    .insert({
      user_id: user.id,
      program_id: program.id,
      lesson_id: null,
      lesson_slug: null,
      lesson_title: null,
      body: text,
    })
    .select("id")
    .single();

  if (error) {
    if (isMissingNotesTable(error.code))
      return { ok: false, error: NOTES_UNAVAILABLE };
    return { ok: false, error: error.message };
  }

  revalidatePath(`/programs/${programSlug}`, "layout");
  return { ok: true, id: data.id };
}
