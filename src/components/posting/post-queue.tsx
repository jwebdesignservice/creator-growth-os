"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Plus,
  Send,
  Pencil,
  Loader2,
  Video,
  Clapperboard,
  Images,
  ImagePlus,
  FileText,
  CalendarClock,
  ExternalLink,
  Check,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { PostingItem } from "@/lib/posting/queries";
import { platformMeta } from "@/lib/posting/platform-meta";
import { contentTypeLabel } from "@/lib/posting/content-type-accent";
import {
  queueItemForPublish,
  publishItemNow,
} from "@/app/(app)/posting/publish-actions";
import { StatusPill } from "./status-pill";
import { ItemActionsMenu } from "./item-actions-menu";
import { NewItemForm } from "./posting-actions";

/* Per-type glyph for the platform avatar's corner badge. */
const TYPE_ICON: Record<string, LucideIcon> = {
  reel: Clapperboard,
  short_video: Video,
  story: Plus,
  carousel: Images,
  post: FileText,
  video: Video,
  youtube_video: Video,
};

/**
 * Post queue — the Posts tab's timeline (the reference's queue view).
 *
 * Posts are grouped under day headings ("Today, Jun 10" · "Tomorrow, Jun 11"
 * · "Friday, Jun 12"), each with its scheduled time in the left rail. A post
 * renders as a rich card: platform avatar with a content-type corner badge,
 * the interactive status pill, the topic as the card's main text, and a
 * footer pairing the full date·time with the three-stage publish control
 * (Que to publish → Publish now → View post), edit, and the ⋯ menu. Every
 * day group ends
 * in a "+ New" slot at a suggested time that opens the composer pre-filled
 * with that day. The next 7 days always render, so the queue reads as a
 * schedule you fill rather than a bare list.
 */
export function PostQueue({
  items,
  planId,
}: {
  items: PostingItem[];
  planId: string;
}) {
  const [editItem, setEditItem] = useState<PostingItem | null>(null);
  const [composeDay, setComposeDay] = useState<string | null>(null);

  const { days, unscheduled } = useMemo(() => {
    const byDay = new Map<string, PostingItem[]>();
    const unscheduled: PostingItem[] = [];
    for (const it of items) {
      const d = it.scheduled_for ? new Date(it.scheduled_for) : null;
      if (!d || Number.isNaN(d.getTime())) {
        unscheduled.push(it);
        continue;
      }
      const key = toKey(d);
      const list = byDay.get(key);
      if (list) list.push(it);
      else byDay.set(key, [it]);
    }
    // The queue always scaffolds the next 7 days, even when empty.
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const k = toKey(d);
      if (!byDay.has(k)) byDay.set(k, []);
    }
    const keys = Array.from(byDay.keys()).sort();
    return {
      days: keys.map((key) => ({
        key,
        items: (byDay.get(key) ?? []).sort(
          (a, b) =>
            new Date(a.scheduled_for!).getTime() -
            new Date(b.scheduled_for!).getTime(),
        ),
      })),
      unscheduled,
    };
  }, [items]);

  return (
    <div className="max-w-[880px] space-y-7 pb-4">
      {days.map((day) => (
        <section key={day.key}>
          <DayHeading dayKey={day.key} />
          <div className="mt-3 space-y-3">
            {day.items.map((item) => (
              <QueueRow key={item.id} time={fmtTime(new Date(item.scheduled_for!))}>
                <QueueCard item={item} onEdit={() => setEditItem(item)} />
              </QueueRow>
            ))}
            <QueueRow time={fmtTime(suggestSlot(day.key, day.items))}>
              <button
                type="button"
                onClick={() => setComposeDay(day.key)}
                className="flex h-12 w-full items-center gap-1.5 rounded-[14px] bg-cream-200/55 px-4 text-[13.5px] font-medium text-ink-500 transition-colors hover:bg-cream-200 hover:text-ink-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                <Plus className="size-4" strokeWidth={2.2} />
                New
              </button>
            </QueueRow>
          </div>
        </section>
      ))}

      {unscheduled.length > 0 && (
        <section>
          <h4 className="text-[15px] font-bold text-ink-900">Unscheduled</h4>
          <div className="mt-3 space-y-3">
            {unscheduled.map((item) => (
              <QueueRow key={item.id} time="—">
                <QueueCard item={item} onEdit={() => setEditItem(item)} />
              </QueueRow>
            ))}
          </div>
        </section>
      )}

      {editItem && (
        <NewItemForm
          planId={planId}
          editItem={editItem}
          onClose={() => setEditItem(null)}
        />
      )}
      {composeDay && (
        <NewItemForm
          planId={planId}
          initialDate={composeDay}
          onClose={() => setComposeDay(null)}
        />
      )}
    </div>
  );
}

