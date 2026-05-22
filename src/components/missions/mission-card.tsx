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
  Send,
  ListChecks,
  Target,
  Users,
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
   the type chip, the icon tile (bg + icon color), and the card's left accent
   stripe — so types are instantly distinguishable at a glance.
     posting      → rose       monetization → green
     strategy     → amber      confidence   → teal
     engagement   → violet     performance  → blue                         */
type TypeColors = { chip: string; tile: string; accent: string };

const TYPE_COLORS: Record<MissionType, TypeColors> = {
  posting:      { chip: "bg-rose-100 text-rose-700",   tile: "bg-rose-100 text-rose-600",   accent: "bg-rose-400" },
  strategy:     { chip: "bg-[#F6ECD3] text-[#8A6A1F]", tile: "bg-[#F6ECD3] text-[#A87D24]", accent: "bg-[#E5B94E]" },
  engagement:   { chip: "bg-[#EFE7F7] text-[#6B49A0]", tile: "bg-[#EFE7F7] text-[#7C5BAE]", accent: "bg-[#A98BD0]" },
  performance:  { chip: "bg-[#E3EDF8] text-[#355F90]", tile: "bg-[#E3EDF8] text-[#3E6CA8]", accent: "bg-[#7BA6D6]" },
  monetization: { chip: "bg-[#E2F0E5] text-[#2C7D47]", tile: "bg-[#E2F0E5] text-[#2F8A4E]", accent: "bg-[#5FB87A]" },
  confidence:   { chip: "bg-[#DCF0EE] text-[#287B73]", tile: "bg-[#DCF0EE] text-[#2E8A82]", accent: "bg-[#6FBDB4]" },
};

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

type Props = {
  mission: Mission;
  onToggle: (id: string, next: boolean) => Promise<unknown> | void;
};

export function MissionCard({ mission, onToggle }: Props) {
  const meta = TYPE_META[mission.type];
  const colors = TYPE_COLORS[mission.type];
  const Icon = meta.icon;
  const ProgressIcon = meta.progressIcon;
  const MetaIcon = meta.metaIcon;
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const completed = mission.completed;
  const progressCurrent = mission.progressCurrent ?? 0;
  const progressTarget = mission.progressTarget ?? meta.progressTarget;
  const progressLabel = mission.progressLabel ?? meta.progressLabel;
  const metaLabel = mission.metaLabel ?? meta.metaLabel;
  const metaValue = mission.metaValue ?? meta.metaValue;

  const complete = () => {
    startTransition(async () => {
      await onToggle(mission.id, !completed);
    });
  };

  return (
    <div
      className={cn(
        "group relative card overflow-hidden flex flex-col p-5 sm:p-6 transition-shadow hover:shadow-card",
        completed && "bg-cream-100/60",
      )}
    >
      {/* Left accent stripe — tinted by mission type */}
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1.5", colors.accent)}
      />

      {/* Saved indicator (top-right) */}
      {saved && !completed && (
        <Bookmark
          className="absolute top-4 right-4 size-[18px] text-rose-600"
          fill="currentColor"
          strokeWidth={1.5}
          aria-hidden
        />
      )}

      {/* Header — icon tile + chips + points */}
      <div className="flex items-center gap-2.5 flex-wrap pr-7">
        <span
          className={cn(
            "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
            colors.tile,
          )}
        >
          <Icon className="size-[18px]" strokeWidth={1.9} />
        </span>
        <span className={cn("chip font-semibold", colors.chip)}>
          {meta.label}
        </span>
        <span className="chip bg-cream-100 text-ink-500 inline-flex items-center gap-1">
          <Clock className="size-3" strokeWidth={2} />
          {mission.minutes} min
        </span>
        <span className="chip bg-cream-100 text-ink-500">
          {DIFFICULTY_LABEL[mission.difficulty]}
        </span>
        <span className="ml-auto text-[12.5px] font-semibold text-rose-600 tabular-nums">
          +{mission.points} pts
        </span>
      </div>

      {/* Title + description */}
      <h3
        className={cn(
          "mt-4 text-[19px] sm:text-[20px] font-bold text-ink-900 leading-snug",
          completed && "line-through text-ink-400",
        )}
      >
        {mission.title}
      </h3>
      <p
        className={cn(
          "mt-1.5 text-[13px] text-ink-500 leading-relaxed line-clamp-2",
          completed && "text-ink-300",
        )}
      >
        {mission.description}
      </p>

      <div className="my-4 h-px bg-ink-100" />

      {/* Stats row — progress + goal/focus */}
      <div className="grid grid-cols-2">
        <div className="flex items-center gap-2.5 pr-4 min-w-0">
          <span className="size-9 rounded-full border border-ink-100 inline-flex items-center justify-center text-ink-500 shrink-0">
            <ProgressIcon className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <div className="text-[15px] font-bold text-ink-900 tabular-nums leading-tight">
              {progressCurrent} / {progressTarget}
            </div>
            <div className="text-[12px] text-ink-500 truncate">{progressLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 pl-4 border-l border-ink-100 min-w-0">
          <span className="size-9 rounded-full border border-ink-100 inline-flex items-center justify-center text-ink-500 shrink-0">
            <MetaIcon className="size-4" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] text-ink-400 leading-tight">{metaLabel}</div>
            <div className="text-[12.5px] font-semibold text-ink-900 truncate">
              {metaValue}
            </div>
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="mt-5 flex items-center gap-2">
        {completed ? (
          <>
            <span className="inline-flex items-center gap-1.5 chip chip-success h-11 px-4 flex-1 justify-center">
              <Check className="size-3.5" strokeWidth={3} />
              Completed
              {mission.completed_at && (
                <span className="text-success/80">· {mission.completed_at}</span>
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
              className="flex-1 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
            >
              <CheckCircle2 className="size-4" strokeWidth={2} />
              {pending ? "Saving…" : "Mark Complete"}
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
                  : "border-ink-200 hover:bg-cream-100 text-ink-500 hover:text-rose-600",
              )}
            >
              <Bookmark
                className="size-4"
                strokeWidth={1.8}
                fill={saved ? "currentColor" : "none"}
              />
            </button>
            <button
              type="button"
              aria-label="More options"
              className="size-11 rounded-[12px] border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="size-4" strokeWidth={2} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
