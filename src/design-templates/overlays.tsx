/* Overlays ──────────────────────────────────────────────────────────────
   Transient surfaces layered over the app — a toast stack, a confirm
   dialog, and a command palette. Rendered inline here (no fixed backdrop)
   so the gallery shows each surface itself, with its real states.
   ───────────────────────────────────────────────────────────────────── */

import {
  CircleCheck,
  CircleAlert,
  Info,
  X,
  TriangleAlert,
  Search,
  Command,
  CornerDownLeft,
  LayoutDashboard,
  Users,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

const TOAST_TONE = {
  success: { icon: CircleCheck, tile: "bg-success-bg text-success", accent: "border-l-emerald-500" },
  info: { icon: Info, tile: "bg-sky-100 text-sky-600", accent: "border-l-sky-500" },
  error: { icon: CircleAlert, tile: "bg-rose-100 text-rose-600", accent: "border-l-rose-500" },
} as const;

export function ToastStack() {
  const toasts: { tone: keyof typeof TOAST_TONE; title: string; body: string }[] = [
    { tone: "success", title: "Changes saved", body: "Your profile is up to date." },
    { tone: "info", title: "New version available", body: "Refresh to get the latest." },
    { tone: "error", title: "Couldn’t connect to TikTok", body: "Reconnect from Settings." },
  ];
  return (
    <div aria-live="polite" className="w-[340px] max-w-full space-y-2.5">
      {toasts.map((t, i) => {
        const tone = TOAST_TONE[t.tone];
        const Icon = tone.icon;
        return (
          <div
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-[12px] bg-white border border-ink-100 border-l-[3px] shadow-card px-3.5 py-3",
              tone.accent,
            )}
          >
            <span className={cn("size-8 rounded-full inline-flex items-center justify-center shrink-0", tone.tile)}>
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-900">{t.title}</div>
              <div className="text-[12px] text-ink-500 leading-snug">{t.body}</div>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              className="size-6 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 shrink-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ConfirmDialog() {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dt-confirm-title"
      aria-describedby="dt-confirm-desc"
      className="w-[420px] max-w-full rounded-[18px] bg-white shadow-card border border-ink-100 overflow-hidden"
    >
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <span className="size-10 rounded-full inline-flex items-center justify-center shrink-0 bg-rose-100 text-rose-600">
          <TriangleAlert className="size-5" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 id="dt-confirm-title" className="text-[16px] font-semibold text-ink-900 leading-tight">
            Disconnect Instagram?
          </h2>
          <p id="dt-confirm-desc" className="mt-1.5 text-[13px] text-ink-500 leading-relaxed">
            Your past analytics stay; new data won’t sync until you reconnect.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          className="size-8 inline-flex items-center justify-center rounded-[10px] text-ink-400 hover:text-ink-700 hover:bg-cream-100 cursor-pointer transition-colors shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-4 bg-cream-50/50 border-t border-ink-100">
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] text-[13px] font-medium bg-white border border-ink-200 text-ink-700 hover:bg-cream-100 active:bg-cream-200 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] text-[13px] font-medium text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export function CommandPalette() {
  const results: { icon: LucideIcon; label: string; hint: string }[] = [
    { icon: LayoutDashboard, label: "Go to Dashboard", hint: "G D" },
    { icon: Users, label: "View members", hint: "G M" },
    { icon: Settings, label: "Open settings", hint: "G S" },
  ];
  return (
    <div className="w-[460px] max-w-full rounded-[16px] bg-white border border-ink-100 shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 h-12 border-b border-ink-100">
        <Search className="size-4 text-ink-400" strokeWidth={2} />
        <input
          type="text"
          readOnly
          value="member"
          className="flex-1 bg-transparent text-[14px] text-ink-900 outline-none"
        />
        <span className="inline-flex items-center gap-1 px-1.5 h-6 rounded-[6px] bg-cream-100 border border-ink-200 text-[11px] font-medium text-ink-500">
          <Command className="size-3" strokeWidth={2} />K
        </span>
      </div>
      <div className="py-2">
        <p className="px-4 py-1 text-[10.5px] uppercase tracking-wider font-semibold text-ink-400">
          Quick actions
        </p>
        {results.map((r, i) => {
          const Icon = r.icon;
          const active = i === 0;
          return (
            <button
              key={r.label}
              type="button"
              className={cn(
                "flex w-[calc(100%-1rem)] items-center gap-3 mx-2 px-2.5 h-10 rounded-[10px] text-[13.5px] text-left cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200",
                active ? "bg-rose-50 text-rose-700" : "text-ink-700 hover:bg-cream-100",
              )}
            >
              <Icon className={cn("size-4", active ? "text-rose-600" : "text-ink-400")} strokeWidth={1.9} />
              <span className="flex-1">{r.label}</span>
              {active ? (
                <CornerDownLeft className="size-3.5 text-rose-400" strokeWidth={2} />
              ) : (
                <span className="flex items-center gap-1">
                  {r.hint.split(" ").map((k) => (
                    <kbd key={k} className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[5px] border border-ink-200 bg-white text-[10.5px] font-semibold text-ink-400">
                      {k}
                    </kbd>
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {/* Keyboard hint footer — consistent with global search */}
      <div className="flex items-center gap-3 px-4 h-10 border-t border-ink-100 bg-cream-50 text-[11px] text-ink-400">
        <span className="inline-flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
        <span className="inline-flex items-center gap-1"><Kbd>↵</Kbd> select</span>
        <span className="inline-flex items-center gap-1 ml-auto"><Kbd>esc</Kbd> close</span>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[5px] border border-ink-200 bg-white text-[10.5px] font-semibold text-ink-500">
      {children}
    </kbd>
  );
}
