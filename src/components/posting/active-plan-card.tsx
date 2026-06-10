import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ActivePlan } from "@/lib/posting/queries";
import { platformMeta } from "@/lib/posting/platform-meta";
import { contentTypeLabel } from "@/lib/posting/content-type-accent";
import { EditPlanButton } from "./edit-plan-button";

/**
 * Active plan header band — the plan's identity + true progress + next action.
 *
 * Deliberately quiet: one meta line instead of boxed stat chips, a single
 * HONEST progress bar (emerald fill = published share, so the visual always
 * matches the headline %), the four pipeline counts as a legend underneath,
 * and one "next post" well that pairs the platform tile with the scheduled
 * time — plus the band's only calendar link. Plan-level actions reduce to
 * Edit plan (the Calendar tab above already covers navigation).
 */
export function ActivePlanCard({ plan }: { plan: ActivePlan }) {
  const next = plan.nextPost;
  const nextPlatform = next?.platform ? platformMeta(next.platform) : null;
  const nextType = next?.content_type ? contentTypeLabel(next.content_type) : null;

  const phases = [
    { key: "ideas", label: "Idea", count: plan.ideas, dot: "bg-ink-300", text: "text-ink-600" },
    { key: "planned", label: "Planned", count: plan.planned, dot: "bg-amber-400", text: "text-amber-600" },
    { key: "inProduction", label: "In production", count: plan.inProduction, dot: "bg-violet-500", text: "text-violet-600" },
    { key: "published", label: "Published", count: plan.published, dot: "bg-emerald-500", text: "text-emerald-600" },
  ];
  const allPublished = plan.total > 0 && plan.published === plan.total;

  return (
    <section className="bg-cream-100 border-b border-ink-100 lg:shrink-0">
      <div className="p-5 sm:px-6 sm:py-6">
        {/* ── Identity row ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-rose-600">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full rounded-full bg-rose-400 opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-rose-500" />
              </span>
              Active plan
            </span>
            <h3 className="text-h3 sm:text-[26px] text-ink-900 leading-tight mt-1.5 truncate">
              {plan.title}
            </h3>
            {plan.description && (
              <p className="text-[13px] text-ink-500 leading-relaxed mt-1.5 max-w-xl">
                {plan.description}
              </p>
            )}
            {/* One quiet meta line — replaces four boxed chips */}
            <p className="mt-2 text-[12.5px] font-medium text-ink-500">
              {plan.total} post{plan.total === 1 ? "" : "s"}
              <Dot />
              {plan.platforms} platform{plan.platforms === 1 ? "" : "s"}
              <Dot />
              Week of {formatWeek(plan.week_start)}
            </p>
          </div>
          <div className="shrink-0">
            <EditPlanButton
              planId={plan.id}
              title={plan.title}
              weekStart={plan.week_start}
              description={plan.description}
            />
          </div>
        </div>

        {/* ── Progress — published share, visual always matches the % ── */}
        <div className="mt-5 max-w-3xl">
          <div className="flex items-baseline justify-between gap-3 mb-1.5">
            <span className="text-[13px] font-semibold text-ink-900">
              {plan.total === 0
                ? "No posts in this plan yet"
                : allPublished
                  ? `All ${plan.total} post${plan.total === 1 ? "" : "s"} published — nice work!`
                  : `${plan.published} of ${plan.total} post${plan.total === 1 ? "" : "s"} published this week`}
            </span>
            <span className="text-[14px] font-bold text-ink-900 tabular-nums">
              {plan.progress}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={plan.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Published share of this plan"
            className="h-2 rounded-full bg-cream-200 ring-1 ring-inset ring-ink-900/[0.04] overflow-hidden"
          >
            <div
              className="program-bar h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
              style={{ width: `${plan.progress}%` }}
            />
          </div>
          {/* Pipeline legend — where every post currently sits */}
          {plan.total > 0 && (
            <div className="mt-2.5 flex items-center gap-x-4 gap-y-1.5 flex-wrap">
              {phases.map((p) => (
                <span key={p.key} className="flex items-center gap-1.5">
                  <span className={cn("size-2 rounded-full shrink-0", p.dot)} />
                  <span className={cn("text-[13.5px] font-bold tabular-nums leading-none", p.text)}>
                    {p.count}
                  </span>
                  <span className="text-[11.5px] text-ink-500 leading-none">{p.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Next post — the plan's next action ───────────────────── */}
        <div className="mt-5 max-w-3xl rounded-[14px] border border-ink-100 bg-white/70 px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {nextPlatform ? (
              <span
                className={cn(
                  "size-10 rounded-[12px] inline-flex items-center justify-center shrink-0 shadow-[0_2px_8px_-3px_rgba(26,24,22,0.35)]",
                  nextPlatform.tile,
                )}
              >
                {nextPlatform.icon}
              </span>
            ) : (
              <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                <Clock className="size-4" strokeWidth={2} />
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                Next post
              </div>
              <div className="text-[13.5px] font-semibold text-ink-900 truncate mt-0.5">
                {next ? formatNext(next.scheduled_for) : "Nothing scheduled"}
              </div>
              <div className="text-[12px] text-ink-500 truncate">
                {next && nextPlatform
                  ? `${nextPlatform.label}${nextType ? ` · ${nextType}` : ""}`
                  : "Add a scheduled post to see it here"}
              </div>
            </div>
          </div>
          {/* The band's one calendar link — contextual, next to the post */}
          <Link
            href="/posting?view=calendar"
            className="group/cal inline-flex items-center gap-1 shrink-0 text-[12.5px] font-semibold text-rose-700 hover:text-rose-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-md"
          >
            <span className="hidden sm:inline">View in calendar</span>
            <span className="sm:hidden">Calendar</span>
            <ArrowRight
              className="size-3.5 transition-transform duration-200 group-hover/cal:translate-x-0.5"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Dot() {
  return <span className="mx-1.5 text-ink-300">·</span>;
}

/* ── Date helpers ──────────────────────────────────────────────────────── */

function formatWeek(weekStartIso: string) {
  const d = new Date(`${weekStartIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return weekStartIso;
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

function formatNext(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(d) - startOf(new Date())) / 86_400_000);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  return `${d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}, ${time}`;
}
