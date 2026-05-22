import Link from "next/link";
import {
  ArrowRight,
  Rocket,
  Heart,
  DollarSign,
  Zap,
  GraduationCap,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

export type ProgramCard = {
  slug: string;
  title: string;
  subtitle: string;
  status: "in_progress" | "not_started" | "completed" | "pro_only";
  progress?: number; // 0-100
};

/** Themed icon per program (falls back to a generic cap for unknown slugs). */
const PROGRAM_ICONS: Record<string, LucideIcon> = {
  "influencer-blueprint": Rocket,
  "content-that-connects": Heart,
  "monetize-your-influence": DollarSign,
  "scale-and-automate": Zap,
};

export function ProgramsRow({ programs }: { programs: ProgramCard[] }) {
  // Only the first 3 programs surface on the dashboard; the rest live
  // on /programs (via "View all programs").
  const shown = programs.slice(0, 3);

  return (
    <section>
      <header className="flex items-center justify-between mb-[var(--space-grid-gap-sm)]">
        <h2 className="font-display text-[22px] text-ink-900">Your Programs</h2>
        <Link
          href="/programs"
          className="text-[13px] font-medium text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
        >
          View all programs <ArrowRight className="size-4" strokeWidth={2} />
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--space-grid-gap)]">
        {shown.map((p) => (
          <ProgramItem key={p.slug} program={p} />
        ))}
      </div>
    </section>
  );
}

function ProgramItem({ program }: { program: ProgramCard }) {
  const isPro = program.status === "pro_only";
  const Icon = isPro ? Lock : (PROGRAM_ICONS[program.slug] ?? GraduationCap);
  const badge = badgeFor(program.status);
  const progress = Math.min(100, Math.max(0, program.progress ?? 0));

  return (
    <Link
      href={isPro ? "/billing?upgrade=pro" : `/programs/${program.slug}`}
      className="group flex flex-col rounded-[16px] p-5 bg-gradient-to-br from-cream-100 via-white to-rose-50/60 border border-ink-100 hover:border-rose-200 hover:shadow-card transition-all"
    >
      {/* Status badge + themed icon */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className={cn("chip text-[10.5px]", badge.cls)}>{badge.label}</span>
        <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Icon className="size-[18px]" strokeWidth={1.9} />
        </span>
      </div>

      <div className="text-[15px] font-semibold text-ink-900 mb-1 leading-snug">
        {program.title}
      </div>
      <div className="text-[12.5px] text-ink-500 leading-snug mb-4 line-clamp-2 flex-1">
        {program.subtitle}
      </div>

      {isPro ? (
        <div className="h-9 inline-flex items-center justify-center w-full rounded-[10px] bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-semibold">
          Upgrade to Pro
        </div>
      ) : (
        <div className="mt-auto">
          <div className="h-1.5 rounded-full bg-cream-300/70 overflow-hidden mb-1.5">
            <div
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-right text-[11.5px] text-ink-500 font-medium tabular-nums">
            {progress}%
          </div>
        </div>
      )}
    </Link>
  );
}

function badgeFor(status: ProgramCard["status"]): { label: string; cls: string } {
  switch (status) {
    case "pro_only":
      return { label: "PRO ONLY", cls: "chip-rose" };
    case "completed":
      return { label: "COMPLETED", cls: "chip-success" };
    case "in_progress":
      return { label: "IN PROGRESS", cls: "chip-rose" };
    default:
      return { label: "NOT STARTED", cls: "chip-gold" };
  }
}
