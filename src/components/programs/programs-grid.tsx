"use client";

import { useMemo, useState } from "react";
import { Search, X, LayoutGrid, PlayCircle, CheckCircle2 } from "lucide-react";
import { ProgramCard, type ProgramRow } from "./program-card";
import { FilterDropdown } from "@/components/ui/filter-dropdown";

type StatusTab = "all" | "started" | "finished";
type Category = "all" | "starter" | "growth" | "monetization" | "scale" | "pro";
type Sort = "recommended" | "name" | "progress";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "all", label: "All categories" },
  { value: "starter", label: "Starter Creator" },
  { value: "growth", label: "Growth Creator" },
  { value: "monetization", label: "Monetization Creator" },
  { value: "scale", label: "Scale Creator" },
  { value: "pro", label: "Pro only" },
];

const SORT_OPTIONS: { value: Sort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "name", label: "Name (A–Z)" },
  { value: "progress", label: "Progress" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All programs", icon: LayoutGrid },
  { value: "started", label: "Started", icon: PlayCircle },
  { value: "finished", label: "Finished", icon: CheckCircle2 },
];

type Props = {
  programs: ProgramRow[];
};

/**
 * Filter + sort bar for the Programs library — tidy dropdowns (category +
 * sort) plus a free-text search, all client-side. The parent owns the full
 * list so cards re-render without remounting.
 */
export function ProgramsGrid({ programs }: Props) {
  const [statusTab, setStatusTab] = useState<StatusTab>("all");
  const [category, setCategory] = useState<Category>("all");
  const [sort, setSort] = useState<Sort>("recommended");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 0) Status tab — All / Started (in progress) / Finished (completed)
    let list = programs;
    if (statusTab === "started") {
      list = list.filter((p) => p.status === "in_progress");
    } else if (statusTab === "finished") {
      list = list.filter((p) => p.status === "completed");
    }

    // 1) Category filter
    if (category === "pro") {
      list = list.filter((p) => p.status === "pro_only");
    } else if (category !== "all") {
      list = list.filter((p) =>
        (p.category_label ?? "").toLowerCase().startsWith(category),
      );
    }

    // 2) Free-text search across title / description / category
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.category_label ?? "").toLowerCase().includes(q),
      );
    }

    // 3) Sort (Recommended keeps the curated server order)
    if (sort === "name") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "progress") {
      list = [...list].sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0));
    }

    return list;
  }, [programs, statusTab, category, sort, query]);

  const trimmed = query.trim();

  return (
    <div>
      {/* ── Header — title + count/sort (left) · status & category dropdowns
          + search (right), divided by a full-width line. ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap min-h-[63px] border-b border-ink-100 lg:-mt-[var(--space-page-y)] lg:-mx-[var(--space-page-x)] lg:px-[var(--space-page-x)]">
        <div className="flex items-baseline gap-3 min-w-0 flex-wrap">
          <h2 className="text-h4 sm:text-[22px] text-ink-900">Programs</h2>
          <span className="text-[12.5px] text-ink-500 whitespace-nowrap">
            {visible.length} {visible.length === 1 ? "program" : "programs"} ·{" "}
            <button
              type="button"
              onClick={() =>
                setSort((s) =>
                  s === "recommended"
                    ? "name"
                    : s === "name"
                      ? "progress"
                      : "recommended",
                )
              }
              className="text-ink-700 hover:text-rose-600 underline-offset-4 hover:underline cursor-pointer"
            >
              Sort: {SORT_OPTIONS.find((o) => o.value === sort)?.label}
            </button>
          </span>
        </div>

        <div className="flex items-center justify-end gap-2.5 flex-wrap">
          <FilterDropdown
            ariaLabel="Filter programs by status"
            value={statusTab}
            onChange={(v) => setStatusTab(v as StatusTab)}
            options={STATUS_OPTIONS}
          />
          <FilterDropdown
            ariaLabel="Filter programs by category"
            value={category}
            onChange={(v) => setCategory(v as Category)}
            options={CATEGORY_OPTIONS}
            width={210}
          />
          <div className="relative w-[170px] sm:w-[240px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
              strokeWidth={2}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search programs…"
              aria-label="Search programs"
              className="w-full h-10 pl-9 pr-9 rounded-[12px] bg-white border border-ink-100 text-[13px] text-ink-900 placeholder:text-ink-400 hover:border-ink-200 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
            />
            {trimmed && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 transition-colors"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main wrapper: the program cards (card design unchanged) ── */}
      <div className="pt-5">
        {visible.length === 0 ? (
          <div className="card p-10 text-center text-ink-500 text-[14px]">
            {trimmed
              ? `No programs match “${trimmed}”.`
              : "No programs in this view yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visible.map((p) => (
              <ProgramCard key={p.slug} program={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

