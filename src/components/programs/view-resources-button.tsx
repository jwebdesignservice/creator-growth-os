"use client";

import { Folder } from "lucide-react";
import { openProgramDetailTab } from "./detail-tabs";

/**
 * Hero "View Resources" CTA. The program hero is server-rendered, so this
 * small client component bridges the click to the (client) DetailTabs, asking
 * it to switch to the Resources tab and scroll it into view. Previously this
 * was a plain <button> with no handler — a dead button.
 */
export function ViewResourcesButton() {
  return (
    <button
      type="button"
      onClick={() => openProgramDetailTab("resources")}
      className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-[14px] bg-white border border-ink-200 text-ink-900 text-[14px] font-medium hover:bg-cream-100 transition-colors cursor-pointer"
    >
      <Folder className="size-4" strokeWidth={2} />
      View Resources
    </button>
  );
}
