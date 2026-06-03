/* Page Designs · learning & courses ──────────────────────────────────────────
   The education product loop as full-page blueprints — the screens creators and
   learners use to build, teach, assess, and review courses: course builder,
   lesson editor, quiz builder, curriculum overview, my-learning, catalog,
   assignment review, cohort schedule, discussion Q&A, and course reviews. Same
   visual language as the rest of Page Designs (a 560×268 app-shell frame from
   skeleton bars, rose / ink / cream / emerald accents, flat inner cards), at
   page level. Self-contained & presentational — no shared deps.
   ───────────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { GraduationCap, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

/* ── Shell primitives (identical to the other Page Design files) ───────────── */

function Topbar() {
  return (
    <div className="h-7 shrink-0 bg-white border-b border-ink-100 flex items-center gap-1.5 px-3">
      <div className="size-2 rounded-full bg-rose-300" />
      <div className="size-2 rounded-full bg-amber-300" />
      <div className="size-2 rounded-full bg-emerald-300" />
      <div className="ml-2 h-3 w-44 rounded bg-cream-200" />
      <div className="ml-auto size-4 rounded-full bg-cream-200" />
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[560px] shrink-0 h-[268px] rounded-[14px] border border-ink-200 bg-cream-50 overflow-hidden flex flex-col shadow-sm">
      <Topbar />
      <div className="flex flex-1 min-h-0">{children}</div>
    </div>
  );
}

function Rail({ active = 1 }: { active?: number }) {
  return (
    <div className="w-[110px] shrink-0 bg-white border-r border-ink-100 p-2.5 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 px-1 pb-2">
        <div className="size-5 rounded-md bg-rose-400" />
        <div className="h-2 w-11 rounded bg-ink-200" />
      </div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1.5", i === active && "bg-rose-50")}>
          <div className={cn("size-3 rounded shrink-0", i === active ? "bg-rose-400" : "bg-ink-200")} />
          <div className={cn("h-1.5 rounded", i === active ? "w-11 bg-rose-300" : "w-9 bg-ink-100")} />
        </div>
      ))}
      <div className="mt-auto flex items-center gap-1.5 px-1 pt-2 border-t border-ink-100">
        <div className="size-5 rounded-full bg-cream-200" />
        <div className="h-1.5 w-9 rounded bg-ink-100" />
      </div>
    </div>
  );
}

function PlayGlyph() {
  return <div className="ml-0.5 size-0 border-y-[5px] border-y-transparent border-l-[9px] border-l-ink-900" />;
}

/* ── 1 · Course builder — curriculum tree + lesson editor ──────────────────── */
export function CourseBuilder() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-white flex">
        <div className="w-[142px] shrink-0 border-r border-ink-100 bg-cream-50 p-2.5 space-y-2 overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="h-2 w-16 rounded bg-ink-300" />
            <div className="size-4 rounded bg-rose-100" />
          </div>
          {[0, 1].map((m) => (
            <div key={m} className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-sm bg-rose-300" />
                <div className="h-1.5 w-16 rounded bg-ink-200" />
              </div>
              {[0, 1, 2].map((i) => (
                <div key={i} className={cn("flex items-center gap-1.5 pl-3.5 rounded px-1 py-0.5", m === 0 && i === 1 && "bg-rose-50")}>
                  <div className="size-2 rounded-full bg-cream-200 shrink-0" />
                  <div className={cn("h-1.5 flex-1 rounded", m === 0 && i === 1 ? "bg-rose-300" : "bg-ink-100")} />
                </div>
              ))}
            </div>
          ))}
          <div className="h-6 rounded-md border border-dashed border-ink-300 flex items-center justify-center">
            <div className="h-1.5 w-12 rounded bg-ink-200" />
          </div>
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2 bg-cream-50">
          <div className="flex items-center justify-between">
            <div className="h-2.5 w-32 rounded bg-ink-300" />
            <div className="flex gap-1.5">
              <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
              <div className="h-6 w-16 rounded-md bg-rose-400" />
            </div>
          </div>
          <div className="rounded-lg bg-ink-900 h-[78px] relative overflow-hidden flex items-center justify-center">
            <div className="size-8 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
            <div className="absolute bottom-2 right-2 h-3 w-9 rounded bg-white/15" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-6 flex-1 rounded-md bg-white border border-ink-200" />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 2 · Lesson editor — stacked content blocks + add-block ────────────────── */
