import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  BarChart3,
  CheckCircle2,
  Play,
  PlayCircle,
  Lock,
  ChevronLeft,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
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
import {
  LESSON_TABS,
  type LessonTabKey,
} from "@/components/tutorials/lesson-tab-defs";
import {
  WorkspaceShell,
  WorkspaceHeader,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";
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
    title: t ? `${t.title} · Profluencer` : "Tutorial · Profluencer",
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

  const active: LessonTabKey = LESSON_TABS.some((t) => t.key === tab)
    ? (tab as LessonTabKey)
    : "overview";
  // Resources / Notes get live count pills so the learner can tell at a
  // glance whether a section has anything in it before clicking.
  const tabBadge: Partial<Record<LessonTabKey, number>> = {
    resources: resources.length,
    notes: notes.length,
  };
  const lessonTabs: WorkspaceTab[] = LESSON_TABS.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    badge: tabBadge[t.key],
    href:
      t.key === "overview"
        ? `/tutorials/${slug}`
        : `/tutorials/${slug}?tab=${t.key}`,
  }));

  const upNext = authoredNext ?? lesson.next ?? null;
  const durationLabel = humanDuration(lesson.durationSeconds, lesson.duration);

  return (
    <PageShell>
      <WorkspaceShell
        title="Tutorial"
        icon={PlayCircle}
        tabs={lessonTabs}
        activeKey={active}
      >
        {/* Back + breadcrumb — leveled header band (lines up with rail title) */}
        <WorkspaceHeader
          left={
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/tutorials"
                className="group inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700 transition-all duration-150 hover:bg-cream-100 hover:border-ink-300 hover:text-ink-900 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 shrink-0"
              >
                <ChevronLeft
                  className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5"
                  strokeWidth={2}
                />
                Back
              </Link>
              <span aria-hidden className="w-px h-4 bg-ink-200 shrink-0" />
              <nav className="flex items-center gap-2 text-[13px] min-w-0">
                <Link
                  href="/tutorials"
                  className="text-rose-600 hover:text-rose-700 font-medium shrink-0"
                >
                  Tutorials
                </Link>
                <span className="text-ink-400 shrink-0">/</span>
                {lesson.programSlug && lesson.programTitle ? (
                  <>
                    <Link
                      href={`/programs/${lesson.programSlug}`}
                      className="text-rose-600 hover:text-rose-700 font-medium shrink-0 max-w-[160px] truncate"
                    >
                      {lesson.programTitle}
                    </Link>
                    <span className="text-ink-400 shrink-0">/</span>
                  </>
                ) : null}
                <span className="text-ink-700 truncate">{lesson.title}</span>
              </nav>
            </div>
          }
        />

        <div className="space-y-5 pt-5 lg:pt-6 pb-6">
          {/* Lesson header — context eyebrow, title, quiet meta line */}
          <header className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-rose-600 mb-1.5">
              {lesson.programTitle ?? "Tutorial Library"}
              {lesson.moduleNumber ? ` · Module ${lesson.moduleNumber}` : ""}
            </div>
            <h2 className="text-[clamp(1.4rem,2.2vw,1.75rem)] font-bold tracking-[-0.015em] text-ink-900 leading-[1.15]">
              {lesson.title}
            </h2>
            <div className="mt-2.5 flex items-center gap-x-4 gap-y-1.5 flex-wrap text-[12.5px] text-ink-500">
              <span className="inline-flex items-center gap-1.5">
                <Play className="size-3.5 text-rose-500" fill="currentColor" strokeWidth={0} aria-hidden />
                Video lesson
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BarChart3 className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
                {lesson.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
                {durationLabel}
              </span>
              {lesson.moduleNumber ? (
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <BookOpen className="size-3.5 text-ink-400" strokeWidth={2} aria-hidden />
                  {lesson.moduleLessons.length} lessons in module
                </span>
              ) : null}
              {lesson.completed && (
                <span className="chip chip-success anim-pop-in inline-flex items-center gap-1">
                  <CheckCircle2 className="size-3" strokeWidth={2.5} aria-hidden />
                  Completed
                </span>
              )}
            </div>
          </header>

          {/* Pro lock notice */}
          {proLocked && (
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
          )}

          {/* Video player — persistent across tabs */}
          {!proLocked && (
            <LessonVideoPlayer
              title={lesson.title}
              duration={lesson.duration}
              videoUrl={lesson.videoUrl}
              coverUrl={lesson.coverUrl}
            />
          )}

          {/* Continue bar — completion state, up-next context, primary CTA */}
          {!proLocked && (
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
            />
          )}

          {/* Active section (Overview / Lesson Path / Resources / Notes) */}
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
      </WorkspaceShell>
    </PageShell>
  );
}
