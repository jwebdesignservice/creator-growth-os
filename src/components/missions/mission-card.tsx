"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Camera,
  CalendarDays,
  Heart,
  BarChart3,
  Wallet,
  Sparkles as ConfidenceIcon,
  Clock,
  Check,
  CheckCircle2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  Send,
  ListChecks,
  Target,
  Users,
  Star,
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

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const DIFFICULTY_LEVEL: Record<Difficulty, 1 | 2 | 3> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/** Tiny 3-bar effort meter — fills by difficulty (1–3). Neutral ink tone so it
    reads as a quiet, scannable signal without competing with the type colour. */
function EffortMeter({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-end gap-[2px]" aria-hidden>
      {([1, 2, 3] as const).map((i) => (
        <span
          key={i}
          className={cn(
            "w-[2.5px] rounded-[1px]",
            i <= level ? "bg-ink-500" : "bg-ink-200",
          )}
          style={{ height: `${3 + i * 2}px` }}
        />
      ))}
    </span>
  );
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
  const MetaIcon = meta.metaIcon;
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const completed = mission.completed;
  const progressCurrent = mission.progressCurrent ?? 0;
  const progressTarget = mission.progressTarget ?? meta.progressTarget;
  const progressLabel = mission.progressLabel ?? meta.progressLabel;
  const metaLabel = mission.metaLabel ?? meta.metaLabel;
  const metaValue = mission.metaValue ?? meta.metaValue;
  const progressPct = Math.min(
    100,
    Math.round((progressCurrent / Math.max(1, progressTarget)) * 100),
  );

  // Fill the bar 0 → target on mount (and when it changes) for a calm, one-shot
  // reveal. rAF defers the set out of the effect body (react-hooks lint-safe).
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
    setMenuOpen(false);
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
        "group relative flex flex-col rounded-[22px] border p-5 sm:p-6 transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        completed
          ? "border-ink-100 bg-cream-50/70 shadow-[0_1px_2px_rgba(26,24,22,0.03)]"
          : "border-ink-100/90 bg-gradient-to-b from-white to-cream-50/40 shadow-[0_1px_2px_rgba(26,24,22,0.04),0_10px_30px_-16px_rgba(26,24,22,0.13)] hover:-translate-y-1 hover:border-ink-200/70 hover:shadow-[0_3px_6px_rgba(26,24,22,0.05),0_22px_48px_-20px_rgba(26,24,22,0.20)]",
      )}
    >
      {/* ── Category + reward ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "relative inline-flex size-11 shrink-0 items-center justify-center rounded-[13px] shadow-[0_2px_5px_-2px_rgba(26,24,22,0.20)] ring-1 ring-inset ring-black/[0.04] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]",
              completed ? "bg-cream-200 text-ink-400" : colors.tile,
            )}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[13px] bg-gradient-to-b from-white/50 to-transparent"
            />
            {completed ? (
              <Check className="relative size-[22px]" strokeWidth={2.6} />
            ) : (
              <Icon className="relative size-[21px]" strokeWidth={1.9} />
            )}
          </span>
          <span
            className={cn(
              "truncate text-[11.5px] font-bold uppercase tracking-[0.08em]",
              completed ? "text-ink-400" : colors.text,
            )}
          >
            {meta.label}
          </span>
        </div>

        {/* reward — quiet amber chip */}
        <span
          className={cn(
            "inline-flex h-[27px] shrink-0 items-center gap-1 rounded-full px-2.5 text-[12px] font-bold tabular-nums shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ring-1",
            completed
              ? "bg-cream-100 text-ink-400 ring-ink-100"
              : "bg-gradient-to-b from-amber-50 to-amber-100/70 text-amber-700 ring-amber-200/70",
          )}
          title={`${mission.points} points`}
        >
          <Star className="-ml-0.5 size-3.5" fill="currentColor" strokeWidth={0} />
          {mission.points}
          <span className="font-medium opacity-70">pts</span>
        </span>
      </div>

      {/* ── Title + description ───────────────────────────────────────── */}
      <h3
        className={cn(
          "mt-4 text-[17px] font-bold leading-snug tracking-[-0.012em] sm:text-[18px]",
          completed
            ? "text-ink-400 line-through decoration-ink-300"
            : "text-ink-900",
        )}
      >
        {mission.title}
      </h3>
      <p
        className={cn(
          "mt-1.5 line-clamp-2 text-[13px] leading-relaxed",
          completed ? "text-ink-300" : "text-ink-500",
        )}
      >
        {mission.description}
      </p>

      {/* ── Meta: time · effort ───────────────────────────────────────── */}
      <div className="mt-4 flex items-center gap-3.5 text-[12px] text-ink-500">
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
          <Clock className="size-3.5 text-ink-400" strokeWidth={2} />
          {mission.minutes} min
        </span>
        <span className="h-3 w-px bg-ink-200" aria-hidden />
        <span
          className="inline-flex items-center gap-1.5 whitespace-nowrap"
          title={`Effort: ${DIFFICULTY_LABEL[mission.difficulty]}`}
        >
          <EffortMeter level={DIFFICULTY_LEVEL[mission.difficulty]} />
          {DIFFICULTY_LABEL[mission.difficulty]}
        </span>
      </div>

      {/* ── Progress + goal (active tasks only) ───────────────────────── */}
      {!completed && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[12px] font-medium text-ink-600">
              {progressLabel}
            </span>
            <span className="text-[12.5px] font-semibold tabular-nums text-ink-900">
              {progressCurrent}
              <span className="font-normal text-ink-400"> / {progressTarget}</span>
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
          <div className="mt-2.5 flex min-w-0 items-center gap-1.5 text-[11.5px] text-ink-400">
            <MetaIcon className="size-3.5 shrink-0" strokeWidth={1.9} />
            <span className="shrink-0 font-medium text-ink-500">{metaLabel}</span>
            <span className="shrink-0 text-ink-300">·</span>
            <span className="truncate">{metaValue}</span>
          </div>
        </div>
      )}

      {/* ── Footer: primary action + quiet secondaries ────────────────── */}
      <div className="mt-auto flex items-center gap-2 border-t border-ink-100 pt-5">
        {completed ? (
          <>
            <span className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-[12px] bg-success-bg text-[13px] font-semibold text-success shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ring-1 ring-inset ring-success/15">
              <Check className="size-4" strokeWidth={3} />
              Completed
              {mission.completed_at && (
                <span className="font-normal text-success/70">
                  · {mission.completed_at}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={complete}
              disabled={pending}
              className="h-11 cursor-pointer rounded-[12px] border border-ink-200 bg-gradient-to-b from-white to-cream-50/60 px-4 text-[12.5px] font-medium text-ink-500 shadow-[0_1px_2px_rgba(26,24,22,0.05)] transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out hover:-translate-y-px hover:text-ink-900 hover:shadow-[0_4px_10px_-4px_rgba(26,24,22,0.20)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-300 focus-visible:ring-offset-2 disabled:opacity-50"
            >
              Undo
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={complete}
              disabled={pending}
              className="relative inline-flex h-11 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-[12px] bg-gradient-to-b from-rose-500 to-rose-600 px-5 text-[13.5px] font-semibold text-white shadow-[0_1px_2px_rgba(151,56,74,0.45),0_10px_20px_-8px_rgba(185,72,92,0.55)] ring-1 ring-inset ring-white/15 transition-[transform,box-shadow,filter] duration-200 ease-out hover:-translate-y-px hover:brightness-[1.05] hover:shadow-[0_2px_4px_rgba(151,56,74,0.45),0_16px_28px_-10px_rgba(185,72,92,0.7)] active:translate-y-0 active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 disabled:opacity-70 disabled:saturate-[0.85]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent"
              />
              <span className="relative inline-flex items-center gap-2">
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" strokeWidth={2.2} />
                    Marking…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" strokeWidth={2} />
                    Mark complete
                  </>
                )}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved" : "Save for later"}
              title={saved ? "Saved" : "Save for later"}
              className={cn(
                "inline-flex size-11 cursor-pointer items-center justify-center rounded-[12px] border shadow-[0_1px_2px_rgba(26,24,22,0.05)] transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out hover:-translate-y-px hover:shadow-[0_4px_10px_-4px_rgba(26,24,22,0.20)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2",
                saved
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-ink-200 bg-gradient-to-b from-white to-cream-50/60 text-ink-400 hover:border-rose-200/70 hover:text-rose-600",
              )}
            >
              <Bookmark
                className="size-4"
                strokeWidth={1.9}
                fill={saved ? "currentColor" : "none"}
              />
            </button>

            {canDelete && onDelete && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="More options"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                  className="inline-flex size-11 cursor-pointer items-center justify-center rounded-[12px] border border-ink-200 bg-gradient-to-b from-white to-cream-50/60 text-ink-400 shadow-[0_1px_2px_rgba(26,24,22,0.05)] transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-out hover:-translate-y-px hover:text-ink-700 hover:shadow-[0_4px_10px_-4px_rgba(26,24,22,0.20)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-300 focus-visible:ring-offset-2"
                >
                  <MoreHorizontal className="size-4" strokeWidth={2} />
                </button>
                {menuOpen && (
                  <>
                    <button
                      type="button"
                      aria-hidden
                      tabIndex={-1}
                      onClick={() => setMenuOpen(false)}
                      className="fixed inset-0 z-40 cursor-default"
                    />
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+6px)] z-50 w-[168px] overflow-hidden rounded-[12px] border border-ink-100 bg-white py-1.5 shadow-card"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={handleDelete}
                        disabled={pending}
                        className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                      >
                        <Trash2 className="size-4" strokeWidth={2} />
                        Delete task
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
