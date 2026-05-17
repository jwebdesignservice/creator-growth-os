import Link from "next/link";
import { Play, BookOpen, Clock, BarChart3, Sparkles } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  moduleTitle: string | null;
};

export function FeaturedTutorial({
  slug,
  title,
  description,
  duration,
  difficulty,
  moduleTitle,
}: Props) {
  return (
    <section className="rounded-[20px] sm:rounded-[24px] bg-cream-200 overflow-hidden relative">
      <div className="grid 2xl:grid-cols-[1fr_360px] gap-6 p-5 sm:p-7 lg:p-9 2xl:p-10">
        <div className="max-w-2xl relative z-10">
          <span className="chip chip-rose mb-4">
            <Sparkles className="size-3" strokeWidth={2} />
            Featured Lesson
          </span>
          <h2 className="font-display text-[22px] sm:text-[26px] lg:text-[30px] 2xl:text-[34px] text-ink-900 leading-tight mb-3">
            {title}
          </h2>
          <p className="text-ink-500 text-[14px] max-w-md mb-5 leading-relaxed">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[12.5px] text-ink-700 mb-5">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-rose-500" strokeWidth={2} />
              {duration}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="size-3.5 text-rose-500" strokeWidth={2} />
              {difficulty}
            </span>
            {moduleTitle && (
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-rose-500" strokeWidth={2} />
                {moduleTitle}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <Link
              href={`/tutorials/${slug}`}
              className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[14px] bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-medium shadow-sm transition-colors"
            >
              <Play className="size-4" fill="currentColor" />
              Continue Watching
            </Link>
            <Link
              href={`/tutorials/${slug}`}
              className="inline-flex items-center justify-center h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors"
            >
              View Lesson Path
            </Link>
          </div>
        </div>

        <div className="relative hidden 2xl:block">
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-rose-100/70 -translate-y-8 translate-x-12 blur-2xl" />
          <PlayDecor />
        </div>
      </div>
    </section>
  );
}

function PlayDecor() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="size-40 rounded-full bg-white/90 backdrop-blur shadow-card border border-cream-300 flex items-center justify-center">
        <Play className="size-16 text-rose-600 ml-2" fill="currentColor" />
      </div>
    </div>
  );
}
