"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Clock, CalendarDays } from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";

export type UpcomingItem = {
  id: string;
  platform: "instagram" | "tiktok" | "youtube";
  label: string;
  time: string;
  dayIndex: number; // 0 = today … 6 = six days out
};

export type WeekDay = {
  short: string;   // "Mon"
  date: number;    // 19
  isToday?: boolean;
  count?: number;  // scheduled posts that day (rendered as 1–4 dots)
};

const CALENDAR_HREF = "/posting?view=calendar";

export function UpcomingContent({
  days,
  items,
}: {
  days: WeekDay[];
  items: UpcomingItem[];
}) {
  const todayIndex = Math.max(
    0,
    days.findIndex((d) => d.isToday),
  );
  const [selected, setSelected] = useState(todayIndex);

  const selectedDay = days[selected];
  const dayItems = items.filter((it) => it.dayIndex === selected);

  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <header className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="font-display text-[19px] text-ink-900 leading-tight">
            Upcoming Content
          </h3>
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
              key={d.date}
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
              <span className="text-[14px] font-bold tabular-nums">
                {d.date}
              </span>
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
          {dayItems.map((item) => (
            <Link
              key={item.id}
              href={CALENDAR_HREF}
              className="group rounded-[14px] border border-ink-100 bg-white p-3.5 flex flex-col gap-2.5 hover:border-rose-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="size-9 rounded-[11px] bg-cream-100 flex items-center justify-center">
                  <PlatformIcon platform={item.platform} />
                </span>
                <span className="chip chip-gold text-[10px] px-2 py-0.5">
                  Scheduled
                </span>
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-ink-900 truncate group-hover:text-rose-700 transition-colors">
                  {item.label}
                </div>
                <div className="mt-1 flex items-center gap-1 text-[11.5px] text-ink-500 tabular-nums">
                  <Clock className="size-3" strokeWidth={2} />
                  {item.time}
                </div>
              </div>
            </Link>
          ))}

          {/* Add Content tile */}
          <Link
            href={CALENDAR_HREF}
            className="rounded-[14px] border-2 border-dashed border-ink-200 flex flex-col items-center justify-center gap-1.5 p-3.5 text-ink-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/40 transition-colors min-h-[104px]"
          >
            <Plus className="size-5" strokeWidth={2} />
            <span className="text-[12px] font-semibold">Add Content</span>
          </Link>
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
          <Link
            href={CALENDAR_HREF}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-rose-600 text-white text-[12.5px] font-semibold hover:bg-rose-700 transition-colors"
          >
            <Plus className="size-3.5" strokeWidth={2.5} /> Add Content
          </Link>
        </div>
      )}

      <Link
        href={CALENDAR_HREF}
        className="mt-4 sm:hidden inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
      >
        View full content calendar <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}

function PlatformIcon({
  platform,
}: {
  platform: "instagram" | "tiktok" | "youtube";
}) {
  if (platform === "instagram") {
    return <InstagramIcon className="text-rose-600" size={16} />;
  }
  if (platform === "youtube") {
    return <YoutubeIcon className="text-rose-600" size={16} />;
  }
  return <TiktokIcon className="text-ink-900" size={16} />;
}
