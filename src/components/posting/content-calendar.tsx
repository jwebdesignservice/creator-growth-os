"use client";

import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Maximize2,
  Pencil,
  Plus,
  Send,
} from "lucide-react";
import { platformMeta } from "@/lib/posting/platform-meta";
import { contentTypeLabel } from "@/lib/posting/content-type-accent";
import { cn } from "@/lib/cn";
import { WorkspaceHeader } from "@/components/app-shell/workspace-shell";
import type { PostingItem } from "@/lib/posting/queries";
import { PlatformGlyph } from "./platform-glyphs";
import { NewItemForm } from "./posting-actions";
import { rescheduleItem, updateItemStatus } from "@/app/(app)/posting/actions";
import { ItemActionsMenu } from "./item-actions-menu";
import { StatusPill } from "./status-pill";

type Props = {
  items: PostingItem[];
  weekStart?: string | null;
  planId?: string | null;
  /** Rendered right-aligned in the calendar's top bar (e.g. the Add Post action). */
  addPostSlot?: ReactNode;
};

// The week view is a true Sunday–Saturday grid (like the month view, just one
// week tall): the ‹ / › controls move a whole week at a time.
const VISIBLE_DAYS = 7;
const STEP_DAYS = 7;

/** Time-of-day bands that divide each week-view day column (the reference's
    horizontal grid lines). Chips land in the band containing their hour. */
const WEEK_BANDS: [number, number][] = [
  [0, 6],
  [6, 12],
  [12, 18],
  [18, 24],
];

/**
 * Renders the active plan's posting items as a sliding {@link VISIBLE_DAYS}-day
 * calendar strip, with drag-and-drop: drag a post onto another day to
 * reschedule it (keeps its time-of-day; unscheduled items land at 09:00).
 * Dragging a post over the ‹ / › controls slides the window so a post can be
 * moved to any date; items without a date go to an "Unscheduled" row.
 */
