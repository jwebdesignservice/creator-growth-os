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

/* ─────────────────────────────────────────────────────────────────────────
   ERRORS PAGE (/dev/errors)
   ───────────────────────────────────────────────────────────────────────── */

/* Four-level severity used throughout the errors page (cards, table, donut). */
export type ErrorSeverity = "critical" | "high" | "medium" | "low";

/* Lifecycle state for a grouped error. */
export type ErrorStatus = "open" | "investigating" | "resolved";

/* Tone for the corner icon tile on each errors metric card. */
export type ErrorMetricTone = "red" | "orange" | "green" | "blue" | "amber";

/* Top-row metric cards. `badge` is the inline pill (e.g. "High", "v1.4.2");
 * `deltaIsGood` reverses the green/red mapping for inverted metrics where
 * a downward delta is a positive outcome (e.g. Error Rate, Time to Resolution). */
export type ErrorsMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: ErrorMetricTone;
  icon: LucideIcon;
  delta: string;
  deltaDirection: "up" | "down";
  deltaIsGood: boolean;
  baseline: string;
  badge?: { label: string; tone: "danger" | "warning" | "info" | "neutral" };
  series: number[];
};

/* Error trend chart. */
export type ErrorTrendPoint = { time: string; value: number };
export type ErrorTrendChart = {
  series: ErrorTrendPoint[];
  yLabels: string[];
  yMax: number;
  /* Position (0–1) of the dashed "Latest Deploy" marker along the x-axis. */
  deployMarkerAt: number;
};

/* Severity breakdown donut. */
export type SeverityBreakdownSlice = {
  severity: ErrorSeverity;
  label: string;
  value: number;
  percent: number;
  color: string;
};
export type SeverityBreakdown = {
  total: number;
  slices: SeverityBreakdownSlice[];
};

/* Top affected services list. */
export type AffectedServiceStatus = "operational" | "degraded" | "down";
export type AffectedService = {
  key: string;
  label: string;
  errors24h: number;
  status: AffectedServiceStatus;
  icon: LucideIcon;
  tone: ServiceTone;
};

/* Highest-impact error focus card. */
export type HighestImpactError = {
  id: string;
  title: string;
  type: string;
  statusCode: number;
  route: string;
  firstSeen: string;
  lastSeen: string;
  occurrences: number;
  affectedUsers: number;
  environment: string;
  release: string;
  owner: string;
  impact: "Low" | "Medium" | "High" | "Critical";
  suggestedNextAction: string;
};

/* Grouped errors table row. */
export type GroupedErrorRow = {
  id: string;
  message: string;
  source: string;
  route: string;
  severity: ErrorSeverity;
  status: ErrorStatus;
  occurrences: number;
  affectedUsers: number;
  release: string;
  lastSeen: string;
  owner: string;
};

/* Active incidents list. */
export type ActiveIncident = {
  id: string;
  title: string;
  severity: ErrorSeverity;
};

/* Stack trace preview — array of source lines, with the matching file path. */
export type StackTraceFrame = string;
export type StackTracePreview = {
  filePath: string;
  lines: StackTraceFrame[];
};

/* ─────────────────────────────────────────────────────────────────────────
   USERS PAGE (/dev/users)
   ───────────────────────────────────────────────────────────────────────── */

export type UsersMetricTone = "blue" | "green" | "amber";

/* Top metric tiles. Value-with-sparkline tiles in the strip above the filter row. */
export type UsersMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: UsersMetricTone;
  delta: string;
  deltaDirection: "up" | "down";
  deltaIsGood: boolean;
  baseline: string;
  series: number[];
};

/* User Growth & Activity Trends — three-series line chart. */
export type UserGrowthSeriesKey = "total" | "active" | "signups";
export type UserGrowthSeries = {
  key: UserGrowthSeriesKey;
  label: string;
  color: string;
  values: number[];
};
export type UserGrowthChart = {
  xLabels: string[];
  yLabels: string[];
  yMax: number;
  series: UserGrowthSeries[];
};

/* Plan distribution donut. */
export type PlanSlice = {
  key: "free" | "basic" | "pro" | "admin";
  label: string;
  value: number;
  percent: number;
  color: string;
};
export type PlanDistribution = {
  total: number;
  slices: PlanSlice[];
};

/* User status breakdown — horizontal progress rows. */
export type UserStatusKey = "active" | "trialing" | "inactive" | "suspended" | "flagged";
export type UserStatusRow = {
  key: UserStatusKey;
  label: string;
  percent: number;
  color: string;
};

