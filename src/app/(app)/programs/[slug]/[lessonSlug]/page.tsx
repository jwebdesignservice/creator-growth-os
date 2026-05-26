import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Lock,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  BookOpen,
  BarChart3,
  Clock,
  CheckCircle2,
  Check,
  Sparkles,
  CalendarDays,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { getCurriculumForProgram } from "@/lib/programs/queries";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { getOutcomeForModule } from "@/lib/programs/outcomes";
import {
  getLessonTaskStates,
  type LessonTaskState,
} from "@/lib/programs/lesson-task-queries";
import { LessonVideoPlayer } from "@/components/tutorials/video-player";
import { LessonActionRow } from "@/components/tutorials/action-row";
import { cn } from "@/lib/cn";

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
  const [{ data: dbProgram }, { data: dbLesson }] = await Promise.all([
    supabase.from("programs").select("title, id").eq("slug", slug).maybeSingle(),
    supabase
      .from("lessons")
      .select("id, program_id")
      .eq("slug", lessonSlug)
      .maybeSingle(),
  ]);
  const programTitle = dbProgram?.title ?? prettySlug(slug);
  const lessonUuid = dbLesson?.id ?? null;
  const programUuid = dbLesson?.program_id ?? dbProgram?.id ?? null;

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
              <h1 className="font-display text-[30px] sm:text-[36px] text-ink-900 leading-tight">
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
              />

              {/* Title + meta — sits below the player, YouTube-style */}
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-rose-600 mb-1.5">
                  Module {moduleNumber} · {moduleTitle}
                </div>
                <h1 className="font-display text-[24px] sm:text-[28px] text-ink-900 leading-tight">
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

              {/* Description */}
              <LessonOverview
                title={title}
                description={description}
                moduleNumber={moduleNumber}
              />

              {/* Lesson-specific tasks (DB-backed) */}
              {lessonUuid && programUuid && (
                <LessonTasksSection
                  lessonId={lessonUuid}
                  programSlug={slug}
                  userId={ctx.user.id}
                  lessonCompleted={completed}
                />
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

function LessonOverview({
  title,
  description,
  moduleNumber,
}: {
  title: string;
  description: string | null;
  moduleNumber: number;
}) {
  // Pull the outcome this lesson's module teaches — same source as the
  // program-level "What You'll Learn", so the two stay in sync.
  const outcome = getOutcomeForModule(moduleNumber);
  const OutcomeIcon = outcome.icon;

  return (
    <section className="card p-5 sm:p-6">
      {/* Header — book icon + title/subtitle + Action step pill */}
      <div className="flex items-start gap-3 mb-5">
        <span className="size-11 rounded-[13px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <BookOpen className="size-[20px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-[22px] sm:text-[24px] text-ink-900 leading-tight mb-1">
            Lesson Overview
          </h2>
          <p className="text-[12.5px] sm:text-[13px] text-ink-500 leading-snug max-w-2xl">
            {description ??
              "A focused step in your program path — clear, practical, and built to apply this week. Complete it to unlock the next lesson and keep your progress moving."}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-[12px] font-semibold shrink-0 whitespace-nowrap">
          <Sparkles
            className="size-3.5"
            strokeWidth={2}
            fill="currentColor"
          />
          Action step
        </span>
      </div>

      {/* Apply-it-now block — outcome icon + lesson title + best next step */}
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

        {/* Divider */}
        <div aria-hidden className="h-px bg-rose-200/60 my-3.5" />

        {/* Best next step — outcome-specific action */}
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
    </section>
  );
}

/* ─── Lesson-specific tasks (DB-backed) ───────────────────────────────── */

/**
 * Async server component — fetches the lesson's task templates plus per-user
 * generated state and renders one card per template. Renders nothing when
 * the lesson has no templates configured.
 */
async function LessonTasksSection({
  lessonId,
  programSlug,
  userId,
  lessonCompleted,
}: {
  lessonId: string;
  programSlug: string;
  userId: string;
  lessonCompleted: boolean;
}) {
  const tasks = await getLessonTaskStates(lessonId, userId);
  if (tasks.length === 0) return null;

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <ClipboardCheck className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">
            {tasks.length === 1 ? "Your Lesson Task" : "Your Lesson Tasks"}
          </h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            {lessonCompleted
              ? tasks.every((t) => t.generated)
                ? "Added to your missions — complete them anytime"
                : "Complete this video again to add to your missions"
              : "Complete this video to add these to your missions"}
          </p>
        </div>
        <LessonTasksHeaderPill
          lessonCompleted={lessonCompleted}
          allGenerated={tasks.every((t) => t.generated)}
        />
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <LessonTaskCard
            key={task.id}
            task={task}
            lessonCompleted={lessonCompleted}
            programSlug={programSlug}
          />
        ))}
      </div>
    </section>
  );
}

