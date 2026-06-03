/* Account security ────────────────────────────────────────────────────────
   The Settings → Account security surfaces — two-factor setup, the list of
   active sessions/devices, and a recent-login history. Presentational; these
   mirror the security card patterns used across settings + sign-in flows.
   ───────────────────────────────────────────────────────────────────────── */

import {
  ShieldCheck,
  Smartphone,
  Monitor,
  Check,
  Clock,
  MapPin,
  CircleAlert,
  KeyRound,
} from "lucide-react";

/* 1 · Two-factor authentication card — enabled state with method rows. */
export function TwoFactorCard() {
  return (
    <div className="w-[420px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="size-10 rounded-[12px] bg-emerald-100 text-emerald-600 inline-flex items-center justify-center shrink-0">
          <ShieldCheck className="size-5" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-[14.5px] font-bold text-ink-900">Two-factor authentication</h3>
            <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10.5px] font-semibold">
              <Check className="size-2.5" strokeWidth={3} /> On
            </span>
          </div>
          <p className="text-[12.5px] text-ink-500 mt-1 leading-relaxed">
            An extra step at sign-in keeps your account safe even if your password leaks.
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-[12px] border border-ink-100 divide-y divide-ink-100">
        <div className="flex items-center gap-3 px-3.5 py-3">
          <Smartphone className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-ink-900">Authenticator app</div>
            <div className="text-[11.5px] text-ink-400">Primary method</div>
          </div>
          <button type="button" className="text-[12.5px] font-semibold text-rose-600 rounded px-1 -mx-1 cursor-pointer transition-colors hover:text-rose-700 active:text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Manage</button>
        </div>
        <div className="flex items-center gap-3 px-3.5 py-3">
          <KeyRound className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-ink-900">Recovery codes</div>
            <div className="text-[11.5px] text-ink-400">8 unused</div>
          </div>
          <button type="button" className="text-[12.5px] font-semibold text-rose-600 rounded px-1 -mx-1 cursor-pointer transition-colors hover:text-rose-700 active:text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">View</button>
        </div>
      </div>
    </div>
  );
}

/* 2 · Active sessions — devices currently signed in, with revoke. */
const SESSIONS = [
  { icon: Monitor, device: "Chrome · macOS", loc: "Oslo, NO", when: "Active now", current: true },
  { icon: Smartphone, device: "Safari · iPhone", loc: "Oslo, NO", when: "2 hours ago", current: false },
  { icon: Monitor, device: "Edge · Windows", loc: "Bergen, NO", when: "Yesterday", current: false },
];

export function ActiveSessionsList() {
  return (
    <div className="w-[440px] max-w-full rounded-[16px] border border-ink-100 bg-white overflow-hidden shadow-card">
      <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-ink-900">Active sessions</h3>
        <span className="text-[11.5px] text-ink-400">{SESSIONS.length} devices</span>
      </div>
      <ul className="divide-y divide-ink-100">
        {SESSIONS.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.device} className="flex items-center gap-3 px-5 py-3.5">
              <span className="size-9 rounded-[10px] bg-cream-100 text-ink-500 inline-flex items-center justify-center shrink-0">
                <Icon className="size-[18px]" strokeWidth={1.9} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-semibold text-ink-900 truncate">{s.device}</span>
                  {s.current && (
                    <span className="inline-flex items-center h-5 px-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                      This device
                    </span>
                  )}
                </div>
                <div className="text-[11.5px] text-ink-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="size-3 shrink-0" strokeWidth={2} />
                  {s.loc}
                  <span className="text-ink-300">·</span>
                  {s.when}
                </div>
              </div>
              {!s.current && (
                <button type="button" className="text-[12.5px] font-semibold text-rose-600 shrink-0 rounded px-1 -mx-1 cursor-pointer transition-colors hover:text-rose-700 active:text-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">
                  Revoke
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* 3 · Recent login history — successes + a flagged attempt. */
const LOGINS = [
  { ok: true, label: "Successful sign-in", meta: "Chrome · Oslo, NO", when: "Today, 14:02" },
  { ok: true, label: "Successful sign-in", meta: "iPhone · Oslo, NO", when: "Yesterday, 09:11" },
  { ok: false, label: "Failed attempt", meta: "Unknown · Kyiv, UA", when: "Mar 28, 03:40" },
];

export function LoginHistory() {
  return (
    <div className="w-[420px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <h3 className="text-[14px] font-bold text-ink-900 mb-3">Recent activity</h3>
      <ul className="space-y-3">
        {LOGINS.map((l, i) => (
          <li key={i} className="flex items-center gap-3">
            <span
              className={
                "size-7 rounded-full inline-flex items-center justify-center shrink-0 " +
                (l.ok ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")
              }
            >
              {l.ok ? <Check className="size-3.5" strokeWidth={2.6} /> : <CircleAlert className="size-3.5" strokeWidth={2.2} />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-ink-900 leading-tight">{l.label}</div>
              <div className="text-[11.5px] text-ink-400">{l.meta}</div>
            </div>
            <span className="text-[11.5px] text-ink-400 tabular-nums inline-flex items-center gap-1 shrink-0">
              <Clock className="size-3" strokeWidth={2} />
              {l.when}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