/* Ranked user segments list. */
export type UserSegmentRow = {
  rank: number;
  label: string;
  count: number;
};

/* Onboarding funnel. */
export type OnboardingFunnelStage = {
  key: string;
  label: string;
  count: number;
  /** Drop-off vs the previous stage, as a percentage. Null on the first stage. */
  dropOffPercent: number | null;
};

/* Regional usage ranked list. */
export type RegionalUsageRow = {
  rank: number;
  label: string;
  percent: number;
  count: number;
};

/* Needs attention items. */
export type AttentionTone = "warning" | "danger" | "info";
export type AttentionItem = {
  id: string;
  message: string;
  tone: AttentionTone;
};

/* Retention & engagement stat rows. */
export type RetentionStat = {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
};

/* Top user health rows (with status dot). */
export type UserHealthTone = "success" | "warning" | "danger";
export type UserHealthRow = {
  key: string;
  label: string;
  percent: string;
  tone: UserHealthTone;
};

/* Highest value segment summary. */
export type HighestValueSegment = {
  label: string;
  icon: LucideIcon;
  accounts: number;
  avgRetentionPercent: number;
  avgSessionDuration: string;
};

/* Recent user activity table. */
export type UserActivityPlan = "Free" | "Basic" | "Pro" | "Trial";
export type UserActivityStatus = "Active" | "Flagged" | "Suspended" | "Trialing";
export type UserActivityRow = {
  id: string;
  time: string;
  event: string;
  user: string;
  email: string;
  plan: UserActivityPlan;
  status: UserActivityStatus;
  source: string;
  region: string;
};

/* ─────────────────────────────────────────────────────────────────────────
   AUTH PAGE (/dev/auth)
   ───────────────────────────────────────────────────────────────────────── */

export type AuthMetricTone = "blue" | "green" | "amber" | "red";

/* Top metric tiles. Value-with-sparkline cards in the strip above the filter row. */
export type AuthMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: AuthMetricTone;
  icon: LucideIcon;
  delta: string;
  deltaDirection: "up" | "down";
  deltaIsGood: boolean;
  baseline: string;
  series: number[];
};

/* Auth Activity Trends — multi-series line chart (Sign Ins / Sign Ups / Failed). */
export type AuthActivitySeriesKey = "signIns" | "signUps" | "failed";
export type AuthActivitySeries = {
  key: AuthActivitySeriesKey;
  label: string;
  color: string;
  values: number[];
};
export type AuthActivityChart = {
  xLabels: string[];
  yLabels: string[];
  yMax: number;
  series: AuthActivitySeries[];
};

/* Provider Breakdown donut. */
export type AuthProviderKey = "email" | "google" | "apple" | "magic" | "other";
export type AuthProviderSlice = {
  key: AuthProviderKey;
  label: string;
  percent: number;
  color: string;
};
export type AuthProviderBreakdown = {
  slices: AuthProviderSlice[];
};

/* Session health rows — horizontal progress bars. */
export type SessionHealthKey = "active" | "expired" | "revoked" | "idle" | "invalid";
export type SessionHealthRow = {
  key: SessionHealthKey;
  label: string;
  percent: number;
  color: string;
};

/* Signup funnel stages. */
export type SignupFunnelStage = {
  key: string;
  label: string;
  count: number;
  /** Drop-off vs the previous stage, as a percentage. Null on the first stage. */
  dropOffPercent: number | null;
};

/* Failed login reasons (horizontal bar list). */
export type FailedLoginReason = {
  key: string;
  label: string;
  percent: number;
};

/* Security signals (alert-style rows). */
export type SecuritySignalTone = "danger" | "warning" | "info";
export type SecuritySignal = {
  id: string;
  message: string;
  tone: SecuritySignalTone;
};

/* Auth route health table. */
export type AuthRouteStatus = "Healthy" | "Warning" | "Critical";
export type AuthRouteRow = {
  route: string;
  status: AuthRouteStatus;
  p95Ms: number;
};

/* Regional sign-in activity ranked list. */
export type RegionalSignInRow = {
  rank: number;
  label: string;
  percent: number;
  count: number;
};

