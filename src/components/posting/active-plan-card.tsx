import Link from "next/link";
import {
  CalendarDays,
  FileText,
  Share2,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { ActivePlan } from "@/lib/posting/queries";
import { EditPlanButton } from "./edit-plan-button";

const CONTENT_LABEL: Record<string, string> = {
  reel: "Reel",
  short_video: "Short Video",
  carousel: "Carousel",
  story: "Story",
  youtube_video: "YouTube Video",
  video: "Video",
  post: "Post",
};

export function ActivePlanCard({ plan }: { plan: ActivePlan }) {
  const next = plan.nextPost;
  const platformLabel = next?.platform
    ? next.platform.charAt(0).toUpperCase() + next.platform.slice(1)
    : null;
  const contentLabel = next?.content_type
    ? CONTENT_LABEL[next.content_type] ?? next.content_type
    : null;

  // The 4-phase content pipeline. Counts come straight from the plan's items
  // and always sum to plan.total, so the bar + legend stay in sync no matter
  // how posts are distributed (or if there are none).
  const phases = [
    { key: "ideas", label: "Idea", count: plan.ideas, bar: "bg-ink-300", dot: "bg-ink-400", text: "text-ink-600" },
    { key: "planned", label: "Planned", count: plan.planned, bar: "bg-amber-400", dot: "bg-amber-500", text: "text-amber-600" },
    { key: "inProduction", label: "In Production", count: plan.inProduction, bar: "bg-violet-500", dot: "bg-violet-500", text: "text-violet-600" },
    { key: "published", label: "Published", count: plan.published, bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-600" },
  ];
  const allPublished = plan.total > 0 && plan.published === plan.total;

  return (
    <section className="card overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[248px_1fr]">
        {/* ── Illustration ───────────────────────────────────────────── */}
        <div className="hidden lg:block relative m-4 rounded-[16px] overflow-hidden bg-gradient-to-br from-rose-100 via-cream-200 to-rose-200/50">
          <PlanArt />
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex items-center px-2.5 h-6 rounded-full bg-rose-100 text-rose-700 text-[10.5px] font-bold uppercase tracking-[0.1em]">
                Active plan
              </span>
              <h3 className="text-h3 sm:text-[28px] text-ink-900 leading-tight mt-2">
                {plan.title}
              </h3>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Link
                href="/posting?view=calendar"
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] border border-rose-200 text-rose-600 hover:bg-rose-50 text-[13px] font-semibold transition-colors"
              >
                <CalendarDays className="size-4" strokeWidth={2} />
                View Calendar
              </Link>
              <EditPlanButton
                planId={plan.id}
                title={plan.title}
                weekStart={plan.week_start}
                description={plan.description}
              />
            </div>
          </div>

          <p className="text-[13px] text-ink-500 leading-relaxed mt-2 max-w-xl">
            {plan.description ??
              "Your active weekly posting plan with scheduled content, platform mix, and publishing progress."}
          </p>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <StatChip icon={FileText} label={`${plan.total} planned post${plan.total === 1 ? "" : "s"}`} />
            <StatChip icon={Share2} label={`${plan.platforms} platform${plan.platforms === 1 ? "" : "s"}`} />
            <StatChip icon={CalendarDays} label={`Starts ${formatStarts(plan.week_start)}`} />
            <StatChip icon={Clock} label={`Updated ${relativeDay(plan.created_at)}`} />
          </div>

          {/* Progress — published share of the plan */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-semibold text-ink-900">Progress</span>
              <span className="text-[14px] font-bold text-ink-900 tabular-nums">
                {plan.progress}%
              </span>
            </div>
            {/* Stacked pipeline bar — each segment is sized by how many posts
                currently sit in that phase. The green (published) segment width
                equals the headline %. */}
            <div className="flex h-2 rounded-full bg-cream-200 overflow-hidden">
              {plan.total > 0 &&
                phases.map((p) =>
                  p.count > 0 ? (
                    <div
                      key={p.key}
                      className={cn("h-full transition-[width] duration-500", p.bar)}
                      style={{ width: `${(p.count / plan.total) * 100}%` }}
                      title={`${p.label}: ${p.count}`}
                    />
                  ) : null,
                )}
            </div>
            <div className="mt-1.5 text-[12px] text-ink-500">
              {plan.total === 0
                ? "No posts in this plan yet — add one to start your week."
                : allPublished
                  ? `All ${plan.total} post${plan.total === 1 ? "" : "s"} published — nice work!`
                  : `${plan.published} of ${plan.total} post${plan.total === 1 ? "" : "s"} published this week`}
            </div>
          </div>

          {/* Next post + status counts */}
          <div className="mt-5 rounded-[14px] border border-ink-100 bg-cream-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                <Clock className="size-4" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] text-ink-500">Next post</div>
                <div className="text-[13.5px] font-semibold text-ink-900 truncate">
                  {next ? formatNext(next.scheduled_for) : "Nothing scheduled"}
                </div>
                <div className="text-[11.5px] text-ink-500 truncate">
                  {next && platformLabel
                    ? `${platformLabel}${contentLabel ? ` • ${contentLabel}` : ""}`
                    : "Add a scheduled post to see it here"}
                </div>
              </div>
            </div>
            {/* Pipeline phase legend — live counts for each stage */}
            <div className="flex items-center gap-x-4 gap-y-2 flex-wrap shrink-0">
              {phases.map((p) => (
                <PhaseStat
                  key={p.key}
                  dot={p.dot}
                  text={p.text}
                  count={p.count}
                  label={p.label}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Bits ──────────────────────────────────────────────────────────────── */

function StatChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-ink-200 bg-white text-[12.5px] text-ink-700">
      <Icon className="size-3.5 text-ink-400" strokeWidth={2} />
      {label}
    </span>
  );
}

function PhaseStat({
  dot,
  text,
  count,
  label,
}: {
  dot: string;
  text: string;
  count: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full shrink-0", dot)} />
      <span className={cn("text-[15px] font-bold tabular-nums leading-none", text)}>
        {count}
      </span>
      <span className="text-[11.5px] text-ink-500 leading-none">{label}</span>
    </div>
  );
}

function PlanArt() {
  return (
    <svg
      viewBox="0 0 200 240"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <circle cx="100" cy="120" r="80" fill="white" opacity="0.35" />
      {/* Calendar */}
      <rect x="56" y="64" width="88" height="100" rx="8" fill="white" opacity="0.9" />
      <rect x="56" y="64" width="88" height="22" rx="8" fill="var(--rose-200)" />
      <line x1="74" y1="58" x2="74" y2="72" stroke="var(--rose-400)" strokeWidth="4" strokeLinecap="round" />
      <line x1="126" y1="58" x2="126" y2="72" stroke="var(--rose-400)" strokeWidth="4" strokeLinecap="round" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={66 + (i % 4) * 19}
          y={96 + Math.floor(i / 4) * 20}
          width="12"
          height="12"
          rx="3"
          fill={i % 5 === 0 ? "var(--rose-300)" : "var(--cream-300)"}
        />
      ))}
      {/* Leaf */}
      <path d="M40 196 C40 168 64 150 84 150 C84 178 64 196 40 196 Z" fill="var(--rose-300)" opacity="0.8" />
      <line x1="40" y1="196" x2="78" y2="158" stroke="white" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

/* ── Date helpers ──────────────────────────────────────────────────────── */

function formatStarts(weekStartIso: string) {
  const d = new Date(`${weekStartIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return weekStartIso;
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relativeDay(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "recently";
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(d)) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatNext(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(new Date())) / 86_400_000);
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}
