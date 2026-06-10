"use client";

import { useState, useTransition } from "react";
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
  const ProgressIcon = meta.progressIcon;
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
        "group card rounded-[20px] border border-ink-100 p-5 sm:p-6 flex flex-col transition-all duration-200 hover:border-ink-200 hover:shadow-card",
        completed && "bg-cream-50",
      )}
    >
      {/* Header — icon tile · category/meta line · points */}
      <div className="flex items-start gap-3.5">
        <span
          className={cn(
            "size-12 rounded-[14px] inline-flex items-center justify-center shrink-0",
            colors.tile,
          )}
        >
          <Icon className="size-[22px]" strokeWidth={1.9} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            {/* Category · time · difficulty — one quiet line, no chip clutter */}
            <div className="flex items-center gap-2 min-w-0 text-[11.5px] leading-none">
              <span
                className={cn(
                  "font-semibold uppercase tracking-[0.07em]",
                  completed ? "text-ink-400" : colors.text,
                )}
              >
                {meta.label}
              </span>
              <span className="size-[3px] rounded-full bg-ink-300 shrink-0" />
              <span className="inline-flex items-center gap-1 text-ink-500 whitespace-nowrap">
                <Clock className="size-3 text-ink-400" strokeWidth={2} />
                {mission.minutes} min
              </span>
              <span className="size-[3px] rounded-full bg-ink-300 shrink-0" />
              <span className="text-ink-500 whitespace-nowrap">
                {DIFFICULTY_LABEL[mission.difficulty]}
              </span>
            </div>

            {/* Points */}
            <span className="shrink-0 inline-flex items-baseline gap-1 text-[13px] font-bold text-ink-800 tabular-nums leading-none">
              <Star
                className="size-3.5 self-center text-amber-400"
                fill="currentColor"
                strokeWidth={0}
              />
              {mission.points}
              <span className="text-[11px] font-medium text-ink-400">pts</span>
            </span>
          </div>

          <h3
            className={cn(
              "mt-2 text-[17px] sm:text-[18px] font-bold tracking-[-0.01em] text-ink-900 leading-snug",
              completed && "line-through text-ink-400",
            )}
          >
            {mission.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      <p
        className={cn(
          "mt-3 text-[13px] text-ink-500 leading-relaxed line-clamp-2",
          completed && "text-ink-300",
        )}
      >
        {mission.description}
      </p>

      {/* Progress */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-600">
            <ProgressIcon className="size-3.5 text-ink-400" strokeWidth={2} />
            {progressLabel}
          </span>
          <span className="text-[12.5px] font-semibold text-ink-900 tabular-nums">
            {progressCurrent}
            <span className="text-ink-400 font-normal"> / {progressTarget}</span>
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", colors.accent)}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Goal / focus — quiet footnote */}
      <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-400 min-w-0">
        <MetaIcon className="size-3.5 shrink-0" strokeWidth={1.9} />
        <span className="font-medium text-ink-500 shrink-0">{metaLabel}</span>
        <span className="text-ink-300 shrink-0">·</span>
        <span className="truncate">{metaValue}</span>
      </div>

      {/* Actions — pinned to the bottom so cards align in a grid */}
      <div className="mt-auto pt-5 flex items-center gap-2">
        {completed ? (
          <>
            <span className="flex-1 inline-flex items-center justify-center gap-1.5 h-11 rounded-[12px] bg-success-bg text-success text-[13px] font-semibold">
              <Check className="size-4" strokeWidth={3} />
              Completed
              {mission.completed_at && (
                <span className="font-normal text-success/75">
                  · {mission.completed_at}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={complete}
              disabled={pending}
              className="h-11 px-4 rounded-[12px] border border-ink-200 hover:bg-cream-100 text-[12.5px] font-medium text-ink-600 hover:text-ink-900 transition-colors disabled:opacity-50 cursor-pointer"
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
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13.5px] font-semibold shadow-sm shadow-rose-600/10 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="size-4" strokeWidth={2} />
              {pending ? "Saving…" : "Mark complete"}
            </button>
            <button
              type="button"
              onClick={() => setSaved((v) => !v)}
              aria-pressed={saved}
              aria-label={saved ? "Remove from saved" : "Save mission for later"}
              className={cn(
                "size-11 rounded-[12px] border inline-flex items-center justify-center transition-colors cursor-pointer",
                saved
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-ink-200 hover:bg-cream-100 text-ink-400 hover:text-rose-600",
              )}
            >
              <Bookmark
                className="size-4"
                strokeWidth={1.8}
                fill={saved ? "currentColor" : "none"}
              />
            </button>
            {canDelete && onDelete ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label="More options"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                  className="size-11 rounded-[12px] border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-400 hover:text-ink-900 transition-colors cursor-pointer"
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
            ) : (
              <button
                type="button"
                aria-label="More options"
                className="size-11 rounded-[12px] border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-400 hover:text-ink-900 transition-colors cursor-pointer"
              >
                <MoreHorizontal className="size-4" strokeWidth={2} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
