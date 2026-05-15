"use client";

import { useMemo, useState } from "react";
import { CategoryTabs, type Filter } from "./category-tabs";
import { ProgramCard, type ProgramRow } from "./program-card";

type Props = {
  programs: ProgramRow[];
};

/**
 * Top-level client wrapper around the category filter + program grid.
 * `program.category_label` strings map straight to the filter keys.
 */
export function ProgramsGrid({ programs }: Props) {
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    if (filter === "all") return programs;
    if (filter === "pro")
      return programs.filter((p) => p.status === "pro_only");
    return programs.filter((p) =>
      (p.category_label ?? "").toLowerCase().startsWith(filter),
    );
  }, [programs, filter]);

  return (
    <div className="space-y-5">
      <CategoryTabs value={filter} onChange={setFilter} />
      {visible.length === 0 ? (
        <div className="card p-10 text-center text-ink-500 text-[14px]">
          No programs in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <ProgramCard key={p.slug} program={p} />
          ))}
        </div>
      )}
    </div>
  );
}
