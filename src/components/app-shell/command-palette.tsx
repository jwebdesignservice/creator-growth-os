"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  LayoutGrid,
  GraduationCap,
  PlayCircle,
  CalendarDays,
  CheckSquare,
  BarChart3,
  Wallet,
  Users,
  CreditCard,
  Settings,
  Bell,
  MessageSquare,
  User,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Command palette — the global "⌘K" search popover.
 *
 * Mounts once at the top of the app shell (via Topbar) and listens for a
 * `command-palette:open` window event. Triggers in the topbar / mobile bar
 * call `openCommandPalette()` to dispatch that event, so we don't need to
 * thread state through context just to open from two trigger sites.
 *
 * Features:
 *  • Backdrop blur + dimmer behind the panel to focus attention on search.
 *  • Filter chips (Pages / Programs / Tutorials / More) — drives section
 *    visibility and result counts.
 *  • Live client-side filtering over a static manifest of in-app routes
 *    so navigation is instant and 100% functional without a backend call.
 *  • Full keyboard control: ⌘K / Ctrl+K toggles, ↑/↓ navigate, ⏎ selects,
 *    Esc closes. Hover also previews the active row so mouse + keyboard
 *    don't fight each other.
 *  • Click-outside / X-button close. Body scroll locked while open.
 *  • Smooth open/close motion via opacity + translateY + scale. All
 *    transitions respect `prefers-reduced-motion`.
 *  • Restores focus to the trigger on close.
 */

/* ─── Data ─────────────────────────────────────────────────────────────── */

type Category = "pages" | "programs" | "tutorials" | "more";
type Filter = Category | "all";

type SearchItem = {
  id: string;
  label: string;
  hint?: string;
  href: string;
  category: Category;
  icon: LucideIcon;
  keywords?: string[];
};

const FILTERS: { key: Filter; label: string; icon?: LucideIcon }[] = [
  { key: "pages", label: "Pages", icon: LayoutGrid },
  { key: "programs", label: "Programs", icon: GraduationCap },
  { key: "tutorials", label: "Tutorials", icon: PlayCircle },
  { key: "more", label: "More", icon: Sparkles },
];

const CATEGORY_LABELS: Record<Category, string> = {
  pages: "Pages",
  programs: "Programs",
  tutorials: "Tutorials",
  more: "More",
};

