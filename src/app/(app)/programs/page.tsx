import { redirect } from "next/navigation";
import Link from "next/link";
import { Sparkles, Play, ChevronRight, Clock } from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { FeaturedProgram } from "@/components/programs/featured-program";
import { ProgramsGrid } from "@/components/programs/programs-grid";
import type { ProgramRow } from "@/components/programs/program-card";
import { getProgressForPrograms } from "@/lib/programs/queries";

export const metadata = { title: "Programs | Creator Growth OS" };

export default async function ProgramsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const supabase = await createClient();
  const { data: dbPrograms } = await supabase
    .from("programs")
    .select(
      "id, slug, title, description, plan_access, category_access, total_lessons, total_tasks, estimated_days",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });

  // Pull real per-program progress in one round-trip.
  const progressMap = dbPrograms?.length
    ? await getProgressForPrograms(dbPrograms.map((p) => p.id))
    : new Map();

  const programs: ProgramRow[] = dbPrograms?.length
    ? dbPrograms.map((p, i): ProgramRow => {
        const prog = progressMap.get(p.id);
        const real = prog && prog.lessonsTotal > 0;
        // Compute status from real progress when present; otherwise fall
        // back to a friendly visual default so the demo stays alive.
        const status: ProgramRow["status"] =
          p.plan_access === "pro" && ctx.plan !== "pro"
            ? "pro_only"
            : real && prog!.percent === 100
              ? "completed"
              : real && prog!.percent > 0
                ? "in_progress"
                : real
                  ? "not_started"
                  : i === 2
                    ? "not_started"
                    : "in_progress";
        const progress = real ? prog!.percent : i === 0 ? 68 : i === 1 ? 42 : 0;
        return {
          slug: p.slug,
          title: p.title,
          description: p.description ?? "",
          status,
          progress,
          category_label: deriveCategoryLabel(p.category_access),
          total_lessons: p.total_lessons ?? undefined,
          total_tasks: p.total_tasks ?? undefined,
          estimated_days: p.estimated_days ?? undefined,
          cover_hue: i % 3 === 0 ? "rose" : i % 3 === 1 ? "cream" : "warm",
        };
      })
    : FALLBACK;

  const featured = programs.find((p) => p.status === "in_progress") ?? programs[0];

  const firstName = ctx.name.split(" ")[0];

  return (
    <PageShell>
      <div className="space-y-6 sm:space-y-7">
        {/* Header */}
        <header>
          <div className="text-rose-600 font-medium text-[13px] mb-2 flex items-center gap-1.5">
            <Sparkles className="size-4" strokeWidth={2} />
            Welcome back, {firstName}!
          </div>
          <h1 className="text-h1 text-ink-900 mb-1">
            Influencer Programs
          </h1>
          <p className="text-ink-500 text-[14px]">
            Structured creator growth paths tailored to your stage, goals and
            category.
          </p>
        </header>

        {/* Featured */}
        {featured && (
          <FeaturedProgram
            slug={featured.slug}
            title={featured.title}
            description={featured.description}
            category_label={featured.category_label ?? "Growth Creator"}
            total_lessons={featured.total_lessons ?? 24}
            total_tasks={featured.total_tasks ?? 18}
            estimated_days={featured.estimated_days ?? 30}
            progress={featured.progress ?? 0}
          />
        )}

        {/* Grid + filters */}
        <ProgramsGrid programs={programs} />

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <RecommendedForYou programs={programs.slice(0, 3)} />
          <CreatorDrills />
          <UpgradeAccent />
        </div>
      </div>
    </PageShell>
  );
}

function deriveCategoryLabel(arr: string[] | null | undefined) {
  if (!arr || arr.length === 0) return "Starter Creator";
  // Pick the first category in the access array
  const first = arr[0];
  return first === "starter"
    ? "Starter Creator"
    : first === "growth"
      ? "Growth Creator"
      : first === "monetization"
        ? "Monetization Creator"
        : first === "scale"
          ? "Scale Creator"
          : "Growth Creator";
}

