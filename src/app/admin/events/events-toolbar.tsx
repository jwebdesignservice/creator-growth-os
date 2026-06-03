"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { Filter, ChevronDown, Check } from "lucide-react";
import { EVENT_KINDS } from "@/lib/community/event-kinds";
import { cn } from "@/lib/cn";

/**
 * Top-of-page toolbar for /admin/events — same look + URL-driven behaviour as
 * the Programs toolbar. Filter (event type) / Sort / Status (upcoming · past).
 */
export function EventsToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `?${qs}` : "?"));
  }

  const currentSort = params.get("sort") ?? "soonest";
  const currentStatus = params.get("status") ?? "upcoming";
  const currentKind = params.get("kind") ?? "";
  const filterCount = currentKind ? 1 : 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Filter — popover with event-type options */}
      <Popover
        trigger={(open) => (
          <ToolbarButton open={open} badge={filterCount || undefined}>
            <Filter className="size-3.5 text-ink-500" strokeWidth={2} />
            Filter
          </ToolbarButton>
        )}
      >
        {(close) => (
          <FilterPopoverContent
            currentKind={currentKind}
            onPick={(kind) => {
              setParam("kind", kind);
              close();
            }}
            onClear={() => {
              setParam("kind", "");
              close();
            }}
          />
        )}
      </Popover>

      {/* Sort */}
      <DropdownSelect
        value={currentSort}
        onChange={(v) => setParam("sort", v === "soonest" ? "" : v)}
        options={[
          { value: "soonest", label: "Sort: Soonest" },
          { value: "latest", label: "Sort: Latest" },
        ]}
      />

      {/* Status */}
      <DropdownSelect
        value={currentStatus}
        onChange={(v) => setParam("status", v === "upcoming" ? "" : v)}
        options={[
          { value: "upcoming", label: "Upcoming", dot: "bg-success" },
          { value: "past", label: "Past", dot: "bg-ink-400" },
          { value: "all", label: "All events", dot: "bg-rose-500" },
        ]}
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */

function Popover({
  trigger,
  children,
}: {
  trigger: (open: boolean) => ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="contents"
      >
        {trigger(open)}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+6px)] z-30 min-w-[220px] rounded-[14px] bg-white border border-ink-100 shadow-card p-2"
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  open,
  badge,
  children,
}: {
  open: boolean;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] border bg-white text-[13.5px] font-medium text-ink-700 cursor-pointer transition-colors",
        open
          ? "border-rose-300 bg-cream-100"
          : "border-ink-200 hover:bg-cream-100",
      )}
    >
      {children}
      {badge !== undefined && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10.5px] font-bold tabular-nums">
          {badge}
        </span>
      )}
    </span>
  );
}

function FilterPopoverContent({
  currentKind,
  onPick,
  onClear,
}: {
  currentKind: string;
  onPick: (kind: string) => void;
  onClear: () => void;
}) {
  const options = [{ value: "", label: "All types" }, ...EVENT_KINDS];
  return (
    <div className="min-w-[200px]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 px-2 pt-1 pb-1.5">
        Event type
      </div>
      <ul role="none">
        {options.map((o) => (
          <li key={o.value || "all"} role="none">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={currentKind === o.value}
              onClick={() => onPick(o.value)}
              className={cn(
                "w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[13px] cursor-pointer",
                currentKind === o.value
                  ? "bg-rose-50 text-rose-700 font-semibold"
                  : "text-ink-700 hover:bg-cream-100",
              )}
            >
              <span
                className={cn(
                  "size-4 rounded-full inline-flex items-center justify-center border",
                  currentKind === o.value
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-ink-300 bg-white",
                )}
                aria-hidden
              >
                {currentKind === o.value && (
                  <Check className="size-3" strokeWidth={3} />
                )}
              </span>
              {o.label}
            </button>
          </li>
        ))}
      </ul>
      <div aria-hidden className="h-px my-1.5 bg-ink-100" />
      <button
        type="button"
        onClick={onClear}
        className="w-full text-left px-2.5 py-2 rounded-[8px] text-[12.5px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 cursor-pointer"
      >
        Clear filter
      </button>
    </div>
  );
}

function DropdownSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string; dot?: string }[];
}) {
  const current = options.find((o) => o.value === value);
  return (
    <div className="relative">
      {current?.dot && (
        <span
          aria-hidden
          className={cn(
            "absolute left-3.5 top-1/2 -translate-y-1/2 size-2 rounded-full",
            current.dot,
          )}
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none h-11 pr-9 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-medium text-ink-700 cursor-pointer hover:bg-cream-100 focus:outline-none focus:border-rose-400 transition-colors",
          current?.dot ? "pl-8" : "pl-4",
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}
