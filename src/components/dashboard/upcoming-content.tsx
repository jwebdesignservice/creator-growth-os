import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";

export type UpcomingItem = {
  id: string;
  platform: "instagram" | "tiktok" | "youtube";
  label: string;
  time: string;
};

export type WeekDay = {
  short: string;   // "Mon"
  date: number;    // 19
  isToday?: boolean;
};

export function UpcomingContent({
  days,
  items,
}: {
  days: WeekDay[];
  items: UpcomingItem[];
}) {
  return (
    <div className="card p-[var(--space-card-padding-sm)] flex flex-col">
      <header className="flex items-center justify-between mb-4">
        <h3 className="font-display text-[19px] text-ink-900">
          Upcoming Content
        </h3>
      </header>

      {/* Day strip */}
      <div className="flex items-center justify-between mb-5">
        {days.map((d) => (
          <div key={d.date} className="text-center">
            <div className="text-[10.5px] uppercase tracking-wider text-ink-500 font-medium mb-1.5">
              {d.short}
            </div>
            <div
              className={cn(
                "size-9 rounded-full inline-flex items-center justify-center text-[13.5px] font-semibold transition-colors",
                d.isToday
                  ? "bg-rose-500 text-white"
                  : "text-ink-700 hover:bg-cream-200",
              )}
            >
              {d.date}
            </div>
          </div>
        ))}
      </div>

      <ul className="space-y-2 flex-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-button-sm)] hover:bg-cream-100"
          >
            <div className="size-[var(--icon-container-md)] rounded-[var(--radius-icon-sm)] bg-cream-100 flex items-center justify-center">
              <PlatformIcon platform={item.platform} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-ink-900 truncate">
                {item.label}
              </div>
            </div>
            <div className="text-[11.5px] text-ink-500 tabular-nums">
              {item.time}
            </div>
          </li>
        ))}
      </ul>

      <Link
        href="/posting"
        className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-rose-600 hover:text-rose-700"
      >
        View content calendar <ArrowRight className="size-3.5" strokeWidth={2} />
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
