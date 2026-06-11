import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Play,
  Lock,
  BarChart3,
  Clock,
  Check,
  ChevronLeft,
  BookOpen,
  CheckSquare,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { createClient } from "@/lib/supabase/server";
import { getCurriculumForProgram, getLessonNotes } from "@/lib/programs/queries";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { LessonNotes } from "@/components/notes/lesson-notes";
import { RichTextBlock } from "./rich-text-block";
import {
  normalizeLearningPoints,
  type LearningPoint,
} from "@/lib/programs/learning-content";
import { LessonVideoPlayer } from "@/components/tutorials/video-player";
import { LessonPageTabs } from "@/components/programs/lesson-page-tabs";
import { CourseContentRail } from "@/components/programs/course-content-rail";
import { LessonActionRow } from "@/components/tutorials/action-row";
import { ProgramVideoTasks } from "./program-video-tasks";
import { AssignOnMount } from "@/components/tasks/assign-on-mount";
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
    title: lesson ? lesson.title : "Lesson",
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

  const [modules, detail, lessonNotes] = await Promise.all([
    getCurriculumForProgram(slug, ctx.plan),
    getTutorialDetail(lessonSlug),
    getLessonNotes(lessonSlug),
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


  /* ── Page header — back · lesson title + module chip + meta line, with
     the lesson actions anchored right (Udemy-style). Rendered inside the
     left column so the right panel's divider can run full height. ──────── */
  const pageHeader = (
        <header className="flex items-start justify-between gap-x-6 gap-y-4 flex-wrap">
          <div className="flex items-start gap-3.5 min-w-0">
            <Link
              href={`/programs/${slug}`}
              aria-label={`Back to ${programTitle}`}
              className="size-9 rounded-full border border-ink-200 bg-white inline-flex items-center justify-center text-ink-600 hover:bg-cream-100 hover:text-ink-900 transition-colors shrink-0"
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] sm:text-[22px] font-bold tracking-[-0.01em] text-ink-900 leading-tight">
                  {title}
                </h1>
                <span className="inline-flex items-center rounded-[8px] border border-ink-200 bg-white px-2 py-1 text-[11px] font-semibold text-ink-600 leading-none shrink-0">
                  Module {moduleNumber} · {moduleTitle}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-x-4 gap-y-1 flex-wrap text-[12.5px] text-ink-600">
                {lessonNumber && (
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Play
                      className="size-3.5 text-rose-500"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                    Lesson {lessonNumber} of {totalLessons}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="size-3.5 text-rose-500" strokeWidth={2} />
                  {duration}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BarChart3 className="size-3.5 text-rose-500" strokeWidth={2} />
                  {difficulty}
                </span>
              </div>
            </div>
          </div>

          {!proLocked && (
            <div className="w-full sm:w-auto">
              <LessonActionRow
                lessonSlug={lessonSlug}
                initialCompleted={completed}
                lessonTitle={title}
                programSlug={slug}
                prevSlug={prev?.slug ?? null}
                nextSlug={next?.slug ?? null}
                showNoteButton={false}
              />
            </div>
          )}
        </header>
  );

  return (
    <PageShell>
      {proLocked ? (
        <div className="max-w-[1360px] mx-auto space-y-4">
          {pageHeader}
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
        </div>
      ) : (
        /* The whole grid bleeds to the page edges (negative margins cancel
           PageShell's padding) and is at least a full viewport tall, so the
           vertical divider + white panel run topbar→bottom. Page insets are
           restored per-column below. */
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_404px] lg:-mx-[var(--space-page-x)] lg:-my-[var(--space-page-y)] lg:min-h-[calc(100dvh_-_var(--topbar-height))]">
          {/* LEFT — header, video, tabs. Page insets restored here; pr-8 is
              the gutter that gives breathing room before the divider. */}
          <div className="space-y-5 min-w-0 lg:pl-[var(--space-page-x)] lg:pr-8 lg:py-[var(--space-page-y)]">
            {pageHeader}
              <LessonVideoPlayer
                title={title}
                duration={duration}
                videoUrl={videoUrl}
                coverUrl={coverUrl}
              />

              {/* "on_start" task assignment fires on page mount regardless of
                  which tab is open. */}
              {lessonUuid && (
                <AssignOnMount
                  sourceType="program_video"
                  sourceId={lessonUuid}
                  trigger="on_start"
                />
              )}

              <LessonPageTabs
                /* Bleed the underline full-width: cancel the column's left
                   page inset and right gutter so the line runs edge → divider,
                   then re-pad the pills back to the content's left edge.
                   pt-* adds breathing room between the video and the tabs. */
                rootClassName="lg:pt-3"
                tablistClassName="lg:-ml-[var(--space-page-x)] lg:-mr-8 lg:pl-[var(--space-page-x)]"
                tabs={[
                  {
                    key: "overview",
                    label: "Overview",
                    icon: <BookOpen className="size-3.5" strokeWidth={2} />,
                    content: <AboutLessonCard />,
                  },
                  {
                    key: "notes",
                    label: "Notes",
                    icon: <NotebookPen className="size-3.5" strokeWidth={2} />,
                    content: (
                      <LessonNotes
                        notes={lessonNotes}
                        lessonSlug={lessonSlug}
                        lessonTitle={title}
                      />
                    ),
                  },
                  ...(learningPoints.length > 0
                    ? [
                        {
                          key: "learn",
                          label: "What you'll learn",
                          icon: <Sparkles className="size-3.5" strokeWidth={2} />,
                          content: (
                            <LearnChecklistCard learningPoints={learningPoints} />
                          ),
                        },
                      ]
                    : []),
                  ...(lessonUuid
                    ? [
                        {
                          key: "tasks",
                          label: "Tasks",
                          icon: <CheckSquare className="size-3.5" strokeWidth={2} />,
                          content: (
                            <ProgramVideoTasks
                              lessonId={lessonUuid}
                              userId={ctx.user.id}
                              lessonCompleted={completed}
                            />
                          ),
                        },
                      ]
                    : []),
                ]}
              />
            </div>

          {/* RIGHT — full-height white "Course content" panel. Stretches to
              the grid's full height (align stretch), so its 2px left border +
              white fill run topbar→bottom. */}
          <div className="mt-8 lg:mt-0 lg:border-l-2 lg:border-ink-100 lg:bg-white">
            <aside className="pt-3.5 pb-5 lg:sticky lg:top-[var(--topbar-height)] lg:max-h-[calc(100dvh_-_var(--topbar-height))] lg:overflow-y-auto lg:pt-3.5 lg:pb-[var(--space-page-y)]">
              <CourseContentRail
                modules={modules}
                programSlug={slug}
                currentSlug={lessonSlug}
              />
            </aside>
          </div>
        </div>
      )}
    </PageShell>
  );
}

/* ─── About card (Overview tab) ────────────────────────────────────────── */

function AboutLessonCard() {
  return (
    <section>
      <h2 className="text-[16px] font-bold text-ink-900">About this lesson</h2>
      {/* PREVIEW — dummy rich-text block so we can see how a normal
          rich-text lesson body renders here. Not wired to data yet. */}
      <div className="mt-3">
        <RichTextBlock />
      </div>
    </section>
  );
}

/* ─── What you'll learn card (its own tab) ─────────────────────────────── */

function LearnChecklistCard({
  learningPoints,
}: {
  learningPoints: LearningPoint[];
}) {
  // Flatten authored learning points (+ their action steps) into the simple
  // two-column checklist the card shows.
  const items = learningPoints.flatMap((lp) => [
    lp.title,
    ...(lp.actionStep ? [lp.actionStep.title] : []),
  ]);

  return (
    <section>
      <h2 className="text-[16px] font-bold text-ink-900">
        What you&apos;ll learn
      </h2>
      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
        {items.map((t) => (
          <li key={t} className="flex items-start gap-2.5">
            <Check
              className="size-4 text-success shrink-0 mt-0.5"
              strokeWidth={2.5}
            />
            <span className="text-[13px] text-ink-700 leading-snug">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

