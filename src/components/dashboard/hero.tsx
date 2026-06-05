import Link from "next/link";
import { ArrowRight, Crown, Sparkles, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/app-shell/topbar";
import { cn } from "@/lib/cn";

export type HeroJourney =
  | { stage: "start"; primaryHref: string; secondaryHref: string }
  | {
      stage: "continue";
      programTitle: string;
      percent: number;
      primaryHref: string;
      secondaryHref: string;
    }
  | {
      stage: "next";
      programTitle: string;
      primaryHref: string;
      secondaryHref: string;
    }
  | { stage: "done"; primaryHref: string; secondaryHref: string };

export type HeroResume = {
  programTitle: string;
  percent: number;
  lessonTitle: string | null;
  lessonMeta: string | null;
};

type Plan = "free" | "basic" | "pro";

type Props = {
  firstName: string;
  greeting: string;
  avatarUrl?: string | null;
  plan: Plan;
  headline: string;
  subline: string;
  primaryLabel: string;
  primaryHref: string;
  resume: HeroResume | null;
};

const PLAN_CFG: Record<
  Plan,
  {
    label: string;
    Icon: LucideIcon;
    wrap: string;
    iconWrap: string;
    eyebrow: string;
  }
> = {
  pro: {
    label: "Pro",
    Icon: Crown,
    wrap: "border-transparent bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_8px_20px_-10px_rgba(185,72,92,0.7)]",
    iconWrap: "bg-white/20 text-white",
    eyebrow: "text-white/70",
  },
  basic: {
    label: "Basic",
    Icon: Sparkles,
    wrap: "border-rose-100 bg-white text-rose-700",
    iconWrap: "bg-rose-50 text-rose-600",
    eyebrow: "text-ink-400",
  },
  free: {
    label: "Free",
    Icon: Sparkles,
    wrap: "border-ink-100 bg-white text-ink-800",
    iconWrap: "bg-cream-200 text-ink-500",
    eyebrow: "text-ink-400",
  },
};

function PlanBadge({ plan }: { plan: Plan }) {
  const cfg = PLAN_CFG[plan];
  const Icon = cfg.Icon;
  return (
    <Link
      href="/billing"
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[13px] border px-3 py-2 transition-transform duration-300 hover:-translate-y-px",
        cfg.wrap,
      )}
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full",
          cfg.iconWrap,
        )}
      >
        <Icon className="size-[15px]" strokeWidth={2} />
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block text-[9px] font-bold uppercase tracking-[0.12em]",
            cfg.eyebrow,
          )}
        >
          Your plan
        </span>
        <span className="block whitespace-nowrap text-[13px] font-bold">
          {cfg.label}
          {plan !== "pro" && <span className="opacity-60"> · Upgrade</span>}
        </span>
      </span>
    </Link>
  );
}

/**
 * Dashboard welcome hero — greeting + progress on the left, a plan badge
 * (top-right) and two stacked CTAs on the right.
 */
export function DashboardHero({
  firstName,
  greeting,
  avatarUrl,
  plan,
  headline,
  subline,
  primaryLabel,
  primaryHref,
  resume,
}: Props) {
  const pct = resume
    ? Math.min(100, Math.max(0, Math.round(resume.percent)))
    : 0;

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-ink-100 bg-gradient-to-br from-white via-cream-50 to-rose-50 px-6 py-6 sm:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch lg:gap-7">
        {/* ── Greeting + progress ─────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 items-start gap-4 lg:gap-5">
          <span className="hidden size-[60px] shrink-0 overflow-hidden rounded-full bg-rose-100 ring-4 ring-white sm:inline-flex">
            <Avatar name={firstName} src={avatarUrl ?? undefined} size={60} />
          </span>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-rose-500">
              {greeting}
            </div>
            <h1 className="mt-1 text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-ink-900 sm:text-[30px]">
              {headline}
            </h1>
            <p className="mt-1.5 text-[14.5px] text-ink-500">{subline}</p>

            {resume && (
              <div className="mt-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-[7px] w-[200px] shrink-0 overflow-hidden rounded-full bg-rose-100 sm:w-[230px]">
                    <div
                      className="h-full rounded-full bg-rose-600"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="min-w-0 truncate text-[12px] text-ink-500">
                    <span className="font-semibold text-ink-700">{pct}%</span>
                    {" · "}
                    {resume.programTitle}
                  </span>
                </div>
                {resume.lessonTitle && (
                  <div className="mt-2 truncate text-[12px] text-ink-500">
                    <span className="font-semibold text-rose-700">Up next</span>
                    {" · "}
                    {resume.lessonTitle}
                    {resume.lessonMeta ? ` · ${resume.lessonMeta}` : ""}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Divider ─────────────────────────────────────────────────── */}
        <span aria-hidden className="hidden w-px self-stretch bg-ink-100 lg:block" />

        {/* ── Plan badge (top) + CTA (bottom) ─────────────────────────── */}
        <div className="flex flex-col gap-3 lg:w-[200px]">
          <PlanBadge plan={plan} />
          <Link
            href={primaryHref}
            className="mt-auto inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-rose-600 px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
          >
            {primaryLabel}
            <ArrowRight className="size-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}
