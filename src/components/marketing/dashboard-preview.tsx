import {
  Home,
  GraduationCap,
  Play,
  BarChart3,
  CalendarDays,
  Users,
  Sparkles,
  Check,
  TrendingUp,
  Images,
  Film,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/cn";

/**
 * Decorative product mockup shown on the right of the marketing hero.
 *
 * A Profluencer-branded creator-growth dashboard — sidebar (the real app's
 * surfaces), a creator profile, a creator-score + weekly-goal pair, and a
 * top-content table (format + reach). Purely presentational — no
 * interactivity, hidden from assistive tech via the parent's aria-hidden.
 * Fixed pixel width so the perspective tilt and the off-screen bleed in the
 * hero stay stable across viewports.
 */
export function DashboardPreview() {
  return (
    <div className="w-[860px] select-none overflow-hidden rounded-[20px] border border-ink-100 bg-white shadow-[0_40px_90px_-25px_rgba(26,24,22,0.30)]">
      <div className="flex">
        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside className="w-[214px] shrink-0 border-r border-ink-100 p-5">
          <div className="mb-7 flex items-center gap-2">
            <BrandMark size={20} className="text-ink-900" />
            <span className="text-[16px] font-bold tracking-tight text-ink-900">
              Profluencer
            </span>
          </div>
          <nav className="space-y-1">
            <NavItem icon={Home} label="Dashboard" active />
            <NavItem icon={GraduationCap} label="Programs" />
            <NavItem icon={Play} label="Tutorials" />
          </nav>
          <div className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
            Grow
          </div>
          <nav className="space-y-1">
            <NavItem icon={BarChart3} label="Performance" />
            <NavItem icon={CalendarDays} label="Posting Plans" />
            <NavItem icon={Users} label="Community" />
            <NavItem icon={Sparkles} label="AI Coach" />
          </nav>
        </aside>

        {/* ── Main panel ──────────────────────────────────────────── */}
        <div className="min-w-0 flex-1 p-6">
          {/* Profile */}
          <div className="mb-5 flex justify-end">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-full bg-gradient-to-br from-rose-300 to-rose-500" />
              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-ink-900">
                  Mia Larsen
                </div>
                <div className="text-[11px] text-ink-400">@mialarsen</div>
              </div>
            </div>
          </div>

          {/* NEW + heading */}
          <div className="mb-4 flex items-center gap-2.5">
            <span className="inline-flex h-6 items-center rounded-full bg-amber-200 px-2.5 text-[11px] font-bold text-amber-800">
              NEW
            </span>
            <span className="text-[22px] font-bold tracking-tight text-ink-900">
              This week
            </span>
          </div>

          {/* Metric cards */}
          <div className="mb-6 grid grid-cols-[1.15fr_1fr] gap-4">
            {/* Creator score */}
            <div className="rounded-[14px] border border-ink-100 p-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12px] text-ink-500">Creator score</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                  <TrendingUp className="size-3" strokeWidth={2.4} />6 pts
                </span>
              </div>
              <div className="text-[30px] font-bold tracking-tight text-ink-900">
                84
                <span className="text-[15px] font-medium text-ink-400">/100</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-[12px]">
                <span className="text-ink-400">Reach · 30 days</span>
                <span className="font-semibold text-ink-900">128K</span>
              </div>
            </div>

            {/* Weekly goal */}
            <div className="rounded-[14px] border border-ink-100 p-4">
              <div className="mb-2 text-[12px] text-ink-500">Weekly goal</div>
              <div className="mb-2 h-2 overflow-hidden rounded-full bg-cream-200">
                <div className="h-full w-[75%] rounded-full bg-emerald-500" />
              </div>
              <div className="mb-2.5 text-[11px] text-ink-400">
                6 of 8 posts published
              </div>
              <div className="flex gap-1.5">
                <Chip icon={Check} label="On track" tone="emerald" />
                <Chip icon={TrendingUp} label="+12%" tone="rose" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-1 flex items-center gap-6 border-b border-ink-100">
            <Tab label="Top content" active />
            <Tab label="Programs" />
            <Tab label="Upcoming" />
          </div>

          {/* Top-content table */}
          <table className="w-full">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-ink-400">
                <th className="py-3 text-left font-semibold">Title</th>
                <th className="py-3 text-left font-semibold">Format</th>
                <th className="py-3 text-right font-semibold">Reach</th>
              </tr>
            </thead>
            <tbody className="text-[13px]">
              <ContentRow name="How I plan a week of content" format="Reel" reach="14.2K" icon={Play} />
              <ContentRow name="3 hooks that doubled my saves" format="Carousel" reach="9.8K" icon={Images} />
              <ContentRow name="My filming setup tour" format="Video" reach="6.4K" icon={Film} />
              <ContentRow name="Reply → Reel in 30 seconds" format="Reel" reach="4.1K" icon={Play} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Bits ──────────────────────────────────────────────────────────── */

function NavItem({
  icon: Icon,
  label,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-[9px] px-2.5 text-[13px] font-medium",
        active ? "bg-cream-100 text-ink-900" : "text-ink-500",
      )}
    >
      <Icon className="size-[17px]" strokeWidth={1.9} />
      {label}
    </div>
  );
}

function Chip({
  icon: Icon,
  label,
  tone = "ink",
}: {
  icon: LucideIcon;
  label: string;
  tone?: "ink" | "emerald" | "rose";
}) {
  const tones = {
    ink: "bg-cream-100 text-ink-500",
    emerald: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-md px-2 text-[11px] font-medium",
        tones[tone],
      )}
    >
      <Icon className="size-3" strokeWidth={2} />
      {label}
    </span>
  );
}

function Tab({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "-mb-px border-b-2 pb-2.5 text-[13px] font-medium",
        active
          ? "border-ink-900 text-ink-900"
          : "border-transparent text-ink-400",
      )}
    >
      {label}
    </div>
  );
}

function ContentRow({
  name,
  format,
  reach,
  icon: Icon,
}: {
  name: string;
  format: string;
  reach: string;
  icon: LucideIcon;
}) {
  return (
    <tr className="border-t border-ink-100">
      <td className="py-3 font-semibold text-ink-900">{name}</td>
      <td className="py-3">
        <span className="inline-flex items-center gap-1.5 text-ink-500">
          <Icon className="size-3.5" strokeWidth={2} />
          {format}
        </span>
      </td>
      <td className="py-3 text-right font-semibold text-ink-900">{reach}</td>
    </tr>
  );
}
