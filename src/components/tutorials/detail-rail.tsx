import Link from "next/link";
import { Pencil, ArrowRight, Crown, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";
import { cn } from "@/lib/cn";

type Props = {
  userName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  socials: { instagram?: number; tiktok?: number; youtube?: number };
  tutorialsProgress: {
    percent: number;
    watched: number;
    completed: number;
    total: number;
    streak: number;
  };
  categoryLabel: string;
  plan: "free" | "basic" | "pro";
  nextLesson: {
    title: string;
    moduleLabel: string;
    duration: string;
    href: string;
  } | null;
};

export function TutorialDetailRail({
  userName,
  email,
  phone,
  avatarUrl,
  socials,
  tutorialsProgress,
  categoryLabel,
  plan,
  nextLesson,
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

        {/* Profile card with socials */}
        <section className="card p-4 relative">
          <button
            type="button"
            className="absolute top-3 right-3 size-7 rounded-full bg-cream-100 hover:bg-cream-200 inline-flex items-center justify-center cursor-pointer"
            aria-label="Edit profile"
          >
            <Pencil className="size-3.5 text-ink-500" strokeWidth={2} />
          </button>
          <div className="flex items-start gap-3">
            <Avatar name={userName} src={avatarUrl ?? undefined} size={48} />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink-900 truncate">
                {userName}
              </div>
              <div className="text-[12px] text-ink-500 truncate">{email}</div>
              {phone && <div className="text-[12px] text-ink-500">{phone}</div>}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <SocialMini
              icon={<InstagramIcon className="text-rose-600" size={16} />}
              value={socials.instagram}
              label="Followers"
            />
            <SocialMini
              icon={<TiktokIcon className="text-ink-900" size={16} />}
              value={socials.tiktok}
              label="Followers"
            />
            <SocialMini
              icon={<YoutubeIcon className="text-rose-600" size={16} />}
              value={socials.youtube}
              label="Subscribers"
            />
          </div>
        </section>

        {/* Tutorials Progress */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Tutorials Progress
            </div>
            <div className="text-[13.5px] font-semibold text-rose-600">
              {tutorialsProgress.percent}%
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden mb-3">
            <div
              className="h-full bg-rose-500"
              style={{
                width: `${Math.max(0, Math.min(100, tutorialsProgress.percent))}%`,
              }}
            />
          </div>
          <ul className="space-y-2 text-[12.5px]">
            <ProgressRow label="Tutorials Watched" value={tutorialsProgress.watched} />
            <ProgressRow
              label="Lessons Completed"
              value={`${tutorialsProgress.completed}/${tutorialsProgress.total}`}
            />
            <ProgressRow
              label="Completion Rate"
              value={`${tutorialsProgress.percent}%`}
            />
            <ProgressRow
              label="Current Streak"
              value={`${tutorialsProgress.streak} days`}
            />
          </ul>
          <Link
            href="/programs"
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
          >
            View full progress
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </section>

        {/* Your Category */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Your Category
            </div>
            <span className="chip chip-rose">
              <Crown className="size-3" strokeWidth={2} />
              {categoryLabel}
            </span>
          </div>
          <p className="text-[12px] text-ink-500 leading-snug">
            You&apos;re in the {categoryLabel} category. Focus on scaling your
            audience, increasing engagement, and building authority.
          </p>
          <Link
            href="/onboarding"
            className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700"
          >
            Learn more about categories
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </section>

        {/* Plan */}
        <section className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Your Plan
            </div>
            <span className="chip chip-rose capitalize">{plan}</span>
          </div>
          {plan !== "pro" ? (
            <>
              <p className="text-[12px] text-ink-500 leading-snug mb-3">
                You&apos;re on the {plan} plan. Upgrade anytime to unlock all
                tutorials, templates and creator drills.
              </p>
              <Link
                href="/billing?upgrade=pro"
                className="block w-full h-10 leading-10 text-center text-[13px] font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-[10px] mb-3 transition-colors cursor-pointer"
              >
                Upgrade to Pro
              </Link>
              <PlanComparisonRow label="Free" price="0 kr/mnd" />
              <PlanComparisonRow label="Basic" price="999 kr/mnd" active={plan === "basic"} />
              <PlanComparisonRow label="Pro" price="1499 kr/mnd" popular />
            </>
          ) : (
            <div className="flex items-center gap-2 text-[12.5px] text-success">
              You have full Pro access.
            </div>
          )}
        </section>

        {/* Next Lesson */}
        {nextLesson && (
          <section className="card p-4">
            <div className="text-[13.5px] font-semibold text-ink-900 mb-3">
              Next Lesson
            </div>
            <Link href={nextLesson.href} className="block group">
              <div className="relative rounded-[12px] overflow-hidden mb-3 h-[110px] bg-gradient-to-br from-rose-100 via-cream-200 to-rose-200/60">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="size-9 rounded-full bg-rose-500 inline-flex items-center justify-center group-hover:scale-105 transition-transform">
                    <MessageSquare
                      className="size-3.5 text-white"
                      strokeWidth={2}
                    />
                  </span>
                </div>
              </div>
              <div className="text-[13.5px] font-semibold text-ink-900 leading-tight mb-1">
                {nextLesson.title}
              </div>
              <div className="text-[11.5px] text-ink-500 mb-2">
                {nextLesson.moduleLabel} · {nextLesson.duration}
              </div>
              <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 group-hover:text-rose-700">
                View Lesson Path
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </span>
            </Link>
          </section>
        )}
      </div>
    </aside>
  );
}

function SocialMini({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number | undefined;
  label: string;
}) {
  return (
    <div>
      <div className="mx-auto size-8 rounded-[10px] bg-cream-100 inline-flex items-center justify-center">
        {icon}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-ink-900">
        {value !== undefined ? formatCompact(value) : "—"}
      </div>
      <div className="text-[10px] text-ink-500">{label}</div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-900 font-semibold tabular-nums">{value}</span>
    </li>
  );
}

function PlanComparisonRow({
  label,
  price,
  active,
  popular,
}: {
  label: string;
  price: string;
  active?: boolean;
  popular?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-2 rounded-[10px]",
        active && "bg-rose-50 border border-rose-200",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] font-medium text-ink-900">{label}</span>
        {popular && (
          <span className="text-[9.5px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
            Most Popular
          </span>
        )}
      </div>
      <span className="text-[12px] text-ink-500">{price}</span>
    </div>
  );
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}
