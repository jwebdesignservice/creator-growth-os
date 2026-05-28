import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  BarChart3,
  Play,
  Lock,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { LessonVideoPlayer } from "@/components/tutorials/video-player";
import { LessonActionRow } from "@/components/tutorials/action-row";
import { LessonTabs } from "@/components/tutorials/lesson-tabs";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const t = await getTutorialDetail(slug);
  return {
    title: t ? `${t.title} · Creator Growth OS` : "Tutorial · Creator Growth OS",
  };
}

export default async function TutorialDetailPage({
  params,
}: {
  params: Params;
}) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const { slug } = await params;
  const lesson = await getTutorialDetail(slug);
  if (!lesson) notFound();

  const proLocked = lesson.planAccess === "pro" && ctx.plan !== "pro";

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <nav className="text-[13px]">
          <Link href="/tutorials" className="text-rose-600 hover:text-rose-700 font-medium">
            Tutorials
          </Link>
          <span className="text-ink-400 mx-2">/</span>
          {lesson.programSlug && lesson.programTitle ? (
            <>
              <Link
                href={`/programs/${lesson.programSlug}`}
                className="text-rose-600 hover:text-rose-700 font-medium"
              >
                {lesson.programTitle}
              </Link>
              <span className="text-ink-400 mx-2">/</span>
            </>
          ) : null}
          <span className="text-ink-700">Video Lesson</span>
        </nav>

        {/* Title + meta row */}
        <header>
          <h1 className="text-h1 text-ink-900 leading-tight mb-2">
            {lesson.title}
          </h1>
          <p className="text-ink-500 text-[14px] max-w-2xl">
            {lesson.description ??
              "Learn how to apply this skill to your daily creator workflow. The steps and resources in the tabs below will help you make it stick."}
          </p>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
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

        {/* Video player */}
        {!proLocked && (
          <LessonVideoPlayer
            title={lesson.title}
            duration={lesson.duration}
            videoUrl={lesson.videoUrl}
          />
        )}

        {/* Action row */}
        {!proLocked && (
          <LessonActionRow
            lessonSlug={lesson.slug}
            initialCompleted={lesson.completed}
          />
        )}

        {/* Lesson detail — organized into tabs (Overview / Lesson Path /
            Resources / Notes) instead of a stack of cards. */}
        <LessonTabs
          description={lesson.description}
          moduleNumber={lesson.moduleNumber ?? 1}
          moduleTitle={lesson.moduleTitle ?? "Module"}
          moduleLessons={lesson.moduleLessons}
        />
      </div>
    </PageShell>
  );
}
