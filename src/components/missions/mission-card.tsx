"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Camera,
  Lightbulb,
  Heart,
  BarChart3,
  Wallet,
  Sparkles as ConfidenceIcon,
  Clock,
  ArrowRight,
  Check,
  Link as LinkIcon,
  Bookmark,
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
};

const TYPE_META: Record<MissionType, { label: string; icon: LucideIcon; tone: "rose" | "gold" | "success" | "ink" | "warm" }> = {
  posting: { label: "Posting", icon: Camera, tone: "rose" },
  strategy: { label: "Strategy", icon: Lightbulb, tone: "gold" },
  engagement: { label: "Engagement", icon: Heart, tone: "rose" },
  performance: { label: "Performance", icon: BarChart3, tone: "ink" },
  monetization: { label: "Monetization", icon: Wallet, tone: "success" },
  confidence: { label: "Confidence", icon: ConfidenceIcon, tone: "warm" },
};

const TONE_CHIP: Record<"rose" | "gold" | "success" | "ink" | "warm", string> = {
  rose: "bg-rose-100 text-rose-700",
  gold: "bg-[#F6ECD3] text-[#8A6A1F]",
  success: "bg-success-bg text-success",
  ink: "bg-ink-100 text-ink-700",
  warm: "bg-cream-200 text-ink-700",
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
  const Icon = meta.icon;
  const [pending, startTransition] = useTransition();

  const complete = () => {
    startTransition(async () => {
      await onToggle(mission.id, !mission.completed);
    });
  };

  return (
    <div
      className={cn(
        "card p-5 flex flex-col gap-3 relative transition-opacity",
        mission.completed && "bg-cream-100/60",
      )}
    >
      {/* Header chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={cn(
            "chip inline-flex items-center gap-1",
            TONE_CHIP[meta.tone],
          )}
        >
          <Icon className="size-3" strokeWidth={2} />
          {meta.label}
        </span>
        <span className="chip bg-cream-100 text-ink-500 inline-flex items-center gap-1">
          <Clock className="size-3" strokeWidth={2} />
          {mission.minutes} min
        </span>
        <span className="chip bg-cream-100 text-ink-500">
          {DIFFICULTY_LABEL[mission.difficulty]}
        </span>
        <span className="ml-auto text-[11px] text-ink-500 font-medium">
          +{mission.points} pts
        </span>
      </div>

      {/* Body */}
      <div>
        <h3
          className={cn(
            "font-semibold text-ink-900 leading-snug text-[15.5px] mb-1",
            mission.completed && "line-through text-ink-400",
          )}
        >
          {mission.title}
        </h3>
        <p
          className={cn(
            "text-[12.5px] text-ink-500 leading-snug line-clamp-2",
            mission.completed && "text-ink-300",
          )}
        >
          {mission.description}
        </p>
      </div>

      {/* Linked */}
      {mission.linked && !mission.completed && (
        <Link
          href={mission.linked.href}
          className="inline-flex items-center gap-1.5 text-[12px] text-rose-600 hover:text-rose-700 font-medium"
        >
          <LinkIcon className="size-3" strokeWidth={2} />
          Linked: {mission.linked.label}
        </Link>
      )}

      {/* Footer */}
      <div className="flex items-center gap-2 mt-1">
        {mission.completed ? (
          <div className="flex items-center gap-2 w-full">
            <span className="inline-flex items-center gap-1.5 chip chip-success">
              <Check className="size-3" strokeWidth={3} />
              Completed
              {mission.completed_at && (
                <span className="text-success/80 ml-1">
                  · {mission.completed_at}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={complete}
              disabled={pending}
              className="ml-auto text-[12px] text-ink-500 hover:text-ink-900 underline-offset-4 hover:underline disabled:opacity-50 cursor-pointer"
            >
              Undo
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={complete}
              disabled={pending}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              {pending ? "Saving…" : "Mark Complete"}
              {!pending && <ArrowRight className="size-3.5" strokeWidth={2} />}
            </button>
            <button
              type="button"
              className="size-10 rounded-[12px] border border-ink-200 hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-rose-600 transition-colors cursor-pointer"
              aria-label="Save mission for later"
            >
              <Bookmark className="size-4" strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
