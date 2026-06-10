"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Camera,
  CalendarDays,
  Heart,
  BarChart3,
  Wallet,
  Sparkles as ConfidenceIcon,
  CheckCircle2,
  ArrowRight,
  Bookmark,
  Trash2,
  Send,
  ListChecks,
  Target,
  Users,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type MissionType =
  | "posting"
  | "strategy"
  | "engagement"
  | "performance"
  | "monetization"
  | "confidence";

export type Difficulty = "easy" | "medium" | "hard";

export type Mission = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  difficulty: Difficulty;
  minutes: number;
  points: number;
  linked?: { label: string; href: string };
  completed: boolean;
  completed_at?: string | null;
  /* Optional richer metadata — falls back to per-type defaults below. */
  progressCurrent?: number;
  progressTarget?: number;
  progressLabel?: string;
  metaLabel?: string;
  metaValue?: string;
};

type TypeMeta = {
  label: string;
  icon: LucideIcon;
  progressIcon: LucideIcon;
  progressLabel: string;
  progressTarget: number;
  metaIcon: LucideIcon;
  metaLabel: string;
  metaValue: string;
};

const TYPE_META: Record<MissionType, TypeMeta> = {
  posting: {
    label: "Posting",
    icon: Camera,
    progressIcon: Send,
    progressLabel: "Posts shared",
    progressTarget: 3,
    metaIcon: Target,
    metaLabel: "Goal",
    metaValue: "Grow your reach",
  },
  strategy: {
    label: "Content Strategy",
    icon: CalendarDays,
    progressIcon: ListChecks,
    progressLabel: "Ideas planned",
    progressTarget: 3,
    metaIcon: Users,
    metaLabel: "Focus",
    metaValue: "Audience engagement",
  },
  engagement: {
    label: "Engagement",
    icon: Heart,
    progressIcon: Send,
    progressLabel: "Accounts engaged",
    progressTarget: 5,
    metaIcon: Users,
    metaLabel: "Goal",
    metaValue: "Build community",
  },
  performance: {
    label: "Performance",
    icon: BarChart3,
    progressIcon: ListChecks,
    progressLabel: "Reports reviewed",
    progressTarget: 1,
    metaIcon: Target,
    metaLabel: "Focus",
    metaValue: "Data-driven growth",
  },
  monetization: {
    label: "Monetization",
    icon: Wallet,
    progressIcon: Send,
    progressLabel: "Outreach sent",
    progressTarget: 3,
    metaIcon: Target,
    metaLabel: "Goal",
    metaValue: "Build partnerships",
  },
  confidence: {
    label: "Confidence",
    icon: ConfidenceIcon,
    progressIcon: ListChecks,
    progressLabel: "Reflections done",
    progressTarget: 1,
    metaIcon: Users,
    metaLabel: "Focus",
    metaValue: "Mindset & consistency",
  },
};

/* Per-type color system. Each mission type gets its own distinct hue across
   the icon tile (bg + icon color), the category label text, and the progress
   bar — so types are instantly distinguishable without shouting.
     posting      → rose       monetization → green
     strategy     → amber      confidence   → teal
     engagement   → violet     performance  → blue                         */
type TypeColors = { tile: string; accent: string; text: string };

const TYPE_COLORS: Record<MissionType, TypeColors> = {
  posting:      { tile: "bg-rose-100 text-rose-600",   accent: "bg-rose-500",   text: "text-rose-600" },
  strategy:     { tile: "bg-[#F6ECD3] text-[#A87D24]", accent: "bg-[#E5B94E]", text: "text-[#A87D24]" },
  engagement:   { tile: "bg-[#EFE7F7] text-[#7C5BAE]", accent: "bg-[#A98BD0]", text: "text-[#7C5BAE]" },
  performance:  { tile: "bg-[#E3EDF8] text-[#3E6CA8]", accent: "bg-[#7BA6D6]", text: "text-[#3E6CA8]" },
  monetization: { tile: "bg-[#E2F0E5] text-[#2F8A4E]", accent: "bg-[#5FB87A]", text: "text-[#2F8A4E]" },
  confidence:   { tile: "bg-[#DCF0EE] text-[#2E8A82]", accent: "bg-[#6FBDB4]", text: "text-[#2E8A82]" },
};

/** Stable ticket-style code (TSK-10…TSK-99) derived from the mission id. */
function taskCode(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return `TSK-${(h % 90) + 10}`;
}


type Props = {
  mission: Mission;
  onToggle: (id: string, next: boolean) => Promise<unknown> | void;
  /** Admin-only: permanently delete the task. */
  onDelete?: (id: string) => Promise<unknown> | void;
  canDelete?: boolean;
};

