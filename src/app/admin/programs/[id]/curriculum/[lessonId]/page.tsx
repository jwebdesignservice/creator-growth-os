import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeLearningPoints } from "@/lib/programs/learning-content";
import { normalizeLessonTasks } from "@/lib/programs/lesson-tasks";
import { VideoLessonEditor, type VideoLessonRow } from "./video-lesson-editor";

export const metadata = { title: "Video lesson · Admin" };

type Params = Promise<{ id: string; lessonId: string }>;

export default async function ProgramVideoEditorPage({
  params,
}: {
  params: Params;
}) {
  const { id, lessonId } = await params;
  const supabase = createServiceClient();

  // Program (for breadcrumb + back-link).
  const { data: program } = await supabase
    .from("programs")
    .select("id, slug, title")
    .eq("id", id)
    .maybeSingle();
  if (!program) notFound();

  // Lesson — try modern select (learning_points / action_steps from 0036),
  // fall back to the legacy columns when 0036 isn't applied yet.
  type Row = Record<string, unknown>;
  let row: Row | null = null;

  const modern = await supabase
    .from("lessons")
    .select(
      "id, slug, title, description, video_url, cover_image_url, duration_seconds, module_number, module_title, plan_access, published, learning_points, action_steps",
    )
    .eq("id", lessonId)
    .eq("program_id", id)
    .maybeSingle();

  if (modern.error && modern.error.code === "42703") {
    const legacy = await supabase
      .from("lessons")
      .select(
        "id, slug, title, description, video_url, cover_image_url, duration_seconds, module_number, module_title, plan_access, published",
      )
      .eq("id", lessonId)
      .eq("program_id", id)
      .maybeSingle();
    row = legacy.data ?? null;
  } else {
    row = modern.data ?? null;
  }

  if (!row) notFound();

  const lesson: VideoLessonRow = {
    id:              row.id as string,
    slug:            row.slug as string,
    title:           (row.title as string) ?? "Video lesson",
    description:     (row.description as string | null) ?? "",
    videoUrl:        (row.video_url as string | null) ?? null,
    coverImageUrl:   (row.cover_image_url as string | null) ?? null,
    durationSeconds: (row.duration_seconds as number) ?? 0,
    moduleNumber:    (row.module_number as number | null) ?? null,
    moduleTitle:     (row.module_title as string | null) ?? null,
    published:       Boolean(row.published),
    // Legacy plain-string learning points + the old separate action_steps
    // both normalise into the structured shape (action steps now live
    // nested inside each learning point).
    learningPoints:  normalizeLearningPoints(row.learning_points),
    // Lesson tasks (section D) reuse the freed `action_steps` jsonb column.
    tasks:           normalizeLessonTasks(row.action_steps),
  };

  return (
    <VideoLessonEditor
      programId={program.id}
      programSlug={program.slug}
      lesson={lesson}
    />
  );
}
