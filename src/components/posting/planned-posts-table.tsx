import Link from "next/link";
import {
  Clapperboard,
  Copy,
  Plus,
  Video,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import type { PostingItem, PlatformKey } from "@/lib/posting/queries";
import { ItemActionsMenu } from "./item-actions-menu";

type Props = {
  items: PostingItem[];
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

const STATUS_TONE: Record<PostingItem["status"], string> = {
  idea: "chip bg-cream-100 text-ink-700",
  planned: "chip bg-cream-100 text-ink-700",
  scripted: "chip bg-cream-200 text-ink-700",
  filmed: "chip bg-cream-200 text-ink-700",
  edited: "chip chip-rose",
  posted: "chip chip-success",
  reviewed: "chip chip-success",
};

export function PlannedPostsTable({ items }: Props) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
        <h3 className="font-display text-[20px] text-ink-900">Planned Posts</h3>
        <Link
          href="#"
          className="text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
        >
          View Calendar
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="p-10 text-center">
          <div className="inline-flex items-center justify-center size-12 rounded-full bg-rose-100 text-rose-600 mb-3">
            <Sparkles className="size-5" strokeWidth={1.8} />
          </div>
          <p className="text-[14px] text-ink-700 mb-1 font-medium">
            No planned posts yet
          </p>
          <p className="text-[12.5px] text-ink-500">
            Create your first weekly posting plan to start filling your calendar.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500">
                <th className="font-semibold py-3 px-5">Date &amp; Time</th>
                <th className="font-semibold py-3 px-2">Platform</th>
                <th className="font-semibold py-3 px-2">Content Type</th>
                <th className="font-semibold py-3 px-2">Topic</th>
                <th className="font-semibold py-3 px-2">Status</th>
                <th className="py-3 px-5" />
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={cn(
                    "border-t border-ink-100",
                    idx % 2 === 1 && "bg-cream-100/30",
                  )}
                >
                  <td className="py-3 px-5">
                    <DateCell when={item.scheduled_for} />
                  </td>
                  <td className="py-3 px-2">
                    <PlatformCell platform={item.platform} />
                  </td>
                  <td className="py-3 px-2">
                    <ContentTypeCell type={item.content_type} />
                  </td>
                  <td className="py-3 px-2 max-w-[280px] text-ink-900">
                    {item.topic ?? "—"}
                  </td>
                  <td className="py-3 px-2">
                    <span className={STATUS_TONE[item.status]}>
                      {STATUS_LABEL[item.status]}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-right">
                    <ItemActionsMenu
                      itemId={item.id}
                      currentStatus={item.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="border-t border-ink-100 px-5 py-3 flex items-center justify-center">
        <Link
          href="#"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-rose-600 hover:text-rose-700"
        >
          View All Posts
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </footer>
    </section>
  );
}

function DateCell({ when }: { when: string | null }) {
  if (!when) return <span className="text-ink-400">—</span>;
  const d = new Date(when);
  const datePart = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <div>
      <div className="text-ink-900 font-medium">{datePart}</div>
      <div className="text-[11.5px] text-ink-500">{timePart}</div>
    </div>
  );
}

function PlatformCell({ platform }: { platform: PlatformKey | null }) {
  if (!platform) return <span className="text-ink-400">—</span>;
  const icon = renderPlatformIcon(platform);
  const label =
    platform.charAt(0).toUpperCase() + platform.slice(1).replace(/_/g, " ");
  return (
    <div className="flex items-center gap-2">
      <span className="size-7 rounded-full bg-cream-100 inline-flex items-center justify-center">
        {icon}
      </span>
      <span className="text-ink-700">{label}</span>
    </div>
  );
}

function renderPlatformIcon(p: PlatformKey) {
  if (p === "instagram")
    return <InstagramIcon className="text-rose-600" size={14} />;
  if (p === "tiktok") return <TiktokIcon className="text-ink-900" size={14} />;
  if (p === "youtube")
    return <YoutubeIcon className="text-rose-600" size={14} />;
  return <span className="size-3 rounded-full bg-rose-300 inline-block" />;
}

function ContentTypeCell({ type }: { type: string | null }) {
  if (!type) return <span className="text-ink-400">—</span>;
  const meta = TYPE_META(type);
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2 text-ink-700">
      <Icon className="size-3.5 text-rose-500" strokeWidth={2} />
      <span>{meta.label}</span>
    </div>
  );
}

function TYPE_META(t: string) {
  const map: Record<string, { label: string; icon: typeof Clapperboard }> = {
    reel: { label: "Reel", icon: Clapperboard },
    short_video: { label: "Short Video", icon: Video },
    carousel: { label: "Carousel", icon: Copy },
    story: { label: "Story", icon: Plus },
    video: { label: "Video", icon: Video },
    youtube_video: { label: "YouTube Video", icon: Video },
    post: { label: "Post", icon: Copy },
  };
  return map[t] ?? { label: t, icon: Copy };
}