function LessonTasksHeaderPill({
  lessonCompleted,
  allGenerated,
}: {
  lessonCompleted: boolean;
  allGenerated: boolean;
}) {
  if (lessonCompleted && allGenerated) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-bg text-success text-[12px] font-semibold shrink-0 whitespace-nowrap">
        <Check className="size-3.5" strokeWidth={3} />
        Added to your Tasks
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-700 text-[12px] font-semibold shrink-0 whitespace-nowrap">
      <Sparkles className="size-3.5" strokeWidth={2} fill="currentColor" />
      {lessonCompleted ? "Linked to this lesson" : "Unlocks on completion"}
    </span>
  );
}

function LessonTaskCard({
  task,
  lessonCompleted,
  programSlug,
}: {
  task: LessonTaskState;
  lessonCompleted: boolean;
  programSlug: string;
}) {
  const isActive = task.generated; // mission exists in user's task list
  const isLocked = !lessonCompleted && !task.generated;

  return (
    <div
      className={`rounded-[14px] border p-4 sm:p-5 ${
        isActive
          ? "bg-success-bg/40 border-success/30"
          : "bg-rose-50 border-rose-100"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Status marker */}
        {isActive ? (
          <span
            aria-hidden
            className="size-7 rounded-full bg-success text-white inline-flex items-center justify-center shrink-0 mt-0.5"
          >
            <Check className="size-4" strokeWidth={3} />
          </span>
        ) : isLocked ? (
          <span
            aria-hidden
            className="size-7 rounded-full border-2 border-rose-300 bg-white inline-flex items-center justify-center shrink-0 mt-0.5 text-rose-400"
          >
            <Lock className="size-3.5" strokeWidth={2.2} />
          </span>
        ) : (
          <span
            aria-hidden
            className="size-7 rounded-full border-2 border-rose-300 bg-white shrink-0 mt-0.5"
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold text-ink-900 leading-snug mb-1">
            {task.title}
          </div>
          {task.description && (
            <p className="text-[13px] text-ink-700 leading-relaxed">
              {task.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-rose-200 px-2.5 py-1 text-[11.5px] font-semibold text-rose-700">
              <Sparkles
                className="size-3"
                fill="currentColor"
                strokeWidth={0}
              />
              +{task.points} pts
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white border border-rose-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-700">
              <Clock className="size-3" strokeWidth={2} />~
              {task.estimated_minutes} min
            </span>
            <span className="inline-flex items-center rounded-full bg-white border border-rose-200 px-2.5 py-1 text-[11.5px] font-medium text-ink-700 capitalize">
              {task.task_type}
            </span>
            {task.priority === "high" && (
              <span className="inline-flex items-center rounded-full bg-rose-100 text-rose-700 px-2.5 py-1 text-[11.5px] font-semibold">
                High priority
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className={`h-px my-4 ${isActive ? "bg-success/20" : "bg-rose-200/60"}`}
      />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        {isActive ? (
          <>
            <p className="text-[12px] text-ink-500 leading-snug">
              Already in your Tasks — mark it complete when you&apos;ve taken
              action.
            </p>
            <Link
              href="/missions"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-success text-white text-[13.5px] font-semibold transition-colors shrink-0 hover:opacity-90"
            >
              Open in My Tasks
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </Link>
          </>
        ) : isLocked ? (
          <>
            <p className="text-[12px] text-ink-500 leading-snug">
              Mark this video complete to add the task to your missions.
            </p>
            <span className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-100 text-rose-700 text-[13.5px] font-semibold shrink-0">
              <Lock className="size-3.5" strokeWidth={2.5} />
              Locked
            </span>
          </>
        ) : (
          <>
            <p className="text-[12px] text-ink-500 leading-snug">
              Re-complete the video to add this task to your missions.
            </p>
            <Link
              href={`/programs/${programSlug}`}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors shrink-0"
            >
              Back to program
              <ArrowRight className="size-4" strokeWidth={2.5} />
            </Link>
          </>
        )}
      </div>
    </div>
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
  lessons: { slug: string; title: string; duration: string; status: string }[];
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
