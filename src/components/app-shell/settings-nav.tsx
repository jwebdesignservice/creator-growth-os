"use client";

import { usePathname } from "next/navigation";
import {
  CircleUser,
  Mail,
  Link2,
  Bell,
  CreditCard,
  Languages,
  Settings,
} from "lucide-react";
import {
  WorkspaceTabs,
  type WorkspaceTab,
} from "@/components/app-shell/workspace-shell";

/**
 * Inner sub-nav for the user's Settings surface. Built on the shared
 * WorkspaceShell rail idiom (icon + title header + vertically-stacked
 * {@link WorkspaceTabs}) so it reads as the exact same "workspace" pattern as
 * Performance, Community, Tutorials, etc. — white panel flush against the (app)
 * sidebar, with the same rose-active tab treatment.
 *
 * Hidden on mobile (the bottom-nav handles cross-section navigation there);
 * on `lg+` it sits flush against the (app) sidebar.
 */
const TABS: WorkspaceTab[] = [
  { key: "/settings",                    label: "Edit profile",       icon: CircleUser, href: "/settings" },
  { key: "/settings/invites",            label: "Invites",            icon: Mail,       href: "/settings/invites" },
  { key: "/settings/connected-accounts", label: "Connected accounts", icon: Link2,      href: "/settings/connected-accounts" },
  { key: "/settings/notifications",      label: "Notifications",      icon: Bell,       href: "/settings/notifications" },
  { key: "/settings/payment-methods",    label: "Payment methods",    icon: CreditCard, href: "/settings/payment-methods" },
  { key: "/settings/language",           label: "Language",           icon: Languages,  href: "/settings/language" },
];

export function SettingsNav() {
  const pathname = usePathname();
  // "Edit profile" lives at the index (/settings) so it must match exactly;
  // every other tab activates on its path prefix.
  const activeKey =
    pathname === "/settings"
      ? "/settings"
      : TABS.find((t) => t.key !== "/settings" && pathname.startsWith(t.key))
          ?.key ?? "/settings";

  return (
    <aside className="hidden lg:flex lg:flex-col w-[230px] shrink-0 h-screen sticky top-0 bg-white border-r border-ink-100 overflow-hidden">
      <header className="flex items-center gap-2.5 p-[15px] border-b border-ink-100">
        <span className="size-8 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Settings className="size-[17px]" strokeWidth={2} />
        </span>
        <h1 className="text-[15px] font-semibold text-ink-900 leading-tight">
          Account settings
        </h1>
      </header>
      <div className="px-[15px] pt-[15px] pb-3 lg:pb-0">
        <WorkspaceTabs
          tabs={TABS}
          activeKey={activeKey}
          ariaLabel="Account settings"
        />
      </div>
    </aside>
  );
}
