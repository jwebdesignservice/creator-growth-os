"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Video,
  Clapperboard,
  Images,
  Plus,
  FileText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { PostingItem, PlatformKey } from "@/lib/posting/queries";
import { platformMeta } from "@/lib/posting/platform-meta";
import { contentTypeAccent } from "@/lib/posting/content-type-accent";
import { ItemActionsMenu } from "./item-actions-menu";
import { StatusPill } from "./status-pill";
import { PostDetailModal } from "./post-detail-modal";

type Props = {
  items: PostingItem[];
  /**
   * When true, the rows are placeholder demo items (no plan exists yet).
   * We hide the row actions so users don't try to change a status on a
   * row that doesn't exist in the database.
   */
  isDemo?: boolean;
  /** Optional "Add Post" action — rendered inside the empty state. */
  addPostSlot?: ReactNode;
};

/**
 * Planned Posts — the plan's content list.
 *
 * Noise-audited: one header line with a live count and the section's single
 * calendar link; no fake sort affordances, no per-row decorative icons, and
 * ONE accent carrier per fact (the platform/type tiles — no colored rails or
 * format chips repeating the same information). Every row is clickable
 * (click/Enter opens the post editor); the status pill and the ⋯ menu stay
 * independently interactive. Below `sm` the table becomes a stacked list so
 * nothing scrolls sideways on phones.
 */
export function PlannedPostsTable({ items, isDemo = false, addPostSlot }: Props) {
  const count = items.length;
  // Which post is open in the detail/edit popup (null = closed).
  const [editItem, setEditItem] = useState<PostingItem | null>(null);

  const openItem = (item: PostingItem) => {
    if (!isDemo) setEditItem(item);
  };

  return (
    <>
      <section className="bg-cream-100 overflow-hidden lg:flex lg:flex-col lg:min-h-[90vh]">
        {/* ── Header — title · count · the section's one calendar link ── */}
        <header className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4.5 border-b border-ink-100 shrink-0 min-h-[60px]">
          <div className="flex items-baseline gap-2.5 min-w-0">
            <h3 className="text-h4 text-ink-900">Planned Posts</h3>
            {count > 0 && (
              <span className="text-[12.5px] font-medium text-ink-500 tabular-nums">
                {count} upcoming
              </span>
            )}
          </div>
          <Link
            href="/posting?view=calendar"
            className="group/cal inline-flex items-center gap-1 shrink-0 text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-md"
          >
            Open calendar
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover/cal:translate-x-0.5"
              strokeWidth={2.5}
            />
          </Link>
        </header>

        {isDemo && (
          <div className="px-5 sm:px-6 py-2.5 bg-rose-50/60 border-b border-rose-100 text-[12px] text-rose-700">
            Demo data — create a posting plan to see your own items and use the
            row actions.
          </div>
        )}

        {count === 0 ? (
          <div className="p-10 text-center lg:flex-1 lg:flex lg:flex-col lg:items-center lg:justify-center">
            <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
              <Sparkles className="size-5" strokeWidth={1.8} />
            </div>
            <p className="text-[14px] text-ink-700 mb-1 font-medium">
              No posts planned yet
            </p>
            <p className="text-[12.5px] text-ink-500 mb-5">
              Schedule your first post to start the week.
            </p>
            {addPostSlot && <div className="flex justify-center">{addPostSlot}</div>}
          </div>
        ) : (
          <>
            {/* ── Desktop / tablet table ──────────────────────────────── */}
            <div className="hidden sm:block overflow-auto lg:flex-1 lg:min-h-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-400 border-b border-ink-100">
                    <th className="font-semibold py-3 px-5 sm:px-6">Date &amp; time</th>
                    <th className="font-semibold py-3 px-3">Platform</th>
                    <th className="font-semibold py-3 px-3">Content type</th>
                    <th className="font-semibold py-3 px-3">Topic</th>
                    <th className="font-semibold py-3 px-3">Status</th>
                    <th className="py-3 px-5 sm:px-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      tabIndex={isDemo ? undefined : 0}
                      onClick={() => openItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openItem(item);
                        }
                      }}
                      aria-label={
                        isDemo ? undefined : `Open “${item.topic ?? "post"}”`
                      }
                      className={cn(
                        "border-b border-ink-100 last:border-0 transition-colors",
                        !isDemo &&
                          "cursor-pointer hover:bg-white/60 focus-visible:outline-none focus-visible:bg-white/60",
                      )}
                    >
                      <td className="py-3.5 px-5 sm:px-6">
                        <DateCell when={item.scheduled_for} />
                      </td>
                      <td className="py-3.5 px-3">
                        <PlatformCell platform={item.platform} />
                      </td>
                      <td className="py-3.5 px-3">
                        <ContentTypeCell type={item.content_type} />
                      </td>
                      <td className="py-3.5 px-3 max-w-[280px]">
                        <TopicCell topic={item.topic} />
                      </td>
                      {/* Interactive cells — clicks must not open the row */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <StatusPill
                          itemId={item.id}
                          status={item.status}
                          readOnly={isDemo}
                        />
                      </td>
                      <td
                        className="py-3.5 px-5 sm:px-6 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {!isDemo && (
                          <ItemActionsMenu
                            itemId={item.id}
                            currentStatus={item.status}
                            onEdit={() => setEditItem(item)}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile — stacked list, no sideways scrolling ────────── */}
            <ul className="sm:hidden divide-y divide-ink-100">
              {items.map((item) => {
                const pm = item.platform ? platformMeta(item.platform) : null;
                return (
                  <li key={item.id}>
                    <div
                      role={isDemo ? undefined : "button"}
                      tabIndex={isDemo ? undefined : 0}
                      onClick={() => openItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openItem(item);
                        }
                      }}
                      className={cn(
                        "px-5 py-3.5 transition-colors",
                        !isDemo &&
                          "cursor-pointer active:bg-white/60 focus-visible:outline-none focus-visible:bg-white/60",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {pm && (
                          <span
                            className={cn(
                              "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
                              pm.tile,
                            )}
                          >
                            {pm.icon}
                          </span>
                        )}
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="text-[13.5px] font-semibold text-ink-900 truncate">
                            {item.topic ?? "Untitled post"}
                          </div>
                          <div className="text-[12px] text-ink-500 truncate mt-0.5">
                            <DateInline when={item.scheduled_for} />
                            {item.content_type && (
                              <> · {typeMeta(item.content_type).label}</>
                            )}
                          </div>
                        </div>
                        <span onClick={(e) => e.stopPropagation()} className="shrink-0">
                          <StatusPill
                            itemId={item.id}
                            status={item.status}
                            readOnly={isDemo}
                          />
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
      {editItem && (
        <PostDetailModal item={editItem} onClose={() => setEditItem(null)} />
      )}
    </>
  );
}

/* ── Cells ─────────────────────────────────────────────────────────────── */

/** "Today" (rose) / "Tomorrow" / "Sun, Jun 14" over a muted time. */
function DateCell({ when }: { when: string | null }) {
  if (!when) return <span className="text-ink-400">—</span>;
  const { day, time, isToday } = splitWhen(when);
  return (
    <div className="leading-tight">
      <div
        className={cn(
          "text-[13px] font-semibold",
          isToday ? "text-rose-600" : "text-ink-900",
        )}
      >
        {day}
      </div>
      <div className="text-[11.5px] text-ink-500 tabular-nums mt-0.5">{time}</div>
    </div>
  );
}

function DateInline({ when }: { when: string | null }) {
  if (!when) return <>Unscheduled</>;
  const { day, time, isToday } = splitWhen(when);
  return (
    <>
      <span className={isToday ? "font-semibold text-rose-600" : undefined}>{day}</span>
      , {time}
    </>
  );
}

function splitWhen(when: string): { day: string; time: string; isToday: boolean } {
  const d = new Date(when);
  if (Number.isNaN(d.getTime())) return { day: "—", time: "", isToday: false };
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(new Date())) / 86_400_000);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days === 0) return { day: "Today", time, isToday: true };
  if (days === 1) return { day: "Tomorrow", time, isToday: false };
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    time,
    isToday: false,
  };
}

