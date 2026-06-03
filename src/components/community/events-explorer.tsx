"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  X,
  ChevronDown,
  CalendarRange,
  CalendarClock,
  CalendarDays,
  Radio,
  MessageCircleQuestion,
  GraduationCap,
  Phone,
  type LucideIcon,
} from "lucide-react";
import { EventCard } from "./event-card";
import { EVENT_KINDS } from "@/lib/community/event-kinds";
import type { CommunityEvent } from "@/lib/community/queries";
import { cn } from "@/lib/cn";

const KIND_ICON: Record<string, LucideIcon> = {
  live: Radio,
  qa: MessageCircleQuestion,
  workshop: GraduationCap,
  call: Phone,
  other: CalendarDays,
};

const TYPE_FILTERS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "All Events", icon: CalendarRange },
  ...EVENT_KINDS.map((k) => ({
    key: k.value,
    label: k.label,
    icon: KIND_ICON[k.value] ?? CalendarDays,
  })),
];

const RANGES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "week", label: "Next 7 days" },
  { value: "month", label: "Next 30 days" },
  { value: "past", label: "Past events" },
  { value: "all", label: "All events" },
];

/**
 * Client-side explorer for the members' Events tab — filter pills (by type),
 * live search, a date-range dropdown and a sort toggle, over a Tutorial-Library
 * style card grid. Filtering happens in-memory on the already-fetched upcoming
 * events (mirrors how the Tutorial Library filters its list).
 */
export function EventsExplorer({
  events,
  tabs,
}: {
  events: CommunityEvent[];
  tabs?: ReactNode;
}) {
  const [type, setType] = useState("all");
  const [range, setRange] = useState("upcoming");
  const [rangeOpen, setRangeOpen] = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"soonest" | "latest">("soonest");

  const visible = useMemo(() => {
    let rows = events;
    if (type !== "all") rows = rows.filter((e) => (e.kind ?? "other") === type);
    {
      const now = Date.now();
      if (range === "upcoming") {
        rows = rows.filter((e) => new Date(e.starts_at).getTime() >= now);
      } else if (range === "past") {
        rows = rows.filter((e) => new Date(e.starts_at).getTime() < now);
      } else if (range === "week" || range === "month") {
        const horizon = now + (range === "week" ? 7 : 30) * 86_400_000;
        rows = rows.filter((e) => {
          const t = new Date(e.starts_at).getTime();
          return t >= now && t <= horizon;
        });
      }
      // range === "all" → no date filter
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.description ?? "").toLowerCase().includes(q) ||
          (e.host_name ?? "").toLowerCase().includes(q),
      );
    }
    if (sort === "latest") rows = [...rows].reverse();
    return rows;
  }, [events, type, range, query, sort]);

  const noEventsAtAll = events.length === 0;
  const hasFilters =
    query.trim() !== "" || type !== "all" || range !== "upcoming";
  const currentRangeLabel =
    RANGES.find((r) => r.value === range)?.label ?? "Upcoming";
  const heading =
    range === "past"
      ? "Past Events"
      : range === "all"
        ? "All Events"
        : "Upcoming Events";
  const currentType =
    TYPE_FILTERS.find((f) => f.key === type) ?? TYPE_FILTERS[0];
  const TypeIcon = currentType.icon;

  return (
    <section className="space-y-5">
      {/* Tabs (left) + filters (right) — one shared row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {tabs}
        <div className="flex items-center gap-2.5 flex-wrap">
        {/* Event-type dropdown (replaces the old row of tabs) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setTypeOpen((v) => !v);
              setRangeOpen(false);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer"
          >
            <TypeIcon className="size-3.5 text-rose-500" strokeWidth={2} />
            {currentType.label}
            <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
          </button>
          {typeOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[210px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              {TYPE_FILTERS.map((f) => {
                const Icon = f.icon;
                const active = type === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => {
                      setType(f.key);
                      setTypeOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 text-left px-3 py-2 text-[13px] hover:bg-cream-100 cursor-pointer",
                      active ? "text-rose-700 font-semibold" : "text-ink-700",
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4",
                        active ? "text-rose-500" : "text-ink-400",
                      )}
                      strokeWidth={2}
                    />
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Date-range dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setRangeOpen((v) => !v);
              setTypeOpen(false);
            }}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 hover:bg-cream-100 cursor-pointer"
          >
            <CalendarClock className="size-3.5 text-ink-500" strokeWidth={2} />
            {currentRangeLabel}
            <ChevronDown className="size-3.5 text-ink-500" strokeWidth={2} />
          </button>
          {rangeOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-30 w-[180px] rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              {RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => {
                    setRange(r.value);
                    setRangeOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-1.5 text-[13px] hover:bg-cream-100 cursor-pointer",
                    range === r.value
                      ? "text-rose-700 font-semibold"
                      : "text-ink-700",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 size-[15px] text-ink-400"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events…"
            aria-label="Search events"
            className="w-[170px] sm:w-[230px] h-10 pl-9 pr-8 rounded-[12px] bg-white border border-ink-100 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-6 inline-flex items-center justify-center rounded-full text-ink-400 hover:text-ink-700 hover:bg-cream-200 transition-colors"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Header + sort */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-h4 sm:text-[22px] text-ink-900">{heading}</h2>
        <div className="text-[12.5px] text-ink-500">
          {visible.length} {visible.length === 1 ? "event" : "events"} ·{" "}
          <button
            type="button"
            onClick={() => setSort((s) => (s === "soonest" ? "latest" : "soonest"))}
            className="text-ink-700 hover:text-rose-600 underline-offset-4 hover:underline cursor-pointer"
          >
            Sort: {sort === "soonest" ? "Soonest" : "Latest"}
          </button>
        </div>
      </div>

      {/* Grid */}
      {visible.length === 0 ? (
        <div className="card p-10 text-center text-[14px]">
          <p className="text-ink-500">
            {noEventsAtAll
              ? "No events yet — check back soon."
              : query.trim()
                ? `No events match “${query.trim()}”.`
                : "No events match these filters yet."}
          </p>
          {!noEventsAtAll && hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setType("all");
                setRange("upcoming");
              }}
              className="mt-3 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-50 border border-rose-100 text-rose-700 text-[13px] font-medium hover:bg-rose-100 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visible.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </section>
  );
}
