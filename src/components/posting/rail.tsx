import Link from "next/link";
import { Info, ArrowRight, Sparkles } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { MultiDonut } from "@/components/dashboard/donut";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";

type UpcomingItem = {
  id: string;
  scheduled_for: string | null;
  platform: string | null;
  topic: string | null;
};

type Props = {
  userName: string;
  avatarUrl?: string | null;
  weekly: {
    total: number;
    by_type: { label: string; count: number; color: string }[];
  };
  upcoming: UpcomingItem[];
  pillars: { label: string; weight: number }[];
};

export function PostingRail({
  userName,
  avatarUrl,
  weekly,
  upcoming,
  pillars,
}: Props) {
  return (
    <aside className="hidden xl:flex flex-col w-[336px] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-5 space-y-4">
        {/* Profile chip */}
        <div className="flex items-center gap-3 pb-2">
          <Avatar name={userName} src={avatarUrl ?? undefined} size={40} />
          <div className="text-[14px] font-semibold text-ink-900">
            {userName}
          </div>
        </div>

        {/* Weekly Overview */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Weekly Overview
            </div>
            <Info className="size-3.5 text-ink-400" strokeWidth={2} />
          </div>
          <div className="flex items-center gap-5">
            <MultiDonut
              slices={
                weekly.by_type.length > 0
                  ? weekly.by_type.map((t) => ({
                      value: t.count,
                      color: t.color,
                    }))
                  : [{ value: 1, color: "var(--cream-300)" }]
              }
              size={120}
              strokeWidth={16}
            >
              <span className="text-[20px] font-semibold text-ink-900 leading-none">
                {weekly.total}
              </span>
              <span className="text-[10.5px] text-ink-500 mt-1">
                Total Posts
              </span>
            </MultiDonut>
            <ul className="space-y-2 flex-1 min-w-0">
              {weekly.by_type.length === 0 ? (
                <li className="text-[12px] text-ink-500">No posts yet</li>
              ) : (
                weekly.by_type.map((t) => (
                  <li
                    key={t.label}
                    className="flex items-center gap-2 text-[12px]"
                  >
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: t.color }}
                    />
                    <span className="text-ink-900 font-semibold tabular-nums">
                      {t.count}
                    </span>
                    <span className="text-ink-500 truncate">{t.label}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>

        {/* Upcoming This Week */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Upcoming This Week
            </div>
          </div>
          <ul className="space-y-3">
            {upcoming.length === 0 ? (
              <li className="text-[12.5px] text-ink-500">
                No upcoming posts. Plan your week to get started.
              </li>
            ) : (
              upcoming.map((u) => (
                <li key={u.id} className="flex items-start gap-2.5">
                  <div className="size-9 rounded-[10px] bg-gradient-to-br from-rose-100 via-cream-200 to-rose-200/30 inline-flex items-center justify-center shrink-0">
                    <PlatformGlyph platform={u.platform} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10.5px] text-ink-500 mb-0.5">
                      {formatWhen(u.scheduled_for)}
                    </div>
                    <div className="text-[12.5px] text-ink-900 font-medium leading-snug line-clamp-2">
                      {u.topic ?? "Untitled"}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          <Link
            href="#"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 h-9 rounded-[10px] bg-cream-100 hover:bg-cream-200 text-ink-700 text-[12.5px] font-medium border border-ink-100 transition-colors"
          >
            View All
          </Link>
        </section>

        {/* Content Pillars */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Content Pillars
            </div>
            <Info className="size-3.5 text-ink-400" strokeWidth={2} />
          </div>
          {pillars.length === 0 ? (
            <p className="text-[12px] text-ink-500">
              Set your content pillars during onboarding to see your weekly
              distribution.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {pillars.map((p, i) => (
                <li key={p.label}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1">
                    <span className="inline-flex items-center gap-1.5 text-ink-700">
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          ["bg-rose-500","bg-rose-400","bg-rose-300","bg-cream-300","bg-ink-300"][i % 5],
                        )}
                      />
                      {p.label}
                    </span>
                    <span className="text-ink-900 font-semibold tabular-nums">
                      {p.weight}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-cream-200 overflow-hidden">
                    <div
                      className={cn(
                        "h-full",
                        ["bg-rose-500","bg-rose-400","bg-rose-300","bg-cream-300","bg-ink-300"][i % 5],
                      )}
                      style={{ width: `${p.weight}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* AI ideas CTA */}
        <section className="rounded-[16px] bg-rose-50/80 border border-rose-100 p-4">
          <Sparkles className="size-5 text-rose-500 mb-2" strokeWidth={2} />
          <div className="text-[14px] font-semibold text-ink-900 mb-1">
            Need content ideas?
          </div>
          <p className="text-[12px] text-ink-700 leading-snug mb-3">
            Get AI-powered post ideas tailored to your audience.
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-1.5 w-full h-10 rounded-[10px] bg-white border border-rose-200 hover:bg-rose-100 text-rose-700 text-[13px] font-medium cursor-pointer transition-colors"
          >
            <Sparkles className="size-3.5" strokeWidth={2} />
            Generate Ideas
          </button>
          <p className="mt-2 text-[10.5px] text-ink-500">
            Coming in a future Pro release.
          </p>
        </section>
      </div>
    </aside>
  );
}

function PlatformGlyph({ platform }: { platform: string | null }) {
  if (platform === "instagram")
    return <InstagramIcon className="text-rose-600" size={16} />;
  if (platform === "tiktok") return <TiktokIcon className="text-ink-900" size={16} />;
  if (platform === "youtube")
    return <YoutubeIcon className="text-rose-600" size={16} />;
  return <span className="size-2 rounded-full bg-rose-300 inline-block" />;
}

function formatWhen(when: string | null): string {
  if (!when) return "Unscheduled";
  const d = new Date(when);
  const datePart = d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const timePart = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} · ${timePart}`;
}
