/* Mobile ─────────────────────────────────────────────────────────────────
   Mobile navigation chrome — the bottom tab bar (with an elevated center
   action) and a slide-in nav drawer. Framed so they read as mobile in the
   gallery; every tab and row is a real, focusable target.
   ───────────────────────────────────────────────────────────────────── */

import {
  LayoutGrid,
  GraduationCap,
  SquareCheck,
  Users,
  Settings,
  X,
  Sparkles,
  ChartColumn,
  Send,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const TAB_FOCUS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200";

export function BottomNav() {
  const items: { label: string; Icon: LucideIcon; active?: boolean; center?: boolean }[] = [
    { label: "Dashboard", Icon: LayoutGrid, active: true },
    { label: "Programs", Icon: GraduationCap },
    { label: "Tasks", Icon: SquareCheck, center: true },
    { label: "Community", Icon: Users },
    { label: "Settings", Icon: Settings },
  ];
  return (
    <div className="w-[320px] rounded-[28px] border-[6px] border-ink-900 bg-white overflow-hidden">
      <div className="h-[120px] bg-cream-100 flex items-center justify-center text-[12px] text-ink-400">
        App content
      </div>
      <nav className="bg-white/95 border-t border-ink-100" aria-label="Primary">
        <ul className="relative grid grid-cols-5 h-[64px] items-stretch px-1">
          {items.map((it) => {
            const Icon = it.Icon;
            if (it.center) {
              return (
                <li key={it.label} className="flex items-end justify-center">
                  <button type="button" aria-label={it.label} className="inline-flex flex-col items-center gap-1 -translate-y-3 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
                    <span className="inline-flex items-center justify-center size-[48px] rounded-full bg-rose-500 text-white shadow-card ring-4 ring-white">
                      <Icon className="size-[20px]" strokeWidth={2} />
                    </span>
                    <span className="text-[10px] font-medium text-ink-500">{it.label}</span>
                  </button>
                </li>
              );
            }
            return (
              <li key={it.label} className="flex">
                <button
                  type="button"
                  aria-current={it.active ? "page" : undefined}
                  className={cn(
                    "flex-1 inline-flex flex-col items-center justify-center gap-1 rounded-[10px] cursor-pointer transition-colors",
                    TAB_FOCUS,
                    it.active ? "text-rose-600" : "text-ink-500 hover:text-ink-800",
                  )}
                >
                  <Icon className="size-[20px]" strokeWidth={it.active ? 2 : 1.8} />
                  <span className="text-[10px] leading-none font-medium">{it.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function MobileDrawer() {
  const nav: { Icon: LucideIcon; label: string; active?: boolean }[] = [
    { Icon: LayoutGrid, label: "Dashboard", active: true },
    { Icon: ChartColumn, label: "Performance" },
    { Icon: Send, label: "Posting" },
    { Icon: GraduationCap, label: "Programs" },
    { Icon: Users, label: "Community" },
    { Icon: Settings, label: "Settings" },
  ];
  return (
    <div className="w-[280px] rounded-[20px] border border-ink-100 bg-white overflow-hidden shadow-card">
      <div className="flex items-center justify-between px-4 h-14 border-b border-ink-100">
        <span className="inline-flex items-center gap-2">
          <span className="size-8 rounded-[9px] bg-rose-600 text-white flex items-center justify-center">
            <Sparkles className="size-[18px]" strokeWidth={2} />
          </span>
          <span className="text-[14px] font-bold text-ink-900">Creator OS</span>
        </span>
        <button type="button" aria-label="Close menu" className="size-8 rounded-[10px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-ink-700 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      <nav className="p-3 space-y-0.5">
        {nav.map((it) => {
          const Icon = it.Icon;
          return (
            <button
              key={it.label}
              type="button"
              aria-current={it.active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 h-11 px-3 rounded-[12px] text-[14px] text-left cursor-pointer transition-colors",
                TAB_FOCUS,
                it.active ? "bg-rose-50 text-rose-700 font-semibold" : "text-ink-700 hover:bg-cream-100",
              )}
            >
              <Icon className={cn("size-[20px]", it.active ? "text-rose-600" : "text-ink-400")} strokeWidth={1.9} />
              {it.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
