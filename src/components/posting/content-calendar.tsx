"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import type { PostingItem } from "@/lib/posting/queries";
import { NewItemForm } from "./posting-actions";
import { rescheduleItem } from "@/app/(app)/posting/actions";

type Props = {
  items: PostingItem[];
  weekStart?: string | null;
  planId?: string | null;
};

const STATUS_TONE: Record<PostingItem["status"], string> = {
  idea: "bg-cream-100 text-ink-700 border-ink-100",
  planned: "bg-rose-50 text-rose-700 border-rose-100",
  scripted: "bg-cream-200 text-ink-700 border-ink-200",
  filmed: "bg-cream-200 text-ink-700 border-ink-200",
  edited: "bg-rose-100 text-rose-700 border-rose-200",
  posted: "bg-emerald-100 text-emerald-700 border-emerald-200",
  reviewed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const STATUS_LABEL: Record<PostingItem["status"], string> = {
  idea: "Idea",
  planned: "Planned",
  scripted: "Scripted",
  filmed: "Filmed",
  edited: "Edited",
  posted: "Posted",
  reviewed: "Reviewed",
};

/**
 * Renders the active plan's posting items as a 7-day calendar grid, with
 * drag-and-drop: drag a post onto another day to reschedule it (keeps its
 * time-of-day; unscheduled items land at 09:00). Day cells start on Monday
 * of the plan's week; items without a date go to an "Unscheduled" row.
 */
export function ContentCalendar({ items, weekStart, planId }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  // Which day a per-column "Add post" was clicked for (YYYY-MM-DD) → opens the
  // create-post modal pre-filled to that day. null = closed.
  const [addDate, setAddDate] = useState<string | null>(null);
  // While a post is dragged over the ‹ / › buttons we auto-advance the visible
  // week, so a post can be dropped onto ANY week — not just the 7 days shown.
  const [flipHover, setFlipHover] = useState<"prev" | "next" | null>(null);
  const flipDir = useRef<-1 | 1>(1);
  const flipTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function startWeekFlip(dir: -1 | 1) {
    flipDir.current = dir;
    setFlipHover(dir === -1 ? "prev" : "next");
    if (flipTimer.current) return; // already auto-advancing
    // First tick fires after the delay (acts as a hover threshold), then
    // repeats so the user can hold to jump across several weeks.
    flipTimer.current = setInterval(() => {
      setWeekOffset((o) => o + flipDir.current);
    }, 700);
  }
  function stopWeekFlip() {
    setFlipHover(null);
    if (flipTimer.current) {
      clearInterval(flipTimer.current);
      flipTimer.current = null;
    }
  }
  function endDrag() {
    stopWeekFlip();
    setDraggingId(null);
    setOverKey(null);
  }
  // Clear any running auto-advance timer if we unmount mid-drag.
  useEffect(() => {
    return () => {
      if (flipTimer.current) clearInterval(flipTimer.current);
    };
  }, []);

  const baseMonday = mondayOf(weekStart ? new Date(weekStart) : new Date());
  const monday = new Date(baseMonday);
  monday.setDate(monday.getDate() + weekOffset * 7);
  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Week offset (relative to baseMonday) that contains today. The plan may
  // start on a different week than the current one, so the "Today" button
  // jumps straight to today's week instead of just resetting to the plan week.
  const todayMonday = mondayOf(new Date());
  const todayOffset = Math.round(
    (todayMonday.getTime() - baseMonday.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

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
    stopWeekFlip();
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
    <section className={cn("card overflow-hidden h-[80vh] flex flex-col", pending && "opacity-70")}>
      <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100 shrink-0">
        <div>
          <h3 className="text-h4 text-ink-900 leading-none">Content Calendar</h3>
          <p className="text-[12px] text-ink-500 mt-1">
            Week of{" "}
            {monday.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}{" "}
            <span className="text-ink-300">·</span>{" "}
            {draggingId
              ? "hold over ‹ › to move it to another week"
              : "drag a post to another day to reschedule"}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center rounded-[10px] border border-ink-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o - 1)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                startWeekFlip(-1);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  stopWeekFlip();
              }}
              onDrop={(e) => {
                e.preventDefault();
                stopWeekFlip();
              }}
              aria-label="Previous week"
              title="Previous week — drag a post here to move it back a week"
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
              onClick={() => setWeekOffset(todayOffset)}
              disabled={weekOffset === todayOffset}
              className="h-9 px-2.5 text-[12px] font-medium border-x border-ink-200 text-ink-700 hover:bg-cream-100 disabled:text-ink-300 disabled:hover:bg-transparent transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setWeekOffset((o) => o + 1)}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                startWeekFlip(1);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node))
                  stopWeekFlip();
              }}
              onDrop={(e) => {
                e.preventDefault();
                stopWeekFlip();
              }}
              aria-label="Next week"
              title="Next week — drag a post here to move it forward a week"
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
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 lg:grid-rows-1 flex-1 min-h-0 overflow-y-auto divide-y lg:divide-y-0 lg:divide-x divide-ink-100">
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

    </section>

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
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", item.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-opacity",
        dragging && "opacity-40",
      )}
    >
      <CalendarItem item={item} />
    </div>
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

/**
 * Post card — clean white surface with a colored status pill + content-type,
 * inspired by the task-board cards. The whole card stays draggable.
 */
function CalendarItem({ item }: { item: PostingItem }) {
  const time = item.scheduled_for
    ? new Date(item.scheduled_for).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;
  const typeLabel = item.content_type
    ? CONTENT_TYPE_LABEL[item.content_type] ?? prettyType(item.content_type)
    : null;
  const hasPlatformIcon =
    item.platform === "instagram" ||
    item.platform === "tiktok" ||
    item.platform === "youtube";

  return (
    <div className="group rounded-[12px] border border-ink-100 bg-white p-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-rose-200 hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition-all">
      {/* Top row — platform + scheduled time */}
      {(time || hasPlatformIcon) && (
        <div className="flex items-center gap-1.5 mb-1.5 text-ink-500">
          <PlatformIcon platform={item.platform} />
          {time && (
            <span className="text-[10.5px] font-medium tabular-nums ml-auto">
              {time}
            </span>
          )}
        </div>
      )}

      {/* Title / hook */}
      <div className="text-[12.5px] font-semibold text-ink-900 leading-snug line-clamp-2 mb-2">
        {item.topic ?? typeLabel ?? "Untitled post"}
      </div>

      {/* Status pill + content type */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={cn(
            "inline-flex items-center h-[18px] px-2 rounded-full border text-[9.5px] font-bold uppercase tracking-wide",
            STATUS_TONE[item.status],
          )}
        >
          {STATUS_LABEL[item.status]}
        </span>
        {typeLabel && (
          <span className="text-[10.5px] font-medium text-ink-500 truncate">
            {typeLabel}
          </span>
        )}
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

function PlatformIcon({ platform }: { platform: PostingItem["platform"] }) {
  if (platform === "instagram") return <InstagramIcon className="size-3" />;
  if (platform === "tiktok") return <TiktokIcon className="size-3" />;
  if (platform === "youtube") return <YoutubeIcon className="size-3" />;
  return null;
}

function mondayOf(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
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
