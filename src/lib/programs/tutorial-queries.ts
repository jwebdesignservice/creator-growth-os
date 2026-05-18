import "server-only";
import { createClient } from "@/lib/supabase/server";

export type TutorialRow = {
  slug: string;
  title: string;
  description: string | null;
  duration: string;
  durationSeconds: number;
  difficulty: string;
  contentType: string;
  programSlug: string | null;
  programTitle: string | null;
  moduleNumber: number | null;
  moduleTitle: string | null;
  planAccess: "free" | "basic" | "pro";
  completed: boolean;
  category: "starter" | "growth" | "monetization" | "scale" | null;
  /** UI-friendly category label, eg "Growth Creator" */
  categoryLabel: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  starter: "Starter Creator",
  growth: "Growth Creator",
  monetization: "Monetization Creator",
  scale: "Scale Creator",
  authority: "Authority Creator",
};

/**
 * Returns every published lesson with its parent program info and the
 * current user's completion state, ordered by program sort_order +
 * lesson sort_order.
 */
export async function getAllTutorials(): Promise<TutorialRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, description, duration_seconds, difficulty, content_type, plan_access, module_number, module_title, sort_order, category, programs(slug, title, sort_order, category_access)",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (!lessons || lessons.length === 0) return [];

  let progressByLesson = new Map<string, boolean>();
  if (user) {
    const ids = lessons.map((l) => l.id);
    const { data: prog } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .in("lesson_id", ids);
    progressByLesson = new Map(
      (prog ?? []).map((p) => [p.lesson_id, p.completed]),
    );
  }

  return lessons.map((l): TutorialRow => {
    const program = Array.isArray(l.programs)
      ? l.programs[0]
      : (l.programs as { slug: string; title: string; category_access: string[] | null } | null);
    const accessFirst = program?.category_access?.[0] ?? null;
    const cat = (l.category as TutorialRow["category"]) ?? (accessFirst as TutorialRow["category"]) ?? null;

    return {
      slug: l.slug,
      title: l.title,
      description: l.description ?? null,
      duration: formatDuration(l.duration_seconds ?? 0),
      durationSeconds: l.duration_seconds ?? 0,
      difficulty: l.difficulty ?? "Intermediate",
      contentType: l.content_type ?? "video",
      programSlug: program?.slug ?? null,
      programTitle: program?.title ?? null,
      moduleNumber: l.module_number ?? null,
      moduleTitle: l.module_title ?? null,
      planAccess: l.plan_access as TutorialRow["planAccess"],
      completed: progressByLesson.get(l.id) === true,
      category: cat,
      categoryLabel: cat ? (CATEGORY_LABEL[cat] ?? cat) : "All Creators",
    };
  });
}

export type TutorialDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration: string;
  durationSeconds: number;
  difficulty: string;
  contentType: string;
  videoUrl: string | null;
  coverUrl: string | null;
  planAccess: "free" | "basic" | "pro";
  completed: boolean;
  programSlug: string | null;
  programTitle: string | null;
  moduleNumber: number | null;
  moduleTitle: string | null;
  categoryLabel: string;
  /** Sibling lessons inside the same program/module, in sort order */
  moduleLessons: {
    slug: string;
    title: string;
    duration: string;
    isCurrent: boolean;
    completed: boolean;
  }[];
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

/**
 * Read a lesson by slug along with sibling lessons in the same module +
 * the surrounding lessons (prev / next) inside the program.
 */
export async function getTutorialDetail(
  slug: string,
): Promise<TutorialDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, description, duration_seconds, difficulty, content_type, plan_access, video_url, cover_image_url, module_number, module_title, sort_order, category, program_id, programs(slug, title, category_access)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!lesson) return null;

  // Sibling lessons in the same program, ordered by sort_order
  const { data: siblings } = await supabase
    .from("lessons")
    .select("id, slug, title, duration_seconds, module_number, sort_order")
    .eq("program_id", lesson.program_id)
    .order("sort_order", { ascending: true });

  let progress = new Map<string, boolean>();
  if (user && siblings && siblings.length > 0) {
    const { data: rows } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .in(
        "lesson_id",
        siblings.map((s) => s.id),
      );
    progress = new Map((rows ?? []).map((p) => [p.lesson_id, p.completed]));
  }

  const moduleLessons = (siblings ?? [])
    .filter((s) => s.module_number === lesson.module_number)
    .map((s) => ({
      slug: s.slug,
      title: s.title,
      duration: formatDuration(s.duration_seconds ?? 0),
      isCurrent: s.slug === lesson.slug,
      completed: progress.get(s.id) === true,
    }));

  const idx = (siblings ?? []).findIndex((s) => s.slug === lesson.slug);
  const prev =
    idx > 0
      ? { slug: siblings![idx - 1].slug, title: siblings![idx - 1].title }
      : null;
  const next =
    idx >= 0 && idx < (siblings?.length ?? 0) - 1
      ? { slug: siblings![idx + 1].slug, title: siblings![idx + 1].title }
      : null;

  const program = Array.isArray(lesson.programs)
    ? lesson.programs[0]
    : (lesson.programs as { slug: string; title: string; category_access: string[] | null } | null);
  const accessFirst = program?.category_access?.[0] ?? null;
  const cat = (lesson.category as string | null) ?? accessFirst;

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description ?? null,
    duration: formatDuration(lesson.duration_seconds ?? 0),
    durationSeconds: lesson.duration_seconds ?? 0,
    difficulty: lesson.difficulty ?? "Intermediate",
    contentType: lesson.content_type ?? "video",
    videoUrl: lesson.video_url ?? null,
    coverUrl: lesson.cover_image_url ?? null,
    planAccess: lesson.plan_access as "free" | "basic" | "pro",
    completed: progress.get(lesson.id) === true,
    programSlug: program?.slug ?? null,
    programTitle: program?.title ?? null,
    moduleNumber: lesson.module_number ?? null,
    moduleTitle: lesson.module_title ?? null,
    categoryLabel: cat ? CATEGORY_LABEL_MAP(cat) : "All Creators",
    moduleLessons,
    prev,
    next,
  };
}

function CATEGORY_LABEL_MAP(key: string) {
  return CATEGORY_LABEL[key] ?? key;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
