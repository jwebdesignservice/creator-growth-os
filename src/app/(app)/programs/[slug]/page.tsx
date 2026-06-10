import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Users,
  BookOpen,
  BarChart3,
  Clock,
  Check,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Files,
  Link2,
  Sparkles,
  Star,
  Library,
  Target,
  Layers,
  Anchor,
  TrendingUp,
  Lightbulb,
  Rocket,
  Zap,
  Pencil,
  Video,
  Megaphone,
  Heart,
  DollarSign,
  GraduationCap,
  LayoutGrid,
  ListTree,
  FolderClosed,
  NotebookPen,
  CheckSquare,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/app-shell/avatar";
import { CurriculumAccordion } from "@/components/programs/curriculum-accordion";
import {
  WorkspaceShell,
  WorkspaceHeader,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";
import {
  getCurriculumForProgram,
  getProgramProgress,
  getProgramLearningPoints,
  getProgramNotes,
  type ProgramNote,
} from "@/lib/programs/queries";
import { ProgramNotes } from "@/components/programs/program-notes";
import { PROGRAM_OUTCOMES } from "@/lib/programs/outcomes";
import {
  getProgramUserTasks,
  type ProgramUserTask,
} from "@/lib/programs/lesson-task-queries";
import {
  getOnboardingGate,
  isGateActive,
  readPreviewGate,
  ONBOARDING_PROGRAM_SLUG,
} from "@/lib/onboarding/gate";
import { OnboardingLockedNotice } from "@/components/onboarding/onboarding-locked-notice";

/* Learning-point icon keys → lucide components. Keys come from
   learning-content.ts; mirrors the lesson page's map so the program overview
   can render the aggregated per-lesson points. */
const LEARNING_ICONS: Record<string, LucideIcon> = {
  target: Target,
  layers: Layers,
  anchor: Anchor,
  users: Users,
  "trending-up": TrendingUp,
  lightbulb: Lightbulb,
  rocket: Rocket,
  "book-open": BookOpen,
  sparkles: Sparkles,
  zap: Zap,
  pencil: Pencil,
  video: Video,
  megaphone: Megaphone,
  heart: Heart,
  "dollar-sign": DollarSign,
};

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ previewGate?: string; tab?: string }>;

type ProgramTab = "overview" | "curriculum" | "resources" | "notes" | "tasks";
const PROGRAM_TAB_KEYS: ProgramTab[] = [
  "overview",
  "curriculum",
  "resources",
  "notes",
  "tasks",
];

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  return { title: `${prettySlug(slug)} · Profluencer` };
}

function prettySlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ProgramDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { slug } = await params;

  // Onboarding gate — every program except Start Here is locked until the
  // user finishes onboarding. Enforced here so direct URLs respect the lock.
  const { previewGate, tab } = await searchParams;
  const gate = await getOnboardingGate();
  if (
    slug !== ONBOARDING_PROGRAM_SLUG &&
    isGateActive(gate, readPreviewGate(previewGate))
  ) {
    return (
      <PageShell>
        <div className="space-y-6">
          <nav className="text-[13px]">
            <Link
              href="/programs"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Programs
            </Link>
            <span className="text-ink-400 mx-2">/</span>
            <span className="text-ink-700">{prettySlug(slug)}</span>
          </nav>
          <OnboardingLockedNotice
            percent={gate.percent}
            programSlug={gate.programSlug}
            kind="program"
          />
        </div>
      </PageShell>
    );
  }

  const supabase = await createClient();
  const { data: dbProgram } = await supabase
    .from("programs")
    .select("id, slug, title, description, total_lessons, total_tasks, estimated_days, plan_access")
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
  // the lessons table hasn't been seeded yet. The program row and auth user
  // are already resolved above, so pass them in to skip duplicate lookups.
  const [modules, progress] = await Promise.all([
    getCurriculumForProgram(slug, ctx.plan, {
      programId: dbProgram?.id,
      userId: ctx.user.id,
    }),
    getProgramProgress(slug, {
      program: dbProgram
        ? { id: dbProgram.id, total_lessons: dbProgram.total_lessons }
        : undefined,
      userId: ctx.user.id,
    }),
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

  // ── Tasks, enrolled count, notes + learning points ────────────────────
  // All four reads only need the program uuid (+ user id), so they run in
  // one parallel batch instead of four serial awaits.
  const programUuid = dbProgram?.id ?? null;
  const [programTasks, { count: enrolledCountRaw }, programNotes, aggregatedPoints] =
    await Promise.all([
      // Real user tasks for this program (from generated missions)
      programUuid
        ? getProgramUserTasks(programUuid, ctx.user.id)
        : Promise.resolve([] as ProgramUserTask[]),
      // Real enrolled-learner count for this program — one program_progress
      // row per enrolled user (same source as the admin "members" count). No
      // fabricated number; reflects actual enrollment.
      programUuid
        ? supabase
            .from("program_progress")
            .select("*", { count: "exact", head: true })
            .eq("program_id", programUuid)
        : Promise.resolve({ count: 0 }),
      // Learner-authored notes for this program (Resources → My Notes)
      programUuid
        ? getProgramNotes(programUuid)
        : Promise.resolve([] as ProgramNote[]),
      // Program "What You'll Learn" — aggregated from every lesson's authored
      // learning points (admin section C). Falls back to the static outcomes
      // when no lesson has any yet, so the section is never empty.
      programUuid
        ? getProgramLearningPoints(programUuid)
        : Promise.resolve([]),
    ]);
  const enrolledCount = enrolledCountRaw ?? 0;
  const learnOutcomes =
    aggregatedPoints.length > 0
      ? aggregatedPoints.map((lp) => ({
          icon: LEARNING_ICONS[lp.icon] ?? Target,
          title: lp.title,
          desc: lp.description,
        }))
      : PROGRAM_OUTCOMES.map((o) => ({ icon: o.icon, title: o.title, desc: o.desc }));

  const active: ProgramTab = PROGRAM_TAB_KEYS.includes(tab as ProgramTab)
    ? (tab as ProgramTab)
    : "overview";
  const programTabs: WorkspaceTab[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid, href: `/programs/${slug}` },
    {
      key: "curriculum",
      label: "Curriculum",
      icon: ListTree,
      href: `/programs/${slug}?tab=curriculum`,
    },
    {
      key: "resources",
      label: "Resources",
      icon: FolderClosed,
      href: `/programs/${slug}?tab=resources`,
    },
    {
      key: "notes",
      label: "Notes",
      icon: NotebookPen,
      href: `/programs/${slug}?tab=notes`,
    },
    {
      key: "tasks",
      label: "Tasks",
      icon: CheckSquare,
      href: `/programs/${slug}?tab=tasks`,
      badge: programTasks.length,
    },
  ];

  return (
    <PageShell>
      <WorkspaceShell
        title={program.title}
        icon={GraduationCap}
        tabs={programTabs}
        activeKey={active}
      >
        {/* Back + breadcrumb — leveled header band (lines up with rail title) */}
        <WorkspaceHeader
          left={
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/programs"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 hover:text-ink-900 transition-colors shrink-0"
              >
                <ChevronLeft className="size-3.5" strokeWidth={2} />
                Back
              </Link>
              <span aria-hidden className="w-px h-4 bg-ink-200 shrink-0" />
              <nav className="flex items-center gap-2 text-[13px] min-w-0">
                <Link
                  href="/programs"
                  className="text-rose-600 hover:text-rose-700 font-medium shrink-0"
                >
                  Programs
                </Link>
                <span className="text-ink-400 shrink-0">/</span>
                <span className="text-ink-700 truncate">{program.title}</span>
              </nav>
            </div>
          }
        />

        <div className="space-y-5 lg:pt-[var(--space-page-y)]">
          {active === "overview" && (
            <>
              <ProgramHero
                title={program.title}
                description={program.description ?? ""}
                totalLessons={effectiveTotal}
                estimatedDays={program.estimated_days ?? 42}
                progress={effectivePercent}
                continueHref={continueHref}
                enrolledCount={enrolledCount}
              />
              <WhatYoullLearn
                outcomes={learnOutcomes}
                percent={effectivePercent}
                continueHref={continueHref}
              />
              <CurriculumAccordion modules={modules} programSlug={slug} />
            </>
          )}

          {active === "curriculum" && (
            <div className="max-w-[900px]">
              <CurriculumAccordion modules={modules} programSlug={slug} />
            </div>
          )}

          {active === "resources" && <TemplatesDownloads />}

          {active === "notes" && (
            <ProgramNotes
              notes={programNotes}
              programSlug={slug}
              newNoteHref={continueHref}
            />
          )}

          {active === "tasks" && <AllProgramTasks tasks={programTasks} />}
        </div>
      </WorkspaceShell>
    </PageShell>
  );
}

