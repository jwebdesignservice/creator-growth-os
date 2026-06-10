"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronDown,
  Video,
  Clapperboard,
  Images,
  Plus,
  FileText,
  Ghost,
  Briefcase,
  Layers,
  Globe,
  BarChart3,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import type { PostingItem, PlatformKey } from "@/lib/posting/queries";
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
  /** Optional "Add Post" action rendered centered in the space below the rows. */
  addPostSlot?: ReactNode;
  /** Card heading — the Posts/Ideas tabs reuse this table under their own name. */
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDesc?: string;
};

export function PlannedPostsTable({
  items,
  isDemo = false,
  addPostSlot,
  title = "Planned Posts",
  description = "Review and manage your upcoming content across all platforms.",
  emptyTitle = "No posts planned yet",
  emptyDesc = "Use “Add Post” above to schedule your first post for this plan.",
}: Props) {
  const count = items.length;
  // Which post is open in the detail/edit popup (null = closed).
  const [editItem, setEditItem] = useState<PostingItem | null>(null);

  return (
    <>
    <section className="card overflow-hidden lg:flex lg:flex-col">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-ink-100 shrink-0">
        <div className="min-w-0">
          <h3 className="text-h4 text-ink-900">{title}</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">{description}</p>
        </div>
        <Link
          href="/posting?view=calendar"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] border border-rose-200 text-rose-600 hover:bg-rose-50 text-[13px] font-semibold transition-colors shrink-0"
        >
          <CalendarDays className="size-4" strokeWidth={2} />
          View Calendar
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
            {emptyTitle}
          </p>
          <p className="text-[12.5px] text-ink-500">{emptyDesc}</p>
        </div>
      ) : (
        <div className="overflow-auto lg:flex-1 lg:min-h-0">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 border-b border-ink-100">
                <th className="font-semibold py-3 px-5 sm:px-6">
                  <span className="inline-flex items-center gap-1">
                    Date &amp; Time
                    <ChevronDown className="size-3 text-ink-400" strokeWidth={2.5} />
                  </span>
                </th>
                <th className="font-semibold py-3 px-3">Platform</th>
                <th className="font-semibold py-3 px-3">Content Type</th>
                <th className="font-semibold py-3 px-3">Topic</th>
                <th className="font-semibold py-3 px-3">Status</th>
                <th className="py-3 px-5 sm:px-6" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const accent = contentTypeAccent(item.content_type);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-ink-100 last:border-0 hover:bg-cream-50/60 transition-colors"
                  >
                    {/* Date & time — with a content-type colored left rail */}
                    <td className={cn("py-3.5 px-5 sm:px-6 border-l-4", accent.border)}>
                      <DateCell when={item.scheduled_for} />
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 px-3">
                      <PlatformCell platform={item.platform} />
                    </td>

                    {/* Content type + format chip */}
                    <td className="py-3.5 px-3">
                      <ContentTypeCell type={item.content_type} />
                    </td>

                    {/* Topic */}
                    <td className="py-3.5 px-3 max-w-[280px]">
                      <div className="text-[13px] font-semibold text-ink-900 truncate">
                        {item.topic ?? "—"}
                      </div>
                    </td>

                    {/* Status — clickable pill to move through the pipeline */}
                    <td className="py-3.5 px-3">
                      <StatusPill
                        itemId={item.id}
                        status={item.status}
                        readOnly={isDemo}
                      />
                    </td>

                    {/* Row actions */}
                    <td className="py-3.5 px-5 sm:px-6 text-right">
                      {!isDemo && (
                        <ItemActionsMenu
                          itemId={item.id}
                          currentStatus={item.status}
                          onEdit={() => setEditItem(item)}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      {count > 0 && (
        <footer className="border-t border-ink-100 px-5 sm:px-6 py-4 flex items-center justify-between gap-3 flex-wrap shrink-0">
          <div className="inline-flex items-center gap-2.5">
            <span className="size-9 rounded-full bg-cream-100 text-rose-500 inline-flex items-center justify-center shrink-0">
              <BarChart3 className="size-4" strokeWidth={2} />
            </span>
            <span className="text-[13px] text-ink-700">
              <span className="font-bold text-ink-900 tabular-nums">{count}</span>{" "}
              Upcoming Post{count === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {addPostSlot}
            <Link
              href="/posting?view=calendar"
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[12px] border border-rose-200 text-rose-600 hover:bg-rose-50 text-[13px] font-semibold transition-colors"
            >
              View All Posts
              <ArrowRight className="size-4" strokeWidth={2} />
            </Link>
          </div>
        </footer>
      )}
    </section>
      {editItem && (
        <PostDetailModal item={editItem} onClose={() => setEditItem(null)} />
      )}
    </>
  );
}

/* ── Cells ─────────────────────────────────────────────────────────────── */

function DateCell({ when }: { when: string | null }) {
  if (!when) return <span className="text-ink-400">—</span>;
  const d = new Date(when);
  const datePart = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <div className="flex items-center gap-2.5">
      <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <CalendarDays className="size-4" strokeWidth={2} />
      </span>
      <div className="leading-tight">
        <div className="text-[13px] font-semibold text-ink-900">{datePart}</div>
        <div className="text-[11.5px] text-ink-500">{timePart}</div>
      </div>
    </div>
  );
}

function PlatformCell({ platform }: { platform: PlatformKey | null }) {
  if (!platform) return <span className="text-ink-400">—</span>;
  const meta = platformMeta(platform);
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={cn(
          "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
          meta.tile,
        )}
      >
        {meta.icon}
      </span>
      <span className="text-[13px] font-medium text-ink-800">{meta.label}</span>
    </div>
  );
}

