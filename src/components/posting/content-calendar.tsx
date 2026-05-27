import Link from "next/link";
import { Plus } from "lucide-react";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import type { PostingItem } from "@/lib/posting/queries";

type Props = {
  items: PostingItem[];
  weekStart?: string | null;
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
 * Renders the active plan's posting items as a 7-day calendar grid.
 * Day cells start on Monday of the plan's week (or today's Monday if
 * weekStart isn't passed). Items with no scheduled_for go into an
 * "Unscheduled" column at the end.
 */
export function ContentCalendar({ items, weekStart }: Props) {
  const monday = mondayOf(weekStart ? new Date(weekStart) : new Date());
  const days: Date[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });

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
  // Sort each day's items by time
  for (const arr of byDay.values()) {
    arr.sort((a, b) => {
      const ta = a.scheduled_for ? new Date(a.scheduled_for).getTime() : 0;
      const tb = b.scheduled_for ? new Date(b.scheduled_for).getTime() : 0;
      return ta - tb;
    });
  }

  const today = isoDateOf(new Date());

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
        <div>
          <h3 className="text-h4 text-ink-900 leading-none">
            Content Calendar
          </h3>
          <p className="text-[12px] text-ink-500 mt-1">
            Week of {monday.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </p>
        </div>
        <Link
          href="/posting"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          Back to My Plans
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 divide-y lg:divide-y-0 lg:divide-x divide-ink-100">
        {days.map((d) => {
          const key = isoDateOf(d);
          const dayItems = byDay.get(key) ?? [];
          const isToday = key === today;
          return (
            <div
              key={key}
              className={`flex flex-col min-h-[200px] p-3 ${
                isToday ? "bg-rose-50/30" : ""
              }`}
            >
              <header className="mb-2">
                <div className="text-[10px] uppercase tracking-wide text-ink-500 font-semibold">
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`text-[18px] font-display leading-none ${
                    isToday ? "text-rose-600" : "text-ink-900"
                  }`}
                >
                  {d.getDate()}
                </div>
              </header>

              {dayItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-[11px] text-ink-300">—</span>
                </div>
              ) : (
                <ul className="space-y-2">
                  {dayItems.map((item) => (
                    <li key={item.id}>
                      <CalendarItem item={item} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {unscheduled.length > 0 && (
        <section className="border-t border-ink-100 px-5 py-4">
          <div className="text-[11px] uppercase tracking-wide text-ink-500 font-semibold mb-3">
            Unscheduled
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {unscheduled.map((item) => (
              <li key={item.id}>
                <CalendarItem item={item} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="border-t border-ink-100 px-5 py-3 flex items-center justify-center">
        <Link
          href="/posting"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          <Plus className="size-3.5" strokeWidth={2.5} />
          Add a post
        </Link>
      </footer>
    </section>
  );
}

function CalendarItem({ item }: { item: PostingItem }) {
  const time = item.scheduled_for
    ? new Date(item.scheduled_for).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      className={`rounded-[10px] border p-2 ${STATUS_TONE[item.status]}`}
    >
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium mb-1 opacity-80">
        <PlatformIcon platform={item.platform} />
        {time && <span className="tabular-nums">{time}</span>}
      </div>
      <div className="text-[12px] font-medium text-ink-900 leading-snug line-clamp-2 mb-1">
        {item.topic ?? item.content_type ?? "Untitled post"}
      </div>
      <div className="text-[10px] uppercase tracking-wide opacity-80">
        {STATUS_LABEL[item.status]}
      </div>
    </div>
  );
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
  return d.toISOString().slice(0, 10);
}
