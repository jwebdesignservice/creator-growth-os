import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { TutorialEditor, type TutorialEditorData, type ProgramOption } from "./tutorial-editor";
import { loadDrill, type DrillRow } from "./drill-actions";
import { getLessonChapters, type LessonChapter } from "./lesson-chapters-actions";
import { getLessonControls } from "./controls-actions";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("lessons")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  return { title: `${data?.title ?? "Tutorial"} · Admin` };
}

/**
 * /admin/tutorials/[id] — full editor for a single tutorial / lesson.
 * Reuses the existing `lessons` table; frontend-only fields (tags, internal
 * notes, CTA link, category, captions/chapters readiness) live in component
 * state until a backend pass lands. Save is wired through the existing
 * `updateLesson` server action.
 */
export default async function AdminTutorialDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Parallel fetch: the row itself, the program list (for the picker), and
  // a live view count derived from lesson_progress.
  const [{ data: lesson }, { data: programs }, { count: views }] =
    await Promise.all([
      supabase
        .from("lessons")
        .select(
          // Core lesson fields + editor-only columns persisted by
          // migration 0034 (tags, visibility, internal_notes, cta_link,
          // editor_category, learning_outcomes, publishing_notes_internal).
          "id, slug, title, description, program_id, plan_access, cover_image_url, video_url, duration_seconds, module_number, module_title, published, created_at, tags, visibility, internal_notes, cta_link, editor_category, learning_outcomes, publishing_notes_internal",
        )
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("programs")
        .select("id, title")
        .order("sort_order", { ascending: true }),
      supabase
        .from("lesson_progress")
        .select("lesson_id", { count: "exact", head: true })
        .eq("lesson_id", id),
    ]);

  if (!lesson) notFound();

  const data: TutorialEditorData = {
    id:             lesson.id as string,
    slug:           lesson.slug as string,
    title:          (lesson.title as string) ?? "",
    description:    (lesson.description as string | null) ?? "",
    programId:     (lesson.program_id as string | null) ?? "",
    planAccess:     (lesson.plan_access as "free" | "basic" | "pro") ?? "basic",
    coverImageUrl:  (lesson.cover_image_url as string | null) ?? null,
    videoUrl:       (lesson.video_url as string | null) ?? null,
    durationSeconds:(lesson.duration_seconds as number) ?? 0,
    moduleTitle:    (lesson.module_title as string | null) ?? null,
    published:      Boolean(lesson.published),
    createdAt:      (lesson.created_at as string) ?? new Date().toISOString(),
    views:          views ?? 0,

    // Editor-only metadata fields persisted by migration 0034.
    // We coerce defensively so the editor never reads `undefined`
    // even if a row pre-dates the migration.
    tags:                    Array.isArray(lesson.tags) ? (lesson.tags as string[]) : [],
    visibility:              ((lesson.visibility as string) ?? "public") as "public" | "unlisted" | "private",
    internalNotes:           (lesson.internal_notes as string | null) ?? "",
    ctaLink:                 (lesson.cta_link as string | null) ?? "",
    editorCategory:          (lesson.editor_category as string | null) ?? "",
    learningOutcomes:        Array.isArray(lesson.learning_outcomes) ? (lesson.learning_outcomes as string[]) : [],
    publishingNotesInternal: (lesson.publishing_notes_internal as string | null) ?? "",
  };

  const programOptions: ProgramOption[] = (programs ?? []).map((p) => ({
    id:    p.id as string,
    title: p.title as string,
  }));

  // Load the drill for this lesson. Returns { drill: null } when there
  // is no drill yet, or surfaces `missingTable` when migration 0031 is
  // still pending so the tab can show a one-click fix banner.
  const drillResult = await loadDrill(data.id);
  const initialDrill: DrillRow | null = drillResult.ok ? drillResult.drill : null;
  const drillTableMissing = !drillResult.ok && drillResult.missingTable === true;

  // Load the persisted lesson-path chapters. Returns [] when the table
  // is missing or empty so the editor seeds its own demo on first run.
  const initialChapters: LessonChapter[] = await getLessonChapters(data.id);

  // Load this tutorial's Controls panel state. Falls back to platform
  // defaults when no row exists yet, and flags `tableMissing` so the
  // Controls tab can surface a setup notice if migration 0033 is still
  // pending.
  const controlsResult = await getLessonControls(data.id);

  return (
    <TutorialEditor
      lesson={data}
      programs={programOptions}
      initialDrill={initialDrill}
      drillTableMissing={drillTableMissing}
      initialChapters={initialChapters}
      initialControls={controlsResult.controls}
      controlsTableMissing={controlsResult.tableMissing}
    />
  );
}
