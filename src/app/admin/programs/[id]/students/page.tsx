import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { StudentsClient, type Member, type Plan, type MemberStatus } from "./students-client";

export const metadata = { title: "Students · Admin" };

type Params = Promise<{ id: string }>;

/**
 * /admin/programs/[id]/students — real, plan-gated enrollment view.
 *
 * The platform grants program access by membership tier (Free / Basic / Pro /
 * Diamond), not per-program purchase — so a program's "students" are the
 * members whose plan reaches its access tier. Each member's progress is
 * aggregated live from `lesson_progress` over the program's `lessons`.
 *
 * Only tables that are guaranteed-applied are used (programs, lessons,
 * profiles, lesson_progress) so this renders correctly against the current
 * schema with no migration. Empty/sparse data renders an honest empty state.
 */
export default async function StudentsPage({ params }: { params: Params }) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: program } = await supabase
    .from("programs")
    .select("id, slug, title, plan_access")
    .eq("id", id)
    .maybeSingle();
  if (!program) notFound();

  // Program lessons (for total + "current lesson" + progress join).
  const { data: lessonRows } = await supabase
    .from("lessons")
    .select("id, title, sort_order")
    .eq("program_id", program.id)
    .order("sort_order", { ascending: true });
  const lessons = (lessonRows ?? []).map((l) => ({
    id: l.id as string,
    title: (l.title as string) ?? "Untitled lesson",
  }));
  const lessonIds = lessons.map((l) => l.id);
  const totalLessons = lessons.length;

  // Members with access to this program (plan hierarchy). `profiles.plan` is
  // the `subscription_plan` Postgres enum (free | basic | pro) — 'diamond'
  // isn't a DB enum value yet, so we filter the query down to real enum
  // values; otherwise PostgREST throws "invalid input value for enum".
  const allowed = plansWithAccess((program.plan_access as string) ?? "basic");
  const VALID_PLAN_ENUM = ["free", "basic", "pro"];
  const queryPlans = allowed.filter((p) => VALID_PLAN_ENUM.includes(p));
  let profiles: Array<Record<string, unknown>> = [];
  if (queryPlans.length > 0) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, email, plan, last_active_date")
      .in("plan", queryPlans);
    profiles = profileRows ?? [];
  }

  // Live progress for those members over this program's lessons.
  const progressByUser = new Map<
    string,
    { completed: number; watched: number; lastCompletedAt: string | null; completedLessonIds: Set<string> }
  >();
  if (lessonIds.length > 0 && profiles.length > 0) {
    const userIds = profiles.map((p) => p.id as string);
    const { data: progressRows } = await supabase
      .from("lesson_progress")
      .select("user_id, lesson_id, completed, watched_seconds, completed_at")
      .in("lesson_id", lessonIds)
      .in("user_id", userIds);
    for (const r of progressRows ?? []) {
      const uid = r.user_id as string;
      const entry =
        progressByUser.get(uid) ??
        { completed: 0, watched: 0, lastCompletedAt: null, completedLessonIds: new Set<string>() };
      entry.watched += (r.watched_seconds as number) ?? 0;
      if (r.completed) {
        entry.completed += 1;
        entry.completedLessonIds.add(r.lesson_id as string);
        const at = r.completed_at as string | null;
        if (at && (!entry.lastCompletedAt || at > entry.lastCompletedAt)) {
          entry.lastCompletedAt = at;
        }
      }
      progressByUser.set(uid, entry);
    }
  }

  // Server component: renders once per request on the server, so reading the
  // wall clock here is deterministic for this render (not a client re-render).
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const members: Member[] = profiles.map((p) => {
    const prog = progressByUser.get(p.id as string);
    const completedLessons = prog?.completed ?? 0;
    const watched = prog?.watched ?? 0;
    const progress =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    // Days since the member was last active — prefer a real completion
    // timestamp, fall back to the profile's last_active_date.
    const lastTs =
      prog?.lastCompletedAt ?? (p.last_active_date as string | null) ?? null;
    const lastActiveDays = lastTs
      ? Math.max(0, Math.floor((now - new Date(lastTs).getTime()) / 86_400_000))
      : 9999;

    const status = deriveStatus(progress, completedLessons, watched, lastActiveDays);

    // First not-yet-completed lesson by order = what they're "currently on".
    let currentLesson = totalLessons === 0 ? "—" : "Completed";
    if (progress < 100) {
      const next = lessons.find((l) => !(prog?.completedLessonIds.has(l.id)));
      currentLesson = next ? next.title : lessons[0]?.title ?? "—";
    }

    const name =
      (p.full_name as string | null)?.trim() ||
      (p.display_name as string | null)?.trim() ||
      (p.email as string | null)?.split("@")[0] ||
      "Member";

    return {
      id: p.id as string,
      name,
      email: (p.email as string | null) ?? "",
      plan: toDisplayPlan((p.plan as string | null) ?? "free"),
      progress,
      currentLesson,
      lessonsCompleted: completedLessons,
      lessonsTotal: totalLessons,
      lastActiveDays,
      status,
    };
  });

  return <StudentsClient members={members} />;
}

/** Which member tiers can access a program of the given access tier. */
function plansWithAccess(tier: string): string[] {
  switch (tier) {
    case "free":
      return ["free", "basic", "pro", "diamond"];
    case "basic":
      return ["basic", "pro", "diamond"];
    case "pro":
      return ["pro", "diamond"];
    case "diamond":
      return ["diamond"];
    default:
      return ["free", "basic", "pro", "diamond"];
  }
}

function toDisplayPlan(plan: string): Plan {
  switch (plan) {
    case "free":
      return "Free";
    case "basic":
      return "Basic";
    case "pro":
      return "Pro";
    case "diamond":
      return "Diamond";
    default:
      return "Free";
  }
}

function deriveStatus(
  progress: number,
  completedLessons: number,
  watched: number,
  lastActiveDays: number,
): MemberStatus {
  if (progress >= 100) return "completed";
  if (completedLessons === 0 && watched === 0) return "inactive";
  if (lastActiveDays > 14) return "at-risk";
  if (progress < 40) return "needs-attention";
  return "on-track";
}