/* Recent auth events table. */
export type AuthEventStatusKind = "success" | "tracked" | "danger" | "warning";
export type AuthEventDevice = "Desktop" | "Mobile" | "Tablet";
export type AuthEventRow = {
  id: string;
  time: string;
  event: string;
  user: string;
  provider: string;
  route: string;
  device: AuthEventDevice;
  statusLabel: string;
  statusKind: AuthEventStatusKind;
};

/* ─────────────────────────────────────────────────────────────────────────
   LOGS PAGE (/dev/logs)
   ───────────────────────────────────────────────────────────────────────── */

export type LogsMetricTone = "blue" | "green" | "amber" | "red";

/* Top metric tiles. Value-with-sparkline cards in the strip above the filter row. */
export type LogsMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: LogsMetricTone;
  icon: LucideIcon;
  delta: string;
  deltaDirection: "up" | "down";
  deltaIsGood: boolean;
  baseline: string;
  series: number[];
};

/* Live log stream — single row in the main left-side table. */
export type LiveLogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";
export type LiveLogRow = {
  id: string;
  time: string;
  level: LiveLogLevel;
  service: string;
  source: string;
  message: string;
  traceId: string;
  user: string | null;
  route: string;
  duration: string;
};

/* Log volume by level — stacked-area chart payload. */
export type LogVolumeLevelKey = "info" | "warn" | "error";
export type LogVolumeSeries = {
  key: LogVolumeLevelKey;
  label: string;
  color: string;
  values: number[];
};
export type LogVolumeChart = {
  xLabels: string[];
  yLabels: string[];
  yMax: number;
  series: LogVolumeSeries[];
};

/* Services Generating Most Logs — horizontal bar list. */
export type ServiceLogVolumeRow = {
  key: string;
  label: string;
  countLabel: string; // e.g. "2.1M"
  percent: number;    // 0–100
};

/* Saved Views / Quick Filters list. */
export type SavedViewTone = "danger" | "info" | "success" | "warning" | "neutral";
export type SavedViewRow = {
  key: string;
  label: string;
  icon: LucideIcon;
  tone: SavedViewTone;
};

/* Selected log details — wide inspector panel below the log stream. */
export type SelectedLogDetail = {
  id: string;
  level: LiveLogLevel;
  timestamp: string;
  service: string;
  environment: string;
  route: string;
  traceId: string;
  requestId: string;
  userId: string;
  statusCode: number;
  duration: string;
  message: string;
  stackTrace: string[];
};

/* Recent trace groups — full-width compact table at the bottom. */
export type TraceGroupStatus = "Error" | "Warn" | "OK";
export type TraceGroupRow = {
  id: string;
  traceId: string;
  serviceCount: number;
  status: TraceGroupStatus;
  duration: string;
  lastSeen: string;
};

/* ─────────────────────────────────────────────────────────────────────────
   PERFORMANCE PAGE (/dev/performance)
   ───────────────────────────────────────────────────────────────────────── */

export type PerfMetricTone = "blue" | "green" | "amber" | "red";

/* Top metric tiles. */
export type PerfMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: PerfMetricTone;
  icon: LucideIcon;
  delta: string;
  deltaDirection: "up" | "down";
  deltaIsGood: boolean;
  baseline: string;
  series: number[];
};

/* Response time over time — multi-line chart (p50/p95/p99). */
export type PerfLatencySeriesKey = "p50" | "p95" | "p99";
export type PerfLatencySeries = {
  key: PerfLatencySeriesKey;
  label: string;
  color: string;
  values: number[];
};
export type PerfLatencyChart = {
  xLabels: string[];
  yLabels: string[];
  yMax: number;
  series: PerfLatencySeries[];
};

/* Requests throughput — single-series line chart. */
export type PerfThroughputChart = {
  xLabels: string[];
  yLabels: string[];
  yMax: number;
  values: number[];
};

/* Top slowest routes — micro horizontal bar list. */
export type PerfSlowestRouteRow = {
  key: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  p95Ms: number;
};

/* Apdex score summary. */
export type ApdexBand = "Excellent" | "Good" | "Fair" | "Poor" | "Unacceptable";
export type ApdexSummary = {
  score: number;        // 0–1
  band: ApdexBand;
  delta: string;        // e.g. "-0.04"
  deltaDirection: "up" | "down";
  deltaIsGood: boolean;
  baseline: string;     // e.g. "vs prev 24h"
};

