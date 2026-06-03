/* Badges ───────────────────────────────────────────────────────────────
   Status chips, tags, count badges. The colour set mirrors the platform's
   real category tones (task=rose, program=violet, community=indigo,
   event=amber, system=teal) plus neutral and status greens, so a badge
   here maps 1:1 to what ships in the app.
   ───────────────────────────────────────────────────────────────────── */

import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const COLORS = {
  rose:    "bg-rose-100 text-rose-700",
  violet:  "bg-violet-100 text-violet-700",
  indigo:  "bg-indigo-100 text-indigo-700",
  emerald: "bg-emerald-100 text-emerald-700",
  amber:   "bg-amber-100 text-amber-700",
  teal:    "bg-teal-100 text-teal-700",
  sky:     "bg-sky-100 text-sky-700",
  ink:     "bg-ink-100 text-ink-700",
  outline: "bg-white border border-ink-200 text-ink-600",
} as const;

const DOT: Record<string, string> = {
  rose: "bg-rose-500",
  violet: "bg-violet-500",
  indigo: "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  teal: "bg-teal-500",
  sky: "bg-sky-500",
  ink: "bg-ink-400",
  outline: "bg-ink-400",
};

export function Badge({
  color = "rose",
  size = "md",
  dot = false,
  children = "Badge",
}: {
  color?: keyof typeof COLORS;
  size?: "sm" | "md";
  dot?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        size === "sm" ? "h-5 px-2 text-[10.5px]" : "h-6 px-2.5 text-[11.5px]",
        COLORS[color],
      )}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", DOT[color])} />}
      {children}
    </span>
  );
}

export function BadgeWithDot() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge color="emerald" dot>Connected</Badge>
      <Badge color="amber" dot>Pending</Badge>
      <Badge color="ink" dot>Offline</Badge>
    </div>
  );
}

export function CountBadge() {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold text-white bg-rose-600 tabular-nums">
        12
      </span>
      <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold text-white bg-rose-600 tabular-nums">
        99+
      </span>
      <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full text-[11px] font-bold text-ink-600 bg-ink-100 tabular-nums">
        3
      </span>
    </div>
  );
}

export function BadgeRow() {
  return (
    <div className="flex flex-col gap-3">
      {/* Category tones — 1:1 with the app's notification / content categories */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="rose">Task</Badge>
        <Badge color="violet">Program</Badge>
        <Badge color="indigo">Community</Badge>
        <Badge color="amber">Event</Badge>
        <Badge color="teal">System</Badge>
      </div>
      {/* Sizes + neutral + removable tag */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge color="emerald" dot>Live</Badge>
        <Badge color="ink" size="sm">Draft</Badge>
        <Badge color="outline" size="sm">Beta</Badge>
        <span className="inline-flex items-center gap-1 h-6 pl-2.5 pr-1.5 rounded-full text-[11.5px] font-semibold bg-rose-100 text-rose-700">
          Monetization
          <button
            type="button"
            aria-label="Remove filter"
            className="inline-flex items-center justify-center size-4 rounded-full hover:bg-rose-200/70 transition-colors cursor-pointer"
          >
            <X className="size-3" strokeWidth={2.4} />
          </button>
        </span>
      </div>
    </div>
  );
}
