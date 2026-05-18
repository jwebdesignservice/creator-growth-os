import { redirect } from "next/navigation";
import { Sparkles, CalendarDays } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { MissionsRail } from "@/components/missions/rail";
import { MissionsBoard } from "@/components/missions/missions-board";
import type { Mission } from "@/components/missions/mission-card";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { toggleMissionComplete } from "./actions";

export const metadata = { title: "Today's Missions · Creator Growth OS" };

export default async function MissionsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const supabase = await createClient();

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);

  // Past 7 days for streak / activity rail (Mon → today)
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartIso = weekStart.toISOString();

  const [
    { data: dbMissions },
    { data: weekProfile },
    { data: completedThisWeek },
  ] = await Promise.all([
    supabase
      .from("missions")
      .select("id, title, description, status, completed_at, due_date, template_id")
      .eq("user_id", ctx.user.id)
      .gte("due_date", todayIso)
      .order("created_at", { ascending: true })
      .limit(20),
    supabase
      .from("profiles")
      .select("daily_streak")
      .eq("id", ctx.user.id)
      .maybeSingle(),
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
  const weekChecks = dayBuckets.map((n) => n > 0);
  const activityCounts = dayBuckets;
  const dailyStreak = weekProfile?.daily_streak ?? 0;

  const hasRealMissions = (dbMissions?.length ?? 0) > 0;
  const missions: Mission[] = hasRealMissions
    ? dbMissions!.map((m): Mission => ({
        id: m.id,
        title: m.title,
        description: m.description ?? "",
        // Without admin templates we can't infer richer metadata yet;
        // sensible defaults until the templates surface is wired.
        type: "posting",
        difficulty: "medium",
        minutes: 15,
        points: 10,
        completed: m.status === "completed",
        completed_at: m.completed_at
          ? new Date(m.completed_at).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : null,
      }))
    : [];

  const firstName = ctx.name.split(" ")[0];
  const formattedDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const completedCount = missions.filter((m) => m.completed).length;

  return (
    <PageShell
      rail={
        <MissionsRail
          userName={ctx.name}
          avatarUrl={ctx.railProfile.avatar_url}
          plan={ctx.plan}
          streak={dailyStreak}
          weekChecks={weekChecks}
          activityCounts={activityCounts}
          focusLine="Lock in 1 posting mission and 1 engagement mission to keep your streak alive."
          upNext={UP_NEXT}
        />
      }
    >
      <div className="space-y-7 max-w-[1240px] mx-auto">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
              <Sparkles className="size-4" strokeWidth={2} />
              Welcome back, {firstName}!
            </div>
            <h1 className="font-display text-[40px] text-ink-900 leading-tight mb-1">
              Today&apos;s Missions
            </h1>
            <p className="text-ink-500 text-[14px] flex items-center gap-2">
              <CalendarDays className="size-3.5 text-ink-400" strokeWidth={2} />
              {formattedDate} · {missions.length} missions · {completedCount} completed
            </p>
          </div>
        </header>

        {hasRealMissions ? (
          <MissionsBoard
            missions={missions}
            onToggle={toggleMissionComplete}
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
    <section className="card p-10 text-center">
      <div className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-4 mx-auto">
        <Sparkles className="size-6" strokeWidth={1.8} />
      </div>
      <h2 className="font-display text-[22px] text-ink-900 mb-2">
        No missions for today
      </h2>
      <p className="text-[13.5px] text-ink-500 max-w-md mx-auto mb-6">
        Your coach will assign daily missions tailored to your goals. While
        you wait, head into a Program lesson or build out this week&apos;s
        posting plan.
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <a
          href="/programs"
          className="inline-flex items-center justify-center h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold"
        >
          Continue a program
        </a>
        <a
          href="/posting"
          className="inline-flex items-center justify-center h-10 px-4 rounded-[10px] border border-ink-200 hover:bg-cream-100 text-ink-900 text-[13px] font-semibold"
        >
          Plan this week&apos;s posts
        </a>
      </div>
    </section>
  );
}

// ----------------------------------------------------------------------
// Static content
// ----------------------------------------------------------------------

const UP_NEXT = [
  { title: "Plan tomorrow's posting", type: "Strategy" },
  { title: "Engage with 5 new accounts", type: "Engagement" },
  { title: "Update bio CTA", type: "Confidence" },
];
