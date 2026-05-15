import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/cn";

export type ProgramCard = {
  slug: string;
  title: string;
  subtitle: string;
  status: "in_progress" | "not_started" | "pro_only";
  progress?: number; // 0-100
};

export function ProgramsRow({ programs }: { programs: ProgramCard[] }) {
  return (
    <section>
      <header className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[22px] text-ink-900">Your Programs</h2>
        <Link
          href="/programs"
          className="text-[13px] font-medium text-rose-600 hover:text-rose-700 inline-flex items-center gap-0.5"
        >
          View all <ChevronRight className="size-4" strokeWidth={2} />
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {programs.map((p) => (
          <ProgramItem key={p.slug} program={p} />
        ))}
      </div>
    </section>
  );
}

function ProgramItem({ program }: { program: ProgramCard }) {
  const isPro = program.status === "pro_only";
  return (
    <Link
      href={isPro ? "/billing?upgrade=pro" : `/programs/${program.slug}`}
      className="card overflow-hidden hover:shadow-card transition-shadow group"
    >
      {/* Cover */}
      <div
        className={cn(
          "h-[120px] relative overflow-hidden",
          isPro ? "bg-rose-100" : "bg-cream-200",
        )}
      >
        {/* Soft gradient ornament */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100/40 via-cream-200 to-rose-200/40" />
        <span
          className={cn(
            "absolute top-3 left-3 chip text-[10.5px]",
            isPro ? "chip-rose" : program.status === "in_progress" ? "chip-rose" : "chip-gold",
          )}
        >
          {isPro
            ? "PRO ONLY"
            : program.status === "in_progress"
              ? "IN PROGRESS"
              : "NOT STARTED"}
        </span>
        {isPro && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-12 rounded-full bg-white/80 backdrop-blur flex items-center justify-center">
              <Lock className="size-5 text-rose-600" strokeWidth={2} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-[14px] font-semibold text-ink-900 mb-1 leading-snug">
          {program.title}
        </div>
        <div className="text-[12px] text-ink-500 leading-snug mb-3 line-clamp-2">
          {program.subtitle}
        </div>

        {isPro ? (
          <div className="h-9 inline-flex items-center justify-center w-full rounded-[10px] bg-rose-50 border border-rose-200 text-rose-700 text-[12px] font-medium">
            Upgrade to Pro
          </div>
        ) : (
          <>
            <div className="h-1.5 rounded-full bg-cream-200 overflow-hidden mb-1.5">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${program.progress ?? 0}%` }}
              />
            </div>
            <div className="text-right text-[11px] text-ink-500 font-medium">
              {program.progress ?? 0}%
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