/* Resource usage — horizontal progress bars. */
export type ResourceUsageKey = "cpu" | "memory" | "disk" | "network";
export type ResourceUsageRow = {
  key: ResourceUsageKey;
  label: string;
  percent: number;
  tone: "blue" | "amber" | "red";
};

/* Error rate over time — small line chart. */
export type PerfErrorRateChart = {
  xLabels: string[];
  yLabels: string[];     // e.g. "0%", "0.25%", "0.50%", "0.79%", "1.00%"
  yMax: number;          // percentage as a number, e.g. 1
  values: number[];      // each point as a percent (0–1)
};

/* Largest DB queries — micro horizontal bar list. */
export type PerfDbQueryRow = {
  key: string;
  query: string;
  p95Ms: number;
};

/* Service performance overview — bottom table. */
export type ServicePerfStatus = "Healthy" | "Degraded" | "Down";
export type ServicePerfRow = {
  key: string;
  service: string;
  requestsPerMin: number | null;  // null when N/A (e.g. database has no rpm)
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  errorRatePercent: number;
  apdex: number;
  cpuPercent: number;
  memoryPercent: number;
  status: ServicePerfStatus;
};

/* ─────────────────────────────────────────────────────────────────────────
   QA CHECKLIST PAGE (/dev/qa-checklist)
   ───────────────────────────────────────────────────────────────────────── */

export type QaMetricTone = "blue" | "green" | "amber" | "red";

/** Top-strip summary card. `donutPercent` switches the corner glyph from an
 *  icon tile to a circular readiness ring (used for "Release Readiness"). */
export type QaMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: QaMetricTone;
  icon: LucideIcon;
  /** Supporting note under the value (e.g. "↑ 7 from last run"). */
  note: string;
  /** Tone applied to `note`. Use "neutral" for non-delta copy. */
  noteTone: "success" | "warning" | "danger" | "neutral";
  /** When present, replaces the corner icon tile with a donut at this %. */
  donutPercent?: number;
};

/** A single grouped QA area row on the left column. */
export type QaAreaStatusCounts = {
  passed: number;
  needsReview: number;
  blockers: number;
  pending: number;
};
export type QaGroupedArea = {
  key: string;
  /** Single-letter prefix shown before the title — A, B, C, …               */
  letter: string;
  title: string;
  completed: number;
  total: number;
  counts: QaAreaStatusCounts;
};

/** Release readiness focus card (right column). */
export type QaReleaseReadiness = {
  percent: number;
  headline: string;
  body: string;
  lastRun: string;
  release: string;
};

/** Blocker severity used by the blockers card and the readiness chart. */
export type QaBlockerSeverity = "high" | "medium" | "low";
export type QaBlocker = {
  id: string;
  title: string;
  severity: QaBlockerSeverity;
};

/** Progress-by-area row on the right column. */
export type QaProgressByAreaRow = {
  key: string;
  label: string;
  percent: number;
};

/** Recent-activity / sign-off row. */
export type QaActivityKind =
  | "passed"
  | "review"
  | "run-created"
  | "blocker-added";
export type QaActivityRow = {
  id: string;
  actorInitials: string;
  actorName: string;
  /** Compact sentence describing the activity. */
  message: string;
  timeLabel: string;
  kind: QaActivityKind;
};

/** Release notes bullet list. */
export type QaReleaseNote = {
  label: string;
  value: string;
};

/** Filter defaults for the page-level filter bar. */
export type QaFiltersState = {
  release: string;
  status: string;
  owner: string;
  environment: string;
  view: string;
};

/** Per-check lifecycle status. Used by qa_check_results, the activity log,
 *  and the inline status menu on expanded area rows. */
export type QaCheckStatus = "pending" | "passed" | "review" | "blocker";

/** Single check inside an expanded area row. */
export type QaCheckResultRow = {
  id: string;
  areaKey: string;
  title: string;
  ownerTeam: string | null;
  status: QaCheckStatus;
  severity: QaBlockerSeverity;
};

/** Grouped area with the underlying check rows attached. The current
 *  GroupedAreasList renders only the summary; the page passes `checks`
 *  through so the server can expand a row in place via URL state. */
export type QaGroupedAreaWithChecks = QaGroupedArea & {
  checks: QaCheckResultRow[];
};

/* ─────────────────────────────────────────────────────────────────────────
   SUPPORT PAGE (/dev/support)
   ───────────────────────────────────────────────────────────────────────── */

export type SupportMetricTone = "blue" | "red" | "green" | "amber" | "violet";

