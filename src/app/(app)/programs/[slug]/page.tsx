import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Folder,
  Bookmark,
  Users,
  BookOpen,
  BarChart3,
  Clock,
  Check,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Files,
  ChevronRight,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/app-shell/avatar";
import { CurriculumAccordion } from "@/components/programs/curriculum-accordion";
import { DetailTabs } from "@/components/programs/detail-tabs";
import {
  getCurriculumForProgram,
  getProgramProgress,
} from "@/lib/programs/queries";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: `${prettySlug(slug)} · Creator Growth OS` };
}

function prettySlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Params;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { slug } = await params;

  const supabase = await createClient();
  const { data: dbProgram } = await supabase
    .from("programs")
    .select("slug, title, description, total_lessons, total_tasks, estimated_days, plan_access")
    .eq("slug", slug)
    .maybeSingle();

  // Fallback to mock if program isn't seeded yet
  const program = dbProgram ?? {
    slug,
    title: prettySlug(slug),
    description:
      "Build a magnetic personal brand that grows your visibility, builds trust, and creates opportunities. A step-by-step blueprint for modern creators.",
    total_lessons: 32,
    total_tasks: 18,
    estimated_days: 42,
    plan_access: "basic",
  };

  if (!program) notFound();

  // Read curriculum + progress from DB; both gracefully fall back when
  // the lessons table hasn't been seeded yet.
  const [modules, progress] = await Promise.all([
    getCurriculumForProgram(slug, ctx.plan),
    getProgramProgress(slug),
  ]);

  // Effective progress %: use computed value when lessons are seeded;
  // otherwise show a friendly nonzero value so the UI demo stays alive.
  const effectivePercent =
    progress.lessonsTotal > 0 ? progress.percent : 62;
  const effectiveTotal =
    progress.lessonsTotal > 0
      ? progress.lessonsTotal
      : (program.total_lessons ?? 32);

  // "Continue Program" should resume the program where the user left off —
  // the next incomplete lesson, then the in-progress one, then the first
  // unlocked lesson — and open the IN-PROGRAM player (not the standalone
  // Tutorials route). Falls back to the program landing if nothing resolves.
  const flatLessons = modules.flatMap((m) => m.lessons);
  const continueSlug =
    progress.nextLesson?.slug ??
    flatLessons.find((l) => l.status === "current")?.slug ??
    flatLessons.find((l) => l.status !== "locked")?.slug ??
    flatLessons[0]?.slug ??
    null;
  const continueHref = continueSlug
    ? `/programs/${slug}/${continueSlug}`
    : `/programs/${slug}`;

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <nav className="text-[13px]">
          <Link href="/programs" className="text-rose-600 hover:text-rose-700 font-medium">
            Programs
          </Link>
          <span className="text-ink-400 mx-2">/</span>
          <span className="text-ink-700">{program.title}</span>
        </nav>

        {/* Hero */}
        <ProgramHero
          title={program.title}
          description={program.description ?? ""}
          totalLessons={effectiveTotal}
          totalTasks={program.total_tasks ?? 18}
          estimatedDays={program.estimated_days ?? 42}
          progress={effectivePercent}
          continueHref={continueHref}
        />

        {/* Tabs + content */}
        <DetailTabs
          tasksCount={6}
          overview={
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-5">
              <div className="space-y-5">
                <WhatYoullLearn />
                <ThisWeeksLinkedTasks />
                <TemplatesDownloads />
              </div>
              <CurriculumAccordion modules={modules} programSlug={slug} />
            </div>
          }
          curriculum={
            <div className="max-w-[840px]">
              <CurriculumAccordion modules={modules} programSlug={slug} />
            </div>
          }
          resources={<ResourcesPanel />}
          tasks={<TasksPanel />}
        />
      </div>
    </PageShell>
  );
}

function ProgramHero({
  title,
  description,
  totalLessons,
  totalTasks,
  estimatedDays,
  progress,
  continueHref,
}: {
  title: string;
  description: string;
  totalLessons: number;
  totalTasks: number;
  estimatedDays: number;
  progress: number;
  continueHref: string;
}) {
  return (
    <section className="rounded-[24px] bg-cream-200 overflow-hidden relative">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 p-8 lg:p-10">
        <div className="max-w-2xl relative z-10">
          <h1 className="font-display text-[36px] lg:text-[40px] text-ink-900 leading-tight mb-3">
            {title}
          </h1>
          <p className="text-ink-700 text-[14.5px] leading-relaxed max-w-md mb-5">
            {description}
          </p>

          {/* Coach chip */}
          <div className="inline-flex items-center gap-3 mb-5">
            <Avatar name="Sophie Carter" size={44} />
            <div>
              <div className="text-[13px] font-semibold text-ink-900 leading-tight">
                Your Coach: Sophie Carter
              </div>
              <div className="text-[11.5px] text-ink-500">
                Growth & Brand Strategist
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-5 text-[12.5px] text-ink-700 mb-5">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-rose-500" strokeWidth={2} />
              {Math.ceil(totalLessons / 4)} Modules
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-rose-500" strokeWidth={2} />
              {totalLessons} Lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-rose-500" strokeWidth={2} />
              Intermediate
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-rose-500" strokeWidth={2} />
              {Math.ceil(estimatedDays / 7)} Weeks
            </span>
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-ink-500 font-medium">
                Program Progress
              </span>
              <span className="text-[12.5px] text-ink-900 font-semibold tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-cream-300 overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={continueHref}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-medium shadow-sm transition-colors"
            >
              <Play className="size-4" fill="currentColor" />
              Continue Program
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors cursor-pointer"
            >
              <Folder className="size-4" strokeWidth={2} />
              View Resources
            </button>
            <button
              type="button"
              className="size-12 rounded-[14px] bg-white border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-rose-600 transition-colors cursor-pointer"
              aria-label="Bookmark program"
            >
              <Bookmark className="size-4" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* Decorative right */}
        <div className="relative hidden lg:block">
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-rose-100/70 -translate-y-8 translate-x-12 blur-2xl" />
          <NotebookOrnament />
        </div>
      </div>
    </section>
  );
}

