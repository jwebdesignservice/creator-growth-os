/* Missions ──────────────────────────────────────────────────────────────
   Gamification surfaces — the mission card (with progress + complete
   toggle), the weekly streak card, and an XP / level reward bar. Mirrors
   src/components/missions/{mission-card,streak-card}.tsx.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import {
  Camera,
  Clock,
  Target,
  Send,
  Bookmark,
  Ellipsis,
  CircleCheck,
  Flame,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/cn";

export function MissionCard() {
  const [completed, setCompleted] = useState(false);
  return (
    <div
      className={cn(
        "group relative card overflow-hidden flex flex-col p-5 w-[420px] max-w-full",
        completed && "bg-cream-100/60",
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-rose-400" />

      <div className="flex items-center gap-2.5 flex-wrap pr-2">
        <span className="size-9 rounded-[10px] inline-flex items-center justify-center shrink-0 bg-rose-100 text-rose-600">
          <Camera className="size-[18px]" strokeWidth={1.9} />
        </span>
        <span className="chip font-semibold bg-rose-100 text-rose-700">Posting</span>
        <span className="chip bg-cream-100 text-ink-500 inline-flex items-center gap-1">
          <Clock className="size-3" strokeWidth={2} />
          15 min
        </span>
        <span className="chip bg-cream-100 text-ink-500">Easy</span>
        <span className="ml-auto text-[12.5px] font-semibold text-rose-600 tabular-nums">+50 pts</span>
      </div>

      <h3
        className={cn(
          "mt-4 text-[19px] font-bold text-ink-900 leading-snug",
          completed && "line-through text-ink-400",
        )}
      >
        Post 3 times this week
      </h3>
      <p
        className={cn(
          "mt-1.5 text-[13px] text-ink-500 leading-relaxed",
          completed && "text-ink-300",
        )}
      >
        Share three pieces of content to build momentum and grow your reach.
      </p>

      <div className="my-4 h-px bg-ink-100" />

      <div className="grid grid-cols-2">
        <div className="flex items-center gap-2.5 pr-4 min-w-0">
          <span className="size-9 rounded-full border border-ink-100 inline-flex items-center justify-center text-ink-500 shrink-0">
            <Send className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-ink-900 tabular-nums leading-tight">2 / 3</div>
            <div className="text-[12px] text-ink-500 truncate">Posts shared</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 pl-4 border-l border-ink-100 min-w-0">
          <span className="size-9 rounded-full border border-ink-100 inline-flex items-center justify-center text-ink-500 shrink-0">
            <Target className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] text-ink-400 leading-tight">Goal</div>
            <div className="text-[12.5px] font-semibold text-ink-900 truncate">Grow your reach</div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        {completed ? (
          <>
            <span className="inline-flex items-center gap-1.5 chip chip-success h-11 px-4 flex-1 justify-center">
              <CircleCheck className="size-4" strokeWidth={2.2} />
              Completed
            </span>
            <button
              type="button"
              onClick={() => setCompleted(false)}
              className="h-11 px-4 rounded-[12px] border border-ink-200 hover:bg-cream-100 text-[12.5px] font-medium text-ink-500 hover:text-ink-900 transition-colors"
            >
              Undo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setCompleted(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold transition-colors"
            >
              <CircleCheck className="size-4" strokeWidth={2} />
              Mark Complete
            </button>
            <button
              type="button"
              aria-label="Save mission"
              className="size-11 rounded-[12px] border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-rose-600 transition-colors"
            >
              <Bookmark className="size-4" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              aria-label="More options"
              className="size-11 rounded-[12px] border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 transition-colors"
            >
              <Ellipsis className="size-4" strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function StreakCard() {
  const streak = 5;
  const weekChecks = [true, true, true, true, true, false, false];
  const DAY = ["M", "T", "W", "T", "F", "S", "S"];
  return (
    <div className="card p-4 w-[280px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13.5px] font-semibold text-ink-900">Daily Streak</div>
        <span className="inline-flex items-center gap-1 text-rose-600 font-semibold text-[13px]">
          <Flame className="size-3.5" fill="currentColor" strokeWidth={1.6} />
          {streak}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-3">
        {DAY.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "size-7 rounded-full inline-flex items-center justify-center text-[11px] font-semibold",
                weekChecks[i]
                  ? "bg-rose-500 text-white"
                  : "bg-cream-100 border border-ink-100 text-ink-400",
              )}
            >
              {weekChecks[i] ? "✓" : label}
            </span>
            <span className="text-[9.5px] text-ink-400 uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </div>
      <p className="text-[11.5px] text-ink-500 leading-snug">
        Don&apos;t break the chain — finish today&apos;s missions to keep your streak alive.
      </p>
    </div>
  );
}

export function RewardBar() {
  const xp = 320;
  const max = 500;
  const level = 4;
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <div className="flex items-center justify-between mb-2.5">
        <span className="inline-flex items-center gap-2">
          <span className="size-9 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center">
            <Zap className="size-[18px]" strokeWidth={1.9} fill="currentColor" />
          </span>
          <span className="text-[14px] font-bold text-ink-900">Level {level}</span>
        </span>
        <span className="text-[12px] text-ink-500 tabular-nums">
          {xp} / {max} XP
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-cream-200 overflow-hidden">
        <div className="h-full rounded-full bg-rose-500" style={{ width: `${(xp / max) * 100}%` }} />
      </div>
      <p className="text-[11.5px] text-ink-500 mt-2">
        {max - xp} XP to Level {level + 1}
      </p>
    </div>
  );
}
