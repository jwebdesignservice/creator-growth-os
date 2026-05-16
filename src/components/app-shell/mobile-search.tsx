"use client";

import { Search } from "lucide-react";

/**
 * Mobile search field — rendered under the topbar on screens below `lg`.
 * Hidden on desktop where the topbar already hosts an inline search.
 */
export function MobileSearch() {
  return (
    <div
      className="lg:hidden bg-cream-100"
      style={{ padding: "0.75rem var(--mobile-content-x) 0.5rem" }}
    >
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-ink-400"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search programs, tutorials, topics..."
          aria-label="Search"
          className="w-full h-12 pl-11 pr-4 rounded-full bg-white border border-ink-100 placeholder:text-ink-400 text-[14px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
        />
      </div>
    </div>
  );
}
