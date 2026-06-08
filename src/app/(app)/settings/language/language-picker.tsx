"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { LOCALES, getStrings } from "./i18n";

// ─────────────────────────────────────────────────────────────────────────────
// Flags — compact, hand-drawn SVGs (24×24, cropped into a circle). Simplified
// but recognizable: stripes, Nordic crosses, and lightly-stylised US/UK.
// ─────────────────────────────────────────────────────────────────────────────

const FLAGS: Record<string, ReactNode> = {
  us: (
    <>
      <rect width="24" height="24" fill="#B22234" />
      {[1, 3, 5, 7, 9, 11].map((i) => (
        <rect key={i} y={1.846 * i} width="24" height="1.846" fill="#fff" />
      ))}
      <rect width="11" height="12.92" fill="#3C3B6E" />
      <g fill="#fff">
        {[2.4, 7, 11.6].map((y) =>
          [2.2, 5, 7.8].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.7" />),
        )}
        {[4.7, 9.3].map((y) =>
          [3.6, 6.4].map((x) => <circle key={`${x}-${y}b`} cx={x} cy={y} r="0.7" />),
        )}
      </g>
    </>
  ),
  gb: (
    <>
      <rect width="24" height="24" fill="#012169" />
      <path d="M0 0 L24 24 M24 0 L0 24" stroke="#fff" strokeWidth="4" />
      <path d="M0 0 L24 24 M24 0 L0 24" stroke="#C8102E" strokeWidth="1.6" />
      <rect x="9" width="6" height="24" fill="#fff" />
      <rect y="9" width="24" height="6" fill="#fff" />
      <rect x="10" width="4" height="24" fill="#C8102E" />
      <rect y="10" width="24" height="4" fill="#C8102E" />
    </>
  ),
  de: (
    <>
      <rect width="24" height="8" fill="#000" />
      <rect y="8" width="24" height="8" fill="#DD0000" />
      <rect y="16" width="24" height="8" fill="#FFCE00" />
    </>
  ),
  no: (
    <>
      <rect width="24" height="24" fill="#EF2B2D" />
      <rect x="6" width="6" height="24" fill="#fff" />
      <rect y="9" width="24" height="6" fill="#fff" />
      <rect x="7.5" width="3" height="24" fill="#002868" />
      <rect y="10.5" width="24" height="3" fill="#002868" />
    </>
  ),
  se: (
    <>
      <rect width="24" height="24" fill="#006AA7" />
      <rect x="7" width="4" height="24" fill="#FECC00" />
      <rect y="10" width="24" height="4" fill="#FECC00" />
    </>
  ),
  dk: (
    <>
      <rect width="24" height="24" fill="#C8102E" />
      <rect x="7" width="4" height="24" fill="#fff" />
      <rect y="10" width="24" height="4" fill="#fff" />
    </>
  ),
};

function CircleFlag({ cc, className }: { cc: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-ink-900/10",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-full" aria-hidden>
        {FLAGS[cc] ?? <rect width="24" height="24" fill="#cbd5e1" />}
      </svg>
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Picker — a searchable flag popover. Ready locales are selectable; the rest
// render disabled with an "Under development" badge. UI copy follows the
// currently-selected language.
// ─────────────────────────────────────────────────────────────────────────────

export function LanguagePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const s = getStrings(value);
  const selected = LOCALES.find((l) => l.value === value) ?? LOCALES[0];

  const q = query.trim().toLowerCase();
  const filtered = q
    ? LOCALES.filter(
        (l) =>
          l.country.toLowerCase().includes(q) ||
          l.code.toLowerCase().includes(q) ||
          l.value.toLowerCase().includes(q),
      )
    : LOCALES;

  // Dismiss on outside-click / Escape. setState fires from event handlers (not
  // the effect body), so the react-hooks/set-state-in-effect rule is satisfied.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Focus the search field when the panel opens (no setState → lint-clean).
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1.5 block text-[13px] font-semibold text-ink-900">
        {s.languageLabel}
      </label>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-[12px] border bg-white pl-3.5 pr-3 text-left transition-colors",
          open
            ? "border-rose-400 ring-2 ring-rose-200"
            : "border-ink-200 hover:border-ink-300",
        )}
      >
        <CircleFlag cc={selected.cc} className="size-6" />
        <span className="min-w-0 flex-1 truncate text-[14px] text-ink-900">
          {selected.country}
          <span className="text-ink-400"> ({selected.code})</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-ink-500 transition-transform",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-30 mt-2 rounded-[14px] border border-ink-100 bg-white p-1.5 shadow-[0_16px_40px_-12px_rgba(26,24,22,0.25)]">
          <div className="relative p-1.5">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
              strokeWidth={2}
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={s.searchPlaceholder}
              className="h-10 w-full rounded-[10px] border border-ink-100 bg-cream-50 pl-10 pr-3 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-100"
            />
          </div>

          <ul role="listbox" className="max-h-64 overflow-y-auto p-0.5">
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-[13px] text-ink-400">
                {s.noMatches}
              </li>
            ) : (
              filtered.map((l) => {
                // Not-ready locales: shown, but disabled with a dev badge.
                if (!l.ready) {
                  return (
                    <li key={l.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={false}
                        aria-disabled
                        disabled
                        className="flex w-full cursor-not-allowed items-center gap-3 rounded-[10px] px-2.5 py-2 text-left opacity-70"
                      >
                        <CircleFlag cc={l.cc} className="size-6 grayscale" />
                        <span className="min-w-0 flex-1 truncate text-[14px] text-ink-400">
                          {l.country}
                          <span className="text-ink-300"> ({l.code})</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          {s.underDevelopment}
                        </span>
                      </button>
                    </li>
                  );
                }

                const active = l.value === value;
                return (
                  <li key={l.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => pick(l.value)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2 text-left transition-colors",
                        active ? "bg-rose-50" : "hover:bg-cream-100",
                      )}
                    >
                      <CircleFlag cc={l.cc} className="size-6" />
                      <span className="min-w-0 flex-1 truncate text-[14px] text-ink-900">
                        {l.country}
                        <span className="text-ink-400"> ({l.code})</span>
                      </span>
                      {active && (
                        <Check className="size-4 shrink-0 text-rose-600" strokeWidth={2.5} />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