/* Top metric tiles. Value-with-sparkline cards in the strip above the filter row. */
export type SupportMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: SupportMetricTone;
  icon: LucideIcon;
  delta: string;
  deltaDirection: "up" | "down";
  deltaIsGood: boolean;
  baseline: string;
  series: number[];
};

/* Lifecycle status for a support ticket. */
export type SupportTicketStatus =
  | "open"
  | "in-progress"
  | "investigating"
  | "waiting-client"
  | "escalated"
  | "resolved";

/* Priority used by the queue table, the details panel, and the escalations list. */
export type SupportTicketPriority = "high" | "medium" | "low";

/* Single row in the queue table on the left. */
export type SupportQueueRow = {
  id: string;
  client: string;
  subject: string;
  category: string;
  priority: SupportTicketPriority;
  status: SupportTicketStatus;
  assigneeInitials: string;
  assigneeName: string;
  assigneeTone: "blue" | "green" | "amber" | "violet" | "rose" | "cyan";
  lastUpdate: string;
};

/* Details panel (center column) — the currently-selected ticket. */
export type SupportTicketDetails = {
  id: string;
  title: string;
  client: string;
  clientSupportId: string;
  account: string;
  workspace: string;
  status: SupportTicketStatus;
  source: "Web Portal" | "Email" | "API" | "Chat";
  issueSummary: string;
  reproductionNotes: string[];
  priority: SupportTicketPriority;
  slaDeadline: string;
  slaTimeLeft: string;
  affectedArea: string;
  internalNotes: string;
  /** Inline status/assign/CSAT menus need these — fall back to null for
   *  mock data that doesn't track them. */
  assigneeUserId: string | null;
  assigneeName: string;
  csatRating: number | null;
};

/* Right column — client profile + quick actions list. */
export type SupportClientAccountHealth = "Healthy" | "At Risk" | "Critical";
export type SupportClientPlan = "Free" | "Basic" | "Pro" | "Enterprise";

export type SupportClientProfile = {
  client: string;
  supportId: string;
  plan: SupportClientPlan;
  accountHealth: SupportClientAccountHealth;
  company: string;
  contactEmail: string;
  productArea: string;
  previousTicketsTotal: number;
  previousTicketsOpen: number;
  lastActivity: string;
};

/* Communication timeline event. */
export type SupportTimelineKind =
  | "internal-note"
  | "sla-update"
  | "client-reply"
  | "reply";

export type SupportTimelineEvent = {
  id: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorTone: "blue" | "green" | "amber" | "violet" | "rose" | "cyan" | "neutral";
  kind: SupportTimelineKind;
  message: string;
  timeLabel: string;
};

/* Escalation row — bottom escalations card. */
export type SupportEscalationState =
  | "Escalated to Engineering"
  | "Awaiting Client Reply"
  | "Awaiting Internal Review";

export type SupportEscalationRow = {
  ticketId: string;
  subject: string;
  priority: SupportTicketPriority;
  escalationState: SupportEscalationState;
  timeAtRisk: string;
};

/* SLA performance donut. */
export type SupportSlaBucketKey = "met" | "breached" | "at-risk";

export type SupportSlaBucket = {
  key: SupportSlaBucketKey;
  label: string;
  count: number;
  percent: number;
  color: string;
};

export type SupportSlaSummary = {
  totalTickets: number;
  metPercent: number;
  buckets: SupportSlaBucket[];
};

/* Filter row defaults (static UI for now). */
export type SupportFiltersState = {
  priority: string;
  status: string;
  category: string;
  assignee: string;
  timeframe: string;
};

/* Pagination summary for the queue table. */
export type SupportQueuePagination = {
  showingFrom: number;
  showingTo: number;
  total: number;
  currentPage: number;
  totalPages: number;
};

/* ─────────────────────────────────────────────────────────────────────────
   SUPPORT TICKET DETAIL PAGE (/dev/support/[ticketId])
   ───────────────────────────────────────────────────────────────────────── */

/** Top summary strip on the detail page. Combines core ticket fields with
 *  operational SLA metadata so the dev/support team can scan the state of
 *  the ticket without scrolling. */
export type SupportTicketSummary = {
  id: string;
  subject: string;
  client: string;
  clientSupportId: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: string;
  assignee: { name: string; initials: string; tone: SupportQueueRow["assigneeTone"] };
  createdAt: string;     // formatted, e.g. "20 May 2025, 10:14"
  lastUpdatedAt: string; // relative, e.g. "2m ago"
  slaDeadline: string;   // formatted
  slaRemaining: string;  // e.g. "3h 17m"
  accountPlan: SupportClientPlan;
};

