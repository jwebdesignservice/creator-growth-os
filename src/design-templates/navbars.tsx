/* Navbars ───────────────────────────────────────────────────────────────
   Top navigation bars — the in-app admin topbar and a marketing-site
   navbar. Framed in a bordered shell so they read as a real bar inside
   the gallery's preview card.
   ───────────────────────────────────────────────────────────────────── */

import { Search, Bell, Sparkles, ChevronDown } from "lucide-react";

export function AppTopbar() {
  return (
    <div className="w-[680px] max-w-full rounded-[16px] border border-ink-100 bg-cream-100 overflow-hidden">
      <header className="bg-cream-100/85 backdrop-blur border-b border-ink-100">
        <div className="flex items-center gap-4 h-[68px] px-5">
          <div className="flex-1 max-w-[320px] relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400"
              strokeWidth={2}
            />
            <input
              type="search"
              readOnly
              placeholder="Search members by name or email…"
              className="w-full h-11 pl-10 pr-4 rounded-[14px] bg-white border border-ink-100 text-[13.5px] text-ink-700 placeholder:text-ink-400 outline-none"
            />
          </div>
          <div className="flex-1" />
          <button
            type="button"
            aria-label="Notifications"
            className="relative inline-flex items-center justify-center size-10 rounded-full hover:bg-cream-200 text-ink-500 transition-colors"
          >
            <Bell className="size-[18px]" strokeWidth={1.9} />
            <span className="absolute top-2 right-2 size-2 rounded-full bg-rose-500 ring-2 ring-cream-100" />
          </button>
          <span className="inline-flex items-center px-3 h-9 rounded-[10px] bg-rose-100 text-rose-700 text-[12px] font-semibold uppercase tracking-wider">
            Admin Mode
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-2 h-10 pl-1 pr-2.5 rounded-full hover:bg-cream-200 transition-colors"
          >
            <span className="size-8 rounded-full bg-rose-600 text-white text-[12.5px] font-semibold inline-flex items-center justify-center">
              JW
            </span>
            <ChevronDown className="size-4 text-ink-400" strokeWidth={2} />
          </button>
        </div>
      </header>
    </div>
  );
}

export function MarketingNavbar() {
  const links = ["Features", "Pricing", "Customers", "Resources"];
  return (
    <div className="w-[820px] max-w-full rounded-[16px] border border-ink-100 bg-white overflow-hidden">
      <nav className="flex items-center gap-6 h-[64px] px-6">
        <div className="flex items-center gap-2">
          <span className="size-8 rounded-[9px] bg-rose-600 text-white flex items-center justify-center">
            <Sparkles className="size-[18px]" strokeWidth={2} />
          </span>
          <span className="text-[15px] font-bold text-ink-900">Creator OS</span>
        </div>
        <div className="hidden md:flex items-center gap-1 ml-2">
          {links.map((l, i) => (
            <a
              key={l}
              href="#"
              className={
                "h-9 px-3 inline-flex items-center rounded-[9px] text-[13.5px] font-medium transition-colors " +
                (i === 0
                  ? "text-ink-900"
                  : "text-ink-500 hover:text-ink-900 hover:bg-cream-100")
              }
            >
              {l}
            </a>
          ))}
        </div>
        <div className="flex-1" />
        <a
          href="#"
          className="hidden sm:inline-flex items-center h-9 px-3 rounded-[10px] text-[13.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
        >
          Sign in
        </a>
        <a
          href="#"
          className="inline-flex items-center h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-semibold shadow-sm transition-colors"
        >
          Get started
        </a>
      </nav>
    </div>
  );
}
