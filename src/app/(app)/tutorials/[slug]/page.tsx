import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  BarChart3,
  Play,
  PlayCircle,
  Lock,
  ChevronLeft,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { getLessonNotes } from "@/lib/programs/queries";
import { getLessonChapters } from "@/app/admin/tutorials/[id]/lesson-chapters-actions";
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

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const t = await getTutorialDetail(slug);
  return {
    title: t ? `${t.title} · Creator Growth OS` : "Tutorial · Creator Growth OS",
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

  const proLocked = lesson.planAccess === "pro" && ctx.plan !== "pro";

  const active: LessonTabKey = LESSON_TABS.some((t) => t.key === tab)
    ? (tab as LessonTabKey)
    : "overview";
  const lessonTabs: WorkspaceTab[] = LESSON_TABS.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon,
    href:
      t.key === "overview"
        ? `/tutorials/${slug}`
        : `/tutorials/${slug}?tab=${t.key}`,
  }));

  return (
    <PageShell>
      <WorkspaceShell
        title={lesson.title}
        icon={PlayCircle}
        tabs={lessonTabs}
        activeKey={active}
      >
        <div className="space-y-5 lg:pt-[var(--space-page-y)]">
          {/* Back button + breadcrumb / page path — one inline row */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 hover:text-ink-900 transition-colors shrink-0"
            >
              <ChevronLeft className="size-3.5" strokeWidth={2} />
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

          {/* Meta chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip chip-rose">
              {lesson.categoryLabel.split(" ")[0]}
            </span>
            <span className="chip bg-cream-100 text-ink-700 inline-flex items-center gap-1">
              <Play className="size-3" fill="currentColor" />
              Video Lesson
            </span>
            <span className="chip bg-cream-100 text-ink-700 inline-flex items-center gap-1">
              <BarChart3 className="size-3" strokeWidth={2} />
              {lesson.difficulty}
            </span>
            <span className="chip bg-cream-100 text-ink-700 inline-flex items-center gap-1">
              <Clock className="size-3" strokeWidth={2} />
              {lesson.duration}
            </span>
            {lesson.moduleNumber && (
              <span className="chip bg-cream-100 text-ink-700 inline-flex items-center gap-1">
                <BookOpen className="size-3" strokeWidth={2} />
                {lesson.moduleLessons.length} Lessons
              </span>
            )}
          </div>

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
                  Upgrade to unlock this lesson and the rest of the bonus track.
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

          {/* Video player — persistent across tabs */}
          {!proLocked && (
            <LessonVideoPlayer
              title={lesson.title}
              duration={lesson.duration}
              videoUrl={lesson.videoUrl}
              coverUrl={lesson.coverUrl}
            />
          )}

          {/* Action row */}
          {!proLocked && (
            <LessonActionRow
              lessonSlug={lesson.slug}
              initialCompleted={lesson.completed}
              lessonTitle={lesson.title}
            />
          )}

          {/* Active section (Overview / Lesson Path / Resources / Notes) */}
          <LessonContent
            active={active}
            description={lesson.description}
            chapters={chapters}
            resources={resources}
            notes={notes}
            lessonSlug={lesson.slug}
            lessonTitle={lesson.title}
          />
        </div>
      </WorkspaceShell>
    </PageShell>
  );
}
