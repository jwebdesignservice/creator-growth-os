"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import type { PostingItem } from "@/lib/posting/queries";
import { PlatformGlyph } from "./platform-glyphs";
import { NewItemForm } from "./posting-actions";
import { PostDetailModal } from "./post-detail-modal";
import { rescheduleItem } from "@/app/(app)/posting/actions";
import { ItemActionsMenu } from "./item-actions-menu";
import { StatusPill } from "./status-pill";

type Props = {
  items: PostingItem[];
  weekStart?: string | null;
  planId?: string | null;
  /** Rendered right-aligned in the calendar's top bar (e.g. the Add Post action). */
  addPostSlot?: ReactNode;
};

// The calendar shows a sliding window of days (not a fixed Mon–Sun week): the
// ‹ / › controls nudge it STEP_DAYS at a time, which keeps the columns wide and
// readable and lets you slide through dates smoothly.
// NOTE: keep VISIBLE_DAYS in sync with the `lg:grid-cols-N` class on the grid.
const VISIBLE_DAYS = 5;
const STEP_DAYS = 2;

/**
 * Renders the active plan's posting items as a sliding {@link VISIBLE_DAYS}-day
 * calendar strip, with drag-and-drop: drag a post onto another day to
 * reschedule it (keeps its time-of-day; unscheduled items land at 09:00).
 * Dragging a post over the ‹ / › controls slides the window so a post can be
 * moved to any date; items without a date go to an "Unscheduled" row.
 */
