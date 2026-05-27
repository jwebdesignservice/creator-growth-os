import Link from "next/link";
import { Play, GraduationCap, ArrowRight } from "lucide-react";

export type Lesson = {
  slug: string;
  title: string;
  program_title: string;
  lesson_label: string;
  duration: string;
  progress?: number;
};

export function ContinueLearning({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <header className="flex items-center gap-2.5 mb-4">
        <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <GraduationCap className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h3 className="text-h4 text-ink-900 leading-tight">
            Continue Learning
          </h3>
          <p className="text-[12.5px] text-ink-500 leading-snug">
            Pick up where you left off
          </p>
        </div>
      </header>

      <ul className="space-y-3 flex-1">
        {lessons.map((l) => {
          const progress = Math.min(100, Math.max(0, l.progress ?? 0));
          return (
            <li key={l.slug}>
              <Link
                href={`/tutorials/${l.slug}`}
                className="flex items-center gap-3 group"
              >
                {/* Thumbnail */}
                <span className="relative w-[88px] aspect-video rounded-[10px] overflow-hidden shrink-0 bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200">
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="size-7 rounded-full bg-white/85 text-rose-600 inline-flex items-center justify-center shadow-sm group-hover:bg-white transition-colors">
                      <Play className="size-3 ml-0.5" fill="currentColor" />
                    </span>
                  </span>
                </span>

                {/* Title + progress */}
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-semibold text-ink-900 leading-snug truncate group-hover:text-rose-700 transition-colors">
                    {l.title}
                  </span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span className="h-1.5 flex-1 rounded-full bg-cream-200 overflow-hidden">
                      <span
                        className="block h-full rounded-full bg-rose-500"
                        style={{ width: `${progress}%` }}
                      />
                    </span>
                    <span className="text-[11px] font-semibold text-rose-600 tabular-nums shrink-0">
                      {progress}%
                    </span>
                  </span>
                  <span className="mt-1 block text-[11.5px] text-ink-500 tabular-nums">
                    {l.duration}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        href="/tutorials"
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
      >
        View all tutorials <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}
