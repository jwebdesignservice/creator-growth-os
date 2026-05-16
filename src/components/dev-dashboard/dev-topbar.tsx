"use client";

import {
  Menu,
  ChevronDown,
  Search,
  Bell,
  CircleDot,
} from "lucide-react";
import { DEV_ENV, DEV_NOTIFICATION_COUNT, DEV_USER } from "@/lib/dev-dashboard/mock-data";

export function DevTopbar() {
  return (
    <header className="sticky top-0 z-30 bg-[var(--dev-topbar-bg)]/95 backdrop-blur border-b border-[var(--dev-border)]">
      <div className="flex items-center gap-3 h-[var(--dev-topbar-height)] px-4 lg:px-6">
        {/* Collapse */}
        <button
          type="button"
          aria-label="Toggle sidebar"
          className="inline-flex items-center justify-center size-9 rounded-[10px] text-[var(--dev-text-secondary)] hover:bg-[var(--dev-surface-soft)] hover:text-[var(--dev-text-primary)] transition-colors"
        >
          <Menu className="size-[18px]" strokeWidth={1.8} />
        </button>

        {/* Env controls — push to a centered cluster on wide screens, wrap gracefully */}
        <div className="flex-1 flex items-center gap-3 lg:justify-center lg:gap-5 min-w-0 overflow-x-auto">
          <EnvField label="Environment">
            <CircleDot className="size-3 text-[var(--dev-success-text)]" strokeWidth={2.5} />
            <span className="text-[13px] text-[var(--dev-text-primary)] font-medium">{DEV_ENV.environment}</span>
            <ChevronDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
          </EnvField>

          <EnvField label="Region">
            <span className="text-[13px] text-[var(--dev-text-primary)] font-medium">{DEV_ENV.region}</span>
            <ChevronDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
          </EnvField>

          <EnvField label="Version">
            <span className="text-[13px] text-[var(--dev-text-primary)] font-medium">{DEV_ENV.version}</span>
            <ChevronDown className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={2} />
          </EnvField>

          <EnvField label="Branch">
            <span className="text-[13px] text-[var(--dev-text-primary)] font-medium">{DEV_ENV.branch}</span>
            <span className="px-1.5 h-[20px] inline-flex items-center rounded-md bg-[var(--dev-surface-elev)] border border-[var(--dev-border)] text-[11px] font-mono text-[var(--dev-text-secondary)]">
              {DEV_ENV.commit}
            </span>
          </EnvField>
        </div>

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <IconButton aria-label="Search">
            <Search className="size-[17px] text-[var(--dev-text-secondary)]" strokeWidth={1.8} />
          </IconButton>
          <IconButton aria-label="Notifications" className="relative">
            <Bell className="size-[17px] text-[var(--dev-text-secondary)]" strokeWidth={1.8} />
            {DEV_NOTIFICATION_COUNT > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full bg-[var(--dev-accent)] text-white text-[10px] font-semibold ring-2 ring-[var(--dev-topbar-bg)]">
                {DEV_NOTIFICATION_COUNT > 99 ? "99+" : DEV_NOTIFICATION_COUNT}
              </span>
            )}
          </IconButton>

          {/* User chip */}
          <div className="ml-2 flex items-center gap-2.5 pl-3 border-l border-[var(--dev-border)]">
            <div className="size-9 rounded-full bg-[var(--dev-accent-soft)] border border-[var(--dev-accent-border)] inline-flex items-center justify-center text-[12.5px] font-semibold text-[var(--dev-accent-text)]">
              {DEV_USER.initials}
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-[var(--dev-text-primary)]">
                {DEV_USER.name}
              </span>
              <span className="text-[11px] text-[var(--dev-text-muted)]">
                {DEV_USER.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function EnvField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 shrink-0 min-w-0">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)]">
        {label}
      </span>
      <button
        type="button"
        className="inline-flex items-center gap-1.5 px-2.5 h-8 rounded-[8px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] transition-colors"
      >
        {children}
      </button>
    </div>
  );
}

function IconButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={
        "relative inline-flex items-center justify-center size-9 rounded-[10px] hover:bg-[var(--dev-surface-soft)] transition-colors " +
        (className ?? "")
      }
      {...rest}
    >
      {children}
    </button>
  );
}
