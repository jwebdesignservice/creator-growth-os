import { createServiceClient } from "@/lib/supabase/server";
import { TutorialsView, type TutorialCardData } from "./tutorials-view";

export const metadata = {
  title: "Tutorials · Admin · Creator Growth OS",
};

type LessonRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  program_id: string | null;
  plan_access: "free" | "basic" | "pro";
  cover_image_url: string | null;
  video_url: string | null;
  duration_seconds: number;
  module_number: number | null;
  module_title: string | null;
  published: boolean;
  created_at: string;
};

/**
 * /admin/tutorials — full-bleed grid of tutorial videos with tabs, search,
 * program filter, sort, and grid/list view. Replaces the legacy
 * /admin/lessons form-based surface.
 */
export default async function AdminTutorialsPage() {
  const supabase = createServiceClient();

  // Everything we need in parallel.
  const [
    { data: lessons },
    { data: programs },
    { data: progressRows },
    { count: totalCount },
    { count: draftsCount },
  ] = await Promise.all([
    // Tutorials are STANDALONE lessons only (program_id IS NULL). Lessons that
    // belong to a program live in the Program → Curriculum flow and must not
    // leak into the Tutorials library.
    supabase
      .from("lessons")
      .select(
        "id, slug, title, description, program_id, plan_access, cover_image_url, video_url, duration_seconds, module_number, module_title, published, created_at",
      )
      .is("program_id", null)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("programs")
      .select("id, slug, title")
      .order("sort_order", { ascending: true }),
    supabase.from("lesson_progress").select("lesson_id, completed"),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .is("program_id", null),
    supabase
      .from("lessons")
      .select("id", { count: "exact", head: true })
      .is("program_id", null)
      .eq("published", false),
  ]);

  // Real attachment counts per lesson (lesson_resources, migration 0037).
  // Degrades to an empty map when the table isn't applied yet.
  const attachmentCount = new Map<string, number>();
  {
    const { data: resourceRows } = await supabase
      .from("lesson_resources")
      .select("lesson_id");
    for (const r of resourceRows ?? []) {
      if (!r.lesson_id) continue;
      attachmentCount.set(
        r.lesson_id as string,
        (attachmentCount.get(r.lesson_id as string) ?? 0) + 1,
      );
    }
  }

  // Build per-lesson view + completion stats.
  const watchCount = new Map<string, number>();
  const completeCount = new Map<string, number>();
  for (const row of progressRows ?? []) {
    if (!row.lesson_id) continue;
    watchCount.set(row.lesson_id, (watchCount.get(row.lesson_id) ?? 0) + 1);
    if (row.completed) {
      completeCount.set(
        row.lesson_id,
        (completeCount.get(row.lesson_id) ?? 0) + 1,
      );
    }
  }

  const programTitle = new Map<string, string>();
  for (const p of programs ?? []) programTitle.set(p.id, p.title);

  const tutorials: TutorialCardData[] = (lessons ?? []).map(
    (l: LessonRow): TutorialCardData => {
      const views = watchCount.get(l.id) ?? 0;
      const completes = completeCount.get(l.id) ?? 0;
      const completionPct =
        views > 0 ? Math.round((completes / views) * 100) : null;
      return {
        id: l.id,
        slug: l.slug,
        title: l.title,
        programId: l.program_id,
        programTitle: l.program_id ? programTitle.get(l.program_id) ?? null : null,
        moduleTitle: l.module_title,
        coverImageUrl: l.cover_image_url,
        videoUrl: l.video_url,
        durationSeconds: l.duration_seconds,
        published: l.published,
        // Synthetic "Ready to review" — unpublished but has a real video URL.
        readyToReview: !l.published && !!l.video_url,
        updatedAt: l.created_at, // until we track real updated_at
        views,
        completionPct,
        attachments: attachmentCount.get(l.id) ?? 0,
      };
    },
  );

  const total = totalCount ?? tutorials.length;
  const drafts = draftsCount ?? tutorials.filter((t) => !t.published).length;
  const publishedTotal = total - drafts;

  return (
    <TutorialsView
      tutorials={tutorials}
      counts={{
        all: total,
        drafts,
        published: publishedTotal,
        archived: 0,
      }}
    />
  );
}