export function ContentCalendar({
  items,
  weekStart,
  planId,
  addPostSlot,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  // Optimistically move a dropped card to its new day right away; the real data
  // from router.refresh() reconciles it (and reverts it on failure).
  const [optimisticItems, applyOptimisticMove] = useOptimistic(
    items,
    (state: PostingItem[], move: { id: string; scheduled_for: string }) =>
      state.map((i) =>
        i.id === move.id ? { ...i, scheduled_for: move.scheduled_for } : i,
      ),
  );
  // Open on the CURRENT week, Sunday-aligned (the reference's Sun–Sat grid);
  // ‹ / › then step the window a whole week at a time.
  const [dayOffset, setDayOffset] = useState(() => {
    const b = startOfDay(weekStart ? new Date(weekStart) : new Date());
    const sun = startOfDay(new Date());
    sun.setDate(sun.getDate() - sun.getDay());
    return Math.round((sun.getTime() - b.getTime()) / 86_400_000);
  });
  // Which day a per-column "Add post" was clicked for (YYYY-MM-DD) → opens the
  // create-post modal pre-filled to that day. null = closed.
  const [addDate, setAddDate] = useState<string | null>(null);
  // Week (sliding day strip) vs Month (grid with multi-day phase bars).
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  // Months away from the current month shown in the month grid (0 = this month).
  const [monthOffset, setMonthOffset] = useState(0);
  // Which post's edit composer is open (from a bar/card). null = closed.
  const [openId, setOpenId] = useState<string | null>(null);
  const openDetailEdit = (id: string) => setOpenId(id);
  // Quick-peek popover for a clicked month chip (reference behavior): shows
  // the post near its chip; expand/edit hands off to the full composer.
  const [peek, setPeek] = useState<{ id: string; anchor: DOMRect } | null>(
    null,
  );
  const peekItem = peek
    ? optimisticItems.find((i) => i.id === peek.id) ?? null
    : null;
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
      if (viewMode === "month") setMonthOffset((o) => o + flipDir.current);
      else setDayOffset((o) => o + flipDir.current * STEP_DAYS);
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

  // Offset that shows the CURRENT Sunday-aligned week (what "Today" jumps to).
  const todayOffset = (() => {
    const sun = startOfDay(new Date());
    sun.setDate(sun.getDate() - sun.getDay());
    return Math.round((sun.getTime() - base.getTime()) / 86_400_000);
  })();

  // "June 7 – 13, 2026" (month repeated when the week spans two months).
  const weekFirst = days[0];
  const weekLast = days[days.length - 1];
  const weekLabel = `${weekFirst.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  })} – ${weekLast.toLocaleDateString("en-US", {
    ...(weekFirst.getMonth() === weekLast.getMonth()
      ? {}
      : { month: "long" as const }),
    day: "numeric",
  })}, ${weekLast.getFullYear()}`;

  // A card is "saving" while its optimistic day differs from the persisted day
  // (its reschedule hasn't round-tripped yet) — derived, so no effect is needed.
  const persistedDates = new Map<string, string | null>();
  for (const i of items) persistedDates.set(i.id, i.scheduled_for);
  const savingIds = new Set<string>();
  for (const oi of optimisticItems) {
    if (persistedDates.get(oi.id) !== oi.scheduled_for) savingIds.add(oi.id);
  }

  // Day columns hold the scheduled posts; unscheduled posts go to their own
  // row.
  const byDay = new Map<string, PostingItem[]>();
  const unscheduled: PostingItem[] = [];
  for (const item of optimisticItems) {
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

  // ── Month grid (Google-Calendar style) ──────────────────────────────────
  // First of the displayed month, the Sunday on/before it, and exactly enough
  // whole weeks (5 or 6 rows) to cover the month — so the grid hugs the month
  // like the reference design rather than always padding to 6 rows.
  const now = new Date();
  const monthBase = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const monthLabel = monthBase.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const firstWeekday = monthBase.getDay(); // 0 = Sunday
  const daysInMonth = new Date(
    monthBase.getFullYear(),
    monthBase.getMonth() + 1,
    0,
  ).getDate();
  const monthCellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
  const monthGridStart = startOfDay(new Date(monthBase));
  monthGridStart.setDate(monthBase.getDate() - firstWeekday);
  const monthDays: Date[] = Array.from({ length: monthCellCount }, (_, i) => {
    const d = new Date(monthGridStart);
    d.setDate(monthGridStart.getDate() + i);
    return d;
  });

  // Month-grid layout — every post is a one-day pill stacked into lanes.
  const monthLayout = buildMonthLayout(monthDays, optimisticItems);

  const openItem = openId
    ? optimisticItems.find((i) => i.id === openId) ?? null
    : null;

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

    // Move it optimistically (the card jumps to the new day and shows a spinner
    // until the server round-trip + refresh reconcile it), then persist.
    startTransition(async () => {
      applyOptimisticMove({ id, scheduled_for: next.toISOString() });
      await rescheduleItem(id, next.toISOString());
      router.refresh();
    });
  }

  return (
    <>
    <div className="space-y-4 lg:space-y-0 lg:h-full lg:flex lg:flex-col">
    <WorkspaceHeader title="Calendar">
      <div className="flex items-center gap-3 flex-wrap justify-end">
        {/* Week / Month view toggle */}
        <div className="inline-flex items-center rounded-[10px] border border-ink-200 bg-white p-0.5">
          {(["week", "month"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setViewMode(m)}
              aria-pressed={viewMode === m}
              className={cn(
                "h-8 px-3 rounded-[8px] text-[12.5px] font-semibold capitalize transition-colors",
                viewMode === m
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-ink-600 hover:text-ink-900 hover:bg-cream-100",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center rounded-[10px] border border-ink-200 bg-white overflow-hidden">
          <button
            type="button"
            onClick={() =>
              viewMode === "month"
                ? setMonthOffset((o) => o - 1)
                : setDayOffset((o) => o - STEP_DAYS)
            }
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
            onClick={() =>
              viewMode === "month"
                ? setMonthOffset(0)
                : setDayOffset(todayOffset)
            }
            disabled={
              viewMode === "month"
                ? monthOffset === 0
                : dayOffset === todayOffset
            }
            className="h-9 px-2.5 text-[12px] font-medium border-x border-ink-200 text-ink-700 hover:bg-cream-100 disabled:text-ink-300 disabled:hover:bg-transparent transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() =>
              viewMode === "month"
                ? setMonthOffset((o) => o + 1)
                : setDayOffset((o) => o + STEP_DAYS)
            }
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
        {addPostSlot}
      </div>
    </WorkspaceHeader>
    <div className="flex flex-col min-h-[60vh] lg:min-h-0 lg:flex-1 lg:-ml-6 lg:-mr-[var(--space-page-x)] lg:-mb-[var(--space-page-y)]">
      {viewMode === "week" && (
        <div className="flex flex-1 min-h-0 flex-col overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="mb-3 text-[15px] font-semibold text-ink-900">
            {weekLabel}
          </div>
          {/* Reference-style week grid — the month system at one-week zoom:
              "Sunday 7 … Saturday 13" header with today underlined, muted past
              columns, time-band rows, and the same chip → peek → drag system. */}
          <div className="flex flex-1 min-h-0 overflow-x-auto">
            <div className="flex min-h-full w-full min-w-[840px] flex-col overflow-hidden rounded-[14px] border border-ink-100 bg-white">
              {/* Header — weekday + day number; today gets the brand underline */}
              <div className="grid grid-cols-7 border-b border-ink-100">
                {days.map((d) => {
                  const key = isoDateOf(d);
                  const isToday = key === today;
                  return (
                    <div
                      key={key}
                      className="relative flex items-baseline justify-center gap-2 px-2 py-3"
                    >
                      <span
                        className={cn(
                          "text-[13.5px]",
                          isToday
                            ? "font-semibold text-rose-700"
                            : "font-medium text-ink-500",
                        )}
                      >
                        {d.toLocaleDateString("en-US", { weekday: "long" })}
                      </span>
                      <span
                        className={cn(
                          "text-[13.5px] font-semibold tabular-nums",
                          isToday ? "text-rose-700" : "text-ink-700",
                        )}
                      >
                        {d.getDate()}
                      </span>
                      {isToday && (
                        <span
                          aria-hidden
                          className="absolute inset-x-0 bottom-0 h-[2px] bg-rose-600"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Day columns — time bands hold the chips by hour */}
              <div className="grid grid-cols-7 grid-rows-1 flex-1 min-h-0">
                {days.map((d, di) => {
                  const key = isoDateOf(d);
                  const isToday = key === today;
                  const isPast = key < today;
                  const isOver = overKey === key;
                  const muted = isPast && !isToday;
                  const dayItems = byDay.get(key) ?? [];
                  return (
                    <div
                      key={key}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (overKey !== key) setOverKey(key);
                      }}
                      onDragLeave={(e) => {
                        if (
                          !e.currentTarget.contains(e.relatedTarget as Node)
                        ) {
                          setOverKey((k) => (k === key ? null : k));
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        dropOnDay(d, e);
                      }}
                      className={cn(
                        "group relative flex flex-col transition-colors",
                        di < 6 && "border-r border-ink-100",
                        muted ? "bg-cream-100/70" : "bg-white",
                        isOver &&
                          "bg-rose-50/60 ring-2 ring-rose-400 ring-inset",
                      )}
                    >
                      {WEEK_BANDS.map(([from, to], bi) => {
                        const bandItems = dayItems.filter((item) => {
                          const h = new Date(
                            item.scheduled_for!,
                          ).getHours();
                          return h >= from && h < to;
                        });
                        return (
                          <div
                            key={bi}
                            className="flex min-h-[108px] flex-1 flex-col gap-1.5 p-1.5"
                          >
                            {bandItems.map((item) => {
                              const pm = platformMeta(
                                item.platform ?? "other",
                              );
                              const saving = savingIds.has(item.id);
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  draggable={!saving}
                                  onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = "move";
                                    e.dataTransfer.setData(
                                      "text/plain",
                                      item.id,
                                    );
                                    setDraggingId(item.id);
                                  }}
                                  onDragEnd={endDrag}
                                  onClick={(e) =>
                                    setPeek({
                                      id: item.id,
                                      anchor:
                                        e.currentTarget.getBoundingClientRect(),
                                    })
                                  }
                                  title={item.topic ?? "Untitled post"}
                                  className={cn(
                                    "relative flex w-full cursor-grab flex-col gap-1 rounded-[10px] border border-ink-100 bg-white p-1.5 text-left shadow-[0_1px_2px_rgba(26,24,22,0.06)] transition-all active:cursor-grabbing hover:border-ink-200 hover:shadow-[0_3px_8px_-3px_rgba(26,24,22,0.3)]",
                                    draggingId === item.id && "opacity-40",
                                    saving &&
                                      "anim-move-ping pointer-events-none border-rose-300 opacity-80",
                                  )}
                                >
                                  {saving && (
                                    <span className="absolute -right-1.5 -top-1.5 z-10 inline-flex size-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-rose-200">
                                      <Loader2
                                        className="size-3 animate-spin text-rose-600"
                                        strokeWidth={2.5}
                                        aria-label="Moving post"
                                      />
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1.5">
                                    <span
                                      className={cn(
                                        "inline-flex size-6 shrink-0 items-center justify-center rounded-[7px]",
                                        pm.tile,
                                      )}
                                    >
                                      {pm.icon}
                                    </span>
                                    <span className="truncate text-[11.5px] font-semibold tabular-nums text-ink-800">
                                      {fmtChipTime(item.scheduled_for!)}
                                    </span>
                                  </span>
                                  <span className="flex items-start gap-1.5">
                                    <span
                                      className={cn(
                                        "min-w-0 flex-1 text-[11.5px] leading-snug line-clamp-2",
                                        item.topic
                                          ? "text-ink-700"
                                          : "italic text-ink-400",
                                      )}
                                    >
                                      {item.topic ?? "Untitled post"}
                                    </span>
                                    {item.media_url ? (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={item.media_url}
                                        alt=""
                                        className="size-9 shrink-0 rounded-[6px] object-cover ring-1 ring-inset ring-ink-100"
                                      />
                                    ) : (
                                      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-cream-100 to-cream-200 ring-1 ring-inset ring-ink-100">
                                        <ImagePlus
                                          className="size-3.5 text-ink-300"
                                          strokeWidth={1.8}
                                        />
                                      </span>
                                    )}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}

                      {planId && (
                        <button
                          type="button"
                          onClick={() => setAddDate(key)}
                          aria-label={`Add a post on ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                          className="absolute right-1.5 top-1.5 z-20 inline-flex size-6 scale-90 cursor-pointer items-center justify-center rounded-full bg-rose-600 text-white opacity-0 shadow-sm transition-all duration-150 hover:bg-rose-700 focus-visible:scale-100 focus-visible:opacity-100 group-hover:scale-100 group-hover:opacity-100"
                        >
                          <Plus className="size-3.5" strokeWidth={2.6} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "month" && (
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="mb-3 text-[15px] font-semibold text-ink-900">
            {monthLabel}
          </div>
          {/* Reference-style month grid: weekday header row, white cells with
              hairline dividers, muted past/out-of-month days, the brand circle
              on today, and per-day post chips (platform · time · media). */}
          <div className="overflow-hidden rounded-[14px] border border-ink-100 bg-white">
            {/* Weekday header — full names, like the reference */}
            <div className="grid grid-cols-7 border-b border-ink-100">
              {WEEKDAY_NAMES.map((w) => (
                <div
                  key={w}
                  className="px-2 py-3 text-center text-[13px] font-medium text-ink-500"
                >
                  <span className="hidden md:inline">{w}</span>
                  <span className="md:hidden">{w.slice(0, 3)}</span>
                </div>
              ))}
            </div>

            {monthLayout.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7">
                {week.days.map((d, di) => {
                  const key = isoDateOf(d);
                  const inMonth = d.getMonth() === monthBase.getMonth();
                  const isToday = key === today;
                  const isPast = key < today;
                  const isOver = overKey === key;
                  const muted = !isToday && (!inMonth || isPast);
                  const dayItems = optimisticItems
                    .filter(
                      (i) =>
                        i.scheduled_for &&
                        isoDateOf(new Date(i.scheduled_for)) === key,
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.scheduled_for!).getTime() -
                        new Date(b.scheduled_for!).getTime(),
                    );
                  return (
                    <div
                      key={key}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        if (overKey !== key) setOverKey(key);
                      }}
                      onDragLeave={(e) => {
                        if (
                          !e.currentTarget.contains(e.relatedTarget as Node)
                        ) {
                          setOverKey((k) => (k === key ? null : k));
                        }
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        dropOnDay(d, e);
                      }}
                      className={cn(
                        "group relative flex min-h-[148px] flex-col gap-1.5 border-b border-r border-ink-100 p-2 transition-colors",
                        di === 6 && "border-r-0",
                        wi === monthLayout.length - 1 && "border-b-0",
                        muted ? "bg-cream-100/70" : "bg-white",
                        isOver &&
                          "bg-rose-50/60 ring-2 ring-rose-400 ring-inset",
                      )}
                    >
                      {/* Day number — today wears the brand circle */}
                      <div className="flex items-start">
                        <span
                          className={cn(
                            "inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[14px] font-medium tabular-nums",
                            isToday
                              ? "bg-rose-600 font-semibold text-white shadow-sm shadow-rose-600/30"
                              : !inMonth
                                ? "text-ink-300"
                                : isPast
                                  ? "text-ink-400"
                                  : "text-ink-800",
                          )}
                        >
                          {d.getDate()}
                        </span>
                      </div>

                      {/* Post chips — platform · time · media slot */}
                      {dayItems.map((item) => {
                        const pm = platformMeta(item.platform ?? "other");
                        const saving = savingIds.has(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            draggable={!saving}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = "move";
                              e.dataTransfer.setData("text/plain", item.id);
                              setDraggingId(item.id);
                            }}
                            onDragEnd={endDrag}
                            onClick={(e) =>
                              setPeek({
                                id: item.id,
                                anchor:
                                  e.currentTarget.getBoundingClientRect(),
                              })
                            }
                            title={item.topic ?? "Untitled post"}
                            aria-busy={saving || undefined}
                            className={cn(
                              "relative flex w-full cursor-grab items-center gap-1.5 rounded-[10px] border border-ink-100 bg-white p-1 shadow-[0_1px_2px_rgba(26,24,22,0.06)] transition-all active:cursor-grabbing hover:border-ink-200 hover:shadow-[0_3px_8px_-3px_rgba(26,24,22,0.3)]",
                              draggingId === item.id && "opacity-40",
                              saving && "anim-move-ping pointer-events-none border-rose-300 opacity-80",
                            )}
                          >
                            {saving && (
                              <span className="absolute -right-1.5 -top-1.5 z-10 inline-flex size-5 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-rose-200">
                                <Loader2
                                  className="size-3 animate-spin text-rose-600"
                                  strokeWidth={2.5}
                                  aria-label="Moving post"
                                />
                              </span>
                            )}
                            <span
                              className={cn(
                                "inline-flex size-6 shrink-0 items-center justify-center rounded-[7px]",
                                pm.tile,
                              )}
                            >
                              {pm.icon}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-left text-[11.5px] font-semibold tabular-nums text-ink-800">
                              {fmtChipTime(item.scheduled_for!)}
                            </span>
                            {item.media_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.media_url}
                                alt=""
                                className="size-6 shrink-0 rounded-[6px] object-cover ring-1 ring-inset ring-ink-100"
                              />
                            ) : (
                              <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-cream-100 to-cream-200 ring-1 ring-inset ring-ink-100">
                                <ImagePlus
                                  className="size-3 text-ink-300"
                                  strokeWidth={1.8}
                                />
                              </span>
                            )}
                          </button>
                        );
                      })}

                      {planId && (
                        <button
                          type="button"
                          onClick={() => setAddDate(key)}
                          aria-label={`Add a post on ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                          className="absolute right-1.5 top-1.5 z-20 inline-flex size-6 scale-90 cursor-pointer items-center justify-center rounded-full bg-rose-600 text-white opacity-0 shadow-sm transition-all duration-150 hover:bg-rose-700 focus-visible:scale-100 focus-visible:opacity-100 group-hover:scale-100 group-hover:opacity-100"
                        >
                          <Plus className="size-3.5" strokeWidth={2.6} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

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
                  loading={savingIds.has(item.id)}
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

      {openItem && (
        <NewItemForm editItem={openItem} onClose={() => setOpenId(null)} />
      )}

      {peekItem && peek && (
        <PostPeek
          item={peekItem}
          anchor={peek.anchor}
          onClose={() => setPeek(null)}
          onEdit={() => {
            setPeek(null);
            openDetailEdit(peekItem.id);
          }}
        />
      )}
    </>
  );
}

/**
 * Quick-peek popover for a clicked month chip (the reference's behavior):
 * a compact card anchored to the chip — "Jun 11, 9:42 AM" header with an
 * expand control, the post itself (platform avatar · topic · caption ·
 * media slot) and a footer with the status pill + Mark Posted / edit / ⋯.
 * Backdrop click or Escape closes; expand and the pencil hand off to the
 * full composer.
 */
function PostPeek({
  item,
  anchor,
  onClose,
  onEdit,
}: {
  item: PostingItem;
  anchor: DOMRect;
  onClose: () => void;
  onEdit: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const pm = platformMeta(item.platform ?? "other");
  const done = item.status === "posted" || item.status === "reviewed";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  // Anchor below the chip, clamped to the viewport; flip above when the
  // space below is too tight (same approach as the status pill's menu).
  const W = 420;
  const EST_H = 330;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const left = Math.min(Math.max(anchor.left, 8), Math.max(8, vw - W - 8));
  const below = vh - anchor.bottom;
  const up = below < EST_H + 16 && anchor.top > below;
  const top = up
    ? Math.max(8, anchor.top - 8)
    : Math.min(anchor.bottom + 8, vh - 8);

  const markPosted = () =>
    startTransition(async () => {
      await updateItemStatus(item.id, "posted");
      router.refresh();
      onClose();
    });

  const when = item.scheduled_for
    ? `${new Date(item.scheduled_for).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}, ${fmtChipTime(item.scheduled_for)}`
    : "Not scheduled";

  return createPortal(
    <>
      <button
        type="button"
        aria-hidden
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 z-[52] cursor-default bg-transparent"
      />
      <div
        role="dialog"
        aria-label={`Post preview — ${when}`}
        style={{
          position: "fixed",
          left,
          top,
          width: W,
          maxWidth: "calc(100vw - 16px)",
          transform: up ? "translateY(-100%)" : undefined,
        }}
        className="z-[53] overflow-hidden rounded-[16px] border border-ink-100 bg-white shadow-[0_24px_60px_-24px_rgba(26,24,22,0.45)]"
      >
        {/* header — when · expand */}
        <div className="flex items-center justify-between gap-3 px-4 pb-2.5 pt-3.5">
          <span className="text-[14.5px] font-semibold tabular-nums text-ink-900">
            {when}
          </span>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Open in editor"
            title="Open in editor"
            className="inline-flex size-7 items-center justify-center rounded-[8px] text-ink-500 transition-colors hover:bg-cream-100 hover:text-ink-900"
          >
            <Maximize2 className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* body — platform · topic · caption · media slot */}
        <div className="flex items-start gap-3.5 px-4 pb-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "relative inline-flex size-9 shrink-0 items-center justify-center rounded-[11px] shadow-[0_2px_8px_-3px_rgba(26,24,22,0.35)]",
                  pm.tile,
                )}
              >
                {pm.icon}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate text-[13.5px] font-semibold text-ink-900">
                  {pm.label}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-ink-500">
                  {contentTypeLabel(item.content_type)}
                </span>
              </span>
            </div>
            <p
              className={cn(
                "mt-3 text-[14px] leading-snug",
                item.topic
                  ? "font-semibold text-ink-900"
                  : "italic text-ink-400",
              )}
            >
              {item.topic ?? "No topic yet"}
            </p>
            {item.notes && (
              <p className="mt-1.5 whitespace-pre-wrap break-words text-[12.5px] leading-relaxed text-ink-500 line-clamp-4">
                {item.notes}
              </p>
            )}
          </div>
          {item.media_url ? (
            <span className="relative h-[118px] w-[100px] shrink-0 overflow-hidden rounded-[12px] ring-1 ring-inset ring-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.media_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </span>
          ) : (
            <span className="inline-flex h-[118px] w-[100px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[12px] bg-gradient-to-br from-cream-100 to-cream-200 ring-1 ring-inset ring-ink-100">
              <ImagePlus className="size-5 text-ink-300" strokeWidth={1.8} />
              <span className="text-[10px] font-medium text-ink-400">
                No media
              </span>
            </span>
          )}
        </div>

        {/* footer — status · Mark Posted / edit / ⋯ */}
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-3">
          <StatusPill itemId={item.id} status={item.status} />
          <div className="flex items-center gap-1.5">
            {!done && (
              <button
                type="button"
                onClick={markPosted}
                disabled={pending}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-ink-200 bg-white px-3.5 text-[13px] font-semibold text-ink-800 transition-colors hover:bg-cream-100 disabled:opacity-50"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Send className="size-4" strokeWidth={2} />
                )}
                Mark Posted
              </button>
            )}
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit post"
              title="Edit"
              className="inline-flex size-9 items-center justify-center rounded-[10px] border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-cream-100 hover:text-ink-900"
            >
              <Pencil className="size-4" strokeWidth={2} />
            </button>
            <ItemActionsMenu
              itemId={item.id}
              currentStatus={item.status}
              onEdit={onEdit}
            />
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

function DraggableCard({
  item,
  dragging,
  loading,
  onDragStart,
  onDragEnd,
}: {
  item: PostingItem;
  dragging: boolean;
  /** Reschedule in flight — show a spinner over just this card + lock it. */
  loading: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  return (
    <>
      <div
        draggable={!loading}
        onDragStart={(e) => {
          if (loading) return;
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", item.id);
          onDragStart();
        }}
        onDragEnd={onDragEnd}
        onDoubleClick={() => setDetailOpen(true)}
        className={cn(
          "relative cursor-grab active:cursor-grabbing transition-opacity",
          dragging && "opacity-40",
          loading && "cursor-default",
        )}
        aria-busy={loading || undefined}
      >
        <CalendarItem item={item} onEdit={() => setDetailOpen(true)} />
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[14px] bg-white/55 backdrop-blur-[1px]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-ink-100">
              <Loader2
                className="size-3.5 text-rose-600 animate-spin"
                strokeWidth={2.4}
                aria-hidden
              />
              <span className="text-[11px] font-semibold text-ink-600">
                Moving…
              </span>
            </span>
          </div>
        )}
      </div>
      {detailOpen && (
        <NewItemForm editItem={item} onClose={() => setDetailOpen(false)} />
      )}
    </>
  );
}

/* ── Month grid: one-day pills ─────────────────────────────────────────────
   Each scheduled post is a one-column pill on its day; buildMonthLayout slices
   the month into weeks and stacks overlapping pills into lanes. */

// Month grid header row — full weekday names, like the reference design.
const WEEKDAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const DAY_MS = 86_400_000;

/** Chip time — "9:42 AM", matching the reference's per-post chips. */
function fmtChipTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

type MonthSeg = {
  item: PostingItem;
  startCol: number; // 0-6 within the week
  endCol: number;
  isStart: boolean; // true segment start (vs continued from previous week)
  isEnd: boolean;
  lane: number;
};
type MonthWeek = { days: Date[]; segments: MonthSeg[]; laneCount: number };

function buildMonthLayout(
  monthDays: Date[],
  items: PostingItem[],
): MonthWeek[] {
  const gridStart = startOfDay(monthDays[0]);
  const gidx = (iso: string) =>
    Math.round(
      (startOfDay(new Date(iso)).getTime() - gridStart.getTime()) / DAY_MS,
    );

  const events = items
    .map((item) => {
      if (item.scheduled_for) {
        const g = gidx(item.scheduled_for);
        return { item, startIdx: g, endIdx: g };
      }
      return null;
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const weekCount = Math.ceil(monthDays.length / 7);
  const weeks: MonthWeek[] = [];
  for (let wi = 0; wi < weekCount; wi++) {
    const ws = wi * 7;
    const we = ws + 6;
    const raw: MonthSeg[] = [];
    for (const ev of events) {
      const segS = Math.max(ev.startIdx, ws);
      const segE = Math.min(ev.endIdx, we);
      if (segS > segE) continue; // no overlap with this week
      raw.push({
        item: ev.item,
        startCol: segS - ws,
        endCol: segE - ws,
        isStart: segS === ev.startIdx,
        isEnd: segE === ev.endIdx,
        lane: 0,
      });
    }
    // Longer / earlier segments first, then greedily assign non-overlapping lanes.
    raw.sort(
      (a, b) =>
        a.startCol - b.startCol ||
        b.endCol - b.startCol - (a.endCol - a.startCol),
    );
    const laneEnds: number[] = [];
    for (const seg of raw) {
      let lane = 0;
      while (lane < laneEnds.length && laneEnds[lane] >= seg.startCol) lane++;
      seg.lane = lane;
      laneEnds[lane] = seg.endCol;
    }
    weeks.push({
      days: monthDays.slice(ws, we + 1),
      segments: raw,
      laneCount: laneEnds.length,
    });
  }
  return weeks;
}

/* (The month grid now renders per-day chips inline in each cell — the old
   spanning MonthBar was retired with the reference redesign. Phased posts
   appear on their publish day; the Week view still shows full phase detail.) */

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
