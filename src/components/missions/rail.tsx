import Link from "next/link";
import { Sparkles, ArrowRight, Check, Crown } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { StreakCard } from "./streak-card";
import { ActivityBar } from "./activity-bar";

type Props = {
  userName: string;
  avatarUrl?: string | null;
  streak: number;
  weekChecks: boolean[];
  activityCounts: number[];
  focusLine: string;
  upNext: { title: string; type: string }[];
  plan: "free" | "basic" | "pro";
};

export function MissionsRail({
  userName,
  avatarUrl,
  streak,
  weekChecks,
  activityCounts,
  focusLine,
  upNext,
  plan,
}: Props) {
  return (
    <aside className="hidden xl:flex flex-col w-[336px] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-5 space-y-4">
        {/* Profile chip */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <Avatar name={userName} src={avatarUrl ?? undefined} size={40} />
            <div className="text-[14px] font-semibold text-ink-900">
              {userName}
            </div>
          </div>
        </div>

        {/* Today's Focus */}
        <div className="rounded-[16px] bg-rose-50/80 border border-rose-100 p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="size-4 text-rose-500" strokeWidth={2} />
            <span className="text-[13px] font-semibold text-ink-900">
              Today&apos;s Focus
            </span>
          </div>
          <p className="text-[12.5px] text-ink-700 leading-snug">
            {focusLine}
          </p>
        </div>

        {/* Streak */}
        <StreakCard streak={streak} weekChecks={weekChecks} />

        {/* Activity */}
        <ActivityBar counts={activityCounts} />

        {/* Up Next */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Up Next
            </div>
            <span className="text-[11px] text-ink-500">tomorrow</span>
          </div>
          <ul className="space-y-2">
            {upNext.map((u, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-rose-300 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[13px] text-ink-900 font-medium leading-snug truncate">
                    {u.title}
                  </div>
                  <div className="text-[11px] text-ink-500 capitalize">
                    {u.type}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link
            href="/missions?tab=this-week"
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
          >
            See this week
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>

        {/* Plan teaser */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Your Plan
            </div>
            <span className="chip chip-rose capitalize">{plan}</span>
          </div>
          {plan !== "pro" ? (
            <>
              <p className="text-[12px] text-ink-500 leading-snug mb-3">
                Upgrade to unlock advanced monetization missions and weekly
                coach review.
              </p>
              <Link
                href="/billing?upgrade=pro"
                className="block w-full h-10 leading-10 text-center text-[13px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] transition-colors cursor-pointer"
              >
                Upgrade Plan
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2 text-[12.5px] text-success">
              <Check className="size-3.5" strokeWidth={2.5} />
              You have full Pro access.
            </div>
          )}
        </div>

        {/* Optional Pro badge accent */}
        {plan !== "pro" && (
          <div className="rounded-[14px] bg-cream-200 border border-cream-300 p-3 flex items-center gap-3">
            <Crown className="size-5 text-rose-600" strokeWidth={2} />
            <div>
              <div className="text-[12px] font-semibold text-ink-900">
                Earn Coach Reviews
              </div>
              <div className="text-[11px] text-ink-500 leading-snug">
                Pro unlocks weekly mission feedback from your coach.
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