export function ContentCalendar({ items, weekStart, planId, addPostSlot }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  // Open with today centered in the visible strip (rather than anchored at the
  // plan's first day), so users land on "now" with the surrounding days in view.
  const [dayOffset, setDayOffset] = useState(() => {
    const b = startOfDay(weekStart ? new Date(weekStart) : new Date());
    const todayOff = Math.round(
      (startOfDay(new Date()).getTime() - b.getTime()) / 86_400_000,
    );
    return todayOff - Math.floor(VISIBLE_DAYS / 2);
  });
  // Which day a per-column "Add post" was clicked for (YYYY-MM-DD) → opens the
  // create-post modal pre-filled to that day. null = closed.
  const [addDate, setAddDate] = useState<string | null>(null);
  // While a post is dragged over the ‹ / › buttons we auto-slide the window, so
  // a post can be dropped onto ANY date — not just the days currently shown.
  const [flipHover, setFlipHover] = useState<"prev" | "next" | null>(null);
  const flipDir = useRef<-1 | 1>(1);
  const flipTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function startSlide(dir: -1 | 1) {
    flipDir.current = dir;
    setFlipHover(dir === -1 ? "prev" : "next");
    if (flipTimer.current) return; // already auto-sliding
    // First tick fires after the delay (acts as a hover threshold), then
    // repeats so the user can hold to slide across many days.
    flipTimer.current = setInterval(() => {
      setDayOffset((o) => o + flipDir.current * STEP_DAYS);
    }, 700);
  }
  function stopSlide() {
    setFlipHover(null);
    if (flipTimer.current) {
      clearInterval(flipTimer.current);
      flipTimer.current = null;
    }
  }
  function endDrag() {
    stopSlide();
    setDraggingId(null);
    setOverKey(null);
  }
  // Clear any running auto-advance timer if we unmount mid-drag.
  useEffect(() => {
    return () => {
      if (flipTimer.current) clearInterval(flipTimer.current);
    };
  }, []);

  // Anchor the strip at the plan's start (or today when there's no plan); the
  // window then slides by whole days via dayOffset.
  const base = startOfDay(weekStart ? new Date(weekStart) : new Date());
  const viewStart = new Date(base);
  viewStart.setDate(viewStart.getDate() + dayOffset);
  const days: Date[] = Array.from({ length: VISIBLE_DAYS }, (_, i) => {
    const d = new Date(viewStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // dayOffset that places today as the first column — the "Today" button jumps
  // straight there even when the plan starts on a different date.
  const todayOffset = Math.round(
    (startOfDay(new Date()).getTime() - base.getTime()) / 86_400_000,
  );
  // Offset that places today in the CENTER column (what "Today" jumps to).
  const centerOffset = todayOffset - Math.floor(VISIBLE_DAYS / 2);

  // Bucket items by ISO date string
  const byDay = new Map<string, PostingItem[]>();
  const unscheduled: PostingItem[] = [];
  for (const item of items) {
    if (!item.scheduled_for) {
      unscheduled.push(item);
      continue;
    }
    const key = isoDateOf(new Date(item.scheduled_for));
    const arr = byDay.get(key) ?? [];
    arr.push(item);
    byDay.set(key, arr);
  }
  for (const arr of byDay.values()) {
    arr.sort((a, b) => {
      const ta = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0;
      const tb = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0;
      return ta - tb;
    });
  }

  const today = isoDateOf(new Date());

  function dropOnDay(day: Date, e: React.DragEvent) {
    // draggingId survives re-renders (including an auto week-flip mid-drag);
    // fall back to the dataTransfer payload in case the source card unmounted.
    const id = draggingId ?? (e.dataTransfer.getData("text/plain") || null);
    stopSlide();
    setDraggingId(null);
    setOverKey(null);
    if (!id) return;
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const targetKey = isoDateOf(day);
    const currentKey = item.scheduled_for
      ? isoDateOf(new Date(item.scheduled_for))
      : null;
    if (currentKey === targetKey) return; // no-op: dropped on its own day

    const next = new Date(day);
    if (item.scheduled_for) {
      const prev = new Date(item.scheduled_for);
      next.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
    } else {
      next.setHours(9, 0, 0, 0);
    }

    startTransition(async () => {
      await rescheduleItem(id, next.toISOString());
      router.refresh();
    });
  }

  return (
    <>
    <div className="space-y-4 lg:space-y-0 lg:h-full lg:flex lg:flex-col">
    <WorkspaceHeader title="Calendar">
      <div className="flex items-center gap-3 flex-wrap justify-end">
        <div className="inline-flex items-center rounded-[10px] border border-ink-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setDayOffset((o) => o - STEP_DAYS)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              startSlide(-1);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                stopSlide();
            }}
            onDrop={(e) => {
              e.preventDefault();
              stopSlide();
            }}
            aria-label="Show earlier days"
            title="Earlier days — drag a post here to move it earlier"
            className={cn(
              "size-9 inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors",
              draggingId && "text-rose-500",
              flipHover === "prev" && "bg-rose-100 text-rose-700",
            )}
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setDayOffset(centerOffset)}
            disabled={dayOffset === centerOffset}
            className="h-9 px-2.5 text-[12px] font-medium border-x border-ink-200 text-ink-700 hover:bg-cream-100 disabled:text-ink-300 disabled:hover:bg-transparent transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setDayOffset((o) => o + STEP_DAYS)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              startSlide(1);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                stopSlide();
            }}
            onDrop={(e) => {
              e.preventDefault();
              stopSlide();
            }}
            aria-label="Show later days"
            title="Later days — drag a post here to move it later"
            className={cn(
              "size-9 inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors",
              draggingId && "text-rose-500",
              flipHover === "next" && "bg-rose-100 text-rose-700",
            )}
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </button>
        </div>
        <Link
          href="/posting"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700 whitespace-nowrap"
        >
          Back to My Plans
        </Link>
        {addPostSlot}
      </div>
    </WorkspaceHeader>
    <div
      className={cn(
        "flex flex-col min-h-[60vh] lg:min-h-0 lg:flex-1 lg:-ml-6 lg:-mr-[var(--space-page-x)] lg:-mb-[var(--space-page-y)]",
        pending && "opacity-70",
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 lg:grid-rows-1 flex-1 min-h-0 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-ink-100">
        {days.map((d) => {
          const key = isoDateOf(d);
          const dayItems = byDay.get(key) ?? [];
          const isToday = key === today;
          const isOver = overKey === key;
          return (
            <div
              key={key}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (overKey !== key) setOverKey(key);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverKey((k) => (k === key ? null : k));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                dropOnDay(d, e);
              }}
              className={cn(
                "flex flex-col min-h-[200px] lg:min-h-0 overflow-y-auto p-3 transition-colors",
                isToday && !isOver && "bg-rose-50 ring-1 ring-rose-200 ring-inset",
                isOver && "bg-rose-100/60 ring-1 ring-rose-300 ring-inset",
              )}
            >
              <header className="mb-2 flex items-start justify-between gap-1.5">
                <div>
                  <div
                    className={cn(
                      "text-[10px] uppercase tracking-wide font-semibold",
                      isToday ? "text-rose-600" : "text-ink-500",
                    )}
                  >
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div
                    className={cn(
                      "text-[18px] font-display leading-none mt-0.5",
                      isToday ? "text-rose-600" : "text-ink-900",
                    )}
                  >
                    {d.getDate()}
                  </div>
                </div>
                {isToday && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide text-white bg-rose-600 rounded-full px-2 py-1 leading-none">
                    Today
                  </span>
                )}
              </header>

              {dayItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-[56px]">
                  <span className="text-[11px] text-ink-300">
                    {isOver ? "Drop here" : "—"}
                  </span>
                </div>
              ) : (
                <ul className="space-y-2 flex-1">
                  {dayItems.map((item) => (
                    <li key={item.id}>
                      <DraggableCard
                        item={item}
                        dragging={draggingId === item.id}
                        onDragStart={() => setDraggingId(item.id)}
                        onDragEnd={endDrag}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {planId && (
                <button
                  type="button"
                  onClick={() => setAddDate(key)}
                  className="mt-2 w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-[10px] border border-dashed border-ink-200 text-[12px] font-medium text-ink-500 hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/50 transition-colors shrink-0"
                >
                  <Plus className="size-3.5" strokeWidth={2.2} />
                  Add post
                </button>
              )}
            </div>
          );
        })}
      </div>

      {unscheduled.length > 0 && (
        <section className="border-t border-ink-100 px-5 py-4 shrink-0">
          <div className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold mb-3">
            Unscheduled
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unscheduled.map((item) => (
              <li key={item.id}>
                <DraggableCard
                  item={item}
                  dragging={draggingId === item.id}
                  onDragStart={() => setDraggingId(item.id)}
                  onDragEnd={endDrag}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
    </div>

      {addDate && planId && (
        <NewItemForm
          planId={planId}
          initialDate={addDate}
          onClose={() => setAddDate(null)}
        />
      )}
    </>
  );
}

function DraggableCard({
  item,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  item: PostingItem;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.id);
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        onDoubleClick={() => setDetailOpen(true)}
        className={cn(
          "cursor-grab active:cursor-grabbing transition-opacity",
          dragging && "opacity-40",
        )}
      >
        <CalendarItem item={item} onEdit={() => setDetailOpen(true)} />
      </div>
      {detailOpen && (
        <PostDetailModal item={item} onClose={() => setDetailOpen(false)} />
      )}
    </>
  );
}

// Singular, card-friendly labels (queries.ts has plural versions for stats).
const CONTENT_TYPE_LABEL: Record<string, string> = {
  reel: "Reel",
  short_video: "Short Video",
  carousel: "Carousel",
  story: "Story",
  video: "Video",
  youtube_video: "YouTube",
  post: "Post",
};

// Clean, modern color system: each content type gets its own soft accent — a
// colored left stripe on the card plus a matching label tint and progress bar.
// The stripe colour (`color`) is applied inline via borderLeftColor so it
// always wins over the card's neutral border regardless of class ordering;
// `label`/`bar` stay as utility classes. The card itself stays white so the
// wall of cards reads calm but is instantly scannable.
const TYPE_ACCENT: Record<string, { color: string; label: string; bar: string }> = {
  reel: { color: "var(--color-violet-500)", label: "text-violet-600", bar: "bg-violet-500" },
  short_video: { color: "var(--color-fuchsia-500)", label: "text-fuchsia-600", bar: "bg-fuchsia-500" },
  story: { color: "var(--color-amber-500)", label: "text-amber-600", bar: "bg-amber-500" },
  carousel: { color: "var(--color-sky-500)", label: "text-sky-600", bar: "bg-sky-500" },
  post: { color: "var(--color-emerald-500)", label: "text-emerald-600", bar: "bg-emerald-500" },
  video: { color: "var(--color-rose-500)", label: "text-rose-600", bar: "bg-rose-500" },
  youtube_video: { color: "var(--color-red-500)", label: "text-red-600", bar: "bg-red-500" },
};
const accentOf = (t: string | null) =>
  (t ? TYPE_ACCENT[t] : null) ?? {
    color: "var(--color-ink-300)",
    label: "text-ink-500",
    bar: "bg-rose-500",
  };

// A post moves through these stages — the progress bar reflects how far along
// the content pipeline it is (e.g. "Filmed" = stage 4 of 7).
const STATUS_ORDER: PostingItem["status"][] = [
  "idea",
  "planned",
  "scripted",
  "filmed",
  "edited",
  "posted",
  "reviewed",
];

/**
 * Post card — faithful to the task-board card design (rounded surface, header
 * row, bold title, status pill + meta, labelled progress bar) adapted to real
 * post data: the platform logo replaces the task ID, and the progress bar
 * tracks the post's stage in the content pipeline. Uses the app's rose accent.
 * The whole card stays draggable.
 */
function CalendarItem({
  item,
  onEdit,
}: {
  item: PostingItem;
  onEdit?: () => void;
}) {
  const time = item.scheduled_for
    ? new Date(item.scheduled_for).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const scheduleLabel = item.scheduled_for
    ? new Date(item.scheduled_for).toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      })
    : null;
  const typeLabel = item.content_type
    ? CONTENT_TYPE_LABEL[item.content_type] ?? prettyType(item.content_type)
    : null;
  const accent = accentOf(item.content_type);

  const stage = Math.max(1, STATUS_ORDER.indexOf(item.status) + 1);
  const total = STATUS_ORDER.length;
  const pct = Math.round((stage / total) * 100);

  return (
    <div
      className="rounded-[14px] border border-ink-100 border-l-4 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] transition-all"
      style={{ borderLeftColor: accent.color }}
    >
      {/* Header — platform logo (replaces the task ID) + scheduled time */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <PlatformBadge platform={item.platform} />
        <div className="flex items-center gap-1 shrink-0">
          {time && (
            <span className="text-[11px] font-medium text-ink-400 tabular-nums">
              {time}
            </span>
          )}
          <ItemActionsMenu
            itemId={item.id}
            currentStatus={item.status}
            onEdit={onEdit}
          />
        </div>
      </div>

      {/* Title / hook */}
      <h4 className="text-[14px] font-bold text-ink-900 leading-snug line-clamp-2 mb-2">
        {item.topic ?? typeLabel ?? "Untitled post"}
      </h4>

      {/* Status pill + content type */}
      <div className="flex items-center gap-2 mb-2.5">
        <StatusPill itemId={item.id} status={item.status} />
        {typeLabel && (
          <span className={cn("text-[12px] font-semibold truncate", accent.label)}>
            {typeLabel}
          </span>
        )}
      </div>

      {/* Description — real, useful schedule line */}
      <p className="text-[12px] text-ink-500 leading-snug line-clamp-2 mb-3">
        {scheduleLabel ? `Scheduled for ${scheduleLabel}` : "Not scheduled yet"}
      </p>

      {/* Progress — the post's stage within the content pipeline */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11.5px] font-medium text-ink-500">Progress</span>
        <span className="text-[11.5px] font-medium text-ink-500 tabular-nums">
          {stage} of {total}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-ink-100 overflow-hidden">
        <div
          className={cn("h-full rounded-full", accent.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function prettyType(slug: string) {
  return slug
    .split("_")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function PlatformBadge({ platform }: { platform: PostingItem["platform"] }) {
  // Premium, full-colour brand marks (see ./platform-glyphs).
  return <PlatformGlyph platform={platform} className="size-[18px]" />;
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isoDateOf(d: Date) {
  // Local calendar date (NOT UTC). Day cells are built from local midnight and
  // a post shows on the day it falls on in the user's timezone — keying both by
  // the local Y-M-D keeps a dropped post in exactly the cell it landed on.
  // (Using toISOString() here shifted dates by a day in UTC+ timezones.)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
