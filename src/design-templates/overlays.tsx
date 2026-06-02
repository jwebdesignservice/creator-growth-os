/* Overlays ──────────────────────────────────────────────────────────────
   Transient surfaces layered over the app — toast stack, a confirm dialog
   (mirrors ui/confirm-dialog.tsx), and a command palette (app-shell/
   command-palette). Rendered inline here (no fixed backdrop) so the
   gallery shows the surface itself.
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
} from "lucide-react";

export function ToastStack() {
  const toasts = [
    { icon: CircleCheck, tone: "bg-success-bg text-success", title: "Changes saved", body: "Your profile is up to date." },
    { icon: Info, tone: "bg-rose-100 text-rose-600", title: "New version available", body: "Refresh to get the latest." },
    { icon: CircleAlert, tone: "bg-rose-100 text-rose-600", title: "Couldn’t connect to TikTok", body: "Reconnect from Settings." },
  ];
  return (
    <div className="w-[340px] max-w-full space-y-2.5">
      {toasts.map((t, i) => {
        const Icon = t.icon;
        return (
          <div
            key={i}
            className="flex items-start gap-3 rounded-[12px] bg-white border border-ink-100 shadow-card px-3.5 py-3"
          >
            <span className={"size-8 rounded-full inline-flex items-center justify-center shrink-0 " + t.tone}>
              <Icon className="size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-ink-900">{t.title}</div>
              <div className="text-[12px] text-ink-500 leading-snug">{t.body}</div>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              className="size-6 rounded-full inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 shrink-0"
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
    <div className="w-[420px] max-w-full rounded-[18px] bg-white shadow-card border border-ink-100 overflow-hidden">
      <div className="flex items-start gap-3 px-5 pt-5 pb-3">
        <span className="size-10 rounded-full inline-flex items-center justify-center shrink-0 bg-rose-100 text-rose-600">
          <TriangleAlert className="size-5" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-semibold text-ink-900 leading-tight">
            Disconnect Instagram?
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-500 leading-relaxed">
            Your past analytics stay; new data won’t sync until you reconnect.
          </p>
        </div>
        <button
          type="button"
          aria-label="Close"
          className="size-8 inline-flex items-center justify-center rounded-[10px] text-ink-400 hover:text-ink-700 hover:bg-cream-100 transition-colors shrink-0"
        >
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-4 bg-cream-50/50 border-t border-ink-100">
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] text-[13px] font-medium bg-white border border-ink-200 text-ink-700 hover:bg-cream-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] text-[13px] font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
}

export function CommandPalette() {
  const results = [
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
        <span className="inline-flex items-center gap-1 px-1.5 h-6 rounded-[6px] bg-cream-100 border border-ink-100 text-[11px] font-medium text-ink-500">
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
            <div
              key={r.label}
              className={
                "flex items-center gap-3 mx-2 px-2.5 h-10 rounded-[10px] text-[13.5px] " +
                (active ? "bg-rose-50 text-rose-700" : "text-ink-700")
              }
            >
              <Icon
                className={"size-4 " + (active ? "text-rose-600" : "text-ink-400")}
                strokeWidth={1.9}
              />
              <span className="flex-1">{r.label}</span>
              {active ? (
                <span className="inline-flex items-center gap-1 text-[11px] text-rose-400">
                  <CornerDownLeft className="size-3.5" strokeWidth={2} />
                </span>
              ) : (
                <span className="text-[11px] font-mono text-ink-300">{r.hint}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
