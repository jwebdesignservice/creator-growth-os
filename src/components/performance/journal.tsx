import { Lightbulb, Star } from "lucide-react";
import type { PerformanceEntry } from "@/lib/performance/queries";

type Props = {
  entries: PerformanceEntry[];
};

export function BestPostsJournal({ entries }: Props) {
  const items = entries.filter((e) => e.best_post || e.lesson_learned).slice(0, 8);
  return (
    <section className="card p-5">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-h4 text-ink-900">
          Best Posts &amp; Lessons Journal
        </h3>
        <span className="text-[12px] text-ink-500">
          {items.length} {items.length === 1 ? "entry" : "entries"}
        </span>
      </header>
      {items.length === 0 ? (
        <div className="text-[13px] text-ink-500">
          Once you start logging your best post and a weekly reflection, your
          journal will collect here.
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((entry) => {
            const d = new Date(entry.week_start + "T00:00:00Z");
            const label = d.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            });
            return (
              <li
                key={entry.week_start}
                className="rounded-[12px] border border-ink-100 bg-cream-100/50 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] text-ink-500 font-medium">
                    Week of {label}
                  </div>
                </div>
                {entry.best_post && (
                  <div className="flex items-start gap-2 mb-2">
                    <Star
                      className="size-3.5 text-rose-500 mt-0.5"
                      strokeWidth={2}
                      fill="currentColor"
                    />
                    <span className="text-[13px] text-ink-900">
                      <span className="font-semibold">Best post:</span>{" "}
                      {entry.best_post}
                    </span>
                  </div>
                )}
                {entry.lesson_learned && (
                  <div className="flex items-start gap-2">
                    <Lightbulb
                      className="size-3.5 text-rose-500 mt-0.5"
                      strokeWidth={2}
                    />
                    <span className="text-[13px] text-ink-700">
                      <span className="font-semibold text-ink-900">
                        Lesson learned:
                      </span>{" "}
                      {entry.lesson_learned}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
