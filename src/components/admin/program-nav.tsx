"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  Layers,
  LayoutTemplate,
  Award,
  Info,
  Tag,
  Globe,
  Code2,
  Ticket,
  TrendingUp,
  MessageSquare,
  GraduationCap,
  BarChart3,
  ChevronLeft,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Matches "exact" so child routes don't activate the index entry. */
  exact?: boolean;
};

/**
 * The inner sub-nav for a single program. Mirrors the EmailNav structure
 * exactly — same brand strip / section label / nav list / admin chip
 * footer — so the two surfaces feel like the same "compact-shell + inner
 * panel" idiom rather than two different patterns.
 *
 * Groups are separated by a hairline divider (no header label) to give the
 * 13 items a scannable rhythm without adding extra chrome.
 */

const SETUP_NAV = (id: string): NavItem[] => [
  { label: "Setup guide",     href: `/admin/programs/${id}`,                  icon: ClipboardCheck, exact: true },
  { label: "Curriculum",      href: `/admin/programs/${id}/curriculum`,       icon: Layers       },
  { label: "Design templates",href: `/admin/programs/${id}/design`,           icon: LayoutTemplate },
  { label: "Certificates",    href: `/admin/programs/${id}/certificates`,     icon: Award        },
  { label: "Information",     href: `/admin/programs/${id}/information`,      icon: Info         },
];

const SALES_NAV = (id: string): NavItem[] => [
  { label: "Pricing",      href: `/admin/programs/${id}/pricing`,      icon: Tag        },
  { label: "Sales pages",  href: `/admin/programs/${id}/sales-pages`,  icon: Globe      },
  { label: "Embed",        href: `/admin/programs/${id}/embed`,        icon: Code2      },
  { label: "Coupons",      href: `/admin/programs/${id}/coupons`,      icon: Ticket     },
  { label: "Upsell funnel",href: `/admin/programs/${id}/upsell`,       icon: TrendingUp },
];

const COMMUNITY_NAV = (id: string): NavItem[] => [
  { label: "Comments", href: `/admin/programs/${id}/comments`, icon: MessageSquare  },
  { label: "Students", href: `/admin/programs/${id}/students`, icon: GraduationCap  },
  { label: "Reports",  href: `/admin/programs/${id}/reports`,  icon: BarChart3      },
];

export function ProgramNav({
  programId,
  programTitle,
  adminName,
  adminEmail,
}: {
  programId: string;
  programTitle: string;
  adminName: string;
  adminEmail: string;
}) {
  const pathname = usePathname();
  const setup     = SETUP_NAV(programId);
  const sales     = SALES_NAV(programId);
  const community = COMMUNITY_NAV(programId);

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 border-r border-ink-100 bg-cream-100">
      {/* Brand strip — links back to the Programs list. The program title
          replaces the parent "Email" surface label so the user always knows
          which program they're editing. */}
      <Link
        href="/admin/programs"
        className="px-6 py-6 hover:opacity-90 transition-opacity flex items-center gap-2 group"
        title="Back to Programs"
      >
        <ChevronLeft
          className="size-4 text-ink-400 group-hover:text-rose-600 transition-colors"
          strokeWidth={2}
          aria-hidden
        />
        <span className="font-display text-[18px] text-rose-600 leading-none truncate">
          {programTitle || "Program"}
        </span>
      </Link>

      {/* Section label */}
      <div className="px-6 mt-2 mb-3">
        <span className="text-[10.5px] uppercase tracking-[0.18em] text-rose-600 font-semibold">
          Program
        </span>
      </div>

      {/* Nav items — 3 groups separated by hairlines. */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <NavGroup items={setup}     pathname={pathname} />
        <Divider />
        <NavGroup items={sales}     pathname={pathname} />
        <Divider />
        <NavGroup items={community} pathname={pathname} />
      </nav>

      {/* Admin chip — same component-level structure as EmailNav's footer */}
      <div className="p-3 border-t border-ink-100">
        <Link
          href="/admin"
          className="flex items-center gap-3 px-2 py-2 rounded-[12px] hover:bg-cream-200/70 transition-colors"
        >
          <span className="size-9 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[12px] font-bold shrink-0">
            {initials(adminName)}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block text-[13px] font-semibold text-ink-900 truncate leading-tight">
              {adminName}
            </span>
            <span className="block text-[11.5px] text-ink-500 truncate">
              {adminEmail}
            </span>
          </span>
          <ChevronDown
            className="size-3.5 text-ink-400 shrink-0"
            strokeWidth={2}
          />
        </Link>
      </div>
    </aside>
  );
}

function NavGroup({
  items,
  pathname,
}: {
  items: NavItem[];
  pathname: string;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-[13.5px] font-medium transition-colors",
                active
                  ? "bg-rose-100 text-rose-700"
                  : "text-ink-700 hover:bg-cream-200/70 hover:text-ink-900",
              )}
            >
              <Icon
                className={cn(
                  "size-[17px] shrink-0",
                  active ? "text-rose-600" : "text-ink-500",
                )}
                strokeWidth={2}
              />
              <span className="flex-1">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Divider() {
  return <div aria-hidden className="my-3 mx-3.5 border-t border-ink-100" />;
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname.startsWith(href);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
