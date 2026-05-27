import Link from "next/link";
import { Play, BookOpen, CheckSquare, CalendarDays, User } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  description: string;
  category_label: string;
  total_lessons: number;
  total_tasks: number;
  estimated_days: number;
  progress: number;
};

export function FeaturedProgram(p: Props) {
  return (
    <section className="rounded-[20px] sm:rounded-[24px] bg-cream-200 overflow-hidden relative">
      <div className="grid 2xl:grid-cols-[1fr_360px] gap-6 p-5 sm:p-7 lg:p-9 2xl:p-10">
        <div className="max-w-xl relative z-10">
          <span className="chip chip-rose mb-4">
            <span aria-hidden>✦</span> Featured Program
          </span>
          <h2 className="text-h3 sm:text-[26px] lg:text-[30px] 2xl:text-[36px] leading-tight text-ink-900 mb-3">
            {p.title}
          </h2>
          <p className="text-ink-500 text-[14px] max-w-md mb-5 leading-relaxed">
            {p.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-ink-700 mb-5">
            <span className="inline-flex items-center gap-1.5">
              <User className="size-3.5 text-rose-500" strokeWidth={2} />
              {p.category_label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-rose-500" strokeWidth={2} />
              {p.estimated_days} Days
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-rose-500" strokeWidth={2} />
              {p.total_lessons} Lessons
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckSquare className="size-3.5 text-rose-500" strokeWidth={2} />
              {p.total_tasks} Tasks
            </span>
          </div>

          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] text-ink-500 font-medium">
                Overall Progress
              </span>
              <span className="text-[12.5px] text-ink-900 font-semibold tabular-nums">
                {p.progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-cream-300 overflow-hidden">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${p.progress}%` }}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <Link
              href={`/programs/${p.slug}`}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-medium shadow-sm transition-colors"
            >
              <Play className="size-4" fill="currentColor" />
              Continue Program
            </Link>
            <Link
              href={`/programs/${p.slug}`}
              className="inline-flex items-center justify-center h-12 px-7 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>

        {/* Decorative right column — content notebook motif */}
        <div className="relative hidden 2xl:block">
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-rose-100/70 -translate-y-8 translate-x-12 blur-2xl" />
          <NotebookIllustration />
        </div>
      </div>
    </section>
  );
}

function NotebookIllustration() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <div className="w-44 h-56 rounded-[14px] bg-white border border-cream-300 rotate-[-3deg] shadow-card p-4">
          <div className="font-script text-[20px] text-ink-700 mb-2 underline decoration-rose-300/70 underline-offset-4">
            Content Plan
          </div>
          <div className="space-y-1.5">
            <div className="h-2 rounded bg-cream-200 w-full" />
            <div className="h-2 rounded bg-cream-200 w-4/5" />
            <div className="h-2 rounded bg-cream-200 w-3/4" />
            <div className="h-2 rounded bg-cream-200 w-5/6" />
            <div className="h-2 rounded bg-cream-200 w-2/3" />
          </div>
          <div className="mt-4 text-right text-rose-400 text-[14px]">♥</div>
        </div>
        {/* Floating sparkles */}
        <svg
          className="absolute -top-6 -left-8 size-12 text-rose-300"
          viewBox="0 0 32 32"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="4" cy="6" r="2" />
          <circle cx="20" cy="3" r="1.5" />
          <circle cx="28" cy="12" r="2" />
        </svg>
      </div>
    </div>
  );
}
