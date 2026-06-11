import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Play,
  Lock,
  ChevronLeft,
  CalendarDays,
  Files,
  NotebookPen,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/server";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { getLessonNotes } from "@/lib/programs/queries";
import {
  getLessonChapters,
  getLinkedVideoNavTargets,
} from "@/app/admin/tutorials/[id]/lesson-chapters-actions";
import { getLessonResources } from "@/app/admin/tutorials/[id]/resources-actions";
import { LessonVideoPlayer } from "@/components/tutorials/video-player";
import { LessonActionRow } from "@/components/tutorials/action-row";
import { LessonContent } from "@/components/tutorials/lesson-tabs";
import { type LessonTabKey } from "@/components/tutorials/lesson-tab-defs";
import {
  getOnboardingGate,
  isGateActive,
  readPreviewGate,
} from "@/lib/onboarding/gate";
import { OnboardingLockedNotice } from "@/components/onboarding/onboarding-locked-notice";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ previewGate?: string; tab?: string }>;

/** "00:05" / 245s → a human label like "5 sec" or "4 min". */
function humanDuration(seconds: number, fallback: string): string {
  if (!seconds || seconds <= 0) return fallback;
  if (seconds < 60) return `${seconds} sec`;
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const t = await getTutorialDetail(slug);
  return {
    title: t ? `${t.title}` : "Tutorial",
  };
}