function ProgramHero({
  title,
  description,
  totalLessons,
  estimatedDays,
  progress,
  continueHref,
  enrolledCount,
}: {
  title: string;
  description: string;
  totalLessons: number;
  estimatedDays: number;
  progress: number;
  continueHref: string;
  enrolledCount: number;
}) {
  return (
    <section className="rounded-[24px] bg-cream-200 overflow-hidden relative">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6 p-8 lg:p-10">
        <div className="max-w-2xl relative z-10">
          <h1 className="text-h1 lg:text-[40px] text-ink-900 leading-tight mb-3">
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

            {/* Social proof — real enrolled-learner count (decorative avatars) */}
            <div className="inline-flex items-center gap-2.5 pl-1">
              <div className="flex -space-x-2.5" aria-hidden>
                <span className="size-8 rounded-full bg-gradient-to-br from-rose-300 to-rose-500 ring-2 ring-cream-200" />
                <span className="size-8 rounded-full bg-gradient-to-br from-amber-300 to-rose-400 ring-2 ring-cream-200" />
                <span className="size-8 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500 ring-2 ring-cream-200" />
              </div>
              <span className="text-[14px] text-ink-700 leading-tight">
                <span className="font-bold text-ink-900 tabular-nums">
                  {enrolledCount.toLocaleString()}
                </span>{" "}
                learner{enrolledCount === 1 ? "" : "s"} enrolled
              </span>
            </div>
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

function WhatYoullLearn({
  outcomes,
  percent,
  continueHref,
}: {
  outcomes: { icon: LucideIcon; title: string; desc: string }[];
  percent: number;
  continueHref: string;
}) {
  const total = outcomes.length;
  const completed = Math.min(total, Math.round((percent / 100) * total));
  const allDone = completed >= total;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
      {/* ── Left: outcomes ───────────────────────────────────────────── */}
      <div className="rounded-[20px] bg-cream-100 border border-cream-200 p-5 sm:p-6">
        <header className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-start gap-3.5 min-w-0">
            <span className="size-12 rounded-[14px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <BookOpen className="size-[22px]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h2 className="text-h3 text-ink-900 leading-tight mb-1">
                What You&apos;ll Learn
              </h2>
              <p className="text-[13px] text-ink-500 leading-snug max-w-md">
                Master the essential building blocks to grow your brand,
                attract your audience, and create real impact.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-[12.5px] font-semibold whitespace-nowrap shrink-0">
            <Sparkles className="size-3.5" strokeWidth={2} />
            <span>Complete</span>
            <span className="tabular-nums">
              {completed} / {total}
            </span>
          </span>
        </header>

        <ul className="rounded-[16px] bg-white border border-ink-100 overflow-hidden">
          {outcomes.map((o, i) => {
            const isDone = i < completed;
            const Icon = o.icon;
            return (
              <li
                key={o.title}
                className={`flex items-center gap-4 p-4 ${
                  i > 0 ? "border-t border-ink-100" : ""
                }`}
              >
                <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                  <Icon className="size-[20px]" strokeWidth={1.9} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-ink-900 leading-snug">
                    {o.title}
                  </div>
                  <div className="text-[12.5px] text-ink-500 leading-snug mt-0.5">
                    {o.desc}
                  </div>
                </div>
                <span
                  className={`size-7 rounded-full inline-flex items-center justify-center shrink-0 ${
                    isDone
                      ? "bg-rose-100 text-rose-600"
                      : "bg-cream-100 text-ink-300"
                  }`}
                  aria-label={isDone ? "Mastered" : "Not yet mastered"}
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Right: status / celebration ──────────────────────────────── */}
      <aside className="rounded-[20px] bg-rose-50 border border-rose-100 p-6 flex flex-col items-center text-center">
        <div className="relative mb-4 mt-1">
          <span className="size-16 rounded-full bg-rose-500 text-white inline-flex items-center justify-center shadow-sm">
            <Star className="size-7" fill="currentColor" strokeWidth={0} />
          </span>
          <span
            aria-hidden
            className="absolute -top-1 -left-2 text-rose-400 text-[10px]"
          >
            ✦
          </span>
          <span
            aria-hidden
            className="absolute -top-2 right-0 text-rose-400 text-[13px]"
          >
            ✦
          </span>
          <span
            aria-hidden
            className="absolute -bottom-1 -right-2 text-rose-400 text-[11px]"
          >
            ✦
          </span>
        </div>
        {allDone ? (
          <>
            <p className="text-[12.5px] text-ink-500 mb-1.5">
              You&apos;re all set!
            </p>
            <h3 className="text-h3 text-ink-900 leading-tight mb-3">
              All lessons completed
            </h3>
            <p className="text-[12.5px] text-ink-500 leading-relaxed mb-5 max-w-[220px]">
              You&apos;ve completed everything in this section. Keep building
              and keep growing!
            </p>
          </>
        ) : (
          <>
            <p className="text-[12.5px] text-ink-500 mb-1.5">
              You&apos;re making progress!
            </p>
            <h3 className="text-h3 text-ink-900 leading-tight mb-3 tabular-nums">
              {percent}% complete
            </h3>
            <p className="text-[12.5px] text-ink-500 leading-relaxed mb-5 max-w-[220px]">
              Stick with it — every lesson moves you closer to mastering all{" "}
              {total} outcomes.
            </p>
          </>
        )}
        <Link
          href={continueHref}
          className="inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-700 text-[14px] font-semibold transition-colors"
        >
          {allDone ? "Keep Going" : "Continue"}
          <ArrowRight className="size-4" strokeWidth={2.5} />
        </Link>
      </aside>
    </section>
  );
}

function TemplatesDownloads() {
  const items: {
    title: string;
    desc: string;
    type: string;
    icon: LucideIcon;
    pro?: boolean;
  }[] = [
    {
      title: "Niche Clarity Worksheet",
      desc: "Clarify your offer, audience, and positioning.",
      type: "PDF",
      icon: FileText,
    },
    {
      title: "Content Pillars Template",
      desc: "Map your recurring themes and posting angles.",
      type: "Google Sheet",
      icon: FileSpreadsheet,
    },
    {
      title: "Hook Library Starter Pack",
      desc: "Plug-and-play hook prompts for better content starts.",
      type: "Swipe File",
      icon: Files,
      pro: true,
    },
    {
      title: "Creator Checklist",
      desc: "A simple execution checklist for consistent publishing.",
      type: "PDF Guide",
      icon: FileText,
    },
  ];
  return (
    <section className="lg:-ml-6 lg:-mr-[var(--space-page-x)] lg:-mt-[var(--space-page-y)]">
      {/* Header — matches This Week's Linked Tasks chrome */}
      <div className="p-5 sm:p-6 flex items-start gap-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Library className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">
            Templates &amp; Downloads
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            Ready-to-use resources to speed up execution
          </p>
        </div>
      </div>

      {/* Rows */}
      <ul>
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li key={it.title} className="border-t border-ink-100">
              {/* Non-interactive until real downloadable files exist — shown as
                  "Coming soon" rather than a dead button that does nothing. */}
              <div className="flex items-center gap-3.5 w-full px-5 sm:px-6 py-4 text-left">
                <span className="size-11 rounded-[12px] bg-cream-200 text-ink-400 inline-flex items-center justify-center shrink-0">
                  <Icon className="size-[20px]" strokeWidth={1.9} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-ink-900 leading-snug">
                    <span className="truncate">{it.title}</span>
                    {it.pro && (
                      <span className="chip chip-rose text-[9.5px] px-2 py-0.5">
                        PRO
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-ink-500 leading-snug mt-0.5 truncate">
                    {it.desc}
                  </div>
                </div>
                <span className="text-[12px] text-ink-500 shrink-0 hidden sm:inline">
                  {it.type}
                </span>
                <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-cream-200 text-ink-500 text-[10.5px] font-semibold shrink-0 whitespace-nowrap">
                  Coming soon
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer note */}
      <div className="border-t border-ink-100 px-5 sm:px-6 py-3 flex items-center gap-2 text-[12px] text-ink-500 flex-wrap">
        <span className="size-6 rounded-full bg-cream-200 text-ink-400 inline-flex items-center justify-center shrink-0">
          <Star className="size-3" fill="currentColor" strokeWidth={0} />
        </span>
        <span>
          Downloadable templates are being prepared — they&apos;ll appear here
          soon.
        </span>
      </div>
    </section>
  );
}

/**
 * Tasks tab — every task linked to the current program, rendered with the
 * same row chrome as the Overview's "This Week's Linked Tasks" card so the
 * two stay visually consistent. This tab is the full-width superset; the
 * Overview card is the this-week subset.
 */
function AllProgramTasks({ tasks }: { tasks: ProgramUserTask[] }) {
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const nextIdx = tasks.findIndex((t) => t.status !== "completed");
  const nextTask = nextIdx >= 0 ? tasks[nextIdx] : null;
  const remaining = total - completed;

  return (
    <section className="card p-5 sm:p-6">
      {/* Header — same chrome as ThisWeeksLinkedTasks */}
      <div className="flex items-start gap-3 mb-5">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Link2 className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">
            Program Tasks
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            Every task linked to this program — generated as you complete videos
          </p>
        </div>
      </div>

      {total === 0 ? (
        <ProgramTasksEmptyState />
      ) : (
      <>
      {/* Task list */}
      <ul className="space-y-3 mb-4">
        {tasks.map((t, i) => {
          const isDone = t.status === "completed";
          const isNext = i === nextIdx;
          return (
            <li
              key={t.id}
              className={`flex items-center gap-3 ${i < tasks.length - 1 ? "pb-3 border-b border-ink-100" : ""}`}
            >
              <span
                className={`size-6 rounded-full inline-flex items-center justify-center shrink-0 transition-colors ${
                  isDone
                    ? "bg-rose-500 text-white"
                    : "border-2 border-rose-300 bg-white"
                }`}
                aria-hidden
              >
                {isDone && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <div className="flex-1 min-w-0">
                <div
                  className={`text-[14px] leading-snug ${
                    isDone
                      ? "text-ink-400 line-through"
                      : "text-ink-900 font-semibold"
                  }`}
                >
                  {t.title}
                </div>
                <div className="text-[11.5px] text-ink-500 mt-0.5 truncate">
                  {t.module_number
                    ? `Module ${t.module_number} · ${t.module_title ?? "Module"}`
                    : t.lesson_title ?? "Program task"}
                  {isNext && (
                    <>
                      <span aria-hidden> · </span>
                      <span className="text-rose-600 font-semibold">
                        Next recommended task
                      </span>
                    </>
                  )}
                </div>
              </div>
              <span className="inline-flex items-center h-7 px-2.5 rounded-full bg-cream-100 text-ink-500 text-[11px] font-medium shrink-0 tabular-nums">
                {t.due_date ? formatDueLabel(t.due_date) : `~${t.estimated_minutes} min`}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Next-up callout */}
      {nextTask && (
        <div className="rounded-[12px] bg-rose-50 border border-rose-100 px-3.5 py-2.5 flex items-center gap-3 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-rose-700 shrink-0">
            <Sparkles
              className="size-3.5"
              strokeWidth={2}
              fill="currentColor"
            />
            Next up
          </span>
          <span aria-hidden className="w-px h-4 bg-rose-200 shrink-0" />
          <span className="flex-1 min-w-0 text-[12.5px] text-ink-700 leading-snug truncate">
            Complete {nextTask.title.toLowerCase()} to unlock your next lesson.
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-600 shrink-0">
            <span aria-hidden className="size-1.5 rounded-full bg-rose-500" />
            {remaining} task{remaining === 1 ? "" : "s"} ready now
          </span>
        </div>
      )}

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-[12px] text-ink-500 mb-1.5">
          <span>
            {completed} of {total} tasks completed
          </span>
          <span className="font-semibold text-ink-900 tabular-nums">
            {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-rose-500 transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      </>
      )}
    </section>
  );
}

/* ─── Empty state + helpers shared by both task cards ─────────────────── */

function ProgramTasksEmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`rounded-[14px] bg-cream-50 border border-cream-200 text-center ${
        compact ? "px-4 py-5" : "px-4 py-8"
      }`}
    >
      <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <Sparkles className="size-[18px]" strokeWidth={1.9} />
      </span>
      <h4 className="text-[14px] font-semibold text-ink-900 mb-1">
        No tasks linked yet
      </h4>
      <p className="text-[12.5px] text-ink-500 max-w-md mx-auto leading-snug">
        Complete a lesson in this program to unlock its tasks. They&apos;ll show
        up here and in your global Tasks tab.
      </p>
    </div>
  );
}

/** Format an ISO date (YYYY-MM-DD) as a human-friendly "Due in N days" chip. */
function formatDueLabel(iso: string): string {
  const due = new Date(iso + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (diff < 0) return `Overdue ${Math.abs(diff)}d`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `Due in ${diff} days`;
}


