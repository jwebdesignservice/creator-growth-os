import {
  Monitor,
  Server,
  Database,
  Lock,
  HardDrive,
  Bell,
  CreditCard,
} from "lucide-react";
import type {
  CriticalAlert,
  DatabaseHealth,
  DeploymentStatus,
  DevEnvironment,
  DevUser,
  ErrorBreakdown,
  LogEntry,
  MetricCard,
  QaReadiness,
  SystemService,
  TopError,
  UsageChart,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Centralized mock data for the Dev Dashboard.
   Replace the exports below with real data sources (Supabase queries,
   Stripe API, log aggregator, deployment provider, etc.) when wiring up
   the backend. Keep the shapes the same — components depend on them.
   ───────────────────────────────────────────────────────────────────────── */

/* ── Topbar ──────────────────────────────────────────────────────────────── */
export const DEV_ENV: DevEnvironment = {
  environment: "Production",
  region: "EU West (Oslo)",
  version: "v1.4.2",
  branch: "main",
  commit: "a1b2c3d",
};

export const DEV_USER: DevUser = {
  name: "Deividas B.",
  initials: "DB",
  role: "Developer",
};

export const DEV_NOTIFICATION_COUNT = 12;

/* ── Overall + service health strip ──────────────────────────────────────── */
export const SYSTEM_OVERALL_STATUS: "operational" | "degraded" | "down" = "operational";

export const SYSTEM_SERVICES: SystemService[] = [
  { key: "frontend",      label: "Frontend",      status: "operational", tone: "blue",   icon: Monitor },
  { key: "backend",       label: "Backend (API)", status: "operational", tone: "purple", icon: Server },
  { key: "database",      label: "Database",      status: "operational", tone: "green",  icon: Database },
  { key: "auth",          label: "Auth System",   status: "operational", tone: "amber",  icon: Lock },
  { key: "storage",       label: "Storage",       status: "operational", tone: "cyan",   icon: HardDrive },
  { key: "notifications", label: "Notifications", status: "operational", tone: "rose",   icon: Bell },
  { key: "payments",      label: "Payments",      status: "operational", tone: "amber",  icon: CreditCard },
];

/* ── Key metric cards (six tiles) ────────────────────────────────────────── */
export const METRIC_CARDS: MetricCard[] = [
  {
    key: "active-users",
    label: "Active Users (Now)",
    value: "124",
    delta: 18.2,
    deltaUnit: "%",
    deltaBaseline: "vs last 30 min",
    series: [80, 92, 88, 102, 96, 110, 118, 124, 120, 124],
    tone: "blue",
  },
  {
    key: "requests-24h",
    label: "Requests (24h)",
    value: "52,389",
    delta: 12.5,
    deltaUnit: "%",
    deltaBaseline: "vs yesterday",
    series: [32, 40, 36, 48, 42, 55, 50, 62, 58, 70, 64, 60],
    tone: "blue",
  },
  {
    key: "error-rate",
    label: "Error Rate (24h)",
    value: "0.23%",
    delta: -0.08,
    deltaUnit: "%",
    deltaBaseline: "vs yesterday",
    series: [0.6, 0.55, 0.5, 0.48, 0.42, 0.4, 0.36, 0.32, 0.3, 0.27, 0.25, 0.23],
    tone: "red",
  },
  {
    key: "avg-response",
    label: "Avg. Response Time",
    value: "182",
    delta: -24,
    deltaUnit: "ms",
    deltaBaseline: "vs yesterday",
    series: [220, 210, 200, 215, 205, 195, 198, 190, 184, 180, 182],
    tone: "green",
  },
  {
    key: "sign-ups",
    label: "Sign Ups (24h)",
    value: "89",
    delta: 7.2,
    deltaUnit: "%",
    deltaBaseline: "vs yesterday",
    series: [40, 48, 52, 50, 58, 62, 68, 74, 78, 84, 89],
    tone: "blue",
  },
  {
    key: "revenue-mrr",
    label: "Revenue (MRR)",
    value: "€8,642",
    delta: 15.3,
    deltaUnit: "%",
    deltaBaseline: "vs last month",
    series: [4800, 5100, 5500, 5800, 6200, 6800, 7100, 7600, 8000, 8400, 8642],
    tone: "blue",
  },
];

/* ── Critical alerts ─────────────────────────────────────────────────────── */
export const CRITICAL_ALERTS: CriticalAlert[] = [
  {
    id: "alert-1",
    message: "High error rate on /api/notifications",
    severity: "high",
    timeLabel: "2m ago",
  },
  {
    id: "alert-2",
    message: "Failed payments webhook errors",
    severity: "high",
    timeLabel: "15m ago",
  },
  {
    id: "alert-3",
    message: "Database slow query detected",
    severity: "medium",
    timeLabel: "32m ago",
  },
];

/* ── Errors (24h) donut breakdown ────────────────────────────────────────── */
export const ERROR_BREAKDOWN: ErrorBreakdown = {
  total: 128,
  slices: [
    { label: "Frontend", value: 45, percent: 35, color: "var(--dev-chart-rose)" },
    { label: "Backend",  value: 32, percent: 25, color: "var(--dev-chart-amber)" },
    { label: "Database", value: 18, percent: 14, color: "var(--dev-chart-green)" },
    { label: "Auth",     value: 14, percent: 11, color: "var(--dev-chart-blue)" },
    { label: "Payments", value: 11, percent: 9,  color: "var(--dev-chart-pink)" },
    { label: "Other",    value: 8,  percent: 6,  color: "var(--dev-chart-violet)" },
  ],
};

/* ── Top error ───────────────────────────────────────────────────────────── */
export const TOP_ERROR: TopError = {
  id: "ERR-5042",
  type: "Server Error",
  statusCode: 500,
  message: "Failed to fetch /api/notifications",
  occurrences: 42,
  affectedUsers: 18,
  timeLabel: "2m ago",
};

/* ── Usage Overview (24h) ────────────────────────────────────────────────── */
export const USAGE_CHART: UsageChart = {
  series: [
    1600, 1450, 1380, 1300, 1250, 1280, 1500, 1700, 1900, 2100, 2400,
    2800, 3100, 3400, 3700, 4000, 4500, 5200, 5800, 5400, 5900, 4800, 4400, 4600,
  ],
  timeLabels: ["12 AM", "4 AM", "8 AM", "12 PM", "4 PM", "8 PM"],
  yMax: 6000,
  yLabels: ["0", "2K", "4K", "6K"],
};

/* ── Database health ─────────────────────────────────────────────────────── */
export const DATABASE_HEALTH: DatabaseHealth = {
  connection: "Healthy",
  activeConnections: 12,
  slowQueries: 2,
  failedQueries: 0,
  replicationLag: "≈0.2s",
};

/* ── Deployment status ───────────────────────────────────────────────────── */
export const DEPLOYMENT_STATUS: DeploymentStatus = {
  state: "Successful",
  deployedBy: "Deividas B.",
  timeLabel: "2h 14m ago",
  duration: "1m 42s",
  version: "v1.4.2",
  commit: "a1b2c3d",
};

/* ── QA readiness ────────────────────────────────────────────────────────── */
export const QA_READINESS: QaReadiness = {
  score: 92,
  checks: [
    { label: "No critical errors",      passing: true },
    { label: "All services operational", passing: true },
    { label: "Performance healthy",     passing: true },
    { label: "Data integrity clean",    passing: true },
    { label: "E2E tests passing",       passing: true },
  ],
};

/* ── Recent logs ─────────────────────────────────────────────────────────── */
export const RECENT_LOGS: LogEntry[] = [
  {
    id: "log-1",
    time: "10:41:58",
    level: "ERROR",
    source: "API",
    message: "Failed to fetch /api/notifications - 500 Internal Server Error",
    user: null,
    route: "/api/notifications",
  },
  {
    id: "log-2",
    time: "10:41:32",
    level: "WARN",
    source: "Database",
    message: "Slow query detected (1.2s) on public.missions",
    user: null,
    route: null,
  },
  {
    id: "log-3",
    time: "10:40:11",
    level: "INFO",
    source: "Auth",
    message: "User signed in successfully",
    user: "user_8f3e2a",
    route: "/auth/signin",
  },
  {
    id: "log-4",
    time: "10:39:47",
    level: "INFO",
    source: "Payments",
    message: "Stripe webhook received: invoice.payment_succeeded",
    user: "user_2a7b9c",
    route: "/api/webhooks/stripe",
  },
];
