import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Module, Lesson as UILesson } from "@/components/programs/curriculum-accordion";
import { normalizeLearningPoints, type LearningPoint } from "./learning-content";

type RawLesson = {
  id: string;
  slug: string;
  title: string;
  duration_seconds: number | null;
  module_number: number | null;
  module_title: string | null;
  plan_access: "free" | "basic" | "pro";
  sort_order: number;
  cover_image_url: string | null;
};

type RawProgress = {
  lesson_id: string;
  completed: boolean;
};

export type ProgramProgress = {
  percent: number;
  lessonsCompleted: number;
  lessonsTotal: number;
  nextLesson: {
    slug: string;
    title: string;
    duration: string;
    moduleLabel: string;
  } | null;
};

/**
 * Read curriculum for a program, grouped by module. Returns an empty
 * array when the program is unknown or has no lessons yet — the caller
 * renders a proper empty state. We never fabricate placeholder lessons,
 * so completion/progress always reflects this program's real lessons.
 */
export async function getCurriculumForProgram(
  programSlug: string,
  userPlan: "free" | "basic" | "pro",
): Promise<Module[]> {
  const supabase = await createClient();

  // Find program id by slug
  const { data: program } = await supabase
    .from("programs")
    .select("id")
    .eq("slug", programSlug)
    .maybeSingle();

  if (!program) return [];

  // Fetch lessons
  const { data: lessons } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, duration_seconds, module_number, module_title, plan_access, sort_order, cover_image_url",
    )
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  if (!lessons || lessons.length === 0) return [];

  // Fetch user's progress for these lessons
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let progressByLesson = new Map<string, boolean>();
  if (user) {
    const lessonIds = lessons.map((l) => l.id);
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);
    progressByLesson = new Map(
      (progress ?? []).map((p: RawProgress) => [p.lesson_id, p.completed]),
    );
  }

  // Group by module
  const byModule = new Map<
    number,
    { title: string; pro_only: boolean; lessons: RawLesson[] }
  >();
  for (const l of lessons as RawLesson[]) {
    const n = l.module_number ?? 1;
    const t = l.module_title ?? `Module ${n}`;
    const entry = byModule.get(n) ?? {
      title: t,
      pro_only: true,
      lessons: [],
    };
    entry.lessons.push(l);
    // A module is Pro-only if every lesson is Pro
    if (l.plan_access !== "pro") entry.pro_only = false;
    byModule.set(n, entry);
  }

  // Identify first incomplete lesson to mark as "current"
  const firstIncompleteId = lessons.find(
    (l) => !progressByLesson.get(l.id),
  )?.id;

  // Build UI modules
  const modules: Module[] = [];
  for (const [n, entry] of [...byModule.entries()].sort((a, b) => a[0] - b[0])) {
    const uiLessons: UILesson[] = entry.lessons.map((l): UILesson => {
      const completed = progressByLesson.get(l.id) === true;
      const proGated = l.plan_access === "pro" && userPlan !== "pro";
      const isCurrent = !completed && l.id === firstIncompleteId && !proGated;
      const status: UILesson["status"] = proGated
        ? "locked"
        : completed
          ? "completed"
          : isCurrent
            ? "current"
            : "todo";
      return {
        slug: l.slug,
        title: l.title,
        duration: formatDuration(l.duration_seconds ?? 0),
        status,
        coverUrl: l.cover_image_url ?? null,
      };
    });

    modules.push({
      number: n,
      title: entry.title,
      lessons: uiLessons,
      bonus: entry.pro_only && n > 1 && entry.lessons.length <= 4,
      pro_only: entry.pro_only,
    });
  }

  return modules;
}

