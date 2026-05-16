"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CircleDot, LifeBuoy } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { DEV_ROUTES } from "@/lib/dev-dashboard/dev-routes";
import { cn } from "@/lib/cn";

export function DevSidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden lg:flex flex-col w-[var(--dev-sidebar-width)] shrink-0 h-screen sticky top-0 bg-[var(--dev-sidebar-bg)] border-r border-[var(--dev-border)] text-[var(--dev-text-primary)]"
    >
      {/* Brand + Internal Only badge */}
      <Link
        href="/dev"
        className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--dev-border-soft)] hover:opacity-90 transition-opacity"
      >
        <BrandMark size={28} className="text-[var(--dev-accent)]" />
        <span className="text-[15px] font-semibold text-white tracking-tight">
          Dev Dashboard
        </span>
        <span className="ml-auto inline-flex items-center px-2 h-[22px] rounded-md text-[10px] font-semibold tracking-wider bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)] border border-[var(--dev-accent-border)]">
          Internal Only
        </span>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <ul className="space-y-0.5">
          {DEV_ROUTES.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={isActive(pathname, item.href)}
            />
          ))}
        </ul>
      </nav>

      {/* System time + Report an Issue */}
      <div className="px-3 pt-3 pb-4 border-t border-[var(--dev-border-soft)] space-y-2.5">
        <SystemTimeCard />
        <button
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors"
        >
          <LifeBuoy className="size-4 shrink-0" strokeWidth={1.8} />
          Report an Issue
        </button>
      </div>
    </aside>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/dev") return pathname === "/dev";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center gap-3 px-3 py-2 rounded-[10px] text-[13.5px] font-medium transition-colors",
          active
            ? "bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)]"
            : "text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)]",
        )}
      >
        <Icon
          className={cn(
            "size-[17px] shrink-0",
            active ? "text-[var(--dev-accent-text)]" : "text-[var(--dev-text-muted)] group-hover:text-[var(--dev-text-secondary)]",
          )}
          strokeWidth={1.7}
        />
        <span className="flex-1 truncate">{label}</span>
      </Link>
    </li>
  );
}

function SystemTimeCard() {
  // Render after mount to avoid a server/client mismatch on the live clock.
  // The first tick is deferred to a microtask so we never call setState
  // synchronously during the effect body.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);

  const dateLine = now
    ? now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "—";

  const offsetLine = now ? formatOffset(now.getTimezoneOffset()) : "";

  return (
    <div className="px-3 py-2.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)]">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1.5">
        <CircleDot className="size-3 text-[var(--dev-success-text)]" strokeWidth={2} />
        System Time
      </div>
      <div className="text-[12.5px] font-medium text-[var(--dev-text-primary)] tabular-nums leading-tight">
        {dateLine}
      </div>
      <div className="mt-0.5 text-[11px] text-[var(--dev-text-muted)] tabular-nums">
        {offsetLine}
      </div>
    </div>
  );
}

function formatOffset(minutes: number) {
  // Date.getTimezoneOffset returns the inverted sign — flip it for display.
  const inverted = -minutes;
  const sign = inverted >= 0 ? "+" : "-";
  const abs = Math.abs(inverted);
  const h = String(Math.floor(abs / 60)).padStart(2, "0");
  const m = String(abs % 60).padStart(2, "0");
  return `UTC ${sign}${h}:${m}`;
}
