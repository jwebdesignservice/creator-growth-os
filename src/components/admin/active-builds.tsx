import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Layers,
  PlayCircle,
  CheckSquare,
  BookOpen,
  UserRound,
  CalendarDays,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { ActiveProgramBuild, BuildStatus } from "@/lib/admin/queries";

const STATUS_STYLES: Record<
  BuildStatus,
  { label: string; dot: string; text: string }
> = {
  in_progress: {
    label: "In Progress",
    dot: "bg-rose-500",
    text: "text-rose-700",
  },
  draft: {
    label: "Draft",
    dot: "bg-ink-400",
    text: "text-ink-600",
  },
  ready_to_publish: {
    label: "Ready to Publish",
    dot: "bg-success",
    text: "text-success",
  },
};

const PLAN_LABEL: Record<ActiveProgramBuild["plan_access"], string> = {
  free: "Free Members",
  basic: "Starter Members",
  pro: "Pro Members",
};

/**
 * Dashboard "Continue where you left off" section — three program-build
 * cards + a momentum/focus footer row. Replaces the four stat tiles on
 * the admin dashboard.
 */
export function ActiveBuildsSection({
  builds,
}: {
  builds: ActiveProgramBuild[];
}) {
  if (builds.length === 0) {
    return <EmptyBuilds />;
  }

  const inProgressCount = builds.filter(
    (b) => b.status === "in_progress",
  ).length;

  return (
    <section className="space-y-5">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Sparkles
              className="size-[20px]"
              strokeWidth={2}
              fill="currentColor"
            />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-[26px] text-ink-900 leading-tight mb-1">
              Continue where you left off
            </h2>
            <p className="text-[13.5px] text-ink-500 leading-snug max-w-xl">
              Jump back into your active program builds and keep momentum
              without losing context.
            </p>
          </div>
        </div>
        <Link
          href="/admin/programs"
          className="inline-flex items-center gap-1 text-[13.5px] font-semibold text-rose-600 hover:text-rose-700 shrink-0"
        >
          View all projects
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </header>

      {/* 3 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {builds.map((b, i) => (
          <BuildCard key={b.id} build={b} featured={i === 0} />
        ))}
      </div>

      {/* Bottom row — momentum nudge + focus session */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-5 flex items-center gap-3">
          <span className="size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <Sparkles
              className="size-[18px]"
              strokeWidth={2}
              fill="currentColor"
            />
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-ink-900">
              Keep the momentum going
            </div>
            <p className="text-[12.5px] text-ink-500 mt-0.5">
              You have{" "}
              <span className="font-semibold text-ink-700 tabular-nums">
                {inProgressCount}
              </span>{" "}
              active program build{inProgressCount === 1 ? "" : "s"} in
              progress.
            </p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-3 flex-wrap">
          <span className="size-11 rounded-full bg-cream-100 text-rose-600 inline-flex items-center justify-center shrink-0">
            <CalendarDays className="size-[18px]" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-[11.5px] text-ink-500 leading-tight">
              Set build time
            </div>
            <div className="text-[14px] font-bold text-ink-900 leading-tight">
              Focus for 30 min
            </div>
          </div>
          <Link
            href={builds[0]?.cta.href ?? "/admin/programs"}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-ink-200 bg-white text-[13px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors shrink-0"
          >
            Start focus session
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function BuildCard({
  build: b,
  featured,
}: {
  build: ActiveProgramBuild;
  featured: boolean;
}) {
  const status = STATUS_STYLES[b.status];
  const planLabel = PLAN_LABEL[b.plan_access];

  return (
    <article
      className={cn(
        "rounded-[20px] border bg-white overflow-hidden flex flex-col transition-shadow hover:shadow-card",
        featured
          ? "border-rose-200 ring-1 ring-rose-100 bg-gradient-to-br from-rose-50/60 to-white"
          : "border-ink-100",
      )}
    >
      <div className="px-5 pt-5 pb-5 flex flex-col gap-4 flex-1">
        {/* Recommended badge — only on featured card */}
        {featured && (
          <div>
            <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-rose-700">
              <Sparkles
                className="size-3.5"
                strokeWidth={2}
                fill="currentColor"
              />
              Recommended to resume
            </span>
          </div>
        )}

        {/* Thumbnail + title row */}
        <div className="flex items-start gap-4">
          <BuildThumb build={b} />
          <div className="flex-1 min-w-0 pt-1">
            <h3 className="text-[18px] font-bold text-ink-900 leading-tight mb-1.5">
              {b.title}
            </h3>
            {b.description && (
              <p className="text-[12.5px] text-ink-500 leading-snug line-clamp-2 mb-2.5">
                {b.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-cream-100 text-[11.5px] font-semibold",
                  status.text,
                )}
              >
                <span
                  aria-hidden
                  className={cn("size-1.5 rounded-full", status.dot)}
                />
                {status.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-cream-100 text-[11.5px] font-medium text-ink-700">
                <BookOpen className="size-3" strokeWidth={2} />
                Program
              </span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="text-[12.5px] text-ink-700 font-semibold mb-1.5 tabular-nums">
            {b.buildPct}% complete
          </div>
          <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-rose-500 transition-[width] duration-500"
              style={{ width: `${b.buildPct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[12px] text-ink-500 flex-wrap mt-auto">
          <StatChip
            icon={<Layers className="size-3.5" strokeWidth={2} />}
            label={`${b.modulesCount} Modules`}
          />
          <span aria-hidden className="text-ink-300">·</span>
          <StatChip
            icon={<PlayCircle className="size-3.5" strokeWidth={2} />}
            label={`${b.total_lessons} Lessons`}
          />
          <span aria-hidden className="text-ink-300">·</span>
          <StatChip
            icon={<CheckSquare className="size-3.5" strokeWidth={2} />}
            label={`${b.total_tasks} Tasks`}
          />
        </div>
      </div>

      {/* Footer — access tier / last edited / CTA */}
      <footer className="px-5 py-4 border-t border-ink-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-8 rounded-full bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
              <UserRound className="size-[15px]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <div className="text-[10.5px] text-ink-400 uppercase tracking-wider leading-tight">
                Access Tier
              </div>
              <div className="text-[12px] font-semibold text-ink-900 truncate">
                {planLabel}
              </div>
            </div>
          </div>
          <div className="min-w-0 flex items-center gap-2">
            <Clock className="size-[15px] text-ink-400 shrink-0" strokeWidth={2} />
            <div className="min-w-0">
              <div className="text-[10.5px] text-ink-400 uppercase tracking-wider leading-tight">
                Last edited
              </div>
              <div className="text-[12px] font-semibold text-ink-900 truncate">
                {b.lastEdited}
              </div>
            </div>
          </div>
        </div>
        <Link
          href={b.cta.href}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] text-[12.5px] font-semibold transition-colors shrink-0",
            featured
              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
              : "bg-cream-100 text-ink-700 hover:bg-cream-200",
          )}
        >
          {b.cta.label}
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      </footer>
    </article>
  );
}

function BuildThumb({ build }: { build: ActiveProgramBuild }) {
  const gradient = getThumbGradient(build);
  const dark = gradient.startsWith("from-ink");
  return (
    <div
      className={cn(
        "w-[92px] aspect-square rounded-[14px] overflow-hidden shrink-0 bg-gradient-to-br",
        gradient,
      )}
    >
      {build.cover_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={build.cover_image_url}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center p-2.5 text-center">
          <span
            className={cn(
              "text-[10px] font-bold tracking-[0.08em] leading-tight uppercase",
              dark ? "text-white/90" : "text-ink-900/80",
            )}
          >
            {build.title}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Pick a gradient for the thumbnail based on the program slug — mirrors
 * the mockup's varied covers (dark navy / cream / rose-sunset).
 */
function getThumbGradient(b: ActiveProgramBuild): string {
  const slug = b.slug.toLowerCase();
  if (slug.includes("influencer") || slug.includes("blueprint")) {
    return "from-ink-900 via-ink-700 to-ink-900";
  }
  if (slug.includes("content") || slug.includes("connect")) {
    return "from-cream-200 via-cream-300 to-rose-100/60";
  }
  if (slug.includes("monet") || slug.includes("income")) {
    return "from-rose-300 via-rose-200 to-cream-100";
  }
  if (slug.includes("scale") || slug.includes("automate")) {
    return "from-rose-400 via-rose-300 to-cream-200";
  }
  return "from-rose-200 via-rose-100 to-cream-100";
}

function StatChip({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-ink-600">
      <span className="text-ink-400">{icon}</span>
      <span className="tabular-nums">{label}</span>
    </span>
  );
}

function EmptyBuilds() {
  return (
    <section className="card p-10 text-center">
      <span className="inline-flex items-center justify-center size-14 rounded-full bg-rose-100 text-rose-600 mb-3 mx-auto">
        <Sparkles className="size-6" strokeWidth={1.8} fill="currentColor" />
      </span>
      <h2 className="font-display text-[22px] text-ink-900 mb-1">
        No program builds in flight
      </h2>
      <p className="text-[13.5px] text-ink-500 max-w-md mx-auto mb-5">
        Once you start drafting programs, they&apos;ll show up here so you can
        pick them back up without losing context.
      </p>
      <Link
        href="/create-new"
        className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold transition-colors"
      >
        Start a new program
        <ArrowRight className="size-4" strokeWidth={2} />
      </Link>
    </section>
  );
}
