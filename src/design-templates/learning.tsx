/* Learning ──────────────────────────────────────────────────────────────
   Programs & tutorials surfaces — the program card, an expandable
   curriculum accordion, and a video-player frame. Mirrors
   src/components/programs/program-card.tsx and the lesson player.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import {
  BookOpen,
  SquareCheck,
  CalendarDays,
  CircleCheck,
  ChevronDown,
  Play,
  Lock,
  Volume2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/cn";

export function ProgramCard() {
  const progress = 64;
  return (
    <div className="w-[300px] max-w-full flex flex-col gap-3">
      {/* Thumbnail */}
      <div className="relative aspect-video rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/70 via-rose-50 to-cream-200" />
        <svg
          className="absolute inset-0 h-full w-full text-rose-300/70"
          viewBox="0 0 200 112"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="30" cy="20" r="2" />
          <circle cx="170" cy="26" r="3" />
          <circle cx="50" cy="92" r="2.5" />
          <circle cx="150" cy="84" r="2" />
        </svg>
        <span className="absolute top-2.5 left-2.5 chip chip-rose text-[10px] font-semibold uppercase tracking-wide shadow-soft">
          In progress
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-2.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-ink-900 leading-snug line-clamp-2">
            Creator Launchpad
          </h3>
          <span className="chip chip-rose shrink-0">Growth</span>
        </div>
        <p className="text-[12.5px] text-ink-500 leading-snug line-clamp-2">
          Go from zero to a repeatable posting system in three weeks.
        </p>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[12px] text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="size-3.5 text-ink-400" strokeWidth={1.8} />
            12 Lessons
          </span>
          <span className="inline-flex items-center gap-1.5">
            <SquareCheck className="size-3.5 text-ink-400" strokeWidth={1.8} />
            8 Tasks
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-ink-400" strokeWidth={1.8} />
            3 weeks
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden flex-1">
            <div className="h-full rounded-full bg-rose-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[11.5px] font-semibold tabular-nums shrink-0 text-ink-500">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function CurriculumAccordion() {
  const modules = [
    {
      title: "Module 1 · Foundations",
      lessons: [
        { name: "Why a posting system beats motivation", done: true, len: "6:12" },
        { name: "Find your content pillars", done: true, len: "9:48" },
      ],
    },
    {
      title: "Module 2 · The weekly loop",
      lessons: [
        { name: "Batch filming in 90 minutes", done: false, len: "12:30" },
        { name: "Writing hooks that stop the scroll", done: false, len: "8:05", locked: true },
      ],
    },
  ];
  const [open, setOpen] = useState(0);
  return (
    <div className="w-[460px] max-w-full card divide-y divide-ink-100 overflow-hidden">
      {modules.map((m, i) => {
        const isOpen = open === i;
        const doneCount = m.lessons.filter((l) => l.done).length;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex items-center gap-3 w-full px-4 py-3.5 text-left"
            >
              <span className="text-[13.5px] font-semibold text-ink-900 flex-1">{m.title}</span>
              <span className="text-[11.5px] text-ink-400 tabular-nums">
                {doneCount}/{m.lessons.length}
              </span>
              <ChevronDown
                className={cn("size-4 text-ink-400 transition-transform", isOpen && "rotate-180")}
                strokeWidth={2}
              />
            </button>
            {isOpen && (
              <ul className="px-2 pb-2">
                {m.lessons.map((l, j) => (
                  <li
                    key={j}
                    className="flex items-center gap-3 px-2.5 h-11 rounded-[10px] hover:bg-cream-100 transition-colors"
                  >
                    <span
                      className={cn(
                        "size-6 rounded-full inline-flex items-center justify-center shrink-0",
                        l.done
                          ? "bg-success-bg text-success"
                          : l.locked
                            ? "bg-cream-200 text-ink-400"
                            : "bg-rose-100 text-rose-600",
                      )}
                    >
                      {l.done ? (
                        <CircleCheck className="size-3.5" strokeWidth={2.2} />
                      ) : l.locked ? (
                        <Lock className="size-3" strokeWidth={2.2} />
                      ) : (
                        <Play className="size-3" strokeWidth={2.5} />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[13px] flex-1",
                        l.done ? "text-ink-500" : "text-ink-900",
                      )}
                    >
                      {l.name}
                    </span>
                    <span className="text-[11.5px] text-ink-400 tabular-nums">{l.len}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function VideoPlayer() {
  return (
    <div className="w-[420px] max-w-full rounded-[14px] overflow-hidden border border-ink-100 bg-ink-900">
      {/* Video area */}
      <div className="relative aspect-video bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center">
        <button
          type="button"
          aria-label="Play"
          className="size-14 rounded-full bg-white/90 hover:bg-white text-rose-600 inline-flex items-center justify-center shadow-card transition-colors"
        >
          <Play className="size-6 translate-x-0.5" strokeWidth={2.5} fill="currentColor" />
        </button>
      </div>
      {/* Controls */}
      <div className="bg-ink-900 px-3 py-2.5">
        <div className="h-1 rounded-full bg-white/20 overflow-hidden mb-2.5">
          <div className="h-full w-1/3 rounded-full bg-rose-500" />
        </div>
        <div className="flex items-center gap-3 text-white/80">
          <Play className="size-4" strokeWidth={2} fill="currentColor" />
          <Volume2 className="size-4" strokeWidth={2} />
          <span className="text-[11.5px] tabular-nums">2:14 / 6:12</span>
          <Maximize2 className="size-4 ml-auto" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
