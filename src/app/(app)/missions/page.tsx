import { redirect } from "next/navigation";
import { CheckSquare, LayoutGrid, ListChecks, Activity } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import {
  WorkspaceShell,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";
import { MissionsOverview } from "@/components/missions/missions-overview";
import { TasksList } from "@/components/missions/tasks-list";
import {
  MissionActivity,
  type ActivityDay,
} from "@/components/missions/mission-activity";
import type { Mission } from "@/components/missions/mission-card";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getAdminContext } from "@/lib/admin/is-admin";
import { createClient } from "@/lib/supabase/server";
import { toggleMissionComplete, deleteMission } from "./actions";
import { getUserTasks } from "@/lib/tasks/queries";

export const metadata = { title: "Tasks · Creator Growth OS" };

type MissionsTab = "overview" | "tasks" | "activity";

const VALID_TABS: MissionsTab[] = ["overview", "tasks", "activity"];

const MISSIONS_TABS: WorkspaceTab[] = [
  { key: "overview", label: "Overview", icon: LayoutGrid, href: "/missions" },
  { key: "tasks", label: "Tasks", icon: ListChecks, href: "/missions?tab=tasks" },
  {
    key: "activity",
    label: "Mission Activity",
    icon: Activity,
    href: "/missions?tab=activity",
  },
];

const ACTIVITY_DAYS = 14;
const WEEKDAY = ["S", "M", "T", "W", "T", "F", "S"];

type SearchParams = Promise<{ tab?: string }>;

export default async function MissionsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { isAdmin } = await getAdminContext();

  const { tab } = await searchParams;
  const active: MissionsTab = VALID_TABS.includes(tab as MissionsTab)
    ? (tab as MissionsTab)
    : "overview";

  const supabase = await createClient();

  const today = new Date();
  const dayStartToday = new Date(today);
  dayStartToday.setHours(0, 0, 0, 0);
  // Window for the activity chart (oldest → today).
  const rangeStart = new Date(dayStartToday);
  rangeStart.setDate(rangeStart.getDate() - (ACTIVITY_DAYS - 1));
  const rangeStartIso = rangeStart.toISOString();

  const [userTasks, { data: completedRecent }] = await Promise.all([
    getUserTasks(ctx.user.id),
    supabase
      .from("missions")
      .select("completed_at")
      .eq("user_id", ctx.user.id)
      .eq("status", "completed")
      .gte("completed_at", rangeStartIso)
      .order("completed_at", { ascending: true }),
  ]);

  // ── Build the daily activity buckets ──────────────────────────────────
  const buckets = new Array(ACTIVITY_DAYS).fill(0) as number[];
  for (const row of completedRecent ?? []) {
    if (!row.completed_at) continue;
    const d = new Date(row.completed_at);
    d.setHours(0, 0, 0, 0);
    const idx = Math.floor(
      (d.getTime() - rangeStart.getTime()) / 86_400_000,
    );
    if (idx >= 0 && idx < ACTIVITY_DAYS) buckets[idx] += 1;
  }

  const series: ActivityDay[] = buckets.map((count, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    return {
      weekday: WEEKDAY[d.getDay()],
      fullLabel: d.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      count,
      isToday: i === ACTIVITY_DAYS - 1,
    };
  });

  const last7 = series.slice(ACTIVITY_DAYS - 7);
  const weekTotal = last7.reduce((sum, d) => sum + d.count, 0);
  const streakLast7 = last7.map((d) => ({
    weekday: d.weekday,
    done: d.count > 0,
  }));

  // Current streak — consecutive days with ≥1 completion, ending today. Today
  // not being done yet is forgiven (count through yesterday) so the streak
  // doesn't read as 0 mid-day.
  let streakCurrent = 0;
  let startIdx = series.length - 1;
  if (series[startIdx]?.count === 0) startIdx -= 1;
  for (let i = startIdx; i >= 0; i--) {
    if (series[i].count > 0) streakCurrent += 1;
    else break;
  }

  // ── Map unified UserTasks → Mission card shape ────────────────────────
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

  const completedCount = missions.filter((m) => m.completed).length;
  const totalCount = missions.length;
  const progressPct = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;
  const points = missions
    .filter((m) => m.completed)
    .reduce((sum, m) => sum + m.points, 0);
  const todayFocus = missions.filter((m) => !m.completed).slice(0, 6);

  const firstName = ctx.name.split(" ")[0];
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <PageShell>
      <WorkspaceShell
        title="Tasks"
        icon={CheckSquare}
        tabs={MISSIONS_TABS}
        activeKey={active}
      >
        {active === "overview" && (
          <MissionsOverview
            firstName={firstName}
            formattedDate={formattedDate}
            completedCount={completedCount}
            totalCount={totalCount}
            points={points}
            progressPct={progressPct}
            weekTotal={weekTotal}
            streakCurrent={streakCurrent}
            todayFocus={todayFocus}
          />
        )}

        {active === "tasks" && (
          <TasksList
            missions={missions}
            onToggle={toggleMissionComplete}
            onDelete={deleteMission}
            canDelete={isAdmin}
          />
        )}

        {active === "activity" && (
          <MissionActivity
            series={series}
            weekTotal={weekTotal}
            streakCurrent={streakCurrent}
            streakLast7={streakLast7}
            points={points}
            completedCount={completedCount}
            totalCount={totalCount}
            progressPct={progressPct}
          />
        )}
      </WorkspaceShell>
    </PageShell>
  );
}
