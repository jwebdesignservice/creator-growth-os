import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  BookOpen,
  BarChart3,
  Lightbulb,
  Files,
  FileText,
  FileSpreadsheet,
  ChevronRight,
  CheckCircle2,
  Play,
  Lock,
  Target,
  CalendarDays,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getTutorialDetail } from "@/lib/programs/tutorial-queries";
import { LessonVideoPlayer } from "@/components/tutorials/video-player";
import { LessonActionRow } from "@/components/tutorials/action-row";
import { Avatar } from "@/components/app-shell/avatar";
import { cn } from "@/lib/cn";

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
          <h1 className="font-display text-[36px] text-ink-900 leading-tight mb-2">
            {lesson.title}
          </h1>
          <p className="text-ink-500 text-[14px] max-w-2xl">
            {lesson.description ??
              "Learn how to apply this skill to your daily creator workflow. The action drill at the bottom will help you make it stick."}
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

        {/* 3-col details row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <LessonOverview
            description={lesson.description}
            takeaways={lessonTakeaways(lesson.title)}
          />
          <LessonPath
            moduleNumber={lesson.moduleNumber ?? 1}
            moduleTitle={lesson.moduleTitle ?? "Module"}
            lessons={lesson.moduleLessons}
            totalDuration={lesson.moduleLessons
              .reduce((sum, l) => sum + parseMinutes(l.duration), 0)
              .toString()}
          />
          <CreatorDrill
            lessonTitle={lesson.title}
          />
        </div>

        {/* Bottom row: Resources + Quick Notes + Key Insight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <ResourcesPanel />
          <QuickNotes />
          <KeyInsight />
        </div>
      </div>
    </PageShell>
  );
}

// ----------------------------------------------------------------------
// Sub-components
// ----------------------------------------------------------------------

function LessonOverview({
  description,
  takeaways,
}: {
  description: string | null;
  takeaways: string[];
}) {
  return (
    <div className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-3 flex items-center gap-2">
        <BookOpen className="size-4 text-rose-500" strokeWidth={1.8} />
        Lesson Overview
      </h3>
      <p className="text-[13px] text-ink-500 leading-relaxed mb-4">
        {description ??
          "A focused lesson packed with what actually moves the needle for creators at your stage — clear, practical, and built to apply this week."}
      </p>
      <div className="text-[12.5px] font-semibold text-ink-900 mb-2">
        Key Takeaways
      </div>
      <ul className="space-y-2">
        {takeaways.map((t) => (
          <li key={t} className="flex items-start gap-2 text-[12.5px] text-ink-700">
            <span className="size-4 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="size-3" strokeWidth={3} />
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function LessonPath({
  moduleNumber,
  moduleTitle,
  lessons,
  totalDuration,
}: {
  moduleNumber: number;
  moduleTitle: string;
  lessons: { slug: string; title: string; duration: string; isCurrent: boolean; completed: boolean }[];
  totalDuration: string;
}) {
  return (
    <div className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-3 flex items-center gap-2">
        <CalendarDays className="size-4 text-rose-500" strokeWidth={1.8} />
        Lesson Path · Module {moduleNumber}
      </h3>
      <div className="text-[12px] text-ink-500 mb-3">{moduleTitle}</div>
      <ul className="space-y-2">
        {lessons.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/tutorials/${l.slug}`}
              className={cn(
                "flex items-center gap-2.5 px-2 py-2 -mx-2 rounded-[10px] transition-colors",
                l.isCurrent ? "bg-rose-50 border border-rose-200" : "hover:bg-cream-100",
              )}
            >
              <span
                className={cn(
                  "size-5 rounded-full inline-flex items-center justify-center shrink-0",
                  l.completed
                    ? "bg-rose-100 text-rose-600"
                    : l.isCurrent
                      ? "bg-rose-500 text-white"
                      : "border border-ink-300",
                )}
              >
                {l.completed ? (
                  <CheckCircle2 className="size-3" strokeWidth={3} />
                ) : l.isCurrent ? (
                  <Play className="size-2.5 ml-0.5" fill="currentColor" />
                ) : null}
              </span>
              <span
                className={cn(
                  "flex-1 text-[12.5px] truncate",
                  l.isCurrent ? "font-semibold text-ink-900" : "text-ink-700",
                )}
              >
                {l.title}
              </span>
              <span className="text-[11px] text-ink-500 tabular-nums">
                {l.duration}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-[11.5px] text-ink-500">
        {lessons.length} lessons · ~{totalDuration} min total
      </div>
    </div>
  );
}

function CreatorDrill({ lessonTitle }: { lessonTitle: string }) {
  return (
    <div className="card p-5 flex flex-col">
      <h3 className="font-display text-[18px] text-ink-900 mb-3 flex items-center gap-2">
        <Target className="size-4 text-rose-500" strokeWidth={1.8} />
        Creator Drill
      </h3>
      <p className="text-[13px] text-ink-700 leading-snug mb-4">
        Write 10 variations applying what you learned in <span className="font-semibold">{lessonTitle}</span>. Use different angles and test the strongest one this week.
      </p>
      <ul className="space-y-1.5 text-[12.5px] text-ink-700 mb-4">
        <li className="flex items-center gap-2">
          <Clock className="size-3.5 text-rose-500" strokeWidth={2} />
          Estimated time: <span className="font-semibold">30 min</span>
        </li>
        <li className="flex items-center gap-2">
          <CalendarDays className="size-3.5 text-rose-500" strokeWidth={2} />
          Due Date: <span className="font-semibold">In 2 days</span>
        </li>
        <li className="flex items-center gap-2">
          <FileText className="size-3.5 text-rose-500" strokeWidth={2} />
          Format: <span className="font-semibold">Written Submission</span>
        </li>
      </ul>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-medium transition-colors mt-auto cursor-pointer"
      >
        Start Drill
      </button>
    </div>
  );
}

function ResourcesPanel() {
  const items = [
    { title: "Hook Formula PDF", type: "PDF Guide", icon: FileText },
    { title: "Caption Starter Sheet", type: "Google Sheet", icon: FileSpreadsheet },
    { title: "Hook Swipe File", type: "Swipe File Library", icon: Files, pro: true },
    { title: "Creator Checklist", type: "PDF Guide", icon: FileText },
  ];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-[18px] text-ink-900 flex items-center gap-2">
          📚 Resources &amp; Templates
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
    </div>
  );
}

function QuickNotes() {
  return (
    <div className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-3 flex items-center gap-2">
        📝 Quick Notes
      </h3>
      <textarea
        className="w-full min-h-[140px] rounded-[10px] border border-ink-200 bg-white px-3 py-2 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-none"
        placeholder="Write your key takeaways, ideas, and insights from this lesson..."
        maxLength={1000}
      />
      <div className="flex items-center justify-between mt-2 text-[11px] text-ink-500">
        <div className="inline-flex items-center gap-2">
          <button type="button" className="hover:text-ink-900 cursor-pointer font-bold">B</button>
          <button type="button" className="hover:text-ink-900 cursor-pointer italic">I</button>
          <button type="button" className="hover:text-ink-900 cursor-pointer">•</button>
          <button type="button" className="hover:text-ink-900 cursor-pointer">1.</button>
        </div>
        <span>0 / 1000</span>
      </div>
    </div>
  );
}

function KeyInsight() {
  return (
    <div className="card p-5">
      <h3 className="font-display text-[18px] text-ink-900 mb-3 flex items-center gap-2">
        <Lightbulb className="size-4 text-rose-500" strokeWidth={1.8} />
        Key Insight
      </h3>
      <blockquote className="border-l-2 border-rose-300 pl-4 italic text-[13.5px] text-ink-700 leading-relaxed mb-4">
        &ldquo;The best hooks create curiosity, promise value, or challenge the
        viewer&apos;s current belief. Make them want to stay.&rdquo;
      </blockquote>
      <div className="flex items-center gap-2.5">
        <Avatar name="Sophie Carter" size={36} />
        <div>
          <div className="text-[12.5px] font-semibold text-ink-900 leading-tight">
            Your Coach, Sophie
          </div>
          <div className="text-[11px] text-ink-500">
            Growth &amp; Content Strategist
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function lessonTakeaways(_title: string): string[] {
  return [
    "Why hooks are critical for reach and retention",
    "4 high-performing hook angles that work every time",
    "The hook formula and how to use it",
    "Real hook examples that drive views",
    "How to test and refine your hooks",
  ];
}

function parseMinutes(duration: string): number {
  const [m] = duration.split(":");
  const n = parseInt(m ?? "0", 10);
  return Number.isFinite(n) ? n : 0;
}
