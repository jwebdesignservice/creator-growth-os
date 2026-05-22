import Link from "next/link";
import {
  Pencil,
  Send,
  Heart,
  ArrowRight,
  Crown,
  Check,
  ChevronRight,
} from "lucide-react";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";
import { Avatar } from "./topbar";
import { cn } from "@/lib/cn";

type Profile = {
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  plan: "free" | "basic" | "pro";
  category_label: string;
  category_description: string;
  profile_completion: number; // 0-100
  socials: {
    instagram?: number;
    tiktok?: number;
    youtube?: number;
  };
};

export function RightRail({ profile }: { profile: Profile }) {
  return (
    <aside className="hidden xl:flex flex-col w-[var(--right-rail-width)] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-[var(--space-card-padding-sm)] space-y-[var(--space-grid-gap-sm)]">
        {/* Profile card */}
        <ProfileCard profile={profile} />

        {/* Profile completion */}
        <CompletionCard percent={profile.profile_completion} />

        {/* Coach message */}
        <CoachCard />

        {/* Category */}
        <CategoryCard
          label={profile.category_label}
          description={profile.category_description}
        />

        {/* Plan */}
        <PlanCard plan={profile.plan} />
      </div>
    </aside>
  );
}

/**
 * Full-width inline insights grid.
 *
 * Used on the dashboard, which no longer docks the right rail — instead
 * these cards (social snapshot, profile completion, coach, category, plan)
 * flow inside the main content as a responsive grid. Reuses the exact same
 * card components as <RightRail /> so they stay visually identical.
 */
export function DashboardInsights({ profile }: { profile: Profile }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[var(--space-grid-gap)] items-start">
      <ProfileCard profile={profile} />
      <CompletionCard percent={profile.profile_completion} />
      <CoachCard />
      <CategoryCard
        label={profile.category_label}
        description={profile.category_description}
      />
      <PlanCard plan={profile.plan} />
    </section>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <div className="card p-[var(--space-card-padding-sm)]">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[13.5px] font-semibold text-ink-900">
          Your Social Snapshot
        </div>
        <Link
          href="/settings"
          className="size-7 rounded-full bg-cream-100 hover:bg-cream-200 inline-flex items-center justify-center"
          aria-label="Connect social accounts"
        >
          <Pencil className="size-3.5 text-ink-500" strokeWidth={2} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <SocialStat
          icon={<InstagramIcon className="text-rose-600" size={16} />}
          label="Followers"
          value={profile.socials.instagram}
          tone="instagram"
        />
        <SocialStat
          icon={<TiktokIcon className="text-ink-900" size={16} />}
          label="Followers"
          value={profile.socials.tiktok}
          tone="tiktok"
        />
        <SocialStat
          icon={<YoutubeIcon className="text-rose-600" size={16} />}
          label="Subscribers"
          value={profile.socials.youtube}
          tone="youtube"
        />
      </div>
    </div>
  );
}

function SocialStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  tone: "instagram" | "tiktok" | "youtube";
}) {
  const bg =
    tone === "instagram"
      ? "bg-rose-100"
      : tone === "tiktok"
        ? "bg-ink-100"
        : "bg-rose-100";
  return (
    <div className="text-center">
      <div className={cn("mx-auto size-8 rounded-[10px] inline-flex items-center justify-center", bg)}>
        {icon}
      </div>
      <div className="mt-1.5 text-[13px] font-semibold text-ink-900">
        {value ? formatCompact(value) : "—"}
      </div>
      <div className="text-[10.5px] text-ink-500">{label}</div>
    </div>
  );
}