function platformMeta(p: PlatformKey): {
  label: string;
  tile: string;
  icon: ReactNode;
} {
  switch (p) {
    case "youtube":
      return { label: "YouTube", tile: "bg-red-600 text-white", icon: <YoutubeIcon size={16} /> };
    case "tiktok":
      return { label: "TikTok", tile: "bg-ink-900 text-white", icon: <TiktokIcon size={15} /> };
    case "instagram":
      return {
        label: "Instagram",
        tile: "bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-white",
        icon: <InstagramIcon size={15} />,
      };
    case "snapchat":
      return { label: "Snapchat", tile: "bg-yellow-300 text-ink-900", icon: <Ghost className="size-4" strokeWidth={2} /> };
    case "linkedin":
      return { label: "LinkedIn", tile: "bg-sky-600 text-white", icon: <Briefcase className="size-4" strokeWidth={2} /> };
    case "multiple":
      return { label: "Multiple", tile: "bg-cream-200 text-ink-600", icon: <Layers className="size-4" strokeWidth={2} /> };
    default:
      return { label: "Other", tile: "bg-cream-200 text-ink-600", icon: <Globe className="size-4" strokeWidth={2} /> };
  }
}

function ContentTypeCell({ type }: { type: string | null }) {
  if (!type) return <span className="text-ink-400">—</span>;
  const meta = typeMeta(type);
  const accent = contentTypeAccent(type);
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span className={cn("size-9 rounded-[10px] inline-flex items-center justify-center shrink-0", accent.tile)}>
        <Icon className="size-4" strokeWidth={1.9} />
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <span className={cn("text-[13px] font-semibold truncate", accent.label)}>{meta.label}</span>
        {meta.format && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cream-100 text-ink-500 text-[10px] font-semibold shrink-0">
            {meta.format}
          </span>
        )}
      </div>
    </div>
  );
}

function typeMeta(t: string): { label: string; icon: LucideIcon; format: string } {
  const map: Record<string, { label: string; icon: LucideIcon; format: string }> = {
    reel: { label: "Reel", icon: Clapperboard, format: "Short Form" },
    short_video: { label: "Short Video", icon: Video, format: "Short Form" },
    story: { label: "Story", icon: Plus, format: "Short Form" },
    carousel: { label: "Carousel", icon: Images, format: "Static" },
    post: { label: "Post", icon: FileText, format: "Static" },
    video: { label: "Video", icon: Video, format: "Video" },
    youtube_video: { label: "YouTube Video", icon: Video, format: "Video" },
  };
  return map[t] ?? { label: t.replace(/_/g, " "), icon: FileText, format: "Post" };
}
