"use client";

import { useMemo, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { ProgramCard, type ProgramRow } from "./program-card";

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
      {/* ── Tabs: All / Started / Finished — drive the status filter ── */}
      <div className="border-b border-ink-100 flex items-center gap-1 overflow-x-auto">
        <StatusTabButton
          active={statusTab === "all"}
          onClick={() => setStatusTab("all")}
          label="All programs"
        />
        <StatusTabButton
          active={statusTab === "started"}
          onClick={() => setStatusTab("started")}
          label="Started programs"
        />
        <StatusTabButton
          active={statusTab === "finished"}
          onClick={() => setStatusTab("finished")}
          label="Finished programs"
        />
      </div>

      {/* ── Toolbar: category filter + sort (incl. Recommended) + search ── */}
      <div className="py-3 border-b border-ink-100 flex items-center gap-2.5 flex-wrap">
        <FilterSelect
          value={category}
          onChange={(v) => setCategory(v as Category)}
          options={CATEGORY_OPTIONS}
          ariaLabel="Filter programs by category"
        />
        <FilterSelect
          value={sort}
          onChange={(v) => setSort(v as Sort)}
          options={SORT_OPTIONS}
          ariaLabel="Sort programs"
        />
        <div className="relative w-full sm:w-[240px] lg:w-[260px] sm:ml-auto">
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

/** Status tab — underline-style, matching the app's tab treatment. */
function StatusTabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 px-4 inline-flex items-center text-[13.5px] font-semibold border-b-2 -mb-px whitespace-nowrap transition-colors",
        active
          ? "text-rose-600 border-rose-500"
          : "text-ink-500 hover:text-ink-900 border-transparent",
      )}
    >
      {label}
    </button>
  );
}

/** Tidy native-select dropdown with a chevron — matches the search field. */
function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (next: string) => void;
  options: { value: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="h-10 pl-3.5 pr-9 rounded-[12px] bg-white border border-ink-100 text-[13px] font-medium text-ink-700 appearance-none cursor-pointer hover:border-ink-200 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}
