/* Loading ────────────────────────────────────────────────────────────────
   Loading & busy states — a spinner, the full brand loader, busy buttons,
   and a content skeleton. Each announces its status to assistive tech while
   the visual placeholder animates with pure CSS.
   ───────────────────────────────────────────────────────────────────── */

import { LoaderCircle, Sparkles } from "lucide-react";

export function Spinner() {
  return (
    <div role="status" className="flex flex-col items-center gap-3">
      <span aria-hidden className="size-10 rounded-full border-[3px] border-rose-100 border-t-rose-500 animate-spin" />
      <span className="text-[12.5px] text-ink-500">Loading…</span>
    </div>
  );
}

export function BrandLoader() {
  return (
    <div role="status" className="flex flex-col items-center gap-5 p-6">
      <div className="relative size-[72px] flex items-center justify-center">
        <span aria-hidden className="absolute inset-0 rounded-full border-2 border-rose-100" />
        <span aria-hidden className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 border-r-rose-400/60 animate-spin" />
        <span className="size-10 rounded-[12px] bg-rose-600 text-white flex items-center justify-center">
          <Sparkles className="size-5" strokeWidth={2} />
        </span>
      </div>
      <div className="text-center">
        <div className="text-h5 text-ink-900">Creator Growth OS</div>
        <div className="text-[12px] text-ink-500 mt-0.5">Preparing your workspace…</div>
      </div>
      <div aria-hidden className="w-44 h-[3px] rounded-full bg-rose-100 overflow-hidden">
        <div className="h-full w-1/2 bg-rose-500 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export function LoadingButton() {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled
        aria-busy="true"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 text-white text-[13.5px] font-medium opacity-80 cursor-wait select-none"
      >
        <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
        Saving…
      </button>
      <button
        type="button"
        disabled
        aria-busy="true"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-ink-500 text-[13.5px] font-medium cursor-wait select-none"
      >
        <LoaderCircle className="size-4 animate-spin" strokeWidth={2} />
        Loading
      </button>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div role="status" aria-label="Loading content" className="card p-5 w-[320px] max-w-full">
      <div aria-hidden className="flex items-center gap-3 mb-4">
        <div className="size-12 rounded-full bg-cream-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded bg-cream-200 animate-pulse w-2/3" />
          <div className="h-2.5 rounded bg-cream-200/70 animate-pulse w-2/5" />
        </div>
      </div>
      <div aria-hidden className="space-y-2">
        <div className="h-3 rounded bg-cream-200 animate-pulse" />
        <div className="h-3 rounded bg-cream-200 animate-pulse w-5/6" />
        <div className="h-3 rounded bg-cream-200 animate-pulse w-3/4" />
      </div>
      <div aria-hidden className="h-9 rounded-[10px] bg-cream-200 animate-pulse mt-4 w-32" />
    </div>
  );
}
