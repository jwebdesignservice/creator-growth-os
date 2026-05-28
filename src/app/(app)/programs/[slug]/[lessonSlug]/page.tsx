import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Lock,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  BarChart3,
  Clock,
  CheckCircle2,
  Check,
  Sparkles,
  CalendarDays,
  FileText,
  Target,
  Layers,
  Anchor,
  Users,
  TrendingUp,
  Lightbulb,
  Rocket,
  Zap,
  Pencil,
  Video,
  Megaphone,
  Heart,
  DollarSign,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { getCurriculumForProgram } from "@/lib/programs/queries";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { getOutcomeForModule } from "@/lib/programs/outcomes";
import {
  normalizeLearningPoints,
  type LearningPoint,
  type LearningIconKey,
} from "@/lib/programs/learning-content";
import { LessonVideoPlayer } from "@/components/tutorials/video-player";
import { LessonActionRow } from "@/components/tutorials/action-row";
import { ProgramVideoTasks } from "./program-video-tasks";
import { AssignOnMount } from "@/components/tasks/assign-on-mount";
import { cn } from "@/lib/cn";
import {
  getOnboardingGate,
  isGateActive,
  readPreviewGate,
  ONBOARDING_PROGRAM_SLUG,
} from "@/lib/onboarding/gate";
import { OnboardingLockedNotice } from "@/components/onboarding/onboarding-locked-notice";

/**
 * In-program lesson player — `/programs/[slug]/[lessonSlug]`.
 *
 * Laid out like a YouTube watch page: the video + title + the platform's own
 * action row (Continue Watching / Mark Complete / Save Notes) live in the main
 * column on the left, and the program's module path sits in a YouTube-style
 * "up next" rail on the right (each lesson rendered as a thumbnail + title +
 * meta row). No likes, comments, ads, subscribe, or channel chrome — just the
 * lesson and the path through the program.
 *
 * The same lesson is still reachable standalone at /tutorials/[slug] — one
 * lesson, two entry points (sequenced here, à la carte there).
 *
 * Data: `getTutorialDetail` supplies the video + program-scoped prev/next;
 * `getCurriculumForProgram` supplies the full path for the rail. Both fall
 * back gracefully when lessons aren't seeded, so the page always renders.
 */

