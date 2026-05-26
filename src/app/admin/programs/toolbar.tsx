"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  Filter,
  Search,
  ChevronDown,
  LayoutGrid,
  Table2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Top-of-page toolbar for /admin/programs. URL-driven — every interaction
 * mutates `?search/sort/status/plan/view/per/page` and the server re-renders.
 *
 * Popovers (Filter / View) live in this file as small helper components so
 * the whole toolbar surface is one cohesive client island.
 */
export function ProgramsToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(params.get("search") ?? "");

  function pushParams(next: URLSearchParams) {
    // Any toolbar change resets pagination.
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `?${qs}` : "?");
    });
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    pushParams(next);
  }

  function onSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setParam("search", search);
  }

  const currentSort = params.get("sort") ?? "newest";
  const currentStatus = params.get("status") ?? "all";
  const currentPlan = params.get("plan") ?? "";
  const currentView = params.get("view") === "grid" ? "grid" : "table";
  const filterCount = currentPlan ? 1 : 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Filter — popover with plan-access options */}
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
            currentPlan={currentPlan}
            onPick={(plan) => {
              setParam("plan", plan);
              close();
            }}
            onClear={() => {
              setParam("plan", "");
              close();
            }}
          />
        )}
      </Popover>

      {/* Search */}
      <form
        onSubmit={onSearchSubmit}
        className="relative flex-1 min-w-[220px] max-w-md"
      >
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400"
          strokeWidth={2}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search programs..."
          className="w-full h-11 pl-10 pr-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
        />
      </form>

      {/* Sort */}
      <DropdownSelect
        value={currentSort}
        onChange={(v) => setParam("sort", v === "newest" ? "" : v)}
        options={[
          { value: "newest", label: "Sort: Newest" },
          { value: "oldest", label: "Sort: Oldest" },
          { value: "name", label: "Sort: A → Z" },
        ]}
      />

      {/* Status */}
      <DropdownSelect
        value={currentStatus}
        onChange={(v) => setParam("status", v === "all" ? "" : v)}
        options={[
          { value: "all", label: "All statuses", dot: "bg-rose-500" },
          { value: "published", label: "Published", dot: "bg-success" },
          { value: "draft", label: "Draft", dot: "bg-ink-400" },
        ]}
      />

      {/* View — popover toggling Table / Grid */}
      <Popover
        trigger={(open) => (
          <ToolbarButton open={open}>
            {currentView === "grid" ? (
              <LayoutGrid
                className="size-3.5 text-ink-500"
                strokeWidth={2}
              />
            ) : (
              <Table2 className="size-3.5 text-ink-500" strokeWidth={2} />
            )}
            View
            <ChevronDown
              className="size-3.5 text-ink-400 -ml-0.5"
              strokeWidth={2}
            />
          </ToolbarButton>
        )}
      >
        {(close) => (
          <ViewPopoverContent
            currentView={currentView}
            onPick={(view) => {
              setParam("view", view === "table" ? "" : view);
              close();
            }}
          />
        )}
      </Popover>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/* Popover primitive — anchors content under the trigger button.        */

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

/* ───────────────────────────────────────────────────────────────────── */

function FilterPopoverContent({
  currentPlan,
  onPick,
  onClear,
}: {
  currentPlan: string;
  onPick: (plan: string) => void;
  onClear: () => void;
}) {
  const options: { value: string; label: string }[] = [
    { value: "", label: "All plans" },
    { value: "free", label: "Free" },
    { value: "basic", label: "Basic" },
    { value: "pro", label: "Pro" },
  ];
  return (
    <div className="min-w-[200px]">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400 px-2 pt-1 pb-1.5">
        Plan access
      </div>
      <ul role="none">
        {options.map((o) => (
          <li key={o.value || "all"} role="none">
            <button
              type="button"
              role="menuitemradio"
              aria-checked={currentPlan === o.value}
              onClick={() => onPick(o.value)}
              className={cn(
                "w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[13px] cursor-pointer",
                currentPlan === o.value
                  ? "bg-rose-50 text-rose-700 font-semibold"
                  : "text-ink-700 hover:bg-cream-100",
              )}
            >
              <span
                className={cn(
                  "size-4 rounded-full inline-flex items-center justify-center border",
                  currentPlan === o.value
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-ink-300 bg-white",
                )}
                aria-hidden
              >
                {currentPlan === o.value && (
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

function ViewPopoverContent({
  currentView,
  onPick,
}: {
  currentView: "table" | "grid";
  onPick: (view: "table" | "grid") => void;
}) {
  const options: {
    value: "table" | "grid";
    label: string;
    icon: typeof Table2;
    sub: string;
  }[] = [
    {
      value: "table",
      label: "Table",
      icon: Table2,
      sub: "Dense rows with every column",
    },
    {
      value: "grid",
      label: "Grid",
      icon: LayoutGrid,
      sub: "Visual cards with thumbnails",
    },
  ];
  return (
    <div className="min-w-[240px]">
      <ul role="none">
        {options.map((o) => {
          const active = currentView === o.value;
          const Icon = o.icon;
          return (
            <li key={o.value} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => onPick(o.value)}
                className={cn(
                  "w-full text-left flex items-center gap-3 px-2.5 py-2 rounded-[10px] cursor-pointer",
                  active
                    ? "bg-rose-50"
                    : "hover:bg-cream-100",
                )}
              >
                <span
                  className={cn(
                    "size-9 rounded-[10px] inline-flex items-center justify-center shrink-0",
                    active
                      ? "bg-rose-100 text-rose-600"
                      : "bg-cream-100 text-ink-600",
                  )}
                >
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      "text-[13px] font-semibold",
                      active ? "text-rose-700" : "text-ink-900",
                    )}
                  >
                    {o.label}
                  </div>
                  <div className="text-[11.5px] text-ink-500 truncate">
                    {o.sub}
                  </div>
                </div>
                {active && (
                  <Check
                    className="size-4 text-rose-600 shrink-0"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/* Native <select> styled as a chevron-suffixed pill, with an optional   */
/* leading colored dot (used by the Status filter).                       */

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
