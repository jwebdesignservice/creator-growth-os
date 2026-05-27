import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { TutorialEditor, type TutorialEditorData, type ProgramOption } from "./tutorial-editor";

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
          "id, slug, title, description, program_id, plan_access, cover_image_url, video_url, duration_seconds, module_number, module_title, published, created_at",
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
  };

  const programOptions: ProgramOption[] = (programs ?? []).map((p) => ({
    id:    p.id as string,
    title: p.title as string,
  }));

  return <TutorialEditor lesson={data} programs={programOptions} />;
}