export function MissionCard({ mission, onToggle, onDelete, canDelete }: Props) {
  const meta = TYPE_META[mission.type];
  const colors = TYPE_COLORS[mission.type];
  const Icon = meta.icon;
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const completed = mission.completed;
  const progressCurrent = mission.progressCurrent ?? 0;
  const progressTarget = mission.progressTarget ?? meta.progressTarget;
  const progressLabel = mission.progressLabel ?? meta.progressLabel;
  // Task data sometimes carries raw markdown ("**Objective:** …") — strip the
  // asterisks so the card never shows formatting characters.
  const desc = mission.description.replace(/\*\*/g, "");
  const progressPct = Math.min(
    100,
    Math.round((progressCurrent / Math.max(1, progressTarget)) * 100),
  );

  // Fill the bar 0 → value on mount for a calm, one-shot reveal. rAF defers
  // the set out of the effect body (react-hooks lint-safe).
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setBarWidth(progressPct));
    return () => cancelAnimationFrame(raf);
  }, [progressPct]);
  const complete = () => {
    startTransition(async () => {
      await onToggle(mission.id, !completed);
    });
  };

  const handleDelete = () => {
    if (!onDelete) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this task? This can't be undone.")
    )
      return;
    startTransition(async () => {
      await onDelete(mission.id);
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[20px] border p-5 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:p-6",
        completed
          ? "border-ink-100 bg-cream-50/70 shadow-[0_1px_2px_rgba(26,24,22,0.03)]"
          : "border-rose-200/70 bg-white shadow-[0_1px_2px_rgba(26,24,22,0.04),0_10px_30px_-16px_rgba(26,24,22,0.13)] hover:-translate-y-1 hover:border-rose-200 hover:shadow-[0_3px_6px_rgba(26,24,22,0.05),0_22px_48px_-20px_rgba(185,72,92,0.22)]",
      )}
    >
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* ── Header: ticket code + quick actions ────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "inline-flex size-7 shrink-0 items-center justify-center rounded-[8px] ring-1 ring-inset ring-black/[0.04]",
                completed ? "bg-cream-200 text-ink-400" : colors.tile,
              )}
            >
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <span
              className={cn(
                "truncate font-mono text-[13px] font-bold tracking-wide",
                completed ? "text-ink-400" : "text-rose-700",
              )}
            >
              {taskCode(mission.id)}
            </span>
          </span>

        </div>

        {/* ── Title + rose description ───────────────────────────────── */}
        <h3
          className={cn(
            "mt-3.5 text-[18px] font-bold leading-snug tracking-[-0.014em] sm:text-[19px]",
            completed
              ? "text-ink-400 line-through decoration-ink-300"
              : "text-ink-900",
          )}
        >
          {mission.title}
        </h3>
        <p
          className={cn(
            "mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed",
            completed ? "text-ink-300" : "text-rose-700/80",
          )}
        >
          {desc}
        </p>

        {/* ── Task progress — labeled bar + sub-task dots (reference) ── */}
        {!completed && (
          <>
            <div className="my-4 border-t border-dashed border-rose-200/70" aria-hidden />
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]">
                  <span className="text-ink-400">Task </span>
                  <span className="text-ink-700">progress</span>
                </span>
                <span className="text-[13px] font-bold tabular-nums text-ink-900">
                  {progressPct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-cream-200 shadow-[inset_0_1px_2px_rgba(26,24,22,0.09)] ring-1 ring-inset ring-ink-100/50">
                <div
                  className={cn(
                    "relative h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    colors.accent,
                  )}
                  style={{ width: `${barWidth}%` }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/35 to-transparent"
                  />
                </div>
              </div>
              {/* sub-task dots — one per step, filled as you go */}
              <div className="mt-2.5 flex items-center gap-2.5">
                <span className="flex items-center gap-1" aria-hidden>
                  {Array.from(
                    { length: Math.min(progressTarget, 6) },
                    (_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "size-2.5 rounded-full transition-colors",
                          i < progressCurrent
                            ? colors.accent
                            : "bg-cream-200 ring-1 ring-inset ring-ink-200/60",
                        )}
                      />
                    ),
                  )}
                </span>
                <span className="min-w-0 truncate font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-ink-500">
                  {progressLabel}:{" "}
                  <span className="tabular-nums text-ink-700">
                    {progressCurrent}/{progressTarget}
                  </span>
                </span>
              </div>
            </div>
          </>
        )}

        {/* ── Footer: summary left, /programs-style CTA pill right ────── */}
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-dashed border-rose-200/70 pt-4">
          {completed ? (
            <>
              <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] font-semibold text-success">
                <CheckCircle2 className="size-3.5 shrink-0" strokeWidth={2.2} />
                Completed
                {mission.completed_at && (
                  <span className="truncate font-normal text-success/70">
                    · {mission.completed_at}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={complete}
                disabled={pending}
                className="inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-cream-100 px-3.5 text-[12.5px] font-semibold text-ink-700 ring-1 ring-inset ring-ink-200/90 transition-colors duration-200 hover:bg-ink-900 hover:text-white hover:ring-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-300 focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {pending && (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />
                )}
                Undo
              </button>
            </>
          ) : (
            <>
              {/* quiet circular secondaries (reference's outline icon row) */}
              <span className="flex shrink-0 items-center gap-1.5">
                {canDelete && onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={pending}
                    aria-label="Delete task"
                    title="Delete task"
                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-full border border-rose-200 bg-white text-rose-500 shadow-[0_1px_2px_rgba(26,24,22,0.05)] transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50"
                  >
                    <Trash2 className="size-4" strokeWidth={1.9} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSaved((v) => !v)}
                  aria-pressed={saved}
                  aria-label={saved ? "Remove from saved" : "Save for later"}
                  title={saved ? "Saved" : "Save for later"}
                  className={cn(
                    "inline-flex size-9 cursor-pointer items-center justify-center rounded-full border bg-white shadow-[0_1px_2px_rgba(26,24,22,0.05)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
                    saved
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-ink-200 text-ink-400 hover:border-rose-200 hover:text-rose-600",
                  )}
                >
                  <Bookmark
                    className="size-4"
                    strokeWidth={1.9}
                    fill={saved ? "currentColor" : "none"}
                  />
                </button>
              </span>
              <button
                type="button"
                onClick={complete}
                disabled={pending}
                className="group/cta inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-rose-50 px-3.5 text-[12.5px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200/80 transition-colors duration-200 hover:bg-rose-600 hover:text-white hover:ring-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {pending && (
                  <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />
                )}
                Mark complete
                <ArrowRight
                  className="size-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5"
                  strokeWidth={2.5}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
