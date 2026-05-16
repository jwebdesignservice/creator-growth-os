import type { LucideIcon } from "lucide-react";

/* ── Shell / nav ─────────────────────────────────────────────────────────── */
export type DevRoute = {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

/* ── Topbar ──────────────────────────────────────────────────────────────── */
export type DevEnvironment = {
  environment: "Production" | "Staging" | "Preview" | "Development";
  region: string;
  version: string;
  branch: string;
  commit: string;
};

export type DevUser = {
  name: string;
  initials: string;
  role: string;
};

/* ── System health ───────────────────────────────────────────────────────── */
export type ServiceStatus = "operational" | "degraded" | "down" | "maintenance";

export type ServiceTone = "blue" | "purple" | "green" | "amber" | "cyan" | "rose" | "pink" | "violet";

export type SystemService = {
  key: string;
  label: string;
  status: ServiceStatus;
  tone: ServiceTone;
  icon: LucideIcon;
};

/* ── Metric cards ────────────────────────────────────────────────────────── */
export type MetricTone = "blue" | "green" | "red" | "amber" | "purple" | "cyan";

export type MetricCard = {
  key: string;
  label: string;
  value: string;
  delta: number;       // signed percentage or absolute, sign drives color
  deltaUnit?: string;  // e.g. "%", "ms", "" — appended after `delta`
  deltaBaseline: string;
  series: number[];
  tone: MetricTone;
};

/* ── Critical alerts ─────────────────────────────────────────────────────── */
export type AlertSeverity = "high" | "medium" | "low";

export type CriticalAlert = {
  id: string;
  message: string;
  severity: AlertSeverity;
  timeLabel: string;
};

/* ── Errors breakdown ────────────────────────────────────────────────────── */
export type ErrorBreakdownSlice = {
  label: string;
  value: number;
  percent: number;
  color: string;
};

export type ErrorBreakdown = {
  total: number;
  slices: ErrorBreakdownSlice[];
};

/* ── Top error card ──────────────────────────────────────────────────────── */
export type TopError = {
  id: string;
  type: string;
  statusCode: number;
  message: string;
  occurrences: number;
  affectedUsers: number;
  timeLabel: string;
};

/* ── Usage chart ─────────────────────────────────────────────────────────── */
export type UsageChart = {
  series: number[];
  timeLabels: string[];
  yMax: number;
  yLabels: string[];
};

/* ── Database health ─────────────────────────────────────────────────────── */
export type DatabaseHealth = {
  connection: "Healthy" | "Degraded" | "Down";
  activeConnections: number;
  slowQueries: number;
  failedQueries: number;
  replicationLag: string;
};

/* ── Deployment ──────────────────────────────────────────────────────────── */
export type DeploymentStatus = {
  state: "Successful" | "Failed" | "In Progress";
  deployedBy: string;
  timeLabel: string;
  duration: string;
  version: string;
  commit: string;
};

/* ── QA readiness ────────────────────────────────────────────────────────── */
export type QaCheckItem = {
  label: string;
  passing: boolean;
};

export type QaReadiness = {
  score: number; // 0–100
  checks: QaCheckItem[];
};

/* ── Logs table ──────────────────────────────────────────────────────────── */
export type LogLevel = "ERROR" | "WARN" | "INFO";

export type LogEntry = {
  id: string;
  time: string;
  level: LogLevel;
  source: string;
  message: string;
  user: string | null;
  route: string | null;
};