const ITEMS: SearchItem[] = [
  // ── Pages — primary navigation ───────────────────────────────────────
  { id: "page-dashboard",    label: "Dashboard",     hint: "Overview & today's focus",       href: "/dashboard",    category: "pages", icon: LayoutGrid,    keywords: ["home", "overview"] },
  { id: "page-programs",     label: "Programs",      hint: "Structured growth tracks",       href: "/programs",     category: "pages", icon: GraduationCap, keywords: ["course", "track"] },
  { id: "page-tutorials",    label: "Tutorials",     hint: "On-demand video library",        href: "/tutorials",    category: "pages", icon: PlayCircle,    keywords: ["videos", "lessons"] },
  { id: "page-posting",      label: "Posting Plans", hint: "Your content calendar",          href: "/posting",      category: "pages", icon: CalendarDays,  keywords: ["calendar", "schedule", "publish"] },
  { id: "page-missions",     label: "Tasks",         hint: "Open missions & to-dos",         href: "/missions",     category: "pages", icon: CheckSquare,   keywords: ["missions", "todo", "todos"] },
  { id: "page-performance",  label: "Performance",   hint: "Analytics & growth trends",      href: "/performance",  category: "pages", icon: BarChart3,     keywords: ["analytics", "metrics", "stats"] },
  { id: "page-monetization", label: "Monetization",  hint: "Revenue & sponsorships",         href: "/monetization", category: "pages", icon: Wallet,        keywords: ["money", "revenue", "income", "sponsor"] },
  { id: "page-community",    label: "Community",     hint: "Creators around you",            href: "/community",    category: "pages", icon: Users,         keywords: ["network", "creators", "people"] },

  // ── Programs (deep links / browse) ───────────────────────────────────
  { id: "prog-browse",       label: "Browse all programs",   hint: "Explore the full catalog",   href: "/programs",  category: "programs",  icon: GraduationCap, keywords: ["catalog", "all programs"] },

  // ── Tutorials ────────────────────────────────────────────────────────
  { id: "tut-browse",        label: "Browse all tutorials",  hint: "Search the video library",   href: "/tutorials", category: "tutorials", icon: PlayCircle,    keywords: ["library", "all tutorials"] },

  // ── More — secondary destinations ────────────────────────────────────
  { id: "more-notifications", label: "Notifications", hint: "Recent activity & alerts", href: "/notifications", category: "more", icon: Bell,          keywords: ["alerts", "inbox"] },
  { id: "more-support",       label: "Support",       hint: "Help, guides & tickets",   href: "/support",       category: "more", icon: MessageSquare, keywords: ["help desk", "ticket", "faq", "guides", "help center"] },
  { id: "more-billing",       label: "Billing",       hint: "Plan & invoices",          href: "/billing",       category: "more", icon: CreditCard,    keywords: ["payment", "subscription", "plan"] },
  { id: "more-settings",      label: "Settings",      hint: "Account preferences",      href: "/settings",      category: "more", icon: Settings,      keywords: ["preferences", "account"] },
  { id: "more-profile",       label: "Profile",       hint: "Your public profile",      href: "/profile",       category: "more", icon: User,          keywords: ["bio", "avatar"] },
];

/* ─── Imperative open API ──────────────────────────────────────────────── */

/**
 * Dispatch a window event the palette listens for. Trigger buttons in the
 * topbar / mobile bar call this; no provider / context plumbing needed.
 */
export function openCommandPalette() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("command-palette:open"));
}

/* ─── Component ────────────────────────────────────────────────────────── */

