/* Page layouts ──────────────────────────────────────────────────────────
   Full-page compositions assembled from the smaller primitives — a
   dashboard shell, a settings page, and a centered auth screen. These are
   wide; the gallery scales them down to thumbnails and shows them full
   size in the detail modal.
   ───────────────────────────────────────────────────────────────────── */

import {
  Search,
  Bell,
  Sparkles,
  LayoutDashboard,
  BarChart3,
  Send,
  GraduationCap,
  Users,
  ArrowRight,
  TrendingUp,
  User,
  CreditCard,
  Lock,
  BellRing,
  type LucideIcon,
} from "lucide-react";

export function DashboardPage() {
  const nav: LucideIcon[] = [LayoutDashboard, BarChart3, Send, GraduationCap, Users];
  const kpis = [
    { label: "Followers", value: "12.4K", delta: "+8.2%" },
    { label: "Engagement", value: "5.7%", delta: "+1.1%" },
    { label: "Posts / week", value: "9", delta: "+3" },
    { label: "Revenue", value: "$2,140", delta: "+12%" },
  ];
  const bars = [40, 65, 50, 80, 72, 90, 60];
  return (
    <div className="w-[760px] h-[480px] rounded-[18px] border border-ink-100 bg-cream-100 overflow-hidden flex">
      {/* Icon rail */}
      <div className="w-[64px] bg-white border-r border-ink-100 flex flex-col items-center py-4 gap-2 shrink-0">
        <span className="size-9 rounded-[11px] bg-rose-600 text-white flex items-center justify-center mb-2">
          <Sparkles className="size-[18px]" strokeWidth={2} />
        </span>
        {nav.map((Icon, i) => (
          <span
            key={i}
            className={
              "inline-flex items-center justify-center size-10 rounded-[11px] " +
              (i === 0 ? "bg-rose-50 text-rose-600" : "text-ink-400")
            }
          >
            <Icon className="size-[18px]" strokeWidth={1.9} />
          </span>
        ))}
      </div>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[60px] bg-white border-b border-ink-100 flex items-center gap-4 px-5 shrink-0">
          <div className="relative w-[280px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400"
              strokeWidth={2}
            />
            <div className="h-9 rounded-[12px] bg-cream-100 border border-ink-100 pl-9 flex items-center text-[12.5px] text-ink-400">
              Search…
            </div>
          </div>
          <div className="flex-1" />
          <Bell className="size-[18px] text-ink-400" strokeWidth={1.9} />
          <span className="size-8 rounded-full bg-rose-600 text-white text-[12px] font-semibold flex items-center justify-center">
            JW
          </span>
        </header>

        <div className="flex-1 overflow-hidden p-6">
          <p className="text-[12.5px] text-rose-600 font-semibold">Good morning</p>
          <h2 className="text-h3 text-ink-900">Welcome back, Jack</h2>

          <div className="grid grid-cols-4 gap-3 mt-5">
            {kpis.map((k) => (
              <div key={k.label} className="card p-4">
                <div className="text-[11.5px] text-ink-500">{k.label}</div>
                <div className="text-h4 text-ink-900 tabular-nums mt-1">
                  {k.value}
                </div>
                <div className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 mt-1">
                  <TrendingUp className="size-3" strokeWidth={2.5} />
                  {k.delta}
                </div>
              </div>
            ))}
          </div>

          <div className="card p-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h5 text-ink-900">This week&rsquo;s performance</h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[12.5px] text-rose-600 font-medium"
              >
                View report
                <ArrowRight className="size-3.5" strokeWidth={2} />
              </button>
            </div>
            <div className="h-[120px] rounded-[12px] bg-cream-100 flex items-end gap-2 p-3">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-rose-300"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const sections: { icon: LucideIcon; label: string; active?: boolean }[] = [
    { icon: User, label: "Profile", active: true },
    { icon: BellRing, label: "Notifications" },
    { icon: CreditCard, label: "Billing" },
    { icon: Lock, label: "Security" },
  ];
  return (
    <div className="w-[720px] h-[440px] rounded-[18px] border border-ink-100 bg-cream-100 overflow-hidden flex">
      {/* Settings sub-nav */}
      <div className="w-[210px] bg-white border-r border-ink-100 p-4 shrink-0">
        <h3 className="text-h5 text-ink-900 mb-3 px-1">Settings</h3>
        <div className="flex flex-col gap-0.5">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <a
                key={s.label}
                href="#"
                aria-current={s.active ? "page" : undefined}
                className={
                  "flex items-center gap-2.5 h-9 px-2.5 rounded-[10px] text-[13px] transition-colors " +
                  (s.active
                    ? "bg-rose-50 text-rose-700 font-semibold"
                    : "text-ink-500 hover:bg-cream-100 hover:text-ink-900")
                }
              >
                <Icon
                  className={
                    "size-4 " + (s.active ? "text-rose-600" : "text-ink-400")
                  }
                  strokeWidth={1.9}
                />
                {s.label}
              </a>
            );
          })}
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 overflow-hidden p-7 min-w-0">
        <h2 className="text-h4 text-ink-900">Profile</h2>
        <p className="text-[13px] text-ink-500 mt-1">
          This information is shown on your public creator profile.
        </p>

        <div className="card p-5 mt-5 space-y-4">
          <div className="flex items-center gap-4">
            <span className="size-14 rounded-full bg-rose-600 text-white text-[18px] font-semibold flex items-center justify-center">
              JW
            </span>
            <button
              type="button"
              className="inline-flex items-center h-9 px-3 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[13px] font-medium transition-colors"
            >
              Change photo
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
                Display name
              </label>
              <div className="h-10 rounded-[10px] border border-ink-100 bg-white px-3 flex items-center text-[13px] text-ink-900">
                Jack Wilson
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
                Username
              </label>
              <div className="h-10 rounded-[10px] border border-ink-100 bg-white px-3 flex items-center text-[13px] text-ink-500">
                @jackwilson
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            className="inline-flex items-center h-10 px-4 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[13.5px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-medium shadow-sm transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export function AuthPage() {
  return (
    <div className="w-[640px] h-[420px] rounded-[18px] border border-ink-100 bg-cream-100 overflow-hidden flex items-center justify-center p-8">
      <div className="card w-full max-w-[360px] p-7">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="size-11 rounded-[13px] bg-rose-600 text-white flex items-center justify-center mb-3">
            <Sparkles className="size-5" strokeWidth={2} />
          </span>
          <h2 className="text-h4 text-ink-900">Welcome back</h2>
          <p className="text-[13px] text-ink-500 mt-1">
            Sign in to your Creator OS account
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
              Email
            </label>
            <div className="h-11 rounded-[12px] border border-ink-100 bg-white px-3.5 flex items-center text-[13.5px] text-ink-500">
              you@example.com
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
              Password
            </label>
            <div className="h-11 rounded-[12px] border border-ink-100 bg-white px-3.5 flex items-center text-[13.5px] text-ink-300 tracking-[0.3em]">
              ••••••••
            </div>
          </div>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center h-11 rounded-[12px] bg-rose-600 hover:bg-rose-700 text-white text-[14px] font-semibold shadow-sm transition-colors"
          >
            Sign in
          </button>
        </div>

        <p className="text-center text-[12.5px] text-ink-500 mt-5">
          New here?{" "}
          <a href="#" className="text-rose-600 font-medium hover:text-rose-700">
            Create an account
          </a>
        </p>
      </div>
    </div>
  );
}
