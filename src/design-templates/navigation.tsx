/* Navigation ────────────────────────────────────────────────────────────
   Wayfinding controls: breadcrumbs, pagination, a horizontal stepper, a
   segmented control, and an open action dropdown. Interactive demos use
   local state, so this whole module is a client component.
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
              className={
                last
                  ? "text-ink-900 font-semibold"
                  : "text-ink-500 hover:text-ink-900 transition-colors"
              }
            >
              {c}
            </a>
            {!last && (
              <ChevronRight className="size-3.5 text-ink-300" strokeWidth={2} />
            )}
          </span>
        );
      })}
    </nav>
  );
}

export function Pagination() {
  const [page, setPage] = useState(3);
  const pages = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Previous page"
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="inline-flex items-center justify-center size-9 rounded-[10px] border border-ink-100 text-ink-500 hover:bg-cream-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft className="size-4" strokeWidth={2} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPage(p)}
          aria-current={p === page ? "page" : undefined}
          className={
            "inline-flex items-center justify-center size-9 rounded-[10px] text-[13.5px] font-medium transition-colors " +
            (p === page
              ? "bg-rose-600 text-white"
              : "text-ink-700 hover:bg-cream-100")
          }
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        onClick={() => setPage((p) => Math.min(5, p + 1))}
        disabled={page === 5}
        className="inline-flex items-center justify-center size-9 rounded-[10px] border border-ink-100 text-ink-500 hover:bg-cream-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
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
                className={
                  "inline-flex items-center justify-center size-8 rounded-full text-[13px] font-semibold " +
                  (done
                    ? "bg-rose-600 text-white"
                    : active
                      ? "bg-rose-100 text-rose-700 ring-2 ring-rose-300"
                      : "bg-cream-200 text-ink-400")
                }
              >
                {done ? <Check className="size-4" strokeWidth={2.5} /> : i + 1}
              </span>
              <span
                className={
                  "text-[11.5px] " +
                  (active ? "text-ink-900 font-semibold" : "text-ink-400")
                }
              >
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={
                  "h-[2px] flex-1 mx-2 mt-4 rounded " +
                  (done ? "bg-rose-600" : "bg-cream-200")
                }
              />
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
          onClick={() => setSel(i)}
          className={
            "h-8 px-4 rounded-[9px] text-[13px] font-medium transition-colors " +
            (i === sel
              ? "bg-white text-ink-900 shadow-sm"
              : "text-ink-500 hover:text-ink-900")
          }
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function DropdownMenu() {
  const [open, setOpen] = useState(true);
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 h-10 px-3 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[13.5px] font-medium transition-colors"
      >
        Actions
        <ChevronDown className="size-4 text-ink-500" strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+6px)] z-10 w-[180px] rounded-[12px] border border-ink-100 bg-white shadow-card py-1"
        >
          <button
            type="button"
            className="flex items-center gap-2.5 w-full h-9 px-3 text-[13px] text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Pencil className="size-4 text-ink-400" strokeWidth={1.9} />
            Edit
          </button>
          <button
            type="button"
            className="flex items-center gap-2.5 w-full h-9 px-3 text-[13px] text-ink-700 hover:bg-cream-100 transition-colors"
          >
            <Copy className="size-4 text-ink-400" strokeWidth={1.9} />
            Duplicate
          </button>
          <div className="my-1 h-px bg-ink-100" />
          <button
            type="button"
            className="flex items-center gap-2.5 w-full h-9 px-3 text-[13px] text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="size-4" strokeWidth={1.9} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
