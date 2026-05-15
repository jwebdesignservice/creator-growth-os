import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Play,
  Clock,
  ArrowRight,
  Flame,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { RightRail } from "@/components/app-shell/right-rail";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getAllTutorials, type TutorialRow } from "@/lib/programs/tutorial-queries";
import { TutorialLibrary } from "@/components/tutorials/library";
import { FeaturedTutorial } from "@/components/tutorials/featured";

export const metadata = { title: "Tutorials · Creator Growth OS" };

export default async function TutorialsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const tutorials = await getAllTutorials();

  // Featured = first non-completed lesson the user can access, else first
  const featured =
    tutorials.find(
      (t) => !t.completed && (t.planAccess !== "pro" || ctx.plan === "pro"),
    ) ?? tutorials[0];

  // Recommended Next: next 3 incomplete after the featured one
  const recommended = tutorials
    .filter((t) => !t.completed && t.slug !== featured?.slug && (t.planAccess !== "pro" || ctx.plan === "pro"))
    .slice(0, 3);

  // "This Week's Creator Drill" — first drill, else first short lesson
  const drill =
    tutorials.find((t) => t.contentType === "drill") ??
    [...tutorials].sort((a, b) => a.durationSeconds - b.durationSeconds)[0];

  const firstName = ctx.name.split(" ")[0];

  return (
    <PageShell rail={<RightRail profile={ctx.railProfile} />}>
      <div className="space-y-7 max-w-[1240px] mx-auto">
        {/* Header */}
        <header>
          <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
            <Sparkles className="size-4" strokeWidth={2} />
            Welcome back, {firstName}!
          </div>
          <h1 className="font-display text-[40px] text-ink-900 leading-tight mb-1">
            Tutorials
          </h1>
          <p className="text-ink-500 text-[14px]">
            Learn practical creator skills, drills, templates and assignments to
            grow your influence.
          </p>
        </header>

        {/* Featured */}
        {featured && (
          <FeaturedTutorial
            slug={featured.slug}
            title={featured.title}
            description={
              featured.description ??
              "A focused, practical lesson — built around what actually moves the needle for creators at your stage."
            }
            duration={featured.duration}
            difficulty={featured.difficulty}
            moduleTitle={featured.moduleTitle}
          />
        )}

        {/* Library */}
        {tutorials.length === 0 ? (
          <div className="card p-10 text-center text-ink-500 text-[14px]">
            No tutorials seeded yet. Apply migration{" "}
            <code className="text-ink-900 bg-cream-100 px-1.5 py-0.5 rounded">
              0003_lessons_seed.sql
            </code>{" "}
            to populate the lessons table.
          </div>
        ) : (
          <TutorialLibrary tutorials={tutorials} userPlan={ctx.plan} />
        )}

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <RecommendedNext items={recommended} />
          {drill && <ThisWeeksDrill drill={drill} />}
        </div>
      </div>
    </PageShell>
  );
}

function RecommendedNext({ items }: { items: TutorialRow[] }) {
  return (
    <div className="card p-5">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[19px] text-ink-900">
          Recommended Next
        </h3>
        <Link
          href="/tutorials"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          View all
        </Link>
      </header>
      {items.length === 0 ? (
        <p className="text-[13px] text-ink-500">
          You&apos;re all caught up — open the library to revisit a favourite.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/tutorials/${t.slug}`}
                className="flex items-center gap-3 p-2 -mx-2 rounded-[10px] hover:bg-cream-100 transition-colors"
              >
                <div className="size-11 rounded-[10px] bg-gradient-to-br from-rose-100 via-cream-200 to-rose-100/30 inline-flex items-center justify-center shrink-0">
                  <Play
                    className="size-3.5 text-rose-600 ml-0.5"
                    fill="currentColor"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-ink-900 truncate">
                    {t.title}
                  </div>
                  <div className="text-[11.5px] text-ink-500 truncate">
                    {t.programTitle} · {t.duration}
                  </div>
                </div>
                <ArrowRight className="size-4 text-ink-400" strokeWidth={2} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ThisWeeksDrill({ drill }: { drill: TutorialRow }) {
  return (
    <div className="rounded-[16px] bg-cream-200 border border-cream-300 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[19px] text-ink-900">
          This Week&apos;s Creator Drill
        </h3>
        <span className="chip chip-rose inline-flex items-center gap-1">
          <Flame className="size-3" strokeWidth={2} fill="currentColor" />
          2 day streak
        </span>
      </div>
      <p className="text-[13px] text-ink-700 leading-snug mb-4">
        <span className="font-semibold text-ink-900">{drill.title}.</span>{" "}
        {drill.description ??
          "Spend the time below applying what you've learned — focus on the first 3 seconds, the hook, and the next action you want viewers to take."}
      </p>
      <div className="flex items-center gap-3 text-[12px] text-ink-500 mb-4">
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3" strokeWidth={2} />
          {drill.duration}
        </span>
        <span>· {drill.difficulty}</span>
      </div>
      <Link
        href={`/tutorials/${drill.slug}`}
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors mt-auto self-start"
      >
        Start Drill
        <ArrowRight className="size-4" strokeWidth={2} />
      </Link>
    </div>
  );
}