/** What the client submitted. Surfaces the user's exact words and the
 *  attachments the dev team needs to triage quickly. */
export type SupportAttachment = {
  name: string;
  /** Free-form size label, e.g. "248 KB" — already formatted server-side. */
  sizeLabel: string;
  /** Mime hint for picking the right icon. */
  kind: "image" | "text" | "log" | "video" | "other";
};

export type SupportClientSubmission = {
  submittedByName: string;
  submittedByCompany: string;
  contactEmail: string;
  affectedProductArea: string;
  environment: string;
  issueSummary: string;
  reproductionSteps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  attachments: SupportAttachment[];
  browser: string;
  submittedVia: string;
};

/** Internal investigation panel — visible only to the dev team. */
export type SupportInvestigationNotes = {
  notes: string[];
  affectedService: string;
  suspectedSeverity: SupportTicketPriority;
  occurrences24h: number;
  affectedAccounts: number;
};

/** Right-sidebar client profile (richer than the list-page version — keeps
 *  list-page card uncoupled). */
export type SupportClientProfileDetail = {
  company: string;
  accountHealth: SupportClientAccountHealth;
  plan: SupportClientPlan;
  previousTicketsTotal: number;
  previousTicketsOpen: number;
  lastActivity: string;
  quickLinks: { id: string; label: string; href: string; external?: boolean }[];
};

/** Compact metadata card — environment / browser / OS / version. */
export type SupportTicketMetadata = {
  source: string;
  productArea: string;
  region: string;
  appVersion: string;
  browser: string;
  operatingSystem: string;
};

/** Conversation thread entry. Visually keyed off `kind`. */
export type SupportConversationKind =
  | "client-reply"
  | "support-reply"
  | "internal-note"
  | "system-update";

export type SupportConversationEntry = {
  id: string;
  kind: SupportConversationKind;
  authorName: string;
  /** Optional sub-label shown next to the author (e.g. "Acme Corp"). */
  authorContext?: string;
  message: string;
  timeLabel: string;
  /** ISO timestamp — when present, the conversation row uses a
   *  live-updating relative time component instead of the static label. */
  createdAtIso?: string;
};

/** Resolution stages — fixed five-step flow. */
export type SupportResolutionStageKey =
  | "submitted"
  | "in-review"
  | "investigating"
  | "awaiting-fix"
  | "resolved";

export type SupportResolutionStage = {
  key: SupportResolutionStageKey;
  label: string;
  /** Timestamp at which the ticket entered this stage, blank if not yet. */
  timestamp?: string;
};

export type SupportEscalationWorkflow = {
  escalationStatus: string;
  escalationTone: "danger" | "warning" | "info" | "success";
  ownerName: string;
  ownerInitials: string;
  ownerTone: SupportQueueRow["assigneeTone"];
  nextAction: string;
  incidentLink: { id: string; href: string };
  stages: SupportResolutionStage[];
  /** Index of the currently-active stage (0-based). */
  currentStageIndex: number;
};

/** Related issues card row. */
export type SupportRelatedIssueStatus = "open" | "investigating" | "resolved";
export type SupportRelatedIssue = {
  id: string;
  subject: string;
  status: SupportRelatedIssueStatus;
  href: string;
};

/** SLA risk ring card. */
export type SupportSlaRisk = {
  percent: number;
  label: "Healthy" | "At Risk" | "Breached";
  /** Headline sentence shown next to the ring. */
  headline: string;
  /** Time remaining on the SLA clock. */
  timeRemaining: string;
};

/** Composite shape served by the (mock) loader. */
export type SupportTicketDetailBundle = {
  summary: SupportTicketSummary;
  submission: SupportClientSubmission;
  investigation: SupportInvestigationNotes;
  clientProfile: SupportClientProfileDetail;
  metadata: SupportTicketMetadata;
  conversation: SupportConversationEntry[];
  workflow: SupportEscalationWorkflow;
  relatedIssues: SupportRelatedIssue[];
  slaRisk: SupportSlaRisk;
};

/* ─────────────────────────────────────────────────────────────────────────
   DATABASE PAGE (/dev/database)
   ───────────────────────────────────────────────────────────────────────── */

