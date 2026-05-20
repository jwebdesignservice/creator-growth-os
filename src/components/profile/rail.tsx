import Link from "next/link";
import { ArrowRight, Crown, Info, Check } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";

type Social = { platform: string; follower_count: number; handle?: string | null };

type Props = {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  socials: Social[];
  completion: {
    percent: number;
    checks: { label: string; done: boolean }[];
  };
  categoryLabel: string;
  plan: "free" | "basic" | "pro";
};

export function ProfileRail({
  name,
  email,
  phone,
  avatarUrl,
  socials,
  completion,
  categoryLabel,
  plan,
}: Props) {
  return (
    <aside className="hidden xl:flex flex-col w-[336px] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-5 space-y-4">
        {/* Profile Summary */}
        <section className="card p-4">
          <div className="text-[13.5px] font-semibold text-ink-900 mb-3">
            Profile Summary
          </div>
          <div className="flex items-start gap-3">
            <Avatar name={name} src={avatarUrl ?? undefined} size={56} />
            <div className="min-w-0 flex-1">
              <div className="text-[14.5px] font-semibold text-ink-900 truncate">
                {name}
              </div>
              <div className="text-[12px] text-ink-500 truncate">{email}</div>
              {phone && (
                <div className="text-[12px] text-ink-500">{phone}</div>
              )}
            </div>
          </div>
          <Link
            href="#"
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-[13px] font-medium cursor-pointer transition-colors"
          >
            View Public Profile
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </section>

        {/* Social & Audience Snapshot */}
        <section className="card p-4">
          <div className="text-[13.5px] font-semibold text-ink-900 mb-3">
            Social &amp; Audience Snapshot
          </div>
          {socials.length === 0 ? (
            <p className="text-[12px] text-ink-500 mb-2">
              Connect your social handles below to see follower counts here.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {socials.map((s) => (
                <li
                  key={s.platform}
                  className="flex items-center gap-2.5 text-[13px]"
                >
                  <SocialGlyph platform={s.platform} />
                  <span className="flex-1 text-ink-700 capitalize">
                    {s.platform}
                  </span>
                  <span className="text-ink-900 font-semibold tabular-nums">
                    {formatCompact(s.follower_count)}
                  </span>
                  <span className="text-[11px] text-ink-500">
                    {s.platform === "youtube" ? "Subscribers" : "Followers"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/performance"
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
          >
            View full analytics
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </section>

        {/* Profile Completion */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Profile Completion
            </div>
            <span className="text-[13.5px] font-semibold text-rose-600">
              {completion.percent}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden mb-3">
            <div
              className="h-full bg-rose-500"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          <p className="text-[11.5px] text-ink-500 mb-3">
            Great progress! Keep it up.
          </p>
          <ul className="space-y-1.5">
            {completion.checks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-[12px]">
                <span
                  className={cn(
                    "size-4 rounded-full inline-flex items-center justify-center shrink-0",
                    c.done
                      ? "bg-success-bg text-success"
                      : "bg-cream-200 text-ink-400",
                  )}
                >
                  {c.done && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                <span className={c.done ? "text-ink-700" : "text-ink-500"}>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Current Category */}
        <section className="card p-4">
          <div className="text-[13.5px] font-semibold text-ink-900 mb-2 flex items-center gap-1.5">
            <Crown className="size-4 text-rose-500" strokeWidth={2} />
            Current Category
          </div>
          <div className="text-[14px] font-semibold text-ink-900 mb-1">
            {categoryLabel}
          </div>
          <div className="flex items-center gap-1.5 text-[11.5px] text-ink-500">
            <Info className="size-3 text-ink-400" strokeWidth={2} />
            Managed by our team
          </div>
        </section>

        {/* Plan */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Your Plan
            </div>
            <span className="chip chip-rose capitalize">{plan}</span>
          </div>
          <p className="text-[12px] text-ink-500 leading-snug mb-3">
            {plan === "pro"
              ? "You have full Pro access."
              : `You're on the ${plan} plan. Upgrade anytime to unlock Pro programs and 1-to-1 coaching.`}
          </p>
          {plan !== "pro" && (
            <Link
              href="/billing?upgrade=pro"
              className="block w-full h-10 leading-10 text-center text-[13px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] cursor-pointer transition-colors"
            >
              Upgrade to Pro
            </Link>
          )}
        </section>
      </div>
    </aside>
  );
}

function SocialGlyph({ platform }: { platform: string }) {
  if (platform === "instagram")
    return (
      <span className="size-7 rounded-[8px] bg-rose-100 inline-flex items-center justify-center">
        <InstagramIcon className="text-rose-600" size={14} />
      </span>
    );
  if (platform === "tiktok")
    return (
      <span className="size-7 rounded-[8px] bg-ink-100 inline-flex items-center justify-center">
        <TiktokIcon className="text-ink-900" size={14} />
      </span>
    );
  if (platform === "youtube")
    return (
      <span className="size-7 rounded-[8px] bg-rose-100 inline-flex items-center justify-center">
        <YoutubeIcon className="text-rose-600" size={14} />
      </span>
    );
  return (
    <span className="size-7 rounded-[8px] bg-cream-200 inline-flex items-center justify-center">
      <span className="size-2 rounded-full bg-rose-400" />
    </span>
  );
}

function formatCompact(n: number) {
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000)
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}
