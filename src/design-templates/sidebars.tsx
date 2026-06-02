/* Sidebars ──────────────────────────────────────────────────────────────
   App navigation rails. AppSidebar = full sectioned nav with a profile
   footer; CompactSidebar = icon-only rail for dense layouts.
   ───────────────────────────────────────────────────────────────────── */

import {
  LayoutDashboard,
  BarChart3,
  Send,
  Megaphone,
  GraduationCap,
  Users,
  Settings,
  LifeBuoy,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type NavItem = { icon: LucideIcon; label: string; active?: boolean };
const NAV: { section: string; items: NavItem[] }[] = [
  {
    section: "Main",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", active: true },
      { icon: BarChart3, label: "Performance" },
      { icon: Send, label: "Posting" },
      { icon: Megaphone, label: "Missions" },
    ],
  },
  {
    section: "Learn",
    items: [
      { icon: GraduationCap, label: "Programs" },
      { icon: Users, label: "Community" },
    ],
  },
];

export function AppSidebar() {
  return (
    <aside className="w-[248px] h-[520px] rounded-[18px] border border-ink-100 bg-white flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 h-[64px] border-b border-ink-100 shrink-0">
        <span className="size-8 rounded-[9px] bg-rose-600 text-white flex items-center justify-center">
          <Sparkles className="size-[18px]" strokeWidth={2} />
        </span>
        <span className="text-[14.5px] font-bold text-ink-900">Creator OS</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV.map((g) => (
          <div key={g.section}>
            <p className="px-2.5 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
              {g.section}
            </p>
            <div className="flex flex-col gap-0.5">
              {g.items.map((it) => {
                const Icon = it.icon;
                return (
                  <a
                    key={it.label}
                    href="#"
                    aria-current={it.active ? "page" : undefined}
                    className={
                      "flex items-center gap-3 h-10 px-2.5 rounded-[10px] text-[13.5px] transition-colors " +
                      (it.active
                        ? "bg-rose-50 text-rose-700 font-semibold"
                        : "text-ink-500 hover:bg-cream-100 hover:text-ink-900")
                    }
                  >
                    <Icon
                      className={
                        "size-[18px] shrink-0 " +
                        (it.active ? "text-rose-600" : "text-ink-400")
                      }
                      strokeWidth={1.9}
                    />
                    {it.label}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-100 p-3 space-y-0.5 shrink-0">
        <a
          href="#"
          className="flex items-center gap-3 h-10 px-2.5 rounded-[10px] text-[13.5px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
        >
          <Settings className="size-[18px] text-ink-400" strokeWidth={1.9} />
          Settings
        </a>
        <a
          href="#"
          className="flex items-center gap-3 h-10 px-2.5 rounded-[10px] text-[13.5px] text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
        >
          <LifeBuoy className="size-[18px] text-ink-400" strokeWidth={1.9} />
          Support
        </a>
      </div>
    </aside>
  );
}

export function CompactSidebar() {
  const items: LucideIcon[] = [
    LayoutDashboard,
    BarChart3,
    Send,
    GraduationCap,
    Users,
    Settings,
  ];
  return (
    <aside className="w-[72px] h-[460px] rounded-[18px] border border-ink-100 bg-white flex flex-col items-center py-4 gap-2">
      <span className="size-10 rounded-[12px] bg-rose-600 text-white flex items-center justify-center mb-2">
        <Sparkles className="size-5" strokeWidth={2} />
      </span>
      {items.map((Icon, i) => (
        <a
          key={i}
          href="#"
          aria-label="Nav item"
          className={
            "inline-flex items-center justify-center size-11 rounded-[12px] transition-colors " +
            (i === 0
              ? "bg-rose-50 text-rose-600"
              : "text-ink-400 hover:bg-cream-100 hover:text-ink-700")
          }
        >
          <Icon className="size-[20px]" strokeWidth={1.9} />
        </a>
      ))}
    </aside>
  );
}
