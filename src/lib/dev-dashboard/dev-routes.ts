import {
  LayoutDashboard,
  TriangleAlert,
  LineChart,
  UsersRound,
  ShieldCheck,
  Database,
  Bell,
  CreditCard,
  Gauge,
  ClipboardCheck,
  FileText,
  ScrollText,
  Rocket,
  Settings2,
  Flag,
  ListChecks,
} from "lucide-react";
import type { DevRoute } from "./types";

/**
 * Canonical list of dev-console routes. Used by the sidebar, the mobile
 * nav (if/when added), placeholder pages, and any breadcrumb logic.
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
    label: "Billing",
    href: "/dev/billing",
    icon: CreditCard,
    description: "Stripe webhooks, subscriptions, and revenue",
  },
  {
    label: "Performance",
    href: "/dev/performance",
    icon: Gauge,
    description: "Response times, throughput, and resource use",
  },
  {
    label: "Data Integrity",
    href: "/dev/data-integrity",
    icon: ClipboardCheck,
    description: "Schema, constraints, and consistency checks",
  },
  {
    label: "CMS Monitor",
    href: "/dev/cms-monitor",
    icon: FileText,
    description: "Content publishing and CMS-side health",
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
];

export function getDevRoute(href: string): DevRoute | undefined {
  return DEV_ROUTES.find((r) => r.href === href);
}
