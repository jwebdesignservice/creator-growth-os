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

  // Pull this user's missions if any exist; otherwise render the seeded
  // mock so the page is meaningful before an admin assigns missions.
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const { data: dbMissions } = await supabase
    .from("missions")
    .select("id, title, description, status, completed_at, due_date, template_id")
    .eq("user_id", ctx.user.id)
    .gte("due_date", todayIso)
    .order("created_at", { ascending: true })
    .limit(20);

  const missions: Mission[] = dbMissions?.length
    ? dbMissions.map((m): Mission => ({
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
    : FALLBACK_MISSIONS;

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
          streak={12}
          weekChecks={[true, true, true, true, false, false, false]}
          activityCounts={[3, 4, 6, 2, 0, 0, 0]}
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

        <MissionsBoard
          missions={missions}
          onToggle={toggleMissionComplete}
        />
      </div>
    </PageShell>
  );
}

// ----------------------------------------------------------------------
// Fallback content used until admin assigns real missions via templates.
// ----------------------------------------------------------------------

const FALLBACK_MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "Post 1 short-form video",
    description:
      "Pick a hook, film 30 seconds, post to your primary platform. Aim for a strong first 3 seconds.",
    type: "posting",
    difficulty: "medium",
    minutes: 25,
    points: 25,
    linked: { label: "Hooks That Stop the Scroll", href: "/tutorials" },
    completed: false,
  },
  {
    id: "m2",
    title: "Write 10 hooks for next week",
    description:
      "Use the 4 hook angles from your last lesson — curiosity, contrast, promise, problem.",
    type: "strategy",
    difficulty: "medium",
    minutes: 20,
    points: 20,
    linked: { label: "Content That Connects", href: "/programs" },
    completed: false,
  },
  {
    id: "m3",
    title: "Reply to DMs and 10 comments",
    description:
      "Spend 15 minutes engaging with your audience — reply with intention, not emojis.",
    type: "engagement",
    difficulty: "easy",
    minutes: 15,
    points: 10,
    completed: true,
    completed_at: "10:18 AM",
  },
  {
    id: "m4",
    title: "Comment on 5 creators in your niche",
    description:
      "Add real value — share a related experience or ask a thoughtful question.",
    type: "engagement",
    difficulty: "easy",
    minutes: 10,
    points: 10,
    completed: false,
  },
  {
    id: "m5",
    title: "Review yesterday's post analytics",
    description:
      "Open insights, identify your best post, capture the hook that worked and why.",
    type: "performance",
    difficulty: "easy",
    minutes: 10,
    points: 10,
    completed: true,
    completed_at: "9:42 AM",
  },
  {
    id: "m6",
    title: "Record 3 practice intros",
    description:
      "Out loud, no filming. Practice your 5-second intro until it feels natural.",
    type: "confidence",
    difficulty: "easy",
    minutes: 10,
    points: 10,
    completed: false,
  },
];

const UP_NEXT = [
  { title: "Plan tomorrow's posting", type: "Strategy" },
  { title: "Engage with 5 new accounts", type: "Engagement" },
  { title: "Update bio CTA", type: "Confidence" },
];
