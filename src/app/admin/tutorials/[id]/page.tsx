import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { TutorialEditor, type TutorialEditorData, type ProgramOption } from "./tutorial-editor";
import { loadDrill, type DrillRow } from "./drill-actions";
import { getLessonChapters, type LessonChapter } from "./lesson-chapters-actions";
import { getLessonControls } from "./controls-actions";
import { getLessonResources } from "./resources-actions";

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
        // Core columns ONLY. These predate the editor migration and are
        // guaranteed to exist, so this query — the one that decides whether
        // the page 404s — can never be poisoned by an optional column.
        .select(
          "id, slug, title, description, program_id, plan_access, cover_image_url, video_url, duration_seconds, difficulty, module_number, module_title, published, created_at",
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

  // Editor-only fields (tags, visibility, internal notes, CTA link, category,
  // learning outcomes, publishing notes) live behind migration 0034. Fetch
  // them in a SEPARATE query so a *pending* migration degrades gracefully to
  // defaults instead of 404-ing the whole page: PostgREST fails an entire
  // select if any single column is unknown. When the columns are missing this
  // query just returns an error + null data, and `ed` falls back to `{}`.
  const { data: editorRow } = await supabase
    .from("lessons")
    .select(
      "tags, visibility, internal_notes, cta_link, editor_category, learning_outcomes, publishing_notes_internal",
    )
    .eq("id", id)
    .maybeSingle();
  const ed = (editorRow ?? {}) as Record<string, unknown>;

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
    difficulty:     (lesson.difficulty as string | null) ?? "",

    // Editor-only metadata fields persisted by migration 0034. Read from the
    // optional `ed` row so a pending migration just yields empty defaults
    // rather than crashing the page.
    tags:                    Array.isArray(ed.tags) ? (ed.tags as string[]) : [],
    visibility:              ((ed.visibility as string) ?? "public") as "public" | "unlisted" | "private",
    internalNotes:           (ed.internal_notes as string | null) ?? "",
    ctaLink:                 (ed.cta_link as string | null) ?? "",
    editorCategory:          (ed.editor_category as string | null) ?? "",
    learningOutcomes:        Array.isArray(ed.learning_outcomes) ? (ed.learning_outcomes as string[]) : [],
    publishingNotesInternal: (ed.publishing_notes_internal as string | null) ?? "",
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

  // Resources for this tutorial (migration 0037). Degrades to empty + a
  // "needs migration" flag the tab surfaces inline.
  const resourcesResult = await getLessonResources(data.id);

  return (
    <TutorialEditor
      lesson={data}
      programs={programOptions}
      initialDrill={initialDrill}
      drillTableMissing={drillTableMissing}
      initialChapters={initialChapters}
      initialControls={controlsResult.controls}
      controlsTableMissing={controlsResult.tableMissing}
      initialResources={resourcesResult.resources}
      resourcesTableMissing={resourcesResult.tableMissing}
    />
  );
}
