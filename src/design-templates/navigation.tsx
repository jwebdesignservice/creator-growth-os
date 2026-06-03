/* Navigation ────────────────────────────────────────────────────────────
   Wayfinding controls: breadcrumbs, pagination (with truncation), a
   horizontal stepper, a segmented control, and an open action dropdown.
   Every interactive control shares the same keyboard-focus ring.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Pencil,
  Copy,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/cn";

const FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-1 focus-visible:ring-offset-cream-50";

export function Breadcrumbs() {
  const crumbs = ["Admin", "Programs", "Creator Launchpad"];
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c} className="flex items-center gap-1.5">
            <a
              href="#"
              aria-current={last ? "page" : undefined}
              className={cn(
                "rounded-[6px] px-0.5 transition-colors",
                FOCUS,
                last ? "text-ink-900 font-semibold" : "text-ink-500 hover:text-ink-900",
              )}
            >
              {c}
            </a>
            {!last && <ChevronRight className="size-3.5 text-ink-300" strokeWidth={2} />}
          </span>
        );
      })}
    </nav>
  );
}

export function Pagination() {
  const [page, setPage] = useState(3);
  // Demonstrates truncation: first pages, an ellipsis, then the last page.
  const items: (number | "…")[] = [1, 2, 3, 4, 5, "…", 10];
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className={cn(
          "inline-flex items-center justify-center size-9 rounded-[10px] border border-ink-200 text-ink-500 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer transition-colors",
          FOCUS,
        )}
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </button>
      {items.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="inline-flex items-center justify-center size-9 text-ink-300 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => setPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex items-center justify-center size-9 rounded-[10px] text-[13.5px] font-medium cursor-pointer transition-colors tabular-nums",
              FOCUS,
              p === page ? "bg-rose-600 text-white" : "text-ink-700 hover:bg-cream-100",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        onClick={() => setPage((p) => Math.min(10, p + 1))}
        disabled={page === 10}
        className={cn(
          "inline-flex items-center justify-center size-9 rounded-[10px] border border-ink-200 text-ink-500 hover:bg-cream-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer transition-colors",
          FOCUS,
        )}
      >
        <ChevronRight className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export function Stepper() {
  const steps = ["Account", "Profile", "Connect", "Done"];
  const current = 1;
  return (
    <div className="flex items-start w-[460px] max-w-full">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "inline-flex items-center justify-center size-8 rounded-full text-[13px] font-semibold",
                  done
                    ? "bg-rose-600 text-white"
                    : active
                      ? "bg-rose-100 text-rose-700 ring-2 ring-rose-300"
                      : "bg-cream-200 text-ink-400",
                )}
              >
                {done ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
              </span>
              <span className={cn("text-[11.5px]", active ? "text-ink-900 font-semibold" : "text-ink-400")}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-[2px] flex-1 mx-2 mt-4 rounded", done ? "bg-rose-600" : "bg-cream-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function SegmentedControl() {
  const opts = ["Day", "Week", "Month"];
  const [sel, setSel] = useState(1);
  return (
    <div className="inline-flex items-center p-1 rounded-[12px] bg-cream-200">
      {opts.map((o, i) => (
        <button
          key={o}
          type="button"
          aria-pressed={i === sel}
          onClick={() => setSel(i)}
          className={cn(
            "h-8 px-4 rounded-[9px] text-[13px] font-medium cursor-pointer transition-colors",
            FOCUS,
            i === sel ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-900",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function DropdownMenu() {
  const [open, setOpen] = useState(true);
  const item =
    "flex items-center gap-2.5 w-full h-9 px-3 text-[13px] cursor-pointer transition-colors focus:outline-none";
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 h-10 px-3.5 rounded-[10px] bg-white border border-ink-200 hover:bg-cream-100 active:bg-cream-200 text-ink-900 text-[13.5px] font-medium cursor-pointer transition-colors",
          FOCUS,
        )}
      >
        Actions
        <ChevronDown className={cn("size-4 text-ink-500 transition-transform", open && "rotate-180")} strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+6px)] z-10 w-[184px] rounded-[12px] border border-ink-100 bg-white shadow-card py-1"
        >
          <button type="button" role="menuitem" className={cn(item, "text-ink-700 hover:bg-cream-100 focus-visible:bg-cream-100")}>
            <Pencil className="size-4 text-ink-400" strokeWidth={1.9} />
            Edit
          </button>
          <button type="button" role="menuitem" className={cn(item, "text-ink-700 hover:bg-cream-100 focus-visible:bg-cream-100")}>
            <Copy className="size-4 text-ink-400" strokeWidth={1.9} />
            Duplicate
          </button>
          <div className="my-1 h-px bg-ink-100" />
          <button type="button" role="menuitem" className={cn(item, "text-rose-700 hover:bg-rose-50 focus-visible:bg-rose-50")}>
            <Trash2 className="size-4" strokeWidth={1.9} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
