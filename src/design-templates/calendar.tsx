/* Calendar ──────────────────────────────────────────────────────────────
   Content-planning surfaces — a multi-day content calendar strip (with
   accented post cards + a highlighted "today") and a month mini-calendar
   date picker. Mirrors src/components/posting/content-calendar.tsx.
   ───────────────────────────────────────────────────────────────────── */

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

type Post = { title: string; time: string; type: string; accent: string; label: string; pct: number };

const DAYS: { day: string; date: number; today?: boolean; posts: Post[] }[] = [
  { day: "Mon", date: 18, posts: [{ title: "3 hooks that stop the scroll", time: "9:00 AM", type: "Reel", accent: "border-l-violet-500", label: "text-violet-600", pct: 60 }] },
  { day: "Tue", date: 19, posts: [] },
  { day: "Wed", date: 20, today: true, posts: [
    { title: "Behind the scenes batch day", time: "11:30 AM", type: "Story", accent: "border-l-amber-500", label: "text-amber-600", pct: 30 },
    { title: "Carousel: 5 tools I use", time: "5:00 PM", type: "Carousel", accent: "border-l-sky-500", label: "text-sky-600", pct: 45 },
  ] },
  { day: "Thu", date: 21, posts: [{ title: "Weekly recap + CTA", time: "8:00 AM", type: "Video", accent: "border-l-rose-500", label: "text-rose-600", pct: 15 }] },
  { day: "Fri", date: 22, posts: [] },
];

export function ContentCalendar() {
  return (
    <section className="card overflow-hidden w-[760px] max-w-full">
      <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
        <div>
          <h3 className="text-h4 text-ink-900 leading-none">Content Calendar</h3>
          <p className="text-[12px] text-ink-500 mt-1">May 18 – 22 · drag a post to reschedule</p>
        </div>
        <div className="inline-flex items-center rounded-[10px] border border-ink-200 bg-white overflow-hidden">
          <span className="size-9 inline-flex items-center justify-center text-ink-500"><ChevronLeft className="size-4" strokeWidth={2} /></span>
          <span className="h-9 px-2.5 inline-flex items-center text-[12px] font-medium border-x border-ink-200 text-ink-700">Today</span>
          <span className="size-9 inline-flex items-center justify-center text-ink-500"><ChevronRight className="size-4" strokeWidth={2} /></span>
        </div>
      </header>
      <div className="grid grid-cols-5 divide-x divide-ink-100">
        {DAYS.map((d) => (
          <div
            key={d.date}
            className={cn(
              "flex flex-col min-h-[220px] p-2.5",
              d.today && "bg-rose-50 ring-1 ring-rose-200 ring-inset",
            )}
          >
            <header className="mb-2 flex items-start justify-between">
              <div>
                <div className={cn("text-[10px] uppercase tracking-wide font-semibold", d.today ? "text-rose-600" : "text-ink-500")}>{d.day}</div>
                <div className={cn("text-[18px] leading-none mt-0.5 font-semibold", d.today ? "text-rose-600" : "text-ink-900")}>{d.date}</div>
              </div>
              {d.today && (
                <span className="text-[9px] font-bold uppercase tracking-wide text-white bg-rose-600 rounded-full px-2 py-1 leading-none">Today</span>
              )}
            </header>
            <div className="space-y-2 flex-1">
              {d.posts.length === 0 ? (
                <div className="h-full min-h-[56px] flex items-center justify-center text-[11px] text-ink-300">—</div>
              ) : (
                d.posts.map((p, i) => (
                  <div key={i} className={cn("rounded-[12px] border border-ink-100 border-l-4 bg-white p-2.5", p.accent)}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn("text-[11px] font-semibold", p.label)}>{p.type}</span>
                      <span className="text-[10.5px] text-ink-400 tabular-nums">{p.time}</span>
                    </div>
                    <h4 className="text-[12.5px] font-bold text-ink-900 leading-snug line-clamp-2 mb-2">{p.title}</h4>
                    <div className="h-1 rounded-full bg-ink-100 overflow-hidden">
                      <div className="h-full rounded-full bg-rose-500" style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))
              )}
              <button type="button" className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-[10px] border border-dashed border-ink-200 text-[11.5px] font-medium text-ink-500 hover:border-rose-300 hover:text-rose-600 transition-colors">
                <Plus className="size-3.5" strokeWidth={2.2} />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function MiniCalendar() {
  // A 5-week month grid. `scheduled` days get a rose dot; one day is selected.
  const blanks = 2; // month starts on Wed
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const scheduled = new Set([3, 9, 14, 15, 22, 27]);
  const selected = 15;
  const today = 20;
  return (
    <div className="card p-4 w-[280px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13.5px] font-semibold text-ink-900">May 2026</span>
        <div className="flex items-center gap-1">
          <span className="size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100"><ChevronLeft className="size-4" strokeWidth={2} /></span>
          <span className="size-7 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100"><ChevronRight className="size-4" strokeWidth={2} /></span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-center text-[10px] font-semibold text-ink-400">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }).map((_, i) => <span key={"b" + i} />)}
        {days.map((n) => {
          const isSel = n === selected;
          const isToday = n === today;
          return (
            <span
              key={n}
              className={cn(
                "relative h-8 rounded-[8px] inline-flex items-center justify-center text-[12px] tabular-nums transition-colors",
                isSel ? "bg-rose-600 text-white font-semibold" : isToday ? "ring-1 ring-rose-300 text-ink-900" : "text-ink-700 hover:bg-cream-100",
              )}
            >
              {n}
              {scheduled.has(n) && !isSel && (
                <span className="absolute bottom-1 size-1 rounded-full bg-rose-500" />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