function RecommendedForYou({ programs }: { programs: ProgramRow[] }) {
  return (
    <div className="card p-5">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-ink-900">
          Recommended For You
        </h3>
        <Link
          href="/programs"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          View all
        </Link>
      </header>
      <ul className="space-y-3">
        {programs.map((p) => (
          <li key={p.slug}>
            <Link
              href={p.status === "pro_only" ? "/billing?upgrade=pro" : `/programs/${p.slug}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-[10px] hover:bg-cream-100 transition-colors"
            >
              <div className="size-12 rounded-[10px] bg-gradient-to-br from-rose-100 via-cream-200 to-cream-300 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink-900 truncate">
                  {p.title}
                </div>
                <div className="text-[11.5px] text-ink-500 truncate">
                  {p.category_label ?? "Creator program"}
                  {typeof p.total_lessons === "number" && ` · ${p.total_lessons} Lessons`}
                </div>
              </div>
              <ChevronRight className="size-4 text-ink-400" strokeWidth={2} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CreatorDrills() {
  // Slugs below all map to real lessons seeded in 0003_lessons_seed.sql.
  // `hooks-that-stop-the-scroll`, `your-story-differentiator`, and
  // `defining-niche-sweet-spot` replaced earlier copy that linked to
  // tutorial slugs that don't exist yet.
  const drills = [
    { title: "Hooks That Stop The Scroll",       duration: "11:20", slug: "hooks-that-stop-the-scroll" },
    { title: "Content Pillars That Work",        duration: "15:30", slug: "content-pillars-that-work" },
    { title: "How To Read Platform Performance", duration: "13:45", slug: "platform-performance" },
    { title: "Your Story Differentiator",        duration: "10:05", slug: "your-story-differentiator" },
    { title: "Engaging Captions That Convert",   duration: "08:40", slug: "captions-that-convert" },
  ];
  return (
    <div className="card p-5">
      <header className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-ink-900">
          Creator Drills / Tutorials
        </h3>
        <Link
          href="/tutorials"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          View all
        </Link>
      </header>
      <ul className="space-y-2.5">
        {drills.map((d) => (
          <li key={d.slug}>
            <Link
              href={`/tutorials/${d.slug}`}
              className="flex items-center gap-3 group"
            >
              <div className="size-9 rounded-full bg-rose-100 flex items-center justify-center shrink-0 group-hover:bg-rose-200 transition-colors">
                <Play
                  className="size-3.5 text-rose-600 ml-0.5"
                  fill="currentColor"
                />
              </div>
              <span className="flex-1 text-[13px] text-ink-900 truncate">
                {d.title}
              </span>
              <span className="text-[12px] text-ink-500 tabular-nums inline-flex items-center gap-1">
                <Clock className="size-3 text-ink-400" strokeWidth={2} />
                {d.duration}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UpgradeAccent() {
  return (
    <div className="rounded-[16px] bg-rose-50/80 border border-rose-100 p-5 flex flex-col">
      <Sparkles className="size-5 text-rose-500 mb-3" strokeWidth={2} />
      <h3 className="font-display text-[20px] text-ink-900 leading-tight mb-2">
        Unlock the Pro track
      </h3>
      <p className="text-[13px] text-ink-700 leading-snug mb-4 flex-1">
        Pro unlocks <span className="font-semibold">Scale &amp; Automate</span>,
        the Monetization Path, content review and bonus modules in every
        program.
      </p>
      <Link
        href="/billing?upgrade=pro"
        className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors"
      >
        Upgrade to Pro
      </Link>
    </div>
  );
}

const FALLBACK: ProgramRow[] = [
  {
    slug: "influencer-blueprint",
    title: "The Influencer Blueprint",
    description: "Build your personal brand, find your niche, and create a consistent content system.",
    status: "in_progress",
    progress: 68,
    category_label: "Starter Creator",
    total_lessons: 24,
    total_tasks: 18,
    estimated_days: 30,
    cover_hue: "rose",
  },
  {
    slug: "content-that-connects",
    title: "Content That Connects",
    description: "Create content that attracts and converts your ideal audience.",
    status: "in_progress",
    progress: 42,
    category_label: "Growth Creator",
    total_lessons: 20,
    total_tasks: 15,
    estimated_days: 30,
    cover_hue: "cream",
  },
  {
    slug: "monetize-your-influence",
    title: "Monetize Your Influence",
    description: "Turn your audience into income with multiple revenue streams.",
    status: "not_started",
    progress: 0,
    category_label: "Monetization Creator",
    total_lessons: 22,
    total_tasks: 16,
    estimated_days: 30,
    cover_hue: "warm",
  },
  {
    slug: "scale-and-automate",
    title: "Scale & Automate",
    description: "Systemize your content, team and workflows to scale your impact.",
    status: "pro_only",
    category_label: "Monetization Creator",
    total_lessons: 20,
    total_tasks: 14,
    estimated_days: 30,
    cover_hue: "rose",
  },
];
