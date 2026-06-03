/* Admin ─────────────────────────────────────────────────────────────────
   Admin-console surfaces: the metric stat tile, the "Continue where you
   left off" active-build project card, and the labelled horizontal
   breakdown bars (Users by category / plan). Pure presentational mirrors
   of src/components/admin/* and src/app/admin/page.tsx.
   ───────────────────────────────────────────────────────────────────── */

import {
  Users,
  GraduationCap,
  DollarSign,
  Layers,
  PlayCircle,
  CheckSquare,
  UserRound,
  Clock,
  ArrowRight,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Admin stat tile — uppercase label, big stat, delta, right-aligned icon tile.
// ─────────────────────────────────────────────────────────────────────────────

function StatTile({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  tone: string;
}) {
  return (
    <div className="card p-5 w-[210px]">
      <div className="flex items-start justify-between">
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
          {label}
        </span>
        <span className={cn("size-9 rounded-[10px] inline-flex items-center justify-center shrink-0", tone)}>
          <Icon className="size-[18px]" strokeWidth={2} />
        </span>
      </div>
      <div className="text-[28px] font-bold text-ink-900 tabular-nums leading-tight mt-2">{value}</div>
      {delta && (
        <div className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 mt-0.5">
          <TrendingUp className="size-3.5" strokeWidth={2.4} /> {delta}
        </div>
      )}
    </div>
  );
}

export function AdminStatTiles() {
  return (
    <div className="flex flex-wrap gap-4">
      <StatTile icon={Users} label="Total members" value="1,284" delta="+8.2%" tone="bg-rose-100 text-rose-600" />
      <StatTile icon={GraduationCap} label="Active programs" value="12" tone="bg-violet-100 text-violet-600" />
      <StatTile icon={DollarSign} label="MRR" value="$8,940" delta="+3.1%" tone="bg-emerald-100 text-emerald-600" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Active build card — "Continue where you left off" project card.
// ─────────────────────────────────────────────────────────────────────────────

export function ActiveBuildCard() {
  return (
    <article className="card overflow-hidden w-[360px] max-w-full flex flex-col">
      <div className="p-5 flex items-start gap-4">
        <span className="size-16 rounded-[14px] bg-gradient-to-br from-rose-100 to-cream-200 inline-flex items-center justify-center text-[9px] font-bold uppercase tracking-wide text-rose-600 text-center leading-tight px-1 shrink-0">
          Start Here
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-bold text-ink-900 leading-snug">Start Here: Platform Introduction</h3>
          <p className="text-[12.5px] text-ink-500 leading-snug mt-1 line-clamp-2">
            Your first guided mission — a quick tour of how Creator Growth OS works.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600">
              <span className="size-1.5 rounded-full bg-rose-500" /> In Progress
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
              <GraduationCap className="size-3 text-ink-400" strokeWidth={2} /> Program
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[12px] font-semibold text-ink-700">80% complete</span>
        </div>
        <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
          <div className="h-full bg-rose-500 rounded-full" style={{ width: "80%" }} />
        </div>
      </div>

      {/* Meta */}
      <div className="px-5 py-3.5 flex items-center gap-4 text-[12px] text-ink-500">
        <span className="inline-flex items-center gap-1.5"><Layers className="size-3.5 text-ink-400" strokeWidth={2} /> 2 Modules</span>
        <span className="inline-flex items-center gap-1.5"><PlayCircle className="size-3.5 text-ink-400" strokeWidth={2} /> 6 Lessons</span>
        <span className="inline-flex items-center gap-1.5"><CheckSquare className="size-3.5 text-ink-400" strokeWidth={2} /> 6 Tasks</span>
      </div>

      {/* Footer */}
      <div className="border-t border-ink-100 px-5 py-3 flex items-center gap-4 bg-cream-50/40">
        <div className="flex items-center gap-2 min-w-0">
          <UserRound className="size-[15px] text-ink-400 shrink-0" strokeWidth={2} />
          <div className="min-w-0">
            <div className="text-[10px] text-ink-400 uppercase tracking-wider leading-tight">Access tier</div>
            <div className="text-[12px] font-semibold text-ink-900 truncate">Free …</div>
          </div>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Clock className="size-[15px] text-ink-400 shrink-0" strokeWidth={2} />
          <div className="min-w-0">
            <div className="text-[10px] text-ink-400 uppercase tracking-wider leading-tight">Last edited</div>
            <div className="text-[12px] font-semibold text-ink-900 truncate">4d ago</div>
          </div>
        </div>
        <span className="ml-auto inline-flex items-center justify-center size-9 rounded-[10px] bg-rose-600 text-white shrink-0">
          <ArrowRight className="size-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Breakdown bars — labelled horizontal bars with count + percent (Users by X).
// ─────────────────────────────────────────────────────────────────────────────

export function UsersBreakdown() {
  const rows = [
    { label: "Starter Creator", count: 2, pct: 33 },
    { label: "Growth Creator", count: 4, pct: 67 },
    { label: "Monetization Creator", count: 0, pct: 0 },
    { label: "Scale Creator", count: 0, pct: 0 },
  ];
  return (
    <div className="card p-6 w-[420px] max-w-full">
      <h3 className="text-h4 text-ink-900 mb-5">Users by Category</h3>
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[13px] font-medium text-ink-800">{r.label}</span>
              <span className="text-[12.5px] text-ink-500 tabular-nums">
                <span className="font-bold text-ink-900">{r.count}</span> ({r.pct}%)
              </span>
            </div>
            <div className="h-2 rounded-full bg-cream-200 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${r.pct}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
