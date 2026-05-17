import {
  LayoutDashboard,
  TriangleAlert,
  LineChart,
  UsersRound,
  ShieldCheck,
  Database,
  Bell,
  Gauge,
  ScrollText,
  Rocket,
  Settings2,
  Flag,
  ListChecks,
  Headset,
} from "lucide-react";
import type { DevRoute } from "./types";

/**
 * Canonical list of dev-console routes. Used by the sidebar, the mobile
 * nav (if/when added), placeholder pages, and any breadcrumb logic.
 *
 * Three earlier stubs were removed after a daily-usage review:
 *   • Billing       — failed Stripe webhooks already surface on /dev/errors
 *                     (Source = Payments); MRR lives on the Overview tile.
 *                     A dedicated Billing console added no daily value.
 *   • CMS Monitor   — the product isn't CMS-heavy. Admin announcements +
 *                     missions don't need their own dev monitoring page.
 *   • Data Integrity — fully overlapping with Database (schema /
 *                     constraints / consistency hooks all belong there).
 */
export const DEV_ROUTES: DevRoute[] = [
  {
    label: "Overview",
    href: "/dev",
    icon: LayoutDashboard,
    description: "Real-time system health and key metrics",
  },
  {
    label: "Errors",
    href: "/dev/errors",
    icon: TriangleAlert,
    description: "Recent application errors and stack traces",
  },
  {
    label: "Analytics",
    href: "/dev/analytics",
    icon: LineChart,
    description: "Usage, conversion, and engagement metrics",
  },
  {
    label: "Users",
    href: "/dev/users",
    icon: UsersRound,
    description: "User accounts, sessions, and activity",
  },
  {
    label: "Auth",
    href: "/dev/auth",
    icon: ShieldCheck,
    description: "Authentication providers and session health",
  },
  {
    label: "Database",
    href: "/dev/database",
    icon: Database,
    description: "Connection pool, slow queries, and replication",
  },
  {
    label: "Notifications",
    href: "/dev/notifications",
    icon: Bell,
    description: "Outbound notification delivery health",
  },
  {
    label: "Performance",
    href: "/dev/performance",
    icon: Gauge,
    description: "Response times, throughput, and resource use",
  },
  {
    label: "Logs",
    href: "/dev/logs",
    icon: ScrollText,
    description: "Live application logs across services",
  },
  {
    label: "Deployments",
    href: "/dev/deployments",
    icon: Rocket,
    description: "Build history and rollout status",
  },
  {
    label: "Config",
    href: "/dev/config",
    icon: Settings2,
    description: "Environment configuration and secrets status",
  },
  {
    label: "Feature Flags",
    href: "/dev/feature-flags",
    icon: Flag,
    description: "Rollout flags and experiment gates",
  },
  {
    label: "QA Checklist",
    href: "/dev/qa-checklist",
    icon: ListChecks,
    description: "Pre-release verification checklist",
  },
  {
    label: "Support",
    href: "/dev/support",
    icon: Headset,
    description: "Client support tickets, escalations, and SLA workflows",
  },
];

export function getDevRoute(href: string): DevRoute | undefined {
  return DEV_ROUTES.find((r) => r.href === href);
}
