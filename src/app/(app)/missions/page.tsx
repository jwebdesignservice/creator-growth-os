import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles, CalendarDays, GraduationCap, CalendarRange } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { MissionsBoard } from "@/components/missions/missions-board";
import { ActivityBar } from "@/components/missions/activity-bar";
import type { Mission } from "@/components/missions/mission-card";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { toggleMissionComplete } from "./actions";
import { getUserTasks } from "@/lib/tasks/queries";

export const metadata = { title: "Today's Missions · Creator Growth OS" };

type SearchParams = Promise<{ tab?: string }>;

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { tab: tabParam } = await searchParams;
  const initialTab: "today" | "week" | "all" | "completed" =
    tabParam === "this-week" || tabParam === "week"
      ? "week"
      : tabParam === "all"
        ? "all"
        : tabParam === "completed"
          ? "completed"
          : "today";

  const supabase = await createClient();

  const today = new Date();

  // Past 7 days for streak / activity rail (Mon → today)
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartIso = weekStart.toISOString();

  const [userTasks, { data: completedThisWeek }] = await Promise.all([
    // The unified task store — every task assigned to this user, with real
    // fields and NO due-date filter (tasks without a due date still show).
    getUserTasks(ctx.user.id),
    supabase
      .from("missions")
      .select("completed_at")
      .eq("user_id", ctx.user.id)
      .eq("status", "completed")
      .gte("completed_at", weekStartIso)
      .order("completed_at", { ascending: true }),
  ]);

  // Build the 7-day rail data from completedThisWeek
  const dayBuckets: number[] = [0, 0, 0, 0, 0, 0, 0];
  for (const row of completedThisWeek ?? []) {
    if (!row.completed_at) continue;
    const day = new Date(row.completed_at);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const idx = Math.floor(
      (dayStart.getTime() - weekStart.getTime()) / 86400000,
    );
    if (idx >= 0 && idx < 7) dayBuckets[idx] += 1;
  }
  const activityCounts = dayBuckets;

  // Map unified UserTasks → the Mission card shape, using REAL per-task
  // metadata (difficulty / minutes / points) from the task template. Skipped
  // tasks are hidden. `type` stays a generic bucket (the type filter is
  // cosmetic) until task_type is surfaced through the query.
  const DIFFICULTY: Record<string, Mission["difficulty"]> = {
    easy: "easy",
    medium: "medium",
    advanced: "hard",
    hard: "hard",
  };
  const missions: Mission[] = userTasks
    .filter((t) => t.status !== "skipped")
    .map((t): Mission => ({
      id: t.id,
      title: t.title,
      description: t.description,
      type: "posting",
      difficulty: DIFFICULTY[t.difficulty] ?? "medium",
      minutes: t.estimatedMinutes,
      points: t.points,
      completed: t.status === "completed",
      completed_at: t.completedAt
        ? new Date(t.completedAt).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : null,
    }));
  const hasRealMissions = missions.length > 0;

  const firstName = ctx.name.split(" ")[0];
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <PageShell>
      <div className="space-y-7">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
              <Sparkles className="size-4" strokeWidth={2} />
              Welcome back, {firstName}!
            </div>
            <h1 className="text-h1 text-ink-900 mb-1">
              Today&apos;s Missions
            </h1>
            <p className="text-ink-500 text-[14px] flex items-center gap-2">
              <CalendarDays className="size-3.5 text-ink-400" strokeWidth={2} />
              {formattedDate} · {missions.length} missions · {completedCount} completed
            </p>
          </div>
        </header>

        {/* Mission Activity — weekly mission completions (moved out of the rail) */}
        <ActivityBar counts={activityCounts} />

        {hasRealMissions ? (
          <MissionsBoard
            missions={missions}
            onToggle={toggleMissionComplete}
            defaultTab={initialTab}
          />
        ) : (
          <MissionsEmptyState />
        )}
      </div>
    </PageShell>
  );
}

function MissionsEmptyState() {
  return (
    <section className="card p-8 sm:p-10 text-center">
      <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-4 mx-auto">
        <Sparkles className="size-6" strokeWidth={1.8} aria-hidden />
      </div>
      <h2 className="text-h4 sm:text-[22px] text-ink-900 mb-2">
        No missions for today
      </h2>
      <p className="text-[13.5px] text-ink-500 max-w-md mx-auto mb-6 leading-relaxed">
        Your coach will assign daily missions tailored to your goals. While
        you wait, head into a Program lesson or build out this week&apos;s
        posting plan.
      </p>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 max-w-sm mx-auto sm:max-w-none">
        <Link
          href="/programs"
          className="inline-flex items-center justify-center gap-1.5 h-11 sm:h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
        >
          <GraduationCap className="size-4" strokeWidth={2} aria-hidden />
          Continue a program
        </Link>
        <Link
          href="/posting"
          className="inline-flex items-center justify-center gap-1.5 h-11 sm:h-10 px-4 rounded-[10px] border border-ink-200 bg-white hover:bg-cream-100 text-ink-900 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
        >
          <CalendarRange className="size-4 text-ink-500" strokeWidth={2} aria-hidden />
          Plan this week&apos;s posts
        </Link>
      </div>
    </section>
  );
}
