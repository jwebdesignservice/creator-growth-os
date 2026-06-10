import Link from "next/link";
import {
  CalendarDays,
  FileText,
  Share2,
  Clock,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { ActivePlan } from "@/lib/posting/queries";
import { ProgressRing } from "@/components/ui/progress-ring";
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

/**
 * Active plan hero — two compact rows.
 *
 * Row 1: identity (art tile · status chip · title · one quiet meta line) with
 * the actions on the right. Row 2: a single progress strip — animated ring,
 * segmented pipeline bar with its caption + live legend, and the next post
 * inline. Everything else (description, stat chips, big next-post panel) was
 * deliberately dropped to keep the hero scannable.
 */
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
    { key: "ideas", label: "To Do", count: plan.ideas, bar: "bg-ink-300", dot: "bg-ink-400", text: "text-ink-600" },
    { key: "planned", label: "Planned", count: plan.planned, bar: "bg-amber-400", dot: "bg-amber-500", text: "text-amber-600" },
    { key: "inProduction", label: "In Progress", count: plan.inProduction, bar: "bg-violet-500", dot: "bg-violet-500", text: "text-violet-600" },
    { key: "published", label: "Published", count: plan.published, bar: "bg-emerald-500", dot: "bg-emerald-500", text: "text-emerald-600" },
  ];
  const livePhases = phases.filter((p) => p.count > 0);
  const allPublished = plan.total > 0 && plan.published === plan.total;

  const status =
    plan.total === 0
      ? { label: "Planning", cls: "bg-ink-100 text-ink-500" }
      : allPublished
        ? { label: "Complete", cls: "bg-emerald-100 text-emerald-700" }
        : { label: "On Track", cls: "bg-rose-100 text-rose-700" };

  return (
    <section className="card overflow-hidden lg:shrink-0">
      <div className="p-5 sm:p-6">
        {/* ── Row 1 — identity · actions ─────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="hidden sm:block relative size-14 shrink-0 rounded-[14px] overflow-hidden bg-gradient-to-br from-rose-100 via-cream-200 to-rose-200/50">
              <PlanArt />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="font-display text-[22px] sm:text-[24px] text-ink-900 leading-tight truncate">
                  {plan.title}
                </h3>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 h-[20px] rounded-full text-[10px] font-bold uppercase tracking-[0.1em] shrink-0",
                    status.cls,
                  )}
                >
                  {status.label}
                </span>
              </div>
              {/* One quiet meta line instead of four chips */}
              <div className="flex items-center gap-x-3.5 gap-y-1 flex-wrap mt-1.5 text-[12.5px] text-ink-500">
                <Meta icon={FileText} label={`${plan.total} post${plan.total === 1 ? "" : "s"}`} />
                <Meta icon={Share2} label={`${plan.platforms} platform${plan.platforms === 1 ? "" : "s"}`} />
                <Meta icon={CalendarDays} label={`Starts ${formatStarts(plan.week_start)}`} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/posting?view=calendar"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-[12px] border border-ink-200 bg-white text-ink-700 text-[13px] font-semibold hover:bg-cream-100 transition-colors"
            >
              <CalendarDays className="size-4 text-rose-500" strokeWidth={2} />
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

        {/* ── Row 2 — progress strip: ring · bar + legend · next post ── */}
        <div className="mt-5 pt-4 border-t border-ink-100 flex items-center gap-x-5 gap-y-3 flex-wrap">
          <ProgressRing
            pct={plan.progress}
            label={`${plan.progress}% of this plan published`}
            gradientId="planRingGrad"
          />

          <div className="flex-1 min-w-[230px]">
            {/* Segmented pipeline pills — sized by posts per phase */}
            <div className="flex h-2 gap-[3px] plan-bar-fill">
              {plan.total === 0 ? (
                <div className="h-full w-full rounded-full bg-cream-200" />
              ) : (
                livePhases.map((p) => (
                  <div
                    key={p.key}
                    className={cn("h-full rounded-full", p.bar)}
                    style={{ width: `${(p.count / plan.total) * 100}%` }}
                    title={`${p.label}: ${p.count}`}
                  />
                ))
              )}
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-x-4 gap-y-1 flex-wrap">
              <span className="text-[11.5px] text-ink-500">
                {plan.total === 0
                  ? "No posts yet — add one to start your week."
                  : allPublished
                    ? `All ${plan.total} post${plan.total === 1 ? "" : "s"} published — nice work!`
                    : `${plan.published} of ${plan.total} published this week`}
              </span>
              {/* Legend — only phases that currently hold posts */}
              <div className="flex items-center gap-x-3.5 gap-y-1 flex-wrap">
                {livePhases.map((p) => (
                  <span key={p.key} className="flex items-center gap-1.5">
                    <span className={cn("size-2 rounded-full shrink-0", p.dot)} />
                    <span className={cn("text-[13px] font-bold tabular-nums leading-none", p.text)}>
                      {p.count}
                    </span>
                    <span className="text-[11px] text-ink-500 leading-none">{p.label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Next post — inline pill, tap → calendar */}
          <Link
            href="/posting?view=calendar"
            className="group flex items-center gap-2.5 h-12 pl-2 pr-3 rounded-full border border-ink-100 bg-cream-50 hover:border-rose-200 hover:bg-rose-50/40 transition-colors min-w-0"
          >
            <span className="size-8 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
              <Clock className="size-3.5" strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-[0.08em] text-ink-400 font-semibold leading-none">
                Next post
              </span>
              <span className="block text-[12.5px] font-semibold text-ink-900 truncate mt-0.5">
                {next
                  ? `${formatNext(next.scheduled_for)}${platformLabel ? ` · ${platformLabel}` : ""}${contentLabel ? ` ${contentLabel}` : ""}`
                  : "Nothing scheduled"}
              </span>
            </span>
            <ChevronRight
              className="size-4 text-ink-300 group-hover:text-rose-400 group-hover:translate-x-0.5 transition shrink-0"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Bits ──────────────────────────────────────────────────────────────── */

function Meta({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 text-ink-400" strokeWidth={2} />
      {label}
    </span>
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
