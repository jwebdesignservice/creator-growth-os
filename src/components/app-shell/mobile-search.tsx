"use client";

import { Search } from "lucide-react";
import { openCommandPalette } from "./command-palette";

/**
 * Mobile search trigger — rendered under the topbar on screens below `lg`.
 * Hidden on desktop where the topbar already hosts the inline search.
 *
 * Visually it's a pill-shaped field with a search icon and placeholder, but
 * it's actually a button: tapping it opens the global command palette (see
 * `command-palette.tsx`) so mobile and desktop share the exact same search
 * surface — same filter chips, same results, same keyboard hints.
 */
export function MobileSearch() {
  return (
    <div
      className="lg:hidden bg-cream-100"
      style={{ padding: "0.75rem var(--mobile-content-x) 0.5rem" }}
    >
      <button
        type="button"
        onClick={openCommandPalette}
        aria-label="Open search"
        aria-haspopup="dialog"
        className="group relative w-full h-12 pl-11 pr-4 rounded-full bg-white border border-ink-100 text-left text-[14px] text-ink-400 hover:border-ink-200 active:bg-cream-100 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors flex items-center"
      >
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 size-[18px] text-ink-400 group-hover:text-ink-500 transition-colors"
          strokeWidth={2}
          aria-hidden
        />
        <span className="flex-1 truncate">Search programs, tutorials, pages…</span>
      </button>
    </div>
  );
}
