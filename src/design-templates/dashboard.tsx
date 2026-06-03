/* Dashboard ─────────────────────────────────────────────────────────────
   Composite dashboard surfaces from the learner home: the Today's Plan
   guided-session timeline, the Audience-Growth and Content-Activity KPI
   cards, and the Getting-Started links card. Pure presentational mirrors
   of src/components/dashboard/*.
   ───────────────────────────────────────────────────────────────────── */

import {
  GraduationCap,
  ClipboardList,
  Send,
  BarChart3,
  Users,
  Check,
  ArrowRight,
  TrendingUp,
  Sparkles,
  UserRound,
  MessageSquare,
  PenLine,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Today's Plan — connected vertical timeline of the daily creator session.
// ─────────────────────────────────────────────────────────────────────────────

type Step = {
  icon: LucideIcon;
  title: string;
  desc: string;
  done: boolean;
  badge: { kind: "done" | "progress" | "count" | "action" | "action-muted"; label: string };
};

export function TodaysPlanTimeline() {
  const steps: Step[] = [
    { icon: GraduationCap, title: "Watch 1 lesson", desc: "Learn something new", done: true, badge: { kind: "done", label: "Completed" } },
    { icon: ClipboardList, title: "Complete 2 creator tasks", desc: "Make progress on your goals", done: true, badge: { kind: "progress", label: "2 of 2" } },
    { icon: Send, title: "Publish or schedule 1 post", desc: "Share content with your audience", done: false, badge: { kind: "action", label: "Do this" } },
    { icon: BarChart3, title: "Review yesterday's result", desc: "See what worked and improve", done: false, badge: { kind: "action-muted", label: "Review" } },
    { icon: Users, title: "Send 3 brand outreach messages", desc: "Build relationships and opportunities", done: false, badge: { kind: "count", label: "0 of 3" } },
  ];

  return (
    <div className="card w-[360px] max-w-full flex flex-col overflow-hidden">
      <div className="p-5 flex-1">
        <header className="mb-4">
          <h3 className="text-h4 text-ink-900">Today&apos;s Plan</h3>
          <p className="text-[12.5px] text-ink-500">Your daily creator session</p>
        </header>
        <ol>
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-center gap-3 py-2">
              {/* Timeline marker */}
              <div className="relative self-stretch flex flex-col items-center justify-center w-7 shrink-0">
                {i !== 0 && <span aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 h-1/2 w-0.5 bg-ink-100" />}
                {i !== steps.length - 1 && <span aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1/2 w-0.5 bg-ink-100" />}
                <span
                  className={cn(
                    "relative z-[1] size-7 rounded-full inline-flex items-center justify-center text-[11px] font-semibold",
                    s.done ? "bg-rose-500 text-white" : "border-2 border-ink-200 text-ink-400 bg-white",
                  )}
                >
                  {s.done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                </span>
              </div>
              {/* Icon */}
              <span className="size-10 rounded-[12px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <s.icon className="size-[18px]" strokeWidth={1.8} />
              </span>
              {/* Title + desc */}
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-semibold text-ink-900 leading-tight">{s.title}</div>
                <div className="text-[12px] text-ink-500 leading-snug truncate">{s.desc}</div>
              </div>
              {/* Badge */}
              <StepBadge badge={s.badge} />
            </li>
          ))}
        </ol>
      </div>
      <div className="flex items-center justify-center gap-1.5 py-3.5 bg-rose-50 text-rose-600 text-[13.5px] font-semibold">
        Continue Session <ArrowRight className="size-4" strokeWidth={2} />
      </div>
    </div>
  );
}

function StepBadge({ badge }: { badge: Step["badge"] }) {
  switch (badge.kind) {
    case "done":
      return <span className="text-[12.5px] font-semibold text-success shrink-0">{badge.label}</span>;
    case "progress":
      return <span className="text-[12.5px] font-semibold text-rose-600 shrink-0">{badge.label}</span>;
    case "count":
      return <span className="text-[12.5px] font-medium text-ink-400 shrink-0">{badge.label}</span>;
    case "action":
      return <span className="shrink-0 inline-flex items-center h-8 px-3.5 rounded-full bg-rose-100 text-rose-700 text-[12.5px] font-semibold">{badge.label}</span>;
    case "action-muted":
      return <span className="shrink-0 inline-flex items-center h-8 px-3.5 rounded-full bg-cream-200 text-ink-700 text-[12.5px] font-semibold">{badge.label}</span>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Audience Growth KPI card — stat + sparkline + insight + CTA.
// ─────────────────────────────────────────────────────────────────────────────

export function AudienceGrowthCard() {
  const series = [12, 18, 16, 24, 30, 28, 38, 44, 52, 60, 58, 72];
  const max = Math.max(...series);
  const min = Math.min(...series);
  const w = 240;
  const h = 56;
  const pts = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / (max - min || 1)) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="card p-5 w-[300px] max-w-full">
      <div className="flex items-start justify-between mb-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <TrendingUp className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600">
          <TrendingUp className="size-3.5" strokeWidth={2.4} /> +12.4%
        </span>
      </div>
      <div className="text-[12.5px] text-ink-500">Audience Growth</div>
      <div className="text-[28px] font-bold text-ink-900 tabular-nums leading-tight">48,250</div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12 mt-2 overflow-visible" preserveAspectRatio="none" aria-hidden>
        <polyline points={pts} fill="none" stroke="var(--rose-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polygon points={`0,${h} ${pts} ${w},${h}`} fill="var(--rose-500)" opacity="0.08" />
      </svg>
      <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-500">
        <Sparkles className="size-3.5 text-rose-500" strokeWidth={2} />
        +1,820 followers this week
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Content Activity KPI card — weekly posts-per-day bar chart.
// ─────────────────────────────────────────────────────────────────────────────

export function ContentActivityCard() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const counts = [1, 0, 2, 1, 3, 0, 1];
  const max = Math.max(...counts, 1);

  return (
    <div className="card p-5 w-[300px] max-w-full">
      <div className="flex items-start justify-between mb-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center">
          <BarChart3 className="size-[18px]" strokeWidth={2} />
        </span>
      </div>
      <div className="text-[12.5px] text-ink-500">Content Activity</div>
      <div className="text-[28px] font-bold text-ink-900 tabular-nums leading-tight">8 posts</div>
      <div className="mt-3 flex items-end justify-between gap-2 h-20">
        {counts.map((c, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full flex items-end h-16">
              <div
                className={cn("w-full rounded-[5px]", c > 0 ? "bg-rose-400" : "bg-cream-200")}
                style={{ height: `${(c / max) * 100 || 6}%` }}
              />
            </div>
            <span className="text-[10.5px] text-ink-400 font-semibold">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Today's Progress KPI card — completion donut + task checklist.
// ─────────────────────────────────────────────────────────────────────────────

export function TodaysProgressCard() {
  const done = 3;
  const total = 4;
  const pct = Math.round((done / total) * 100);
  const items = [
    { label: "Watch a lesson", done: true },
    { label: "Complete 2 tasks", done: true },
    { label: "Schedule a post", done: true },
    { label: "Log performance", done: false },
  ];
  const r = 26;
  const c = 2 * Math.PI * r;
  const filled = (pct / 100) * c;

  return (
    <div className="card p-5 w-[300px] max-w-full">
      <div className="flex items-center gap-4 mb-3">
        <div className="relative shrink-0">
          <svg viewBox="0 0 64 64" className="size-16 -rotate-90" aria-hidden>
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--cream-200)" strokeWidth="7" />
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--rose-500)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${filled} ${c - filled}`} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-ink-900 tabular-nums">
            {done}/{total}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-[12.5px] text-ink-500">Today&apos;s Progress</div>
          <div className="text-[20px] font-bold text-ink-900 leading-tight">{pct}% done</div>
        </div>
      </div>
      <ul className="space-y-1.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-2">
            <span
              className={cn(
                "size-4 rounded-full inline-flex items-center justify-center shrink-0",
                it.done ? "bg-rose-500 text-white" : "border-2 border-ink-200",
              )}
            >
              {it.done && <Check className="size-2.5" strokeWidth={3} />}
            </span>
            <span className={cn("text-[12.5px]", it.done ? "text-ink-500 line-through" : "text-ink-800")}>
              {it.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Getting Started — onboarding link rows.
// ─────────────────────────────────────────────────────────────────────────────

export function GettingStartedCard() {
  const steps = [
    { icon: UserRound, title: "Complete your profile", desc: "Add bio, niche & links" },
    { icon: MessageSquare, title: "Connect your socials", desc: "Link Instagram, TikTok & more" },
    { icon: PenLine, title: "Create your first post", desc: "Share and start building momentum" },
  ];
  return (
    <div className="card p-5 w-[320px] max-w-full">
      <header className="flex items-start gap-3 mb-3">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Sparkles className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div>
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">Getting Started</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">Set up your foundation</p>
        </div>
      </header>
      <ul className="space-y-1">
        {steps.map((s) => (
          <li key={s.title}>
            <span className="flex items-center gap-3 p-2 -mx-2 rounded-[10px] hover:bg-cream-100 transition-colors cursor-pointer">
              <span className="size-9 rounded-[10px] bg-rose-50 text-rose-600 inline-flex items-center justify-center shrink-0">
                <s.icon className="size-[18px]" strokeWidth={1.9} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[13.5px] font-semibold text-ink-900 leading-tight">{s.title}</span>
                <span className="block text-[12px] text-ink-500 truncate">{s.desc}</span>
              </span>
              <ChevronRight className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
            </span>
          </li>
        ))}
      </ul>
      <span className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-rose-600">
        View onboarding guide <ArrowRight className="size-3.5" strokeWidth={2} />
      </span>
    </div>
  );
}
