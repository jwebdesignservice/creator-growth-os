/* Settings ──────────────────────────────────────────────────────────────
   Settings surfaces — connected accounts (platform connect / disconnect),
   toggle setting rows, and a danger zone. Uses the same full-colour
   platform marks and switch treatment as the rest of the system.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { Share2, CircleCheck, Trash2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { PlatformGlyph } from "@/components/posting/platform-glyphs";
import type { PlatformKey } from "@/lib/posting/queries";

export function ConnectedAccounts() {
  const rows: { platform: PlatformKey; label: string; status: string; connected: boolean }[] = [
    { platform: "instagram", label: "Instagram", status: "Connected as @jackwilson", connected: true },
    { platform: "tiktok", label: "TikTok", status: "Not connected", connected: false },
    { platform: "youtube", label: "YouTube", status: "Not connected", connected: false },
  ];
  return (
    <div className="card p-5 w-[460px] max-w-full">
      <header className="flex items-start gap-3 mb-4">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Share2 className="size-[18px]" strokeWidth={1.8} />
        </span>
        <div>
          <h3 className="text-h5 text-ink-900 leading-tight">Connected accounts</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">Link a platform to sync your performance.</p>
        </div>
      </header>
      <ul className="rounded-[14px] border border-ink-100 divide-y divide-ink-100 overflow-hidden">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-4 px-4 py-3.5">
            <PlatformGlyph platform={r.platform} className="size-9" />
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-ink-900 flex items-center gap-1.5">
                {r.label}
                {r.connected && <CircleCheck className="size-3.5 text-emerald-500" strokeWidth={2.2} />}
              </div>
              <div className={cn("text-[11.5px] mt-0.5", r.connected ? "text-emerald-700" : "text-ink-500")}>
                {r.status}
              </div>
            </div>
            <button
              type="button"
              className={cn(
                "h-8 px-3 rounded-[10px] text-[12.5px] font-medium shrink-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
                r.connected
                  ? "bg-white border border-ink-200 text-ink-700 hover:bg-cream-100 active:bg-cream-200 focus-visible:ring-rose-200"
                  : "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white focus-visible:ring-rose-300",
              )}
            >
              {r.connected ? "Disconnect" : "Connect"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SettingsToggleRows() {
  const [on, setOn] = useState<Record<string, boolean>>({ a: true, b: false, c: true });
  const rows = [
    { k: "a", title: "Email notifications", desc: "Weekly recap + mission reminders" },
    { k: "b", title: "Product updates", desc: "New features and announcements" },
    { k: "c", title: "Public profile", desc: "Show your profile on the creator directory" },
  ];
  return (
    <div className="card divide-y divide-ink-100 w-[460px] max-w-full overflow-hidden">
      {rows.map((r) => (
        <label key={r.k} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-cream-50 transition-colors cursor-pointer">
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold text-ink-900">{r.title}</div>
            <div className="text-[12px] text-ink-500 mt-0.5">{r.desc}</div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={on[r.k]}
            aria-label={r.title}
            onClick={() => setOn((s) => ({ ...s, [r.k]: !s[r.k] }))}
            className={cn(
              "relative w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50",
              on[r.k] ? "bg-rose-600" : "bg-ink-200",
            )}
          >
            <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", on[r.k] ? "left-[22px]" : "left-0.5")} />
          </button>
        </label>
      ))}
    </div>
  );
}

export function DangerZone() {
  return (
    <div className="rounded-[16px] border border-rose-200 bg-rose-50/50 p-5 w-[460px] max-w-full">
      <div className="flex items-center gap-2 mb-1">
        <TriangleAlert className="size-4 text-rose-600" strokeWidth={2} />
        <h3 className="text-[14px] font-bold text-rose-700">Danger zone</h3>
      </div>
      <p className="text-[12.5px] text-ink-500 leading-snug mb-4">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>
      <button
        type="button"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 active:bg-rose-200 text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50"
      >
        <Trash2 className="size-4" strokeWidth={2} />
        Delete account
      </button>
    </div>
  );
}