function CompletionCard({ percent }: { percent: number }) {
  return (
    <div className="card p-[var(--space-card-padding-sm)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13.5px] font-semibold text-ink-900">
          Profile Completion
        </div>
        <div className="text-[13.5px] font-semibold text-rose-600">
          {percent}%
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
        <div
          className="h-full bg-rose-500"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <p className="mt-3 text-[12px] text-ink-500 leading-snug">
        Complete your profile to get better recommendations and results.
      </p>
      <Link href="/settings" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700">
        Complete now <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}

function CoachCard() {
  return (
    <div className="card p-[var(--space-card-padding-sm)]">
      <div className="flex items-start gap-3">
        <Avatar name="Sophie M" size={40} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-ink-900 mb-1 flex items-center gap-1">
            Message from your coach
            <Heart className="size-3 text-rose-500" fill="currentColor" />
          </div>
          <p className="text-[12.5px] text-ink-700 leading-snug">
            You&apos;re doing amazing! Consistency is your superpower. Keep showing up and your audience will too.
          </p>
          <Link href="/support" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700">
            Book 1:1 Coaching Call <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="card p-[var(--space-card-padding-sm)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13.5px] font-semibold text-ink-900">
          Your Category
        </div>
        <span className="chip chip-rose">
          <Crown className="size-3" strokeWidth={2} />
          {label}
        </span>
      </div>
      <p className="text-[12px] text-ink-500 leading-snug">
        You&apos;re in the {label} category. {description}
      </p>
      <Link href="/support" className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-rose-600 hover:text-rose-700">
        Learn more about categories <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </div>
  );
}

function PlanCard({ plan }: { plan: "free" | "basic" | "pro" }) {
  const isFree = plan === "free";
  const isBasic = plan === "basic";
  const isPro = plan === "pro";
  return (
    <div className="card p-[var(--space-card-padding-sm)]">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[13.5px] font-semibold text-ink-900">Your Plan</div>
        <span className="chip chip-rose capitalize">{plan}</span>
      </div>
      <p className="text-[12px] text-ink-500 leading-snug mb-3">
        {isPro
          ? "You're on the Pro plan. Enjoy full access to every program."
          : isBasic
            ? "You're on the Basic plan. Upgrade anytime to unlock Pro programs and 1-to-1 coaching."
            : "You're on the Free plan. Upgrade to unlock the full creator path."}
      </p>
      {!isPro && (
        <Link
          href="/billing?upgrade=pro"
          className="w-full mb-3 inline-flex items-center justify-center gap-2 h-9 px-3 text-[13px] rounded-[10px] font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors"
        >
          Upgrade Plan
        </Link>
      )}

      <PlanRow label="Free" price="0 kr/mnd" active={isFree} />
      <PlanRow label="Basic" price="999 kr/mnd" active={isBasic} />
      <PlanRow label="Pro" price="1499 kr/mnd" active={isPro} popular />
    </div>
  );
}

function PlanRow({
  label,
  price,
  active,
  popular,
}: {
  label: string;
  price: string;
  active: boolean;
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
        <span className="text-[13px] font-medium text-ink-900">{label}</span>
        {popular && (
          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md">
            Most Popular
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[12.5px] text-ink-500">{price}</span>
        {active && <Check className="size-3.5 text-rose-600" strokeWidth={2.5} />}
      </div>
    </div>
  );
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toString();
}

/**
 * Mobile inline rail — renders the priority right-rail cards as a stacked
 * column inside the main content flow on screens below `xl`, where the
 * desktop right rail is hidden. Hidden on `xl` to avoid duplication.
 *
 * Order mirrors the approved mobile reference exactly:
 *   1. Profile Completion
 *   2. Message from your coach
 *   3. Your Category
 *   4. Your Social Snapshot
 */
export function MobileRail({ profile }: { profile: Profile }) {
  return (
    <div className="xl:hidden space-y-[var(--mobile-grid-gap)]">
      <CompletionCard percent={profile.profile_completion} />
      <CoachCard />
      <CategoryCardMobile
        label={profile.category_label}
        description={profile.category_description}
      />
      <SocialSnapshotCard socials={profile.socials} />
    </div>
  );
}

function CategoryCardMobile({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="card p-[var(--space-card-padding-sm)] flex items-start gap-3">
      <div className="size-10 rounded-full bg-rose-100 inline-flex items-center justify-center shrink-0">
        <Crown className="size-[18px] text-rose-600" strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <div className="text-[14px] font-semibold text-ink-900">
            Your Category
          </div>
          <span className="chip chip-rose">
            <Crown className="size-3" strokeWidth={2} />
            {label}
          </span>
        </div>
        <p className="text-[12.5px] text-ink-500 leading-snug">
          You&apos;re in the {label} category. {description}
        </p>
      </div>
      <ChevronRight className="size-4 text-ink-300 mt-1 shrink-0" strokeWidth={2} />
    </div>
  );
}

function SocialSnapshotCard({
  socials,
}: {
  socials: Profile["socials"];
}) {
  return (
    <div className="card p-[var(--space-card-padding-sm)]">
      <div className="text-[14px] font-semibold text-ink-900 mb-3">
        Your Social Snapshot
      </div>
      <div className="grid grid-cols-3 gap-2">
        <SocialBlock
          icon={<InstagramIcon className="text-rose-600" size={18} />}
          bg="bg-rose-100"
          value={socials.instagram}
          label="Followers"
        />
        <SocialBlock
          icon={<TiktokIcon className="text-ink-900" size={18} />}
          bg="bg-ink-100"
          value={socials.tiktok}
          label="Followers"
        />
        <SocialBlock
          icon={<YoutubeIcon className="text-rose-600" size={18} />}
          bg="bg-rose-100"
          value={socials.youtube}
          label="Subscribers"
        />
      </div>
    </div>
  );
}

function SocialBlock({
  icon,
  bg,
  value,
  label,
}: {
  icon: React.ReactNode;
  bg: string;
  value?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div className={cn("size-9 rounded-[10px] inline-flex items-center justify-center shrink-0", bg)}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-ink-900 leading-none">
          {value ? formatCompact(value) : "0"}
        </div>
        <div className="text-[11px] text-ink-500 leading-tight mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}

export { Send };
