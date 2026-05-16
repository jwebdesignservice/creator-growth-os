import Link from "next/link";
import { Play } from "lucide-react";

export type Lesson = {
  slug: string;
  title: string;
  program_title: string;
  lesson_label: string;
  duration: string;
};

export function ContinueLearning({ lessons }: { lessons: Lesson[] }) {
  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h3 className="font-display text-[19px] text-ink-900">
          Continue Learning
        </h3>
        <Link
          href="/tutorials"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          View all
        </Link>
      </header>
      <ul className="space-y-3 flex-1">
        {lessons.map((l) => (
          <li key={l.slug}>
            <Link
              href={`/tutorials/${l.slug}`}
              className="flex items-center gap-3 group"
            >
              <div className="size-[var(--icon-container-xl)] rounded-[var(--radius-button-sm)] bg-cream-200 flex items-center justify-center shrink-0 group-hover:bg-cream-300 transition-colors">
                <Play
                  className="size-4 text-rose-600 ml-0.5"
                  fill="currentColor"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-medium text-ink-900 truncate">
                  {l.title}
                </div>
                <div className="text-[11.5px] text-ink-500 truncate">
                  {l.program_title} · {l.lesson_label}
                </div>
              </div>
              <div className="text-[12px] text-ink-500 tabular-nums">
                {l.duration}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