export async function getProgramProgress(
  programSlug: string,
): Promise<ProgramProgress> {
  const supabase = await createClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, total_lessons")
    .eq("slug", programSlug)
    .maybeSingle();

  if (!program) {
    return {
      percent: 0,
      lessonsCompleted: 0,
      lessonsTotal: 0,
      nextLesson: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      percent: 0,
      lessonsCompleted: 0,
      lessonsTotal: program.total_lessons ?? 0,
      nextLesson: null,
    };
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, slug, title, duration_seconds, module_number")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });

  if (!lessons || lessons.length === 0) {
    // No seeded lessons — return placeholder progress so the UI still has data
    return {
      percent: 0,
      lessonsCompleted: 0,
      lessonsTotal: program.total_lessons ?? 0,
      nextLesson: null,
    };
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, completed")
    .eq("user_id", user.id)
    .in(
      "lesson_id",
      lessons.map((l) => l.id),
    );

  const completedIds = new Set(
    (progress ?? []).filter((p) => p.completed).map((p) => p.lesson_id),
  );
  const total = lessons.length;
  const done = completedIds.size;
  const next = lessons.find((l) => !completedIds.has(l.id)) ?? null;

  return {
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    lessonsCompleted: done,
    lessonsTotal: total,
    nextLesson: next
      ? {
          slug: next.slug,
          title: next.title,
          duration: formatDuration(next.duration_seconds ?? 0),
          moduleLabel: `Lesson ${next.module_number ?? 1}`,
        }
      : null,
  };
}

/**
 * Bulk version of getProgramProgress for the library page — one round-trip
 * to fetch all lesson_progress + group by program.
 */
export async function getProgressForPrograms(
  programIds: string[],
): Promise<Map<string, ProgramProgress>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (programIds.length === 0) return new Map();

  // Pull lessons for all requested programs
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, program_id, slug, title, duration_seconds, module_number")
    .in("program_id", programIds)
    .order("sort_order", { ascending: true });

  const lessonsByProgram = new Map<string, typeof lessons>();
  for (const l of lessons ?? []) {
    const arr = lessonsByProgram.get(l.program_id) ?? [];
    arr.push(l);
    lessonsByProgram.set(l.program_id, arr);
  }

  let progressByLesson = new Map<string, boolean>();
  if (user && (lessons?.length ?? 0) > 0) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", user.id)
      .in(
        "lesson_id",
        (lessons ?? []).map((l) => l.id),
      );
    progressByLesson = new Map(
      (progress ?? []).map((p) => [p.lesson_id, p.completed]),
    );
  }

  const out = new Map<string, ProgramProgress>();
  for (const pid of programIds) {
    const arr = lessonsByProgram.get(pid) ?? [];
    if (arr.length === 0) {
      out.set(pid, {
        percent: 0,
        lessonsCompleted: 0,
        lessonsTotal: 0,
        nextLesson: null,
      });
      continue;
    }
    const completed = arr.filter((l) =>
      progressByLesson.get(l.id) === true,
    ).length;
    const next = arr.find((l) => !progressByLesson.get(l.id)) ?? null;
    out.set(pid, {
      percent: Math.round((completed / arr.length) * 100),
      lessonsCompleted: completed,
      lessonsTotal: arr.length,
      nextLesson: next
        ? {
            slug: next.slug,
            title: next.title,
            duration: formatDuration(next.duration_seconds ?? 0),
            moduleLabel: `Lesson ${next.module_number ?? 1}`,
          }
        : null,
    });
  }
  return out;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Aggregate every lesson's authored "What you'll learn" points (section C,
 * `lessons.learning_points`) across a whole program — ordered by module then
 * sort_order, de-duplicated by title. Powers the program overview's
 * "What You'll Learn" so it reflects the real per-lesson content.
 *
 * Returns [] when no lesson has points yet, or when the `learning_points`
 * column isn't applied (42703) — the caller then falls back to the static
 * PROGRAM_OUTCOMES so the section is never empty.
 */