export default async function TutorialDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { slug } = await params;
  const { previewGate, tab } = await searchParams;

  // Onboarding gate — tutorials are locked until the user finishes the Start
  // Here onboarding. Enforced here so direct URLs respect the lock.
  const gate = await getOnboardingGate();
  if (isGateActive(gate, readPreviewGate(previewGate))) {
    return (
      <PageShell>
        <div className="space-y-6">
          <nav className="text-[13px]">
            <Link
              href="/tutorials"
              className="text-rose-600 hover:text-rose-700 font-medium"
            >
              Tutorials
            </Link>
            <span className="text-ink-400 mx-2">/</span>
            <span className="text-ink-700">Locked</span>
          </nav>
          <OnboardingLockedNotice
            percent={gate.percent}
            programSlug={gate.programSlug}
            kind="tutorial"
          />
        </div>
      </PageShell>
    );
  }

  const lesson = await getTutorialDetail(slug);
  if (!lesson) notFound();

  // Lesson Path + Resources tabs render the admin-authored chapters and the
  // real uploaded files/links attached to this tutorial.
  const [chapters, { resources }, notes] = await Promise.all([
    getLessonChapters(lesson.id),
    getLessonResources(lesson.id),
    getLessonNotes(lesson.slug),
  ]);

  // Resolve linked video steps to navigable tutorials (published only) so
  // the Lesson Path tab can send the learner straight to the next video.
  const navTargets = await getLinkedVideoNavTargets(
    chapters.map((c) => c.linkedLessonId),
  );
  const targetById = new Map(navTargets.map((t) => [t.id, t]));

  // Which of the linked videos has this learner already finished? Lets the
  // path mark watched steps and point "Up next" at the first unseen one.
  const completedLinked = new Set<string>();
  if (navTargets.length > 0) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: prog } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .in(
          "lesson_id",
          navTargets.map((t) => t.id),
        );
      for (const p of prog ?? []) {
        if (p.completed) completedLinked.add(p.lesson_id as string);
      }
    }
  }

  const pathSteps = chapters.map((c) => ({
    ...c,
    linked: c.linkedLessonId ? (targetById.get(c.linkedLessonId) ?? null) : null,
    linkedCompleted: c.linkedLessonId
      ? completedLinked.has(c.linkedLessonId)
      : false,
  }));
  // The authored path beats library order: the first linked video step is
  // what "Complete & continue" should lead to.
  const authoredNext =
    pathSteps.find((c) => c.type === "video" && c.linked)?.linked ?? null;

  const proLocked = lesson.planAccess === "pro" && ctx.plan !== "pro";

  // Tab set mirrors the program page's pill bar: Overview + Notes always;
  // Lesson Path / Resources only when the lesson actually has them. Order
  // puts Notes second (matching the program page).
  const lessonTabs = [
    { key: "overview" as const, label: "Overview", icon: BookOpen },
    { key: "notes" as const, label: "Notes", icon: NotebookPen },
    ...(pathSteps.length > 0
      ? [{ key: "path" as const, label: "Lesson Path", icon: CalendarDays }]
      : []),
    ...(resources.length > 0
      ? [{ key: "resources" as const, label: "Resources", icon: Files }]
      : []),
  ].map((t) => ({
    ...t,
    href:
      t.key === "overview"
        ? `/tutorials/${slug}`
        : `/tutorials/${slug}?tab=${t.key}`,
  }));
  const active: LessonTabKey = lessonTabs.some((t) => t.key === tab)
    ? (tab as LessonTabKey)
    : "overview";

  const upNext = authoredNext ?? lesson.next ?? null;
  const durationLabel = humanDuration(lesson.durationSeconds, lesson.duration);

  /* ── Header — back · title + source chip + meta line, lesson actions
     anchored right (same anatomy as the program lesson page). Rendered in
     the left column so the right panel's divider can run full height. ──── */
  const pageHeader = (
        <header className="flex items-start justify-between gap-x-6 gap-y-4 flex-wrap">
          <div className="flex items-start gap-3.5 min-w-0">
            <Link
              href="/tutorials"
              aria-label="Back to Tutorials"
              className="size-9 rounded-full border border-ink-200 bg-white inline-flex items-center justify-center text-ink-600 hover:bg-cream-100 hover:text-ink-900 transition-colors shrink-0"
            >
              <ChevronLeft className="size-4" strokeWidth={2} />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] sm:text-[22px] font-bold tracking-[-0.01em] text-ink-900 leading-tight">
                  {lesson.title}
                </h1>
                <span className="inline-flex items-center rounded-[8px] border border-ink-200 bg-white px-2 py-1 text-[11px] font-semibold text-ink-600 leading-none shrink-0">
                  {lesson.programTitle
                    ? lesson.moduleNumber
                      ? `${lesson.programTitle} · Module ${lesson.moduleNumber}`
                      : lesson.programTitle
                    : "Tutorial Library"}
                </span>
                {lesson.completed && (
                  <span className="chip chip-success inline-flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="size-3" strokeWidth={2.5} aria-hidden />
                    Completed
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-x-4 gap-y-1 flex-wrap text-[12.5px] text-ink-600">
                <span className="inline-flex items-center gap-1.5">
                  <Play className="size-3.5 text-rose-500" fill="currentColor" strokeWidth={0} aria-hidden />
                  Video lesson
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BarChart3 className="size-3.5 text-rose-500" strokeWidth={2} aria-hidden />
                  {lesson.difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Clock className="size-3.5 text-rose-500" strokeWidth={2} aria-hidden />
                  {durationLabel}
                </span>
                {lesson.moduleNumber ? (
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <BookOpen className="size-3.5 text-rose-500" strokeWidth={2} aria-hidden />
                    {lesson.moduleLessons.length} lessons in module
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {!proLocked && (
            <div className="w-full sm:w-auto">
              <LessonActionRow
                lessonSlug={lesson.slug}
                initialCompleted={lesson.completed}
                lessonTitle={lesson.title}
                // Complete & continue follows the admin-authored lesson path
                // first (the first linked video step); when the path doesn't
                // link a next video it falls back to Tutorial Library order.
                basePath="/tutorials"
                nextSlug={upNext?.slug ?? null}
                nextTitle={upNext?.title ?? null}
                prevSlug={lesson.prev?.slug ?? null}
                showNoteButton={false}
              />
            </div>
          )}
        </header>
  );

  return (
    <PageShell>
      {proLocked ? (
        <div className="max-w-[1100px] mx-auto space-y-5">
          {pageHeader}
          {/* Pro lock notice */}
          <div className="rounded-[16px] bg-rose-50 border border-rose-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Lock className="size-5" strokeWidth={2} />
            </span>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-ink-900">
                This lesson is Pro only
              </div>
              <p className="text-[12.5px] text-ink-700">
                Upgrade to unlock this lesson and the rest of the bonus track.
              </p>
            </div>
            <Link
              href="/billing?upgrade=pro"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors shrink-0"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      ) : (
        /* Two columns, same structure as the program lesson page: the grid
           bleeds to the page edges and is at least a viewport tall, so the
           right panel's 2px divider + white fill run topbar→bottom. */
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] lg:-mx-[var(--space-page-x)] lg:-my-[var(--space-page-y)] lg:min-h-[calc(100dvh_-_var(--topbar-height))]">
          {/* LEFT — header + video */}
          <div className="space-y-5 min-w-0 lg:pl-[var(--space-page-x)] lg:pr-8 lg:py-[var(--space-page-y)]">
            {pageHeader}
            <LessonVideoPlayer
              title={lesson.title}
              duration={lesson.duration}
              videoUrl={lesson.videoUrl}
              coverUrl={lesson.coverUrl}
            />
          </div>

          {/* RIGHT — full-height white panel: pill tabs + active section.
              Tabs stay URL-driven so the in-Overview shortcut links work. */}
          <div className="mt-8 lg:mt-0 lg:border-l-2 lg:border-ink-100 lg:bg-white">
            <aside className="lg:sticky lg:top-[var(--topbar-height)] lg:max-h-[calc(100dvh_-_var(--topbar-height))] lg:overflow-y-auto px-5 lg:pl-6 lg:pr-[var(--space-page-x)] pt-4 pb-6 lg:pb-[var(--space-page-y)]">
              <div
                role="tablist"
                className="flex items-center gap-1.5 flex-wrap border-b-2 border-ink-100 pb-3"
              >
                {lessonTabs.map((t) => {
                  const Icon = t.icon;
                  const isActive = active === t.key;
                  return (
                    <Link
                      key={t.key}
                      href={t.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-rose-100 text-rose-700"
                          : "text-ink-600 hover:bg-cream-100 hover:text-ink-900",
                      )}
                    >
                      <Icon className="size-3.5" strokeWidth={2} aria-hidden />
                      {t.label}
                    </Link>
                  );
                })}
              </div>

              <div className="pt-4">
                <LessonContent
                  active={active}
                  description={lesson.description}
                  chapters={pathSteps}
                  resources={resources}
                  notes={notes}
                  lessonSlug={lesson.slug}
                  lessonTitle={lesson.title}
                  durationLabel={durationLabel}
                  difficulty={lesson.difficulty}
                  upNext={upNext ? { slug: upNext.slug, title: upNext.title } : null}
                />
              </div>
            </aside>
          </div>
        </div>
      )}
    </PageShell>
  );
}