export function LessonEditor() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-28 rounded bg-ink-300" />
          <div className="flex gap-1.5">
            <div className="h-6 w-14 rounded-md bg-white border border-ink-200" />
            <div className="h-6 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 space-y-1">
          <div className="h-1.5 w-full rounded bg-ink-200" />
          <div className="h-1.5 w-3/4 rounded bg-ink-100" />
        </div>
        <div className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2">
          <div className="size-8 rounded bg-ink-900 flex items-center justify-center shrink-0">
            <PlayGlyph />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-1/2 rounded bg-ink-200" />
            <div className="h-1.5 w-1/3 rounded bg-ink-100" />
          </div>
        </div>
        <div className="rounded-lg bg-rose-50/50 border border-rose-100 p-2 space-y-1">
          <div className="h-1.5 w-12 rounded bg-rose-300" />
          <div className="h-1.5 w-full rounded bg-ink-100" />
        </div>
        <div className="h-7 rounded-md border border-dashed border-ink-300 flex items-center justify-center gap-1.5">
          <div className="size-3 rounded-full bg-ink-200" />
          <div className="h-1.5 w-16 rounded bg-ink-200" />
        </div>
      </div>
    </Frame>
  );
}

/* ── 3 · Quiz builder — question list + answer options ─────────────────────── */
export function QuizBuilder() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-white flex">
        <div className="w-[120px] shrink-0 border-r border-ink-100 bg-cream-50 p-2.5 space-y-1.5">
          <div className="h-2 w-14 rounded bg-ink-300 mb-0.5" />
          {[0, 1, 2].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md px-1.5 py-1.5", i === 0 && "bg-white border border-ink-200")}>
              <div className={cn("size-4 rounded-full shrink-0", i === 0 ? "bg-rose-400" : "bg-cream-200")} />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
          <div className="h-6 rounded-md border border-dashed border-ink-300" />
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2 bg-cream-50">
          <div className="h-1.5 w-10 rounded bg-ink-200" />
          <div className="h-8 rounded-md bg-white border border-ink-200" />
          <div className="h-1.5 w-12 rounded bg-ink-200 mt-0.5" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("flex items-center gap-2 rounded-md border p-2", i === 1 ? "border-emerald-300 bg-emerald-50/50" : "border-ink-200 bg-white")}>
              <div className={cn("size-3.5 rounded-full border-2 shrink-0", i === 1 ? "border-emerald-400 bg-emerald-400" : "border-ink-300")} />
              <div className="h-1.5 flex-1 rounded bg-ink-100" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 4 · Curriculum overview — modules with progress (one expanded) ────────── */
