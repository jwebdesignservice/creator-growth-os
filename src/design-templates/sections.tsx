/* Sections ──────────────────────────────────────────────────────────────
   The page chrome every screen is built from: a page header (title +
   subtitle + action), a section card (header + trailing link + body list),
   and a filter / toolbar row. These set the spacing and hierarchy rhythm
   the rest of the platform follows.
   ───────────────────────────────────────────────────────────────────── */

import {
  Plus,
  ArrowUpRight,
  Search,
  ChevronDown,
  RotateCcw,
  CircleCheckBig,
  UserPlus,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/cn";

const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50";

export function PageHeader() {
  return (
    <header className="w-[640px] max-w-full flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-page-title text-ink-900">Performance</h1>
        <p className="mt-1 text-[13.5px] text-ink-500">
          Track your growth across every connected platform.
        </p>
      </div>
      <button
        type="button"
        className={cn(
          "shrink-0 inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[13.5px] font-medium shadow-sm cursor-pointer transition-colors",
          FOCUS,
        )}
      >
        <Plus className="size-4" strokeWidth={2.2} />
        Connect platform
      </button>
    </header>
  );
}

export function SectionCard() {
  const rows = [
    { icon: UserPlus, text: "Amelia Park joined Creator Launchpad", time: "2m" },
    { icon: CircleCheckBig, text: "Marcus completed Module 3", time: "1h" },
    { icon: Upload, text: "New tutorial published — Hook writing", time: "3h" },
  ];
  return (
    <section className="card p-5 w-[420px]">
      <header className="flex items-center justify-between mb-4">
        <h3 className="text-h5 text-ink-900">Recent activity</h3>
        <a
          href="#"
          className={cn("inline-flex items-center gap-1 text-[12.5px] text-rose-600 font-medium hover:text-rose-700 rounded-[6px] px-0.5", FOCUS)}
        >
          View all
          <ArrowUpRight className="size-3.5" strokeWidth={2} />
        </a>
      </header>
      <ul className="-mx-2">
        {rows.map((r, i) => {
          const Icon = r.icon;
          return (
            <li key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-[10px] hover:bg-cream-50 transition-colors">
              <span className="size-9 rounded-full bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
                <Icon className="size-4" strokeWidth={1.9} />
              </span>
              <span className="text-[13px] text-ink-700 leading-snug flex-1">
                {r.text}
              </span>
              <span className="text-[11.5px] text-ink-400 tabular-nums shrink-0">
                {r.time}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function FilterBar() {
  return (
    <section className="card p-3 w-[720px] max-w-full flex flex-wrap items-end gap-x-4 gap-y-3">
      {/* Primary search */}
      <div className="relative flex-[2] min-w-[240px]">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
          strokeWidth={1.9}
        />
        <input
          type="search"
          readOnly
          placeholder="Search members…"
          className="w-full h-11 pl-10 pr-3 rounded-[10px] bg-white border border-ink-200 text-[13.5px] text-ink-700 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
        />
      </div>

      {/* Secondary selects */}
      <div className="flex flex-wrap items-end gap-2 flex-1 min-w-[260px]">
        {[
          { label: "Status", value: "All" },
          { label: "Plan", value: "Pro" },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-1 flex-1 min-w-[120px]">
            <span className="text-[10px] uppercase tracking-[0.06em] font-semibold text-ink-400">
              {f.label}
            </span>
            <div className="relative">
              <select
                defaultValue={f.value}
                aria-label={f.label}
                className="appearance-none w-full h-10 pl-3 pr-8 rounded-[10px] bg-cream-100 border border-ink-200 text-[12.5px] text-ink-900 font-medium cursor-pointer focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
              >
                <option>{f.value}</option>
                <option>Other</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-ink-400"
                strokeWidth={2}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Reset */}
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 h-10 px-3 rounded-[10px] text-[12.5px] font-medium text-ink-500 hover:text-ink-900 hover:bg-cream-100 cursor-pointer transition-colors self-end",
          FOCUS,
        )}
      >
        <RotateCcw className="size-3.5" strokeWidth={1.9} />
        Reset
      </button>
    </section>
  );
}