function NotebookOrnament() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-44 h-56 rounded-[14px] bg-white border border-cream-300 rotate-[-3deg] shadow-card p-4">
        <div className="font-script text-[18px] text-ink-700 mb-1 underline decoration-rose-300/70 underline-offset-4">
          Focus
        </div>
        <div className="font-script text-[18px] text-ink-700 mb-1 underline decoration-rose-300/70 underline-offset-4">
          Plan
        </div>
        <div className="font-script text-[18px] text-ink-700 mb-3 underline decoration-rose-300/70 underline-offset-4">
          Grow
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 rounded bg-cream-200 w-full" />
          <div className="h-1.5 rounded bg-cream-200 w-4/5" />
          <div className="h-1.5 rounded bg-cream-200 w-3/4" />
          <div className="h-1.5 rounded bg-cream-200 w-2/3" />
        </div>
        <div className="mt-3 text-right text-rose-400 text-[14px]">♥</div>
      </div>
    </div>
  );
}

function WhatYoullLearn() {
  const items = [
    "Define your niche and unique positioning",
    "Build content pillars that attract and convert",
    "Create hook-driven content that stops the scroll",
    "Stay consistent and build a loyal community",
    "Turn your personal brand into real income",
  ];
  return (
    <section className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-3 flex items-center gap-2">
        <span className="text-rose-500">📖</span>
        What You&apos;ll Learn
      </h3>
      <ul className="space-y-2.5">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2">
            <span className="size-5 mt-0.5 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <span className="text-[13px] text-ink-700">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ThisWeeksLinkedTasks() {
  const tasks = [
    { title: "Define your niche statement", due: "Due in 2 days", done: true },
    { title: "Create 3 content pillar ideas", due: "Due in 4 days", done: true },
    { title: "Write 5 hook variations", due: "Due in 5 days", done: false },
  ];
  const completed = tasks.filter((t) => t.done).length;
  const pct = Math.round((completed / 6) * 100);
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-ink-900 flex items-center gap-2">
          <span className="text-rose-500">🗓</span>
          This Week&apos;s Linked Tasks
        </h3>
        <Link href="/missions" className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700">
          View all
        </Link>
      </div>
      <ul className="space-y-2 mb-4">
        {tasks.map((t) => (
          <li key={t.title} className="flex items-center gap-2.5">
            <span
              className={`size-4 rounded-full inline-flex items-center justify-center shrink-0 ${t.done ? "bg-rose-500 text-white" : "border-2 border-ink-300"}`}
            >
              {t.done && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <span className={`flex-1 text-[13px] ${t.done ? "text-ink-400 line-through" : "text-ink-700"}`}>
              {t.title}
            </span>
            <span className="chip bg-cream-100 text-ink-500 text-[10.5px]">
              {t.due}
            </span>
          </li>
        ))}
      </ul>
      <div>
        <div className="flex items-center justify-between text-[11.5px] text-ink-500 mb-1">
          <span>{completed} of 6 tasks completed</span>
          <span>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
          <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </section>
  );
}

function TemplatesDownloads() {
  const items = [
    { title: "Niche Clarity Worksheet", type: "PDF", icon: FileText },
    { title: "Content Pillars Template", type: "Google Sheet", icon: FileSpreadsheet },
    { title: "Hook Library Starter Pack", type: "Swipe File", icon: Files, pro: true },
    { title: "Creator Checklist", type: "PDF Guide", icon: FileText },
  ];
  return (
    <section className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-ink-900 flex items-center gap-2">
          <span className="text-rose-500">📚</span>
          Templates &amp; Downloads
        </h3>
        <Link href="/tutorials" className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700">
          View all
        </Link>
      </div>
      <ul className="space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.title}>
              <button
                type="button"
                className="flex items-center gap-3 w-full p-2 -mx-2 rounded-[10px] hover:bg-cream-100 transition-colors cursor-pointer text-left"
              >
                <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                  <Icon className="size-4" strokeWidth={1.8} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink-900 truncate flex items-center gap-1.5">
                    {it.title}
                    {it.pro && (
                      <span className="chip chip-rose text-[9px]">PRO</span>
                    )}
                  </div>
                </div>
                <span className="text-[11.5px] text-ink-500">{it.type}</span>
                <ChevronRight className="size-3.5 text-ink-400" strokeWidth={2} />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ResourcesPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <TemplatesDownloads />
      <div className="card p-5">
        <h3 className="font-display text-[18px] text-ink-900 mb-2">
          Replays &amp; Workshops
        </h3>
        <p className="text-[13px] text-ink-500">
          Recorded sessions will appear here once your coach hosts live workshops for this program.
        </p>
      </div>
    </div>
  );
}

function TasksPanel() {
  return (
    <div className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-3">
        Program Tasks
      </h3>
      <p className="text-[13px] text-ink-500 mb-4">
        Tasks linked to this program show up in your Today&apos;s Missions feed.
        Open the full mission list to manage them.
      </p>
      <Link
        href="/missions"
        className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors"
      >
        Go to Today&apos;s Missions
        <ArrowRight className="size-4" strokeWidth={2} />
      </Link>
    </div>
  );
}