export function CurriculumOverview() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="flex items-center gap-2.5">
          <div className="size-10 rounded-md bg-rose-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-32 rounded bg-ink-300" />
            <div className="h-1 w-full rounded-full bg-cream-200">
              <div className="h-full w-2/5 rounded-full bg-emerald-300" />
            </div>
          </div>
        </div>
        {[0, 1, 2].map((m) => (
          <div key={m} className="rounded-lg bg-white border border-ink-100 overflow-hidden">
            <div className="flex items-center gap-2 px-2.5 py-2">
              <div className="size-3.5 rounded bg-cream-200 shrink-0" />
              <div className="h-1.5 w-24 rounded bg-ink-200" />
              <div className="ml-auto h-1.5 w-10 rounded bg-ink-100" />
            </div>
            {m === 0 && (
              <div className="px-2.5 pb-2 pt-1.5 space-y-1 border-t border-ink-100">
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-1.5 pl-3.5">
                    <div className={cn("size-3 rounded-full shrink-0", i === 0 ? "bg-emerald-300" : "bg-cream-200")} />
                    <div className="h-1.5 flex-1 rounded bg-ink-100" />
                    <div className="h-1.5 w-6 rounded bg-ink-100" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ── 5 · My learning — continue + enrolled courses ─────────────────────────── */
export function MyLearning() {
  return (
    <Frame>
      <Rail active={0} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="h-2.5 w-28 rounded bg-ink-300" />
        <div className="rounded-lg bg-white border border-ink-100 p-2 flex items-center gap-2.5">
          <div className="w-20 h-12 rounded-md bg-ink-900 relative flex items-center justify-center shrink-0">
            <div className="size-6 rounded-full bg-white/90 flex items-center justify-center">
              <PlayGlyph />
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-1.5 w-2/3 rounded bg-ink-200" />
            <div className="h-1 w-full rounded-full bg-cream-200">
              <div className="h-full w-1/2 rounded-full bg-rose-400" />
            </div>
            <div className="h-1.5 w-1/3 rounded bg-ink-100" />
          </div>
          <div className="h-7 w-16 rounded-md bg-rose-400 shrink-0" />
        </div>
        <div className="h-1.5 w-20 rounded bg-ink-300" />
        <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden flex flex-col">
              <div className={cn("h-10", i % 3 === 0 ? "bg-rose-100" : i % 3 === 1 ? "bg-cream-200" : "bg-emerald-100")} />
              <div className="p-1.5 space-y-1 flex-1">
                <div className="h-1.5 w-full rounded bg-ink-200" />
                <div className="h-1 w-full rounded-full bg-cream-200">
                  <div className={cn("h-full rounded-full bg-emerald-300", i === 0 ? "w-full" : "w-1/3")} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 6 · Course catalog — search/filters + course grid ─────────────────────── */
export function CourseCatalog() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 flex flex-col">
        <div className="px-3 py-2.5 bg-white border-b border-ink-100 flex items-center gap-2">
          <div className="flex-1 h-7 rounded-full bg-cream-100 border border-ink-200 flex items-center px-2.5 gap-1.5">
            <div className="size-2.5 rounded-full border-2 border-ink-300" />
            <div className="h-1.5 w-24 rounded bg-ink-200" />
          </div>
          <div className="flex gap-1 shrink-0">
            {[0, 1, 2].map((i) => (
              <div key={i} className={cn("h-7 px-2 rounded-full flex items-center", i === 0 ? "bg-rose-100" : "bg-cream-100 border border-ink-100")}>
                <div className="h-1.5 w-6 rounded bg-ink-200" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 min-h-0 p-2.5 grid grid-cols-3 gap-2 overflow-hidden">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 overflow-hidden flex flex-col">
              <div className={cn("h-10", i % 3 === 0 ? "bg-rose-100" : i % 3 === 1 ? "bg-cream-200" : "bg-emerald-100")} />
              <div className="p-1.5 space-y-1 flex-1">
                <div className="h-1.5 w-full rounded bg-ink-200" />
                <div className="flex items-center justify-between pt-0.5">
                  <div className="h-2 w-8 rounded bg-ink-300" />
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <div key={j} className="size-1 rounded-sm bg-amber-300" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 7 · Assignment review — submissions list + grading ────────────────────── */
export function AssignmentReview() {
  return (
    <Frame>
      <Rail active={3} />
      <div className="flex-1 min-w-0 bg-white flex">
        <div className="w-[132px] shrink-0 border-r border-ink-100 bg-cream-50 p-2 space-y-1.5">
          <div className="h-2 w-16 rounded bg-ink-300 mb-0.5" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn("flex items-center gap-1.5 rounded-md p-1.5", i === 0 && "bg-white border border-ink-200")}>
              <div className="size-5 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                <div className="h-1.5 w-8 rounded bg-ink-100" />
              </div>
              <div className={cn("size-2 rounded-full shrink-0", i < 2 ? "bg-amber-300" : "bg-emerald-300")} />
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0 p-3 flex flex-col gap-2 bg-cream-50">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-full bg-cream-200 shrink-0" />
            <div className="space-y-1">
              <div className="h-1.5 w-16 rounded bg-ink-200" />
              <div className="h-1.5 w-10 rounded bg-ink-100" />
            </div>
          </div>
          <div className="flex-1 rounded-lg bg-white border border-ink-100 p-2 space-y-1.5">
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="h-1.5 w-5/6 rounded bg-ink-100" />
            <div className="h-1.5 w-2/3 rounded bg-ink-100" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-14 rounded-md bg-white border border-ink-200" />
            <div className="ml-auto h-8 w-16 rounded-md bg-white border border-ink-200" />
            <div className="h-8 w-16 rounded-md bg-rose-400" />
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* ── 8 · Cohort schedule — next live session + upcoming ────────────────────── */
export function CohortSchedule() {
  return (
    <Frame>
      <Rail active={1} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="h-2.5 w-24 rounded bg-ink-300" />
          <div className="h-6 w-20 rounded-md bg-white border border-ink-200" />
        </div>
        <div className="rounded-lg bg-gradient-to-r from-rose-50 to-cream-50 border border-rose-100 p-2.5 flex items-center gap-2.5">
          <div className="size-10 rounded-md bg-white/70 flex flex-col items-center justify-center gap-0.5 shrink-0">
            <div className="h-1.5 w-5 rounded bg-rose-300" />
            <div className="h-2 w-6 rounded bg-ink-300" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-2 w-24 rounded bg-ink-300" />
            <div className="h-1.5 w-16 rounded bg-ink-100" />
          </div>
          <div className="h-7 w-16 rounded-md bg-rose-400 shrink-0" />
        </div>
        <div className="space-y-1.5 flex-1 min-h-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-lg bg-white border border-ink-100 p-2">
              <div className="size-9 rounded-md bg-cream-100 flex flex-col items-center justify-center gap-0.5 shrink-0">
                <div className="h-1 w-4 rounded bg-ink-200" />
                <div className="h-1.5 w-5 rounded bg-ink-300" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-1.5 w-20 rounded bg-ink-200" />
                <div className="h-1.5 w-12 rounded bg-ink-100" />
              </div>
              <div className="h-2.5 w-12 rounded-full bg-cream-200 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── 9 · Discussion Q&A — question with answers (one accepted) ─────────────── */
export function DiscussionQA() {
  return (
    <Frame>
      <Rail active={4} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2 overflow-hidden">
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex gap-2.5">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="size-3 rounded-sm bg-emerald-200" />
            <div className="h-1.5 w-4 rounded bg-ink-300" />
            <div className="size-3 rounded-sm bg-cream-200" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-2/3 rounded bg-ink-300" />
            <div className="h-1.5 w-full rounded bg-ink-100" />
            <div className="flex items-center gap-1.5">
              <div className="size-4 rounded-full bg-cream-200" />
              <div className="h-1.5 w-12 rounded bg-ink-100" />
            </div>
          </div>
        </div>
        <div className="h-1.5 w-16 rounded bg-ink-300 ml-1" />
        {[0, 1].map((i) => (
          <div key={i} className={cn("rounded-lg border p-2 flex gap-2 ml-3", i === 0 ? "border-emerald-200 bg-emerald-50/40" : "border-ink-100 bg-white")}>
            <div className="size-6 rounded-full bg-cream-200 shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-12 rounded bg-ink-200" />
                {i === 0 && <div className="h-2 w-10 rounded-full bg-emerald-200" />}
              </div>
              <div className="h-1.5 w-full rounded bg-ink-100" />
              <div className="h-1.5 w-3/4 rounded bg-ink-100" />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ── 10 · Course reviews — rating summary + review list ────────────────────── */
export function CourseReviews() {
  return (
    <Frame>
      <Rail active={2} />
      <div className="flex-1 min-w-0 bg-cream-50 p-3 flex flex-col gap-2.5 overflow-hidden">
        <div className="rounded-lg bg-white border border-ink-100 p-2.5 flex items-center gap-3">
          <div className="text-center space-y-1 shrink-0">
            <div className="h-4 w-8 rounded bg-ink-300 mx-auto" />
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="size-1.5 rounded-sm bg-amber-300" />
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-1.5 w-3 rounded bg-ink-200" />
                <div className="h-1.5 flex-1 rounded-full bg-cream-200 overflow-hidden">
                  <div className={cn("h-full rounded-full bg-amber-300", i === 0 ? "w-4/5" : i === 1 ? "w-1/3" : "w-1/6")} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-1.5 flex-1 min-h-0">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg bg-white border border-ink-100 p-2 flex gap-2">
              <div className="size-7 rounded-full bg-cream-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-14 rounded bg-ink-200" />
                  <div className="flex gap-0.5">
                    {[0, 1, 2, 3, 4].map((j) => (
                      <div key={j} className="size-1.5 rounded-sm bg-amber-300" />
                    ))}
                  </div>
                </div>
                <div className="h-1.5 w-full rounded bg-ink-100" />
                <div className="h-1.5 w-2/3 rounded bg-ink-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

/* ── Category registration ─────────────────────────────────────────────────── */

type PageCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  scale?: number;
  items: { label: string; code: string; node: ReactNode; scale?: number }[];
};

export const PAGE_DESIGNS_LEARNING: PageCategory[] = [
  {
    id: "page-designs-learning",
    label: "Learning & courses",
    icon: GraduationCap,
    blurb: "The education product loop — course builder, lesson editor, quiz builder, curriculum, my-learning, catalog, assignment review, cohort schedule, discussion Q&A & reviews.",
    items: [
      { label: "Course builder · tree + editor", code: "CourseBuilder", node: <CourseBuilder /> },
      { label: "Lesson editor · content blocks", code: "LessonEditor", node: <LessonEditor /> },
      { label: "Quiz builder · questions", code: "QuizBuilder", node: <QuizBuilder /> },
      { label: "Curriculum overview", code: "CurriculumOverview", node: <CurriculumOverview /> },
      { label: "My learning · enrolled", code: "MyLearning", node: <MyLearning /> },
      { label: "Course catalog · browse", code: "CourseCatalog", node: <CourseCatalog /> },
      { label: "Assignment review · grading", code: "AssignmentReview", node: <AssignmentReview /> },
      { label: "Cohort schedule · live", code: "CohortSchedule", node: <CohortSchedule /> },
      { label: "Discussion Q&A", code: "DiscussionQA", node: <DiscussionQA /> },
      { label: "Course reviews · ratings", code: "CourseReviews", node: <CourseReviews /> },
    ],
  },
];