/* ── Pieces ────────────────────────────────────────────────────────────── */

function DayHeading({ dayKey }: { dayKey: string }) {
  const { lead, rest } = dayLabel(dayKey);
  return (
    <h4 className="text-[15px] leading-none">
      <span className="font-bold text-ink-900">{lead}</span>
      <span className="font-medium text-ink-400">, {rest}</span>
    </h4>
  );
}

/** Time gutter + content. The gutter hides on phones (the card footer carries
    the full date·time, so nothing is lost). */
function QueueRow({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="hidden sm:block w-[76px] shrink-0 pt-3 text-[12.5px] font-semibold tabular-nums text-ink-500">
        {time}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function QueueCard({
  item,
  onEdit,
}: {
  item: PostingItem;
  onEdit: () => void;
}) {
  const pm = item.platform ? platformMeta(item.platform) : null;
  const TypeIcon = TYPE_ICON[item.content_type ?? ""] ?? FileText;
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // Three-stage publish control: draft → "Que to publish" → queued (auto-
  // publishes at its scheduled time via the connected account) → "Publish
  // now" force-publishes → published → "View post". Legacy posts marked
  // posted/reviewed before the lifecycle existed count as published.
  const publishState = item.publish_state ?? "draft";
  const isPublished =
    publishState === "published" ||
    item.status === "posted" ||
    item.status === "reviewed";
  const isQueued =
    !isPublished &&
    (publishState === "queued" || publishState === "publishing");
  const failError = publishState === "failed" ? item.publish_error : null;

  const queueForPublish = () =>
    startTransition(async () => {
      setErr(null);
      const res = await queueItemForPublish(item.id);
      if (!res.ok) setErr(res.error);
    });

  const publishNow = () =>
    startTransition(async () => {
      setErr(null);
      const res = await publishItemNow(item.id);
      if (!res.ok) setErr(res.error);
    });

  return (
    <div className="group flex min-h-[270px] flex-col overflow-hidden rounded-[16px] border border-ink-100 bg-white shadow-[0_1px_2px_rgba(26,24,22,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-[0_16px_32px_-20px_rgba(26,24,22,0.38)]">
      {/* Body — click anywhere to open the editor */}
      <div
        role="button"
        tabIndex={0}
        onClick={onEdit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onEdit();
          }
        }}
        aria-label={`Open “${item.topic ?? "post"}”`}
        className="flex flex-1 flex-col cursor-pointer px-4 pb-3.5 pt-4 focus-visible:bg-cream-50 focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {pm && (
              <span
                className={cn(
                  "relative inline-flex size-10 shrink-0 items-center justify-center rounded-[12px] shadow-[0_2px_8px_-3px_rgba(26,24,22,0.35)]",
                  pm.tile,
                )}
              >
                {pm.icon}
                {/* content-type corner badge, like the reference avatar */}
                <span className="absolute -bottom-1 -right-1 inline-flex size-5 items-center justify-center rounded-full bg-white text-ink-700 shadow-sm ring-1 ring-ink-100">
                  <TypeIcon className="size-3" strokeWidth={2.2} />
                </span>
              </span>
            )}
            <span className="min-w-0 leading-tight">
              <span className="block text-[13.5px] font-semibold text-ink-900">
                {pm?.label ?? "Post"}
              </span>
              <span className="mt-0.5 block text-[12px] text-ink-500">
                {contentTypeLabel(item.content_type)}
              </span>
            </span>
          </div>
          {/* Status on the card — interactive pipeline pill */}
          <span onClick={(e) => e.stopPropagation()} className="shrink-0">
            <StatusPill itemId={item.id} status={item.status} />
          </span>
        </div>

        {/* Topic + description (left) · media placeholder (right) */}
        <div className="mt-3 flex flex-1 items-start gap-4">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-[14.5px] leading-snug",
                item.topic
                  ? "font-semibold text-ink-900"
                  : "italic text-ink-400",
              )}
            >
              {item.topic ?? "No topic yet — click to add one"}
            </p>
            {item.notes ? (
              <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-ink-500 line-clamp-4">
                {item.notes}
              </p>
            ) : (
              <p className="mt-1.5 text-[13px] italic leading-relaxed text-ink-400">
                No caption yet — click to write one
              </p>
            )}
          </div>
          {/* media — the post's attachment, or a placeholder when none */}
          {item.media_url ? (
            <span className="relative h-[124px] w-[104px] shrink-0 self-start overflow-hidden rounded-[12px] ring-1 ring-inset ring-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.media_url}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </span>
          ) : (
            <span className="inline-flex h-[124px] w-[104px] shrink-0 flex-col items-center justify-center gap-1.5 self-start rounded-[12px] bg-gradient-to-br from-cream-100 to-cream-200 ring-1 ring-inset ring-ink-100">
              <ImagePlus className="size-5 text-ink-300" strokeWidth={1.8} />
              <span className="text-[10px] font-medium text-ink-400">No media</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer — full date·time · the three-stage publish control */}
      <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-[12px] font-medium text-ink-400">
            {item.scheduled_for
              ? fmtFull(new Date(item.scheduled_for))
              : "Not scheduled yet"}
          </span>
          {isQueued && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-amber-700 ring-1 ring-amber-200"
              title="Queued — publishes automatically at the scheduled time via your connected account"
            >
              <CalendarClock className="size-3" strokeWidth={2.2} />
              Queued
            </span>
          )}
          {isPublished && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[0.04em] text-emerald-700 ring-1 ring-emerald-200">
              <Check className="size-3" strokeWidth={2.5} />
              Published
            </span>
          )}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {isPublished ? (
            item.published_url ? (
              <a
                href={item.published_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex h-8 items-center gap-1.5 rounded-[9px] border border-ink-200 bg-white px-3 text-[12.5px] font-semibold text-ink-700 transition-colors hover:bg-cream-100 hover:text-ink-900"
              >
                <ExternalLink className="size-3.5" strokeWidth={2.2} />
                View post
              </a>
            ) : null
          ) : isQueued ? (
            <button
              type="button"
              onClick={publishNow}
              disabled={pending}
              title="Skip the queue and publish right away"
              className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-rose-600 px-3 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:bg-rose-300"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />
              ) : (
                <Send className="size-3.5" strokeWidth={2.2} />
              )}
              Publish now
            </button>
          ) : (
            <button
              type="button"
              onClick={item.scheduled_for ? queueForPublish : publishNow}
              disabled={pending}
              title={
                item.scheduled_for
                  ? "Queue this post — it publishes automatically at its scheduled time"
                  : "No schedule set — publishes right away"
              }
              className="inline-flex h-8 items-center gap-1.5 rounded-[9px] bg-rose-600 px-3 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:bg-rose-300"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2.2} />
              ) : item.scheduled_for ? (
                <CalendarClock className="size-3.5" strokeWidth={2.2} />
              ) : (
                <Send className="size-3.5" strokeWidth={2.2} />
              )}
              {item.scheduled_for ? "Que to publish" : "Publish now"}
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit post"
            title="Edit"
            className="inline-flex size-8 items-center justify-center rounded-[9px] border border-ink-200 bg-white text-ink-600 transition-colors hover:bg-cream-100 hover:text-ink-900"
          >
            <Pencil className="size-3.5" strokeWidth={2} />
          </button>
          <ItemActionsMenu
            itemId={item.id}
            currentStatus={item.status}
            onEdit={onEdit}
          />
        </div>
      </div>

      {/* publish feedback — connection prompts, queue errors, failed runs */}
      {(err || failError) && (
        <div className="border-t border-rose-100 bg-rose-50/70 px-4 py-2 text-[12px] leading-snug text-rose-700">
          {err ?? failError}
        </div>
      )}
    </div>
  );
}

/* ── Date helpers ──────────────────────────────────────────────────────── */

function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayLabel(key: string): { lead: string; rest: string } {
  const d = new Date(`${key}T12:00:00`);
  const rest = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const startOf = (x: Date) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(new Date())) / 86_400_000);
  if (days === 0) return { lead: "Today", rest };
  if (days === 1) return { lead: "Tomorrow", rest };
  return { lead: d.toLocaleDateString("en-US", { weekday: "long" }), rest };
}

function fmtTime(d: Date): string {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function fmtFull(d: Date): string {
  return `${d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })} · ${fmtTime(d)}`;
}

/** Suggested "+ New" slot — 90 min after the day's last post (rounded to the
    next quarter hour), or 10:00 AM on an empty day; never past 11:30 PM. */
function suggestSlot(dayKey: string, dayItems: PostingItem[]): Date {
  if (dayItems.length === 0) return new Date(`${dayKey}T10:00:00`);
  const last = Math.max(
    ...dayItems.map((i) => new Date(i.scheduled_for!).getTime()),
  );
  const d = new Date(last + 90 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
  if (toKey(d) !== dayKey) return new Date(`${dayKey}T23:30:00`);
  return d;
}
