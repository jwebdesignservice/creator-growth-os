"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PlatformKey, ContentStatus } from "@/lib/posting/queries";
import {
  contentTypeAccent,
  contentTypeLabel,
} from "@/lib/posting/content-type-accent";
import { PlatformGlyph } from "@/components/posting/platform-glyphs";
import { NewItemForm } from "@/components/posting/posting-actions";

export type UpcomingItem = {
  id: string;
  platform: PlatformKey;
  status: ContentStatus;
  /** Content-type slug (reel / story / youtube_video …) for the colored label. */
  contentType: string | null;
  label: string;
  time: string;
  dayIndex: number; // 0 = today … 6 = six days out
};

export type WeekDay = {
  short: string; // "Mon"
  date: number; // 19
  iso: string; // "2026-05-29" — used to pre-fill the Add Content popup
  isToday?: boolean;
  count?: number; // scheduled posts that day (rendered as 1–4 dots)
};

const CALENDAR_HREF = "/posting?view=calendar";

// Accurate, on-brand chip per pipeline status (mirrors the calendar / status pill).
const STATUS_CHIP: Record<ContentStatus, { label: string; cls: string }> = {
  idea: { label: "Idea", cls: "bg-cream-200 text-ink-600" },
  planned: { label: "Scheduled", cls: "bg-amber-50 text-amber-700" },
  scripted: { label: "Scripted", cls: "bg-sky-50 text-sky-700" },
  filmed: { label: "Filmed", cls: "bg-emerald-50 text-emerald-700" },
  edited: { label: "Edited", cls: "bg-violet-50 text-violet-700" },
  posted: { label: "Posted", cls: "bg-emerald-50 text-emerald-700" },
  reviewed: { label: "Reviewed", cls: "bg-emerald-50 text-emerald-700" },
};

export function UpcomingContent({
  days,
  items,
  activePlanId = null,
}: {
  days: WeekDay[];
  items: UpcomingItem[];
  /** When present, "Add Content" opens the create-post popup pre-filled to the
   *  selected day. Without an active plan it falls back to the calendar. */
  activePlanId?: string | null;
}) {
  const todayIndex = Math.max(
    0,
    days.findIndex((d) => d.isToday),
  );
  const [selected, setSelected] = useState(todayIndex);
  const [addOpen, setAddOpen] = useState(false);

  const selectedDay = days[selected];
  const dayItems = items.filter((it) => it.dayIndex === selected);
  const canPopup = !!activePlanId && !!selectedDay;

  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="text-h4 text-ink-900 leading-tight">Upcoming Content</h3>
          <p className="text-[12.5px] text-ink-500 leading-snug">
            Your content calendar at a glance
          </p>
        </div>
        <Link
          href={CALENDAR_HREF}
          className="hidden sm:inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700 shrink-0"
        >
          Full calendar <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </header>

      {/* Week strip — click a day to see what's scheduled */}
      <div className="grid grid-cols-7 gap-1.5 mb-5">
        {days.map((d, i) => {
          const isSelected = i === selected;
          const dots = Math.min(d.count ?? 0, 4);
          return (
            <button
              key={d.iso}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={isSelected}
              title={
                d.count
                  ? `${d.count} scheduled post${d.count > 1 ? "s" : ""}`
                  : "No posts scheduled"
              }
              className={cn(
                "rounded-[12px] py-2.5 flex flex-col items-center gap-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
                isSelected
                  ? "bg-rose-500 text-white"
                  : d.isToday
                    ? "bg-cream-100 text-ink-700 ring-1 ring-inset ring-rose-300 hover:bg-cream-200"
                    : "bg-cream-100 text-ink-700 hover:bg-cream-200",
              )}
            >
              <span className="text-[10px] uppercase tracking-wide font-semibold opacity-80">
                {d.short}
              </span>
              <span className="text-[14px] font-bold tabular-nums">{d.date}</span>
              <span
                aria-hidden
                className="flex items-center justify-center gap-0.5 h-1.5"
              >
                {Array.from({ length: dots }).map((_, j) => (
                  <span
                    key={j}
                    className={cn(
                      "size-1 rounded-full",
                      isSelected ? "bg-white" : "bg-rose-400",
                    )}
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content for the selected day */}
      {dayItems.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          {dayItems.map((item) => {
            const chip = STATUS_CHIP[item.status] ?? STATUS_CHIP.planned;
            return (
              <Link
                key={item.id}
                href={CALENDAR_HREF}
                className="group rounded-[14px] border border-ink-100 bg-white p-3.5 flex flex-col gap-2.5 hover:border-rose-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <PlatformGlyph platform={item.platform} className="size-9" />
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      chip.cls,
                    )}
                  >
                    {chip.label}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-ink-900 truncate group-hover:text-rose-700 transition-colors">
                    {item.label}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[11.5px]">
                    <span
                      className={cn(
                        "font-semibold truncate min-w-0",
                        contentTypeAccent(item.contentType).label,
                      )}
                    >
                      {contentTypeLabel(item.contentType)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-ink-500 tabular-nums shrink-0">
                      <Clock className="size-3" strokeWidth={2} />
                      {item.time}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Add Content tile */}
          <AddContentTile canPopup={canPopup} onOpen={() => setAddOpen(true)} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center rounded-[14px] border-2 border-dashed border-ink-200 py-9 px-4">
          <span className="size-11 rounded-full bg-cream-100 text-ink-400 inline-flex items-center justify-center mb-3">
            <CalendarDays className="size-5" strokeWidth={1.8} />
          </span>
          <p className="text-[13.5px] font-semibold text-ink-900">
            Nothing scheduled
            {selectedDay ? ` for ${selectedDay.short} ${selectedDay.date}` : ""}
          </p>
          <p className="text-[12px] text-ink-500 mt-0.5 mb-3.5">
            Plan a post to keep your momentum going.
          </p>
          {canPopup ? (
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" strokeWidth={2.5} /> Add Content
            </button>
          ) : (
            <Link
              href={CALENDAR_HREF}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 transition-colors"
            >
              <Plus className="size-3.5" strokeWidth={2.5} /> Add Content
            </Link>
          )}
        </div>
      )}

      <Link
        href={CALENDAR_HREF}
        className="mt-4 sm:hidden inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
      >
        View full content calendar{" "}
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>

      {/* Create-post popup — pre-filled to the selected day. */}
      {addOpen && activePlanId && selectedDay && (
        <NewItemForm
          planId={activePlanId}
          initialDate={selectedDay.iso}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}

function AddContentTile({
  canPopup,
  onOpen,
}: {
  canPopup: boolean;
  onOpen: () => void;
}) {
  const cls =
    "rounded-[14px] border-2 border-dashed border-ink-200 flex flex-col items-center justify-center gap-1.5 p-3.5 text-ink-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/40 transition-colors min-h-[104px]";
  if (canPopup) {
    return (
      <button type="button" onClick={onOpen} className={cn(cls, "cursor-pointer")}>
        <Plus className="size-5" strokeWidth={2} />
        <span className="text-[12px] font-semibold">Add Content</span>
      </button>
    );
  }
  return (
    <Link href={CALENDAR_HREF} className={cls}>
      <Plus className="size-5" strokeWidth={2} />
      <span className="text-[12px] font-semibold">Add Content</span>
    </Link>
  );
}