export async function getProgramLearningPoints(
  programId: string,
): Promise<LearningPoint[]> {
  if (!programId) return [];
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("learning_points, module_number, sort_order")
    .eq("program_id", programId)
    .order("module_number", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  const seen = new Set<string>();
  const out: LearningPoint[] = [];
  for (const row of data) {
    const points = normalizeLearningPoints(
      (row as { learning_points?: unknown }).learning_points,
    );
    // One outcome per lesson: take the first learning point we haven't
    // already shown (deduped by title across the program), then move on.
    for (const lp of points) {
      const key = lp.title.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(lp);
      break;
    }
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────
 * Lesson notes — learner-authored notes for a program (Resources tab).
 * ───────────────────────────────────────────────────────────────────── */

export type ProgramNote = {
  id: string;
  body: string;
  lesson_slug: string | null;
  lesson_title: string | null;
  /** Module the note's lesson belongs to — powers the breadcrumb. */
  module_title: string | null;
  /** Pin-to-top flag (migration 0045). */
  pinned: boolean;
  /** Program this note belongs to — powers the breadcrumb on the program view. */
  program_title: string | null;
  created_at: string;
  updated_at: string;
};

type NoteRow = {
  id: string;
  body: string;
  lesson_slug: string | null;
  lesson_title: string | null;
  pinned?: boolean | null;
  created_at: string;
  updated_at: string;
  programs?: { title?: string | null } | { title?: string | null }[] | null;
  lessons?:
    | { module_title?: string | null }
    | { module_title?: string | null }[]
    | null;
};

/** Shape a `lesson_notes` row (+ embedded `programs(title)`) into ProgramNote. */
function mapNoteRow(row: NoteRow): ProgramNote {
  const prog = Array.isArray(row.programs) ? row.programs[0] : row.programs;
  const les = Array.isArray(row.lessons) ? row.lessons[0] : row.lessons;
  return {
    id: row.id,
    body: row.body,
    lesson_slug: row.lesson_slug,
    lesson_title: row.lesson_title,
    module_title: les?.module_title ?? null,
    pinned: row.pinned ?? false,
    program_title: prog?.title ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const NOTE_SELECT =
  "id, body, lesson_slug, lesson_title, pinned, created_at, updated_at, programs(title), lessons(module_title)";

const NOTE_SELECT_BASE =
  "id, body, lesson_slug, lesson_title, created_at, updated_at";

/**
 * Fetch notes, preferring the rich columns (pinned + program title, from
 * migration 0045). If those aren't available yet — missing column (42703) or
 * the program embed relationship isn't recognized — fall back to the base
 * columns so notes STILL render; pins + breadcrumb just stay off until 0045 is
 * applied. Returns [] only when even the base table is missing (0043 not
 * applied) or on a real error.
 */
async function fetchNotes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  filterColumn: "program_id" | "lesson_slug",
  filterValue: string,
): Promise<ProgramNote[]> {
  const rich = await supabase
    .from("lesson_notes")
    .select(NOTE_SELECT)
    .eq("user_id", userId)
    .eq(filterColumn, filterValue)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (!rich.error) return ((rich.data ?? []) as NoteRow[]).map(mapNoteRow);

  const base = await supabase
    .from("lesson_notes")
    .select(NOTE_SELECT_BASE)
    .eq("user_id", userId)
    .eq(filterColumn, filterValue)
    .order("created_at", { ascending: false });

  if (base.error) return []; // base table missing (0043 not applied) — fail soft
  return ((base.data ?? []) as NoteRow[]).map(mapNoteRow);
}

/** All of the current user's notes for a program — pinned first, then newest. */
export async function getProgramNotes(programId: string): Promise<ProgramNote[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return fetchNotes(supabase, user.id, "program_id", programId);
}

/** The current user's notes for a single lesson (by slug) — pinned first. */
export async function getLessonNotes(lessonSlug: string): Promise<ProgramNote[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  return fetchNotes(supabase, user.id, "lesson_slug", lessonSlug);
}