export function CommandPalette() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Defer portal mount until after first client render (avoids SSR mismatch
  // since `document.body` doesn't exist server-side). setTimeout(0) keeps
  // the state mutation out of the synchronous effect body — same pattern
  // used elsewhere in the codebase for client-only hydration flags.
  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  // Centralised open / close transitions. Doing the reset *here* (an event
  // callback) instead of in an effect cleanup keeps us inside the React 19
  // "no setState directly in an effect body" lint rule, and means every
  // fresh open starts with a clean slate.
  const openPalette = useCallback(() => {
    setQuery("");
    setFilter("all");
    setSelectedIndex(0);
    setOpen(true);
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);

  // Open via window event (fired by trigger buttons in topbar / mobile bar).
  useEffect(() => {
    window.addEventListener("command-palette:open", openPalette);
    return () =>
      window.removeEventListener("command-palette:open", openPalette);
  }, [openPalette]);

  // Global ⌘K / Ctrl+K toggles. Opens reset state; closes leave it alone
  // (next open will reset anyway, and the panel is invisible while closed).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" &&
        navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) closePalette();
        else openPalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette, closePalette]);

  // Focus management: remember trigger, focus input on open, restore focus
  // to the trigger on close. Pure DOM side-effects — no setState here.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      const t = window.setTimeout(() => inputRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
    const node = triggerRef.current;
    if (node && typeof node.focus === "function") node.focus();
    triggerRef.current = null;
  }, [open]);

  // Body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Filter + group matches.
  const { groups, flatList } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = ITEMS.filter((item) => {
      if (filter !== "all" && item.category !== filter) return false;
      if (!q) return true;
      const hay = [item.label, item.hint ?? "", ...(item.keywords ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    const order: Category[] = ["pages", "programs", "tutorials", "more"];
    const grouped = order
      .map((c) => ({
        category: c,
        items: matches.filter((m) => m.category === c),
      }))
      .filter((g) => g.items.length > 0);
    const flat = grouped.flatMap((g) => g.items);
    return { groups: grouped, flatList: flat };
  }, [query, filter]);

  // Query / filter setters that also reset the highlighted row to the top.
  // Done in event callbacks (here) rather than a reactive effect to satisfy
  // the React 19 set-state-in-effect rule.
  const handleQueryChange = useCallback((v: string) => {
    setQuery(v);
    setSelectedIndex(0);
  }, []);
  const handleFilterChange = useCallback((f: Filter) => {
    setFilter(f);
    setSelectedIndex(0);
  }, []);

  // Keyboard nav while open (arrow keys / Enter / Esc).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closePalette();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) =>
          Math.min(i + 1, Math.max(0, flatList.length - 1)),
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatList[selectedIndex];
        if (item) {
          router.push(item.href);
          closePalette();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, flatList, selectedIndex, router, closePalette]);

  // Keep the selected row visible as it moves.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector(
      `[data-idx="${selectedIndex}"]`,
    );
    if (node && "scrollIntoView" in node) {
      (node as HTMLElement).scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [selectedIndex, open]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] sm:pt-[12vh] px-4 sm:px-6",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      {/* Backdrop — clickable surface that closes the palette */}
      <button
        type="button"
        aria-label="Close search"
        onClick={closePalette}
        tabIndex={open ? 0 : -1}
        className={cn(
          "absolute inset-0 bg-ink-900/35 backdrop-blur-[10px] transition-opacity duration-200 ease-out motion-reduce:transition-none",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the app"
        className={cn(
          "relative w-full max-w-[680px] flex flex-col gap-3 sm:gap-3.5 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-[0.98]",
        )}
      >
        {/* ── Search bar card ───────────────────────────────────────── */}
        <div className="rounded-[18px] bg-white border border-ink-100 shadow-[0_24px_70px_-12px_rgba(15,12,22,0.28)] overflow-hidden ring-1 ring-rose-100/50">
          <div className="flex items-center gap-3 px-4 sm:px-5 h-[58px] border-b border-ink-100">
            <Search
              className="size-[18px] text-ink-500 shrink-0"
              strokeWidth={2}
              aria-hidden
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search…"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search programs, tutorials and pages"
              className="flex-1 bg-transparent text-[14.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
            <button
              type="button"
              aria-label={query ? "Clear search" : "Close search"}
              onClick={() => {
                if (query) {
                  handleQueryChange("");
                  inputRef.current?.focus();
                } else {
                  closePalette();
                }
              }}
              className="inline-flex items-center justify-center size-7 rounded-full bg-ink-100 text-ink-500 hover:bg-ink-200 hover:text-ink-900 transition-colors"
            >
              <X className="size-4" strokeWidth={2.2} />
            </button>
          </div>

          {/* Keyboard hint row */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-cream-100">
            <div className="flex items-center gap-2 text-[12px] text-ink-500">
              <span>Navigate</span>
              <Kbd>
                <ArrowUp className="size-3" strokeWidth={2.4} />
              </Kbd>
              <Kbd>
                <ArrowDown className="size-3" strokeWidth={2.4} />
              </Kbd>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-ink-500">
              <span>Close</span>
              <Kbd wide>esc</Kbd>
            </div>
          </div>
        </div>

        {/* ── Results card ──────────────────────────────────────────── */}
        <div className="rounded-[18px] bg-white border border-ink-100 shadow-[0_24px_70px_-12px_rgba(15,12,22,0.22)] overflow-hidden">
          {/* Filter chips row — horizontally scrollable on narrow screens */}
          <div
            className="flex items-center gap-2 px-4 sm:px-5 py-3 border-b border-ink-100 overflow-x-auto [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            <FilterChip
              label="All"
              active={filter === "all"}
              onClick={() => handleFilterChange("all")}
            />
            {FILTERS.map((f) => (
              <FilterChip
                key={f.key}
                icon={f.icon}
                label={f.label}
                active={filter === f.key}
                onClick={() => handleFilterChange(f.key)}
              />
            ))}
          </div>

          {/* Results list */}
          <div
            ref={listRef}
            className="max-h-[min(60vh,460px)] overflow-y-auto py-1.5"
          >
            {groups.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              groups.map((group) => (
                <Section
                  key={group.category}
                  category={group.category}
                  items={group.items}
                  selectedIndex={selectedIndex}
                  flatList={flatList}
                  onSelect={(item) => {
                    router.push(item.href);
                    closePalette();
                  }}
                  onHover={(idx) => setSelectedIndex(idx)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ─── Internal building blocks ─────────────────────────────────────────── */

function Kbd({
  children,
  wide,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center rounded-[5px] bg-white border border-ink-200 shadow-soft text-ink-700 text-[10.5px] font-medium tracking-wide",
        wide ? "h-5 px-1.5" : "size-5",
      )}
    >
      {children}
    </kbd>
  );
}

function FilterChip({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon?: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-medium border transition-colors shrink-0",
        active
          ? "bg-ink-900 text-cream-100 border-ink-900 shadow-soft"
          : "bg-white text-ink-700 border-ink-200 hover:bg-cream-100 hover:text-ink-900",
      )}
    >
      {Icon && <Icon className="size-[14px]" strokeWidth={2} />}
      <span>{label}</span>
    </button>
  );
}

function Section({
  category,
  items,
  selectedIndex,
  flatList,
  onSelect,
  onHover,
}: {
  category: Category;
  items: SearchItem[];
  selectedIndex: number;
  flatList: SearchItem[];
  onSelect: (item: SearchItem) => void;
  onHover: (idx: number) => void;
}) {
  return (
    <div className="px-2 py-1.5">
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
        <span className="text-[11px] font-semibold text-ink-900 uppercase tracking-[0.08em]">
          {CATEGORY_LABELS[category]}
        </span>
        <span className="inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full bg-ink-100 text-ink-700 text-[10.5px] font-semibold">
          {items.length}
        </span>
      </div>
      <ul>
        {items.map((item) => {
          const idx = flatList.findIndex((x) => x.id === item.id);
          const selected = idx === selectedIndex;
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-idx={idx}
                onClick={() => onSelect(item)}
                onMouseEnter={() => onHover(idx)}
                className={cn(
                  "group w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left transition-colors",
                  selected ? "bg-cream-100" : "hover:bg-cream-100/60",
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center justify-center size-9 rounded-[10px] border transition-colors shrink-0",
                    selected
                      ? "bg-white border-ink-200 text-ink-900"
                      : "bg-cream-100 border-ink-100 text-ink-700",
                  )}
                  aria-hidden
                >
                  <Icon className="size-[16px]" strokeWidth={1.9} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[13.5px] font-semibold text-ink-900 truncate">
                    {item.label}
                  </span>
                  {item.hint && (
                    <span className="block text-[12px] text-ink-500 truncate">
                      {item.hint}
                    </span>
                  )}
                </span>
                {selected && (
                  <span className="hidden sm:flex items-center gap-1.5 text-[11.5px] text-ink-500 shrink-0">
                    Select
                    <Kbd>
                      <CornerDownLeft className="size-3" strokeWidth={2.4} />
                    </Kbd>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="py-10 px-6 text-center">
      <div className="inline-flex items-center justify-center size-12 rounded-full bg-cream-100 mb-3">
        <Search className="size-5 text-ink-500" strokeWidth={2} aria-hidden />
      </div>
      <p className="text-[13.5px] font-medium text-ink-900">
        No results{query ? <> for &ldquo;{query}&rdquo;</> : null}
      </p>
      <p className="text-[12.5px] text-ink-500 mt-1">
        Try a different keyword or category.
      </p>
    </div>
  );
}
