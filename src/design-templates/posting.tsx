/* Posting ───────────────────────────────────────────────────────────────
   Project-specific elements from the content-calendar / posting feature:
   the premium platform glyphs, the calendar Post Card, the clickable
   pipeline Status Pill, and the 4-phase Pipeline Progress bar.

   These mirror the live components in src/components/posting/* but are
   pure presentational demos (hardcoded data, no server actions) so they
   can live in the gallery sketchpad safely.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  Clock,
  CheckCircle2,
  Lightbulb,
  PenLine,
  Scissors,
  Send,
  Check,
  ChevronDown,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformGlyph } from "@/components/posting/platform-glyphs";

// ─────────────────────────────────────────────────────────────────────────────
// Platform glyphs — the real, full-colour brand marks reused straight from the
// app (src/components/posting/platform-glyphs.tsx).
// ─────────────────────────────────────────────────────────────────────────────

export function PlatformGlyphs() {
  const platforms = [
    { key: "instagram", label: "Instagram" },
    { key: "tiktok", label: "TikTok" },
    { key: "youtube", label: "YouTube" },
    { key: "snapchat", label: "Snapchat" },
    { key: "linkedin", label: "LinkedIn" },
  ] as const;
  return (
    <div className="flex items-end gap-6">
      {platforms.map((p) => (
        <div key={p.key} className="flex flex-col items-center gap-2">
          <PlatformGlyph platform={p.key} className="size-10" />
          <span className="text-[11px] font-medium text-ink-500">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline status model — shared by the Post Card + Status Pill.
// ─────────────────────────────────────────────────────────────────────────────

type Status =
  | "idea"
  | "planned"
  | "scripted"
  | "filmed"
  | "edited"
  | "posted"
  | "reviewed";

const FLOW: Status[] = [
  "idea",
  "planned",
  "scripted",
  "filmed",
  "edited",
  "posted",
  "reviewed",
];

const STATUS_META: Record<
  Status,
  { label: string; cls: string; icon: LucideIcon }
> = {
  idea: { label: "Idea", cls: "bg-cream-100 text-ink-600 border-ink-200", icon: Lightbulb },
  planned: { label: "Planned", cls: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  scripted: { label: "Scripted", cls: "bg-sky-50 text-sky-700 border-sky-200", icon: PenLine },
  filmed: { label: "Filmed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  edited: { label: "Edited", cls: "bg-violet-50 text-violet-700 border-violet-200", icon: Scissors },
  posted: { label: "Posted", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Send },
  reviewed: { label: "Reviewed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Status Pill — click to move a post through the pipeline. Local state only.
// ─────────────────────────────────────────────────────────────────────────────

export function PostStatusPill() {
  const [status, setStatus] = useState<Status>("scripted");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const m = STATUS_META[status];
  const Icon = m.icon;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 h-[22px] pl-2 pr-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors",
          m.cls,
        )}
      >
        <Icon className="size-3" strokeWidth={2.4} />
        {m.label}
        <ChevronDown className="size-3 opacity-70" strokeWidth={2.4} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+4px)] z-10 w-[160px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1.5"
        >
          <div className="px-3 py-1 text-[10px] uppercase tracking-wide text-ink-400 font-semibold">
            Set status
          </div>
          {FLOW.map((s) => {
            const sm = STATUS_META[s];
            const SIcon = sm.icon;
            const current = s === status;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setStatus(s);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-[12.5px] hover:bg-cream-100 transition-colors",
                  current ? "text-rose-600 font-semibold" : "text-ink-700",
                )}
              >
                <SIcon className="size-3.5 shrink-0" strokeWidth={2} />
                {sm.label}
                {current && <Check className="size-3.5 ml-auto" strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Post Card — the content-calendar card: platform glyph + time, title, status
// pill + content type, schedule line, and pipeline progress bar.
// ─────────────────────────────────────────────────────────────────────────────

const TYPE_ACCENT = {
  color: "var(--color-violet-500)",
  label: "text-violet-600",
  bar: "bg-violet-500",
};

export function PostCard() {
  const stage = 3; // scripted
  const total = FLOW.length;
  const pct = Math.round((stage / total) * 100);

  return (
    <div
      className="w-[260px] rounded-[14px] border border-ink-100 border-l-4 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all"
      style={{ borderLeftColor: TYPE_ACCENT.color }}
    >
      {/* Header — platform logo + scheduled time + actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <PlatformGlyph platform="instagram" className="size-[18px]" />
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-medium text-ink-400 tabular-nums">
            9:30 AM
          </span>
          <span className="inline-flex items-center justify-center size-7 rounded-full text-ink-400">
            <MoreHorizontal className="size-4" strokeWidth={2} />
          </span>
        </div>
      </div>

      {/* Title / hook */}
      <h4 className="text-[14px] font-bold text-ink-900 leading-snug line-clamp-2 mb-2">
        3 hooks to stop the scroll
      </h4>

      {/* Status pill + content type */}
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className={cn(
            "inline-flex items-center gap-1 h-[22px] px-2.5 rounded-full border text-[11px] font-semibold whitespace-nowrap",
            STATUS_META.scripted.cls,
          )}
        >
          <PenLine className="size-3" strokeWidth={2.4} />
          Scripted
        </span>
        <span className={cn("text-[12px] font-semibold truncate", TYPE_ACCENT.label)}>
          Reel
        </span>
      </div>

      {/* Schedule line */}
      <p className="text-[12px] text-ink-500 leading-snug line-clamp-2 mb-3">
        Scheduled for Friday, May 30
      </p>

      {/* Pipeline progress */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11.5px] font-medium text-ink-500">Progress</span>
        <span className="text-[11.5px] font-medium text-ink-500 tabular-nums">
          {stage} of {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full", TYPE_ACCENT.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Pipeline Progress — the active-plan stacked bar: each phase is a colored
// segment, with a live legend of phase counts.
// ─────────────────────────────────────────────────────────────────────────────

export function PipelineProgress() {
  const phases = [
    { key: "ideas", label: "Idea", count: 1, bar: "bg-ink-300", dot: "bg-ink-400", text: "text-ink-600" },
    { key: "planned", label: "Planned", count: 2, bar: "bg-amber-400", dot: "bg-amber-500", text: "text-amber-600" },
    { key: "inProduction", label: "In Production", count: 2, bar: "bg-violet-500", dot: "bg-violet-500", text: "text-violet-600" },
    { key: "published", label: "Published", count: 3, bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-600" },
  ];
  const total = phases.reduce((n, p) => n + p.count, 0);
  const published = phases.find((p) => p.key === "published")!.count;
  const pct = Math.round((published / total) * 100);

  return (
    <div className="w-[420px] max-w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-ink-900">Progress</span>
        <span className="text-[14px] font-bold text-ink-900 tabular-nums">
          {pct}%
        </span>
      </div>
      {/* Stacked pipeline bar */}
      <div className="flex h-2 rounded-full bg-cream-200 overflow-hidden">
        {phases.map((p) =>
          p.count > 0 ? (
            <div
              key={p.key}
              className={cn("h-full", p.bar)}
              style={{ width: `${(p.count / total) * 100}%` }}
              title={`${p.label}: ${p.count}`}
            />
          ) : null,
        )}
      </div>
      <div className="mt-1.5 text-[12px] text-ink-500">
        {published} of {total} posts published this week
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-x-4 gap-y-2 flex-wrap">
        {phases.map((p) => (
          <div key={p.key} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full shrink-0", p.dot)} />
            <span className={cn("text-[15px] font-bold tabular-nums leading-none", p.text)}>
              {p.count}
            </span>
            <span className="text-[11.5px] text-ink-500 leading-none">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
