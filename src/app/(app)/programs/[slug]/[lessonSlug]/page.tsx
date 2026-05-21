import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Lock,
  Check,
  Circle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BarChart3,
  Clock,
  CheckCircle2,
  Target,
  CalendarDays,
  FileText,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import {
  getCurriculumForProgram,
  getProgramProgress,
  type ProgramProgress,
} from "@/lib/programs/queries";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { LessonVideoPlayer } from "@/components/tutorials/video-player";
import { LessonActionRow } from "@/components/tutorials/action-row";
import type { Module } from "@/components/programs/curriculum-accordion";
import { cn } from "@/lib/cn";

/**
 * In-program lesson player — `/programs/[slug]/[lessonSlug]`.
 *
 * A program is an *ordered path* of lessons toward a goal, so playback
 * happens HERE, inside the program — not by bouncing the user out to the
 * standalone Tutorials route. We reuse the exact same video player +
 * action-row components as Tutorials (one video system, no duplication),
 * but everything around them stays program-scoped:
 *   • breadcrumb  → Programs / [Program] / [Lesson]
 *   • rail        → this program's curriculum (jump between its lessons)
 *   • prev / next → the surrounding lessons IN THIS program
 *   • progress    → the program's completion
 *
 * The same lesson is still reachable standalone at /tutorials/[slug] — one
 * lesson, two entry points (sequenced here, à la carte there).
 *
 * Data: `getTutorialDetail` supplies the video + program-scoped prev/next;
 * `getCurriculumForProgram` supplies the full path for the rail. Both fall
 * back gracefully when lessons aren't seeded, so the page always renders.
 */

type Params = Promise<{ slug: string; lessonSlug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { lessonSlug } = await params;
  const lesson = await getTutorialDetail(lessonSlug);
  return {
    title: lesson
      ? `${lesson.title} · Creator Growth OS`
      : "Lesson · Creator Growth OS",
  };
}

function prettySlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export default async function ProgramLessonPage({
  params,
}: {
  params: Params;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { slug, lessonSlug } = await params;

  const supabase = await createClient();
  const { data: dbProgram } = await supabase
    .from("programs")
    .select("title")
    .eq("slug", slug)
    .maybeSingle();
  const programTitle = dbProgram?.title ?? prettySlug(slug);

  const [modules, progress, detail] = await Promise.all([
    getCurriculumForProgram(slug, ctx.plan),
    getProgramProgress(slug),
    getTutorialDetail(lessonSlug),
  ]);

  // Flatten the program's curriculum into one ordered list — used for the
  // current lesson lookup and for prev/next when there's no DB detail.
  const flat = modules.flatMap((m) =>
    m.lessons.map((l) => ({
      ...l,
      moduleNumber: m.number,
      moduleTitle: m.title,
    })),
  );
  const idx = flat.findIndex((l) => l.slug === lessonSlug);
  const curr = idx >= 0 ? flat[idx] : null;

  // Neither a DB lesson nor a curriculum entry → genuinely unknown lesson.
  if (!detail && !curr) notFound();

  const title = detail?.title ?? curr!.title;
  const duration = detail?.duration ?? curr!.duration;
  const description = detail?.description ?? null;
  const videoUrl = detail?.videoUrl ?? null;
  const completed = detail?.completed ?? curr?.status === "completed";
  const moduleNumber = detail?.moduleNumber ?? curr?.moduleNumber ?? 1;
  const moduleTitle = detail?.moduleTitle ?? curr?.moduleTitle ?? "Module";
  const difficulty = detail?.difficulty ?? "Intermediate";
  const proLocked =
    curr?.status === "locked" ||
    (detail?.planAccess === "pro" && ctx.plan !== "pro");

  // Prefer the DB's program-scoped prev/next; fall back to the flat list.
  const prev =
    detail?.prev ??
    (idx > 0 ? { slug: flat[idx - 1].slug, title: flat[idx - 1].title } : null);
  const next =
    detail?.next ??
    (idx >= 0 && idx < flat.length - 1
      ? { slug: flat[idx + 1].slug, title: flat[idx + 1].title }
      : null);

  const lessonNumber = idx >= 0 ? idx + 1 : null;
  const totalLessons = flat.length;

  // Lessons in the current module (for the in-content "module" card).
  const moduleLessons = flat.filter((l) => l.moduleNumber === moduleNumber);

  return (
    <PageShell
      rail={
        <ProgramRail
          programSlug={slug}
          programTitle={programTitle}
          modules={modules}
          currentSlug={lessonSlug}
          progress={progress}
          fallbackTotal={totalLessons}
        />
      }
    >
      <div className="space-y-6 max-w-[1100px]">
        {/* Breadcrumb — stays inside Programs */}
        <nav className="text-[13px]">
          <Link
            href="/programs"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Programs
          </Link>
          <span className="text-ink-400 mx-2">/</span>
          <Link
            href={`/programs/${slug}`}
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            {programTitle}
          </Link>
          <span className="text-ink-400 mx-2">/</span>
          <span className="text-ink-700">{title}</span>
        </nav>

        {/* Header */}
        <header>
          <div className="text-[12px] font-semibold uppercase tracking-wider text-rose-600 mb-1.5">
            Module {moduleNumber} · {moduleTitle}
          </div>
          <h1 className="font-display text-[30px] sm:text-[36px] text-ink-900 leading-tight mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-ink-500 text-[14px] max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {lessonNumber && (
              <span className="chip bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                Lesson {lessonNumber} of {totalLessons}
              </span>
            )}
            <span className="chip bg-cream-100 text-ink-700 inline-flex items-center gap-1">
              <Play className="size-3" fill="currentColor" />
              Video Lesson
            </span>
            <span className="chip bg-cream-100 text-ink-700 inline-flex items-center gap-1">
              <BarChart3 className="size-3" strokeWidth={2} />
              {difficulty}
            </span>
            <span className="chip bg-cream-100 text-ink-700 inline-flex items-center gap-1">
              <Clock className="size-3" strokeWidth={2} />
              {duration}
            </span>
          </div>
        </header>

        {/* Pro lock notice */}
        {proLocked && (
          <div className="rounded-[14px] bg-rose-50 border border-rose-200 p-5 flex items-center gap-4">
            <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Lock className="size-5" strokeWidth={2} />
            </span>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-ink-900">
                This lesson is Pro Only
              </div>
              <p className="text-[12.5px] text-ink-700">
                Upgrade to unlock this lesson and finish the program track.
              </p>
            </div>
            <Link
              href="/billing?upgrade=pro"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium"
            >
              Upgrade to Pro
            </Link>
          </div>
        )}

        {/* Video + actions */}
        {!proLocked && (
          <>
            <LessonVideoPlayer
              title={title}
              duration={duration}
              videoUrl={videoUrl}
            />

            <LessonActionRow
              lessonSlug={lessonSlug}
              initialCompleted={completed}
            />

            {/* Prev / Next — within this program */}
            <PrevNextNav programSlug={slug} prev={prev} next={next} />

            {/* Overview + module path */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
              <LessonOverview title={title} description={description} />
              <ModulePathCard
                programSlug={slug}
                moduleNumber={moduleNumber}
                moduleTitle={moduleTitle}
                lessons={moduleLessons}
                currentSlug={lessonSlug}
              />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

/* ─── Right rail: program path ────────────────────────────────────────── */

function ProgramRail({
  programSlug,
  programTitle,
  modules,
  currentSlug,
  progress,
  fallbackTotal,
}: {
  programSlug: string;
  programTitle: string;
  modules: Module[];
  currentSlug: string;
  progress: ProgramProgress;
  fallbackTotal: number;
}) {
  const total = progress.lessonsTotal > 0 ? progress.lessonsTotal : fallbackTotal;
  const done = progress.lessonsCompleted;
  const percent = progress.lessonsTotal > 0 ? progress.percent : 0;

  return (
    <aside className="hidden xl:flex flex-col w-[320px] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-4 pt-16 space-y-3">
        {/* Progress */}
        <section className="card p-4">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-ink-400 mb-1">
            Your progress
          </div>
          <div className="text-[14px] font-semibold text-ink-900 mb-3 leading-snug">
            {programTitle}
          </div>
          <div className="flex items-center justify-between text-[12px] mb-1.5">
            <span className="text-ink-500 tabular-nums">
              {done} of {total} lessons
            </span>
            <span className="font-semibold text-ink-900 tabular-nums">
              {percent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-cream-300 overflow-hidden">
            <div className="h-full bg-rose-500" style={{ width: `${percent}%` }} />
          </div>
        </section>

        {/* Curriculum — jump between lessons without leaving the program */}
        <section className="card p-3">
          <h3 className="text-[13px] font-semibold text-ink-900 px-1 pt-1 mb-2">
            Program Path
          </h3>
          <div className="space-y-3">
            {modules.map((m) => (
              <div key={m.number}>
                <div className="flex items-center gap-2 px-1 mb-1">
                  <span
                    className={cn(
                      "size-5 rounded-full inline-flex items-center justify-center text-[10px] font-semibold shrink-0",
                      m.pro_only
                        ? "bg-cream-200 text-ink-600 border border-rose-200"
                        : "bg-rose-500 text-white",
                    )}
                  >
                    {m.pro_only ? <Lock className="size-2.5" strokeWidth={2.5} /> : m.number}
                  </span>
                  <span className="text-[12px] font-semibold text-ink-800 leading-tight">
                    {m.title}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {m.lessons.map((l) => (
                    <RailLessonRow
                      key={l.slug}
                      programSlug={programSlug}
                      lesson={l}
                      isCurrent={l.slug === currentSlug}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Link
            href={`/programs/${programSlug}`}
            className="mt-3 inline-flex items-center gap-1.5 px-1 text-[12px] font-semibold text-rose-700 hover:text-rose-600 transition-colors"
          >
            View full program
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </Link>
        </section>
      </div>
    </aside>
  );
}

function RailLessonRow({
  programSlug,
  lesson,
  isCurrent,
}: {
  programSlug: string;
  lesson: { slug: string; title: string; duration: string; status: string };
  isCurrent: boolean;
}) {
  const isDone = lesson.status === "completed";
  const isLocked = lesson.status === "locked";

  const inner = (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded-[8px] transition-colors",
        isCurrent
          ? "bg-rose-50 border border-rose-200"
          : isLocked
            ? "opacity-70"
            : "hover:bg-cream-200",
      )}
    >
      <span
        className={cn(
          "size-5 rounded-full inline-flex items-center justify-center shrink-0",
          isDone
            ? "bg-rose-100 text-rose-600"
            : isCurrent
              ? "bg-rose-500 text-white"
              : isLocked
                ? "bg-cream-200 text-ink-400"
                : "bg-cream-100 text-ink-400 border border-ink-200",
        )}
      >
        {isDone ? (
          <Check className="size-3" strokeWidth={3} />
        ) : isLocked ? (
          <Lock className="size-2.5" strokeWidth={2.5} />
        ) : isCurrent ? (
          <Play className="size-2.5 ml-0.5" fill="currentColor" />
        ) : (
          <Circle className="size-2" strokeWidth={2} />
        )}
      </span>
      <span
        className={cn(
          "flex-1 min-w-0 truncate text-[12px]",
          isCurrent
            ? "font-semibold text-ink-900"
            : isLocked
              ? "text-ink-400"
              : "text-ink-700",
        )}
      >
        {lesson.title}
      </span>
      <span className="text-[10.5px] text-ink-400 tabular-nums shrink-0">
        {lesson.duration}
      </span>
    </div>
  );

  if (isLocked) return <li className="cursor-not-allowed">{inner}</li>;

  return (
    <li>
      <Link href={`/programs/${programSlug}/${lesson.slug}`} className="block">
        {inner}
      </Link>
    </li>
  );
}

/* ─── Prev / Next program navigation ──────────────────────────────────── */

function PrevNextNav({
  programSlug,
  prev,
  next,
}: {
  programSlug: string;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}) {
  if (!prev && !next) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {prev ? (
        <Link
          href={`/programs/${programSlug}/${prev.slug}`}
          className="group flex items-center gap-3 card p-3.5 hover:border-rose-200 transition-colors"
        >
          <ChevronLeft
            className="size-5 text-ink-400 group-hover:text-rose-600 transition-colors shrink-0"
            strokeWidth={2}
          />
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-ink-400">
              Previous
            </span>
            <span className="block text-[13px] font-semibold text-ink-900 truncate">
              {prev.title}
            </span>
          </span>
        </Link>
      ) : (
        <span aria-hidden />
      )}
      {next ? (
        <Link
          href={`/programs/${programSlug}/${next.slug}`}
          className="group flex items-center justify-end gap-3 card p-3.5 hover:border-rose-200 transition-colors text-right"
        >
          <span className="min-w-0">
            <span className="block text-[11px] uppercase tracking-wider font-semibold text-ink-400">
              Next
            </span>
            <span className="block text-[13px] font-semibold text-ink-900 truncate">
              {next.title}
            </span>
          </span>
          <ChevronRight
            className="size-5 text-ink-400 group-hover:text-rose-600 transition-colors shrink-0"
            strokeWidth={2}
          />
        </Link>
      ) : (
        <span aria-hidden />
      )}
    </div>
  );
}

/* ─── Lesson overview ─────────────────────────────────────────────────── */

function LessonOverview({
  title,
  description,
}: {
  title: string;
  description: string | null;
}) {
  return (
    <div className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-3 flex items-center gap-2">
        <BookOpen className="size-4 text-rose-500" strokeWidth={1.8} />
        Lesson Overview
      </h3>
      <p className="text-[13px] text-ink-500 leading-relaxed mb-4">
        {description ??
          "A focused step in your program path — clear, practical, and built to apply this week. Complete it to unlock the next lesson and keep your progress moving."}
      </p>
      <div className="rounded-[12px] bg-cream-100 border border-cream-300 p-4 flex items-start gap-3">
        <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Target className="size-4" strokeWidth={1.9} />
        </span>
        <div>
          <div className="text-[12.5px] font-semibold text-ink-900 mb-0.5">
            Apply it now
          </div>
          <p className="text-[12px] text-ink-600 leading-snug">
            Put <span className="font-semibold">{title}</span> into practice
            before moving on — programs work because you follow the path in
            order.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Module path card (in-content, for mobile + context) ─────────────── */

function ModulePathCard({
  programSlug,
  moduleNumber,
  moduleTitle,
  lessons,
  currentSlug,
}: {
  programSlug: string;
  moduleNumber: number;
  moduleTitle: string;
  lessons: { slug: string; title: string; duration: string; status: string }[];
  currentSlug: string;
}) {
  const totalMin = lessons.reduce((sum, l) => {
    const [m] = l.duration.split(":");
    const n = parseInt(m ?? "0", 10);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <div className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-1 flex items-center gap-2">
        <CalendarDays className="size-4 text-rose-500" strokeWidth={1.8} />
        Module {moduleNumber}
      </h3>
      <div className="text-[12px] text-ink-500 mb-3">{moduleTitle}</div>
      <ul className="space-y-1">
        {lessons.map((l) => {
          const isCurrent = l.slug === currentSlug;
          const isDone = l.status === "completed";
          const isLocked = l.status === "locked";
          const row = (
            <div
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 -mx-2 rounded-[10px] transition-colors",
                isCurrent
                  ? "bg-rose-50 border border-rose-200"
                  : isLocked
                    ? "opacity-70"
                    : "hover:bg-cream-100",
              )}
            >
              <span
                className={cn(
                  "size-5 rounded-full inline-flex items-center justify-center shrink-0",
                  isDone
                    ? "bg-rose-100 text-rose-600"
                    : isCurrent
                      ? "bg-rose-500 text-white"
                      : isLocked
                        ? "bg-cream-200 text-ink-400"
                        : "border border-ink-300",
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="size-3" strokeWidth={3} />
                ) : isLocked ? (
                  <Lock className="size-2.5" strokeWidth={2.5} />
                ) : isCurrent ? (
                  <Play className="size-2.5 ml-0.5" fill="currentColor" />
                ) : null}
              </span>
              <span
                className={cn(
                  "flex-1 text-[12.5px] truncate",
                  isCurrent
                    ? "font-semibold text-ink-900"
                    : isLocked
                      ? "text-ink-400"
                      : "text-ink-700",
                )}
              >
                {l.title}
              </span>
              <span className="text-[11px] text-ink-500 tabular-nums shrink-0">
                {l.duration}
              </span>
            </div>
          );
          return (
            <li key={l.slug}>
              {isLocked ? (
                row
              ) : (
                <Link href={`/programs/${programSlug}/${l.slug}`} className="block">
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
      <div className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-ink-500">
        <FileText className="size-3.5 text-ink-400" strokeWidth={2} />
        {lessons.length} lessons · ~{totalMin} min in this module
      </div>
    </div>
  );
}
