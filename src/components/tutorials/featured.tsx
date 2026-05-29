import Link from "next/link";
import { Play, BookOpen, Clock, BarChart3, Sparkles } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  moduleTitle: string | null;
  coverUrl: string | null;
};

export function FeaturedTutorial({
  slug,
  title,
  description,
  duration,
  difficulty,
  moduleTitle,
  coverUrl,
}: Props) {
  return (
    <section className="rounded-[20px] sm:rounded-[24px] bg-cream-200 overflow-hidden relative">
      <div className="grid 2xl:grid-cols-[1fr_360px] gap-6 p-5 sm:p-7 lg:p-9 2xl:p-10">
        <div className="max-w-2xl relative z-10">
          <span className="chip chip-rose mb-4">
            <Sparkles className="size-3" strokeWidth={2} />
            Featured Lesson
          </span>
          <h2 className="text-h3 sm:text-[26px] lg:text-[30px] 2xl:text-[34px] text-ink-900 leading-tight mb-3">
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
          </div>
        </div>

        {/* Cover thumbnail — the lesson's real cover with a play overlay; the
            whole tile opens the lesson. Falls back to a branded gradient tile
            when the lesson has no cover image yet. */}
        <div className="relative hidden 2xl:block">
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-rose-100/70 -translate-y-8 translate-x-12 blur-2xl" />
          <Link
            href={`/tutorials/${slug}`}
            aria-label={`Play ${title}`}
            className="group relative block h-full min-h-[220px] rounded-[18px] overflow-hidden border border-cream-300 shadow-card bg-gradient-to-br from-rose-100/70 via-cream-200 to-rose-100/30"
          >
            {coverUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Depth + legibility for the play button over busy images. */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-ink-900/5 to-transparent" />
              </>
            )}

            {/* Center play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="size-20 rounded-full bg-white/90 backdrop-blur shadow-card border border-white/60 inline-flex items-center justify-center transition-transform group-hover:scale-105">
                <Play className="size-8 text-rose-600 ml-1" fill="currentColor" />
              </span>
            </div>

            {/* Loom-style duration badge */}
            <span className="absolute bottom-3 right-3 rounded-md bg-ink-900/85 px-2 py-1 text-[12px] font-semibold text-white tabular-nums leading-none">
              {duration}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