type Params = Promise<{ slug: string; lessonSlug: string }>;
type SearchParams = Promise<{ previewGate?: string }>;

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
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { slug, lessonSlug } = await params;

  // Onboarding gate — lessons in any program except Start Here are locked
  // until onboarding is complete. Enforced here so direct URLs respect it.
  const { previewGate } = await searchParams;
  const gate = await getOnboardingGate();
  if (
    slug !== ONBOARDING_PROGRAM_SLUG &&
    isGateActive(gate, readPreviewGate(previewGate))
  ) {
    return (
      <PageShell>
        <div className="max-w-[1360px] mx-auto space-y-4">
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
            kind="lesson"
          />
        </div>
      </PageShell>
    );
  }

  const supabase = await createClient();
  const [{ data: dbProgram }, lessonRes] = await Promise.all([
    supabase.from("programs").select("title, id").eq("slug", slug).maybeSingle(),
    supabase
      .from("lessons")
      .select("id, program_id, learning_points, action_steps")
      .eq("slug", lessonSlug)
      .maybeSingle(),
  ]);

  // `learning_points` + `action_steps` arrive with migration 0036. If it
  // hasn't been applied the select 42703s — fall back to the core columns
  // so the page still renders (authored content just stays empty).
  let dbLesson = lessonRes.data as
    | {
        id: string;
        program_id: string | null;
        learning_points?: unknown;
        action_steps?: unknown;
      }
    | null;
  if (!dbLesson && lessonRes.error?.code === "42703") {
    const fb = await supabase
      .from("lessons")
      .select("id, program_id")
      .eq("slug", lessonSlug)
      .maybeSingle();
    dbLesson = fb.data as typeof dbLesson;
  }

  const programTitle = dbProgram?.title ?? prettySlug(slug);
  const lessonUuid = dbLesson?.id ?? null;

  // Admin-authored per-lesson content. Renders on THIS lesson page only —
  // distinct from the program overview page's program-level outcomes. Each
  // learning point is a structured card (icon + title + description) that
  // may carry one nested action step.
  const learningPoints = normalizeLearningPoints(dbLesson?.learning_points);

  const [modules, detail] = await Promise.all([
    getCurriculumForProgram(slug, ctx.plan),
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
  const coverUrl = detail?.coverUrl ?? null;
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

  // Lessons in the current module (for the up-next rail).
  const moduleLessons = flat.filter((l) => l.moduleNumber === moduleNumber);

  return (
    <PageShell>
      <div className="max-w-[1360px] mx-auto space-y-4">
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

        {proLocked ? (
          <>
            <header>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-rose-600 mb-1.5">
                Module {moduleNumber} · {moduleTitle}
              </div>
              <h1 className="text-h1 text-ink-900 leading-tight">
                {title}
              </h1>
            </header>
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
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
            {/* LEFT — video, meta, actions, description (the watch column) */}
            <div className="space-y-4 min-w-0">
              <LessonVideoPlayer
                title={title}
                duration={duration}
                videoUrl={videoUrl}
                coverUrl={coverUrl}
              />

              {/* Title + meta — sits below the player, YouTube-style */}
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-rose-600 mb-1.5">
                  Module {moduleNumber} · {moduleTitle}
                </div>
                <h1 className="text-h3 sm:text-[28px] text-ink-900 leading-tight">
                  {title}
                </h1>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
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
              </div>

              {/* Platform actions — Continue Watching / Mark Complete / Save Notes */}
              <LessonActionRow
                lessonSlug={lessonSlug}
                initialCompleted={completed}
              />

              {/* Prev / Next — within this program */}
              <PrevNextNav programSlug={slug} prev={prev} next={next} />

              {/* Description + authored learning points / action steps */}
              <LessonOverview
                title={title}
                description={description}
                moduleNumber={moduleNumber}
                learningPoints={learningPoints}
              />

              {/* Program video task(s) for this lesson — unified task system.
                  AssignOnMount fires the central engine for "on_start"
                  templates when the learner actually opens the lesson. */}
              {lessonUuid && (
                <>
                  <AssignOnMount
                    sourceType="program_video"
                    sourceId={lessonUuid}
                    trigger="on_start"
                  />
                  <ProgramVideoTasks
                    lessonId={lessonUuid}
                    userId={ctx.user.id}
                    lessonCompleted={completed}
                  />
                </>
              )}
            </div>

            {/* RIGHT — Program path, YouTube "up next" style */}
            <ProgramPathRail
              programSlug={slug}
              moduleNumber={moduleNumber}
              moduleTitle={moduleTitle}
              lessons={moduleLessons}
              currentSlug={lessonSlug}
            />
          </div>
        )}
      </div>
    </PageShell>
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

/* ─── Lesson overview (description box) ───────────────────────────────── */

/* Icon key → component map for the learner-facing learning-point cards.
   Keys are shared (learning-content.ts); falls back to the target icon. */
const LEARNING_ICONS: Record<LearningIconKey, LucideIcon> = {
  target:        Target,
  layers:        Layers,
  anchor:        Anchor,
  users:         Users,
  "trending-up": TrendingUp,
  lightbulb:     Lightbulb,
  rocket:        Rocket,
  "book-open":   BookOpen,
  sparkles:      Sparkles,
  zap:           Zap,
  pencil:        Pencil,
  video:         Video,
  megaphone:     Megaphone,
  heart:         Heart,
  "dollar-sign": DollarSign,
};

function LessonOverview({
  title,
  description,
  moduleNumber,
  learningPoints,
}: {
  title: string;
  description: string | null;
  moduleNumber: number;
  learningPoints: LearningPoint[];
}) {
  // Pull the outcome this lesson's module teaches — same source as the
  // program-level "What You'll Learn". Used as the graceful fallback when
  // the lesson has no authored learning points yet.
  const outcome = getOutcomeForModule(moduleNumber);
  const OutcomeIcon = outcome.icon;

  const hasLearning = learningPoints.length > 0;
  const hasAnyStep = learningPoints.some((lp) => lp.actionStep);

  return (
    <section className="card p-5 sm:p-6">
      {/* Header — book icon + title/subtitle + Action step pill */}
      <div className="flex items-start gap-3 mb-5">
        <span className="size-11 rounded-[13px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <BookOpen className="size-[20px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-h3 sm:text-[24px] text-ink-900 leading-tight mb-1">
            Lesson Overview
          </h2>
          <p className="text-[12.5px] sm:text-[13px] text-ink-500 leading-snug max-w-2xl">
            {description ??
              "A focused step in your program path — clear, practical, and built to apply this week. Complete it to unlock the next lesson and keep your progress moving."}
          </p>
        </div>
        {(hasAnyStep || !hasLearning) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-[12px] font-semibold shrink-0 whitespace-nowrap">
            <Sparkles className="size-3.5" strokeWidth={2} fill="currentColor" />
            Action step
          </span>
        )}
      </div>

      {hasLearning ? (
        <>
          <h3 className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-900 mb-2.5">
            <Sparkles className="size-3.5 text-rose-500" strokeWidth={2} fill="currentColor" />
            What you&apos;ll learn in this lesson
          </h3>
          <ul className="space-y-2.5">
            {learningPoints.map((lp) => {
              const Icon = LEARNING_ICONS[lp.icon] ?? Target;
              return (
                <li
                  key={lp.id}
                  className="rounded-[14px] border border-ink-100 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="size-10 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                      <Icon className="size-5" strokeWidth={1.9} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-ink-900 leading-snug">
                        {lp.title}
                      </div>
                      {lp.description && (
                        <p className="text-[13px] text-ink-500 leading-snug mt-0.5">
                          {lp.description}
                        </p>
                      )}
                    </div>
                    <CheckCircle2
                      className="size-[18px] text-rose-300 shrink-0 mt-1"
                      strokeWidth={2}
                    />
                  </div>

                  {/* Nested action step — sits under its learning point */}
                  {lp.actionStep && (
                    <div className="mt-3 sm:ml-[52px] rounded-[12px] bg-rose-50 border border-rose-100 p-3">
                      <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] font-bold text-rose-600 mb-1">
                        <Sparkles className="size-3" strokeWidth={2} fill="currentColor" />
                        Action step
                      </div>
                      <div className="text-[13.5px] font-semibold text-ink-900 leading-snug">
                        {lp.actionStep.title}
                      </div>
                      {lp.actionStep.description && (
                        <p className="text-[12.5px] text-ink-700 leading-snug mt-0.5">
                          {lp.actionStep.description}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        /* Fallback — outcome-driven apply-it-now for lessons that haven't
           been given their own learning points yet. */
        <div className="rounded-[14px] bg-rose-50 border border-rose-100 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="size-11 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <OutcomeIcon className="size-[20px]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-bold text-ink-900 mb-1">
                Apply it now
              </div>
              <p className="text-[13px] text-ink-700 leading-relaxed">
                Put <span className="font-semibold text-ink-900">{title}</span>{" "}
                into practice before moving on — this lesson builds toward{" "}
                <span className="font-semibold text-rose-700">
                  {outcome.title}
                </span>
                .
              </p>
            </div>
          </div>

          <div aria-hidden className="h-px bg-rose-200/60 my-3.5" />

          <div className="flex items-start gap-2.5">
            <span className="size-5 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0 mt-0.5">
              <Check className="size-3" strokeWidth={3} />
            </span>
            <p className="text-[12.5px] text-ink-700 leading-snug">
              {outcome.nextStep.lead}
              <span className="font-semibold text-rose-700">
                {outcome.nextStep.bold}
              </span>
              {outcome.nextStep.trail}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

/* ─── Program path rail (YouTube "up next" style) ─────────────────────── */

function ProgramPathRail({
  programSlug,
  moduleNumber,
  moduleTitle,
  lessons,
  currentSlug,
}: {
  programSlug: string;
  moduleNumber: number;
  moduleTitle: string;
  lessons: {
    slug: string;
    title: string;
    duration: string;
    status: string;
    coverUrl?: string | null;
  }[];
  currentSlug: string;
}) {
  const totalMin = lessons.reduce((sum, l) => {
    const [m] = l.duration.split(":");
    const n = parseInt(m ?? "0", 10);
    return sum + (Number.isFinite(n) ? n : 0);
  }, 0);

  return (
    <aside className="lg:sticky lg:top-4 self-start">
      <div className="mb-3">
        <h2 className="text-[15px] font-semibold text-ink-900 flex items-center gap-2">
          <CalendarDays className="size-4 text-rose-500" strokeWidth={1.8} />
          Program Path · Module {moduleNumber}
        </h2>
        <p className="text-[12px] text-ink-500 mt-0.5">{moduleTitle}</p>
      </div>

      <ul className="space-y-1.5">
        {lessons.map((l, i) => {
          const isCurrent = l.slug === currentSlug;
          const isDone = l.status === "completed";
          const isLocked = l.status === "locked";

          const item = (
            <div
              className={cn(
                "group flex gap-2.5 p-1.5 rounded-[12px] transition-colors",
                isCurrent
                  ? "bg-rose-50 ring-1 ring-rose-200"
                  : isLocked
                    ? "opacity-75"
                    : "hover:bg-cream-100",
              )}
            >
              {/* Thumbnail */}
              <div className="relative w-[150px] shrink-0 aspect-video rounded-[10px] overflow-hidden bg-gradient-to-br from-cream-200 via-cream-100 to-rose-100/50">
                {l.coverUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.coverUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center size-8 rounded-full shadow-soft transition-transform group-hover:scale-105",
                      isDone
                        ? "bg-white/85 text-rose-600"
                        : isCurrent
                          ? "bg-rose-600 text-white"
                          : isLocked
                            ? "bg-white/80 text-ink-400"
                            : "bg-white/85 text-rose-600",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-4" strokeWidth={2.5} />
                    ) : isLocked ? (
                      <Lock className="size-3.5" strokeWidth={2.2} />
                    ) : (
                      <Play className="size-3.5 ml-0.5" fill="currentColor" />
                    )}
                  </span>
                </div>
                {/* Duration badge — YouTube-style */}
                <span className="absolute bottom-1 right-1 rounded-md bg-ink-900/85 px-1 py-0.5 text-[10px] font-semibold text-white tabular-nums leading-none">
                  {l.duration}
                </span>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1 py-0.5">
                <div
                  className={cn(
                    "text-[12.5px] leading-snug line-clamp-2",
                    isCurrent
                      ? "font-semibold text-rose-700"
                      : "font-medium text-ink-900",
                  )}
                >
                  {l.title}
                </div>
                <div className="mt-1 text-[11px] text-ink-500 inline-flex items-center gap-1.5">
                  <span>Lesson {i + 1}</span>
                  <span aria-hidden>·</span>
                  <span>
                    {isDone
                      ? "Completed"
                      : isCurrent
                        ? "Now playing"
                        : isLocked
                          ? "Locked"
                          : "Not started"}
                  </span>
                </div>
              </div>
            </div>
          );

          return (
            <li key={l.slug}>
              {isLocked ? (
                item
              ) : (
                <Link
                  href={`/programs/${programSlug}/${l.slug}`}
                  className="block"
                >
                  {item}
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
    </aside>
  );
}