function PlatformCell({ platform }: { platform: PlatformKey | null }) {
  if (!platform) return <span className="text-ink-400">—</span>;
  const meta = platformMeta(platform);
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "size-8 rounded-[9px] inline-flex items-center justify-center shrink-0",
          meta.tile,
        )}
      >
        {meta.icon}
      </span>
      <span className="text-[13px] font-medium text-ink-800">{meta.label}</span>
    </div>
  );
}

/** One accent carrier: the tinted tile. Label stays neutral for scanning. */
function ContentTypeCell({ type }: { type: string | null }) {
  if (!type) return <span className="text-ink-400">—</span>;
  const meta = typeMeta(type);
  const accent = contentTypeAccent(type);
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span
        className={cn(
          "size-8 rounded-[9px] inline-flex items-center justify-center shrink-0",
          accent.tile,
        )}
      >
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <span className="text-[13px] font-medium text-ink-800 truncate">
        {meta.label}
      </span>
    </div>
  );
}

function TopicCell({ topic }: { topic: string | null }) {
  if (!topic) return <span className="text-[13px] text-ink-400 italic">No topic</span>;
  return (
    <div className="text-[13px] font-semibold text-ink-900 truncate">{topic}</div>
  );
}

function typeMeta(t: string): { label: string; icon: LucideIcon } {
  const map: Record<string, { label: string; icon: LucideIcon }> = {
    reel: { label: "Reel", icon: Clapperboard },
    short_video: { label: "Short Video", icon: Video },
    story: { label: "Story", icon: Plus },
    carousel: { label: "Carousel", icon: Images },
    post: { label: "Post", icon: FileText },
    video: { label: "Video", icon: Video },
    youtube_video: { label: "YouTube Video", icon: Video },
  };
  return map[t] ?? { label: t.replace(/_/g, " "), icon: FileText };
}