/** Tone for the top metric tile (icon-tile + sparkline color). */
export type DatabaseMetricTone = "blue" | "green" | "amber" | "orange" | "red";

/** Top-strip metric card. `value` may be a status word ("Healthy") or a
 *  number/duration. When `statusLabel` is present, it renders as a pill
 *  instead of a sparkline delta — used by "Database Status". */
export type DatabaseMetricCard = {
  key: string;
  label: string;
  value: string;
  tone: DatabaseMetricTone;
  icon: LucideIcon;
  /** Optional pill — when set, the delta row is replaced by this label. */
  statusLabel?: string;
  /** Optional note rendered under the value (e.g. "All connections stable"). */
  note?: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  deltaIsGood?: boolean;
  baseline?: string;
  series: number[];
};

/* ── Filter / control row ──────────────────────────────────────────────── */

export type DatabaseFiltersState = {
  table: string;        // "All tables", "profiles", "subscriptions", …
  queryType: string;    // "All query types", "SELECT", "INSERT", …
  status: string;       // "All statuses", "Success", "Warning", …
  environment: string;  // "Production" | "Staging" | …
  timeframe: string;    // "Last 24 hours" | "Last 7 days" | …
};

/* ── Query Performance Over Time chart ─────────────────────────────────── */

export type DbQueryPerfSeriesKey = "avg" | "p95" | "failed";
export type DbQueryPerfSeries = {
  key: DbQueryPerfSeriesKey;
  label: string;
  color: string;
  values: number[];
};
export type DbQueryPerfChart = {
  xLabels: string[];
  yLabels: string[];
  yMax: number;
  series: DbQueryPerfSeries[];
};

/* ── Table Activity ────────────────────────────────────────────────────── */

export type DbTableActivityStatus =
  | "Healthy"
  | "High activity"
  | "Warning"
  | "Critical";
export type DbTableActivityRow = {
  table: string;
  reads: number;
  writes: number;
  rowCount: number;
  status: DbTableActivityStatus;
};

/* ── Slowest Queries ───────────────────────────────────────────────────── */

export type DbSlowQueryRow = {
  key: string;
  /** Truncated query — full query lives in the events log. */
  query: string;
  p95Ms: number;
};

/* ── RLS / Policy Monitor ──────────────────────────────────────────────── */

export type DbRlsPolicyStatus = "Healthy" | "Warning" | "Review" | "Restricted";
export type DbRlsPolicyRow = {
  key: string;
  label: string;
  status: DbRlsPolicyStatus;
};

/* ── Migration Status ──────────────────────────────────────────────────── */

export type DbMigrationStatusKind = "Applied" | "Pending" | "Failed";
export type DbMigrationStatus = {
  latestMigration: string;
  status: DbMigrationStatusKind;
  lastRun: string;
  pendingCount: number;
  failedCount: number;
};

/* ── Storage Bucket Status ─────────────────────────────────────────────── */

export type DbStorageBucketStatus = "Healthy" | "Warning" | "Critical";
export type DbStorageBucketRow = {
  bucket: string;
  status: DbStorageBucketStatus;
  size: string;        // "1.8GB"
  /** Used % for the soft fill bar — 0-100. */
  usagePercent: number;
};

/* ── RPC / Functions Health ────────────────────────────────────────────── */

export type DbRpcStatus = "Healthy" | "Warning" | "Critical";
export type DbRpcRow = {
  fn: string;
  status: DbRpcStatus;
  avgMs: number;
};

/* ── Database Integrity Warnings ───────────────────────────────────────── */

export type DbIntegrityTone = "warning" | "danger" | "info";
export type DbIntegrityWarning = {
  id: string;
  message: string;
  tone: DbIntegrityTone;
};

/* ── Recent Database Events table ──────────────────────────────────────── */

export type DbEventStatusKind = "success" | "warning" | "danger" | "info";
export type DbEventType =
  | "SELECT"
  | "INSERT"
  | "UPDATE"
  | "DELETE"
  | "RPC"
  | "UPLOAD"
  | "MIGRATION"
  | "OTHER";
export type DbEventRow = {
  id: string;
  time: string;
  event: string;       // e.g. "query_completed", "rls_denied", …
  source: string;      // table or function name
  type: DbEventType;
  duration: string;    // pre-formatted ("82ms", "1.24s")
  statusLabel: string;
  statusKind: DbEventStatusKind;
  details: string;
};
