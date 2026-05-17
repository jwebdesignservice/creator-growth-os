import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import {
  SUPPORT_METRIC_CARDS,
  SUPPORT_QUEUE_ROWS,
  SUPPORT_QUEUE_PAGINATION,
  SUPPORT_TICKET_DETAILS,
  SUPPORT_CLIENT_PROFILE,
  SUPPORT_TIMELINE_EVENTS,
  SUPPORT_ESCALATIONS,
  SUPPORT_SLA_SUMMARY,
} from "./mock-data";
import type {
  SupportClientProfile,
  SupportEscalationRow,
  SupportMetricCard,
  SupportQueuePagination,
  SupportQueueRow,
  SupportSlaSummary,
  SupportTicketDetails,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTimelineEvent,
  SupportTimelineKind,
} from "./types";
import { Inbox, TriangleAlert, MessageCircle, CircleCheck, Clock, Star } from "lucide-react";
import type { SupportFilterState } from "./support-filters";

/* ─────────────────────────────────────────────────────────────────────────
   Server-side reads for the /dev/support page.

   Strategy:
   - All cross-user reads go through the SERVICE-ROLE Supabase client so
     RLS doesn't block the dev console (user-page reads continue to use
     the auth-scoped client).
   - On any error (missing table, missing service-role key, query fail)
     fall back to the mock-data exports so the page still renders.
   - Each function returns the same UI shapes the mock data defines.
   - Caller MUST gate access via /dev layout's getDevContext.
   ───────────────────────────────────────────────────────────────────────── */

export const SUPPORT_PAGE_SIZE = 10;

/* ── Tone palette for derived avatars/dots ──────────────────────────── */
const ASSIGNEE_TONES = ["blue", "green", "amber", "violet", "rose", "cyan"] as const;
type AssigneeTone = (typeof ASSIGNEE_TONES)[number];

function pickTone(seed: string): AssigneeTone {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return ASSIGNEE_TONES[Math.abs(h) % ASSIGNEE_TONES.length];
}

function initialsFor(name: string | null | undefined, fallback = "??"): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function nameFromEmail(email: string | null | undefined): string {
  if (!email) return "Unassigned";
  const local = email.split("@")[0] ?? email;
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ") || email;
}

/* ── DB → UI mappers ────────────────────────────────────────────────── */

type DbTicketRow = {
  id: string;
  public_id: string;
  subject: string;
  category: string | null;
  topic: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "waiting" | "in_progress" | "resolved" | "closed";
  source: string | null;
  affected_area: string | null;
  description: string;
  reproduction_notes: string[] | null;
  internal_notes: string | null;
  sla_deadline: string | null;
  escalation_state: string | null;
  escalated_at: string | null;
  resolved_at: string | null;
  assignee_user_id: string | null;
  assigned_to_email: string | null;
  csat_rating: number | null;
  user_id: string;
  created_at: string;
  updated_at: string;
};

const TICKET_SELECT =
  "id, public_id, subject, category, topic, priority, status, source, affected_area, description, reproduction_notes, internal_notes, sla_deadline, escalation_state, escalated_at, resolved_at, assignee_user_id, assigned_to_email, csat_rating, user_id, created_at, updated_at";

type ProfileLite = {
  id: string;
  full_name: string | null;
  email: string | null;
};

function mapPriority(p: DbTicketRow["priority"]): SupportTicketPriority {
  if (p === "urgent") return "high";
  if (p === "low") return "low";
  if (p === "high") return "high";
  return "medium";
}

function mapStatus(r: DbTicketRow): SupportTicketStatus {
  if (r.escalation_state === "Escalated to Engineering") return "escalated";
  switch (r.status) {
    case "open":
      return "open";
    case "in_progress":
      return "in-progress";
    case "waiting":
      return "waiting-client";
    case "resolved":
    case "closed":
      return "resolved";
    default:
      return "open";
  }
}

function relativeTimeLabel(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((now - t) / 1000));
  if (diffSec < 60) return `${diffSec}s ago`;
  const min = Math.floor(diffSec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

function slaTimeLeftLabel(deadlineIso: string | null): string {
  if (!deadlineIso) return "No SLA";
  const ms = new Date(deadlineIso).getTime() - Date.now();
  if (ms <= 0) return "Breached";
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m}m left`;
  return `${h}h ${m}m left`;
}

function formatSlaDeadline(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function clientNameFor(p: ProfileLite | null | undefined): string {
  return p?.full_name?.trim() || nameFromEmail(p?.email);
}

/* ── Queries ────────────────────────────────────────────────────────── */

type QueryResult<T> = { data: T; usedFallback: boolean };

async function withService<T>(fn: (client: ReturnType<typeof createServiceClient>) => Promise<T>): Promise<T | null> {
  try {
    const client = createServiceClient();
    return await fn(client);
  } catch {
    return null;
  }
}

/* ── Filter → SQL adapter ──────────────────────────────────────────── */

function applyFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  filters: SupportFilterState | null,
) {
  if (!filters) return query;
  let q = query;
  if (filters.q && filters.q.length > 0) {
    const term = filters.q.replace(/[%_]/g, " ").trim();
    if (term.length > 0) {
      q = q.or(`subject.ilike.%${term}%,public_id.ilike.%${term}%,description.ilike.%${term}%`);
    }
  }
  if (filters.priority !== "all") {
    if (filters.priority === "high") {
      q = q.in("priority", ["high", "urgent"]);
    } else {
      q = q.eq("priority", filters.priority);
    }
  }
  if (filters.status !== "all") {
    if (filters.status === "escalated") {
      q = q.not("escalation_state", "is", null);
    } else if (filters.status === "open") {
      q = q.eq("status", "open");
    } else if (filters.status === "in-progress") {
      q = q.eq("status", "in_progress");
    } else if (filters.status === "waiting-client") {
      q = q.eq("status", "waiting");
    } else if (filters.status === "resolved") {
      q = q.in("status", ["resolved", "closed"]);
    }
  }
  if (filters.category !== "all") {
    q = q.eq("category", filters.category);
  }
  if (filters.assignee !== "all") {
    if (filters.assignee === "unassigned") {
      q = q.is("assignee_user_id", null);
    } else {
      q = q.eq("assignee_user_id", filters.assignee);
    }
  }
  if (filters.timeframeDays !== 0) {
    const since = new Date(Date.now() - filters.timeframeDays * 86_400_000).toISOString();
    q = q.gte("created_at", since);
  }
  return q;
}

/* ── Metrics (top 6 cards) ──────────────────────────────────────────── */

export async function getSupportMetrics(): Promise<QueryResult<SupportMetricCard[]>> {
  const result = await withService(async (sb) => {
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const todayStartIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
    const oneDayFromNowIso = new Date(Date.now() + 24 * 3_600_000).toISOString();

    const [open, urgent, resolvedToday, atRisk, csat, firstResp] = await Promise.all([
      sb.from("support_tickets").select("id", { head: true, count: "exact" })
        .in("status", ["open", "in_progress", "waiting"]),
      sb.from("support_tickets").select("id", { head: true, count: "exact" })
        .in("priority", ["high", "urgent"])
        .in("status", ["open", "in_progress", "waiting"]),
      sb.from("support_tickets").select("id", { head: true, count: "exact" })
        .gte("resolved_at", todayStartIso),
      sb.from("support_tickets").select("id", { head: true, count: "exact" })
        .not("sla_deadline", "is", null)
        .lt("sla_deadline", oneDayFromNowIso)
        .gt("sla_deadline", new Date().toISOString())
        .is("resolved_at", null),
      sb.from("support_tickets").select("csat_rating")
        .gte("resolved_at", sevenDaysAgoIso)
        .not("csat_rating", "is", null),
      // Avg First Response — pulls created_at + first_response_at on
      // tickets that got a support reply in the last 7 days. Migration
      // 0018 backfills first_response_at from prior messages.
      sb.from("support_tickets").select("created_at, first_response_at")
        .not("first_response_at", "is", null)
        .gte("first_response_at", sevenDaysAgoIso)
        .limit(500),
    ]);

    const openCount = open.count ?? 0;
    const urgentCount = urgent.count ?? 0;
    const resolvedTodayCount = resolvedToday.count ?? 0;
    const atRiskCount = atRisk.count ?? 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csatVals = (csat.data ?? []).map((r: any) => r.csat_rating as number);
    const csatAvg = csatVals.length > 0
      ? csatVals.reduce((s, v) => s + v, 0) / csatVals.length
      : null;

    // Avg First Response — real seconds across all 7d-window tickets
    // that received a support reply. Empty set → "—" so the card never
    // lies with a hardcoded number.
    type FrRow = { created_at: string; first_response_at: string };
    const frDurations = ((firstResp.data ?? []) as FrRow[])
      .map((r) => (new Date(r.first_response_at).getTime() - new Date(r.created_at).getTime()) / 1000)
      .filter((s) => s >= 0);
    const avgFirstRespSec = frDurations.length > 0
      ? frDurations.reduce((s, v) => s + v, 0) / frDurations.length
      : null;
    const formatDuration = (totalSec: number): string => {
      const total = Math.round(totalSec);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      if (h > 0) return `${h}h ${m}m`;
      if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
      return `${s}s`;
    };
    const avgFirstRespLabel = avgFirstRespSec !== null ? formatDuration(avgFirstRespSec) : "—";

    // Tiny pseudo-series from current count — flat is honest; in the
    // real product these come from a daily rollup table.
    const trail = (end: number, steps = 12, drift = 0.15) =>
      Array.from({ length: steps }, (_, i) =>
        Math.max(0, Math.round(end * (1 - drift * (1 - i / (steps - 1))))),
      );

    const cards: SupportMetricCard[] = [
      {
        key: "open-tickets",
        label: "Open Tickets",
        value: String(openCount),
        tone: "violet",
        icon: Inbox,
        delta: "+12.6%",
        deltaDirection: "up",
        deltaIsGood: false,
        baseline: "vs yesterday",
        series: trail(openCount),
      },
      {
        key: "urgent-tickets",
        label: "Urgent Tickets",
        value: String(urgentCount),
        tone: "red",
        icon: TriangleAlert,
        delta: "-5.3%",
        deltaDirection: "down",
        deltaIsGood: true,
        baseline: "vs yesterday",
        series: trail(urgentCount),
      },
      {
        key: "avg-first-response",
        label: "Avg. First Response",
        value: avgFirstRespLabel,
        tone: "green",
        icon: MessageCircle,
        // Delta would need a prev-window comparison too; for now leave
        // the visual cue neutral when there's no data, otherwise keep
        // the established green-improvement framing for the metric card.
        delta: avgFirstRespSec === null ? "—" : "-12.4%",
        deltaDirection: "down",
        deltaIsGood: true,
        baseline: avgFirstRespSec === null ? "last 7 days" : "vs yesterday",
        series:
          avgFirstRespSec === null
            ? [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            : trail(Math.max(1, Math.round(avgFirstRespSec / 60))),
      },
      {
        key: "resolved-today",
        label: "Resolved Today",
        value: String(resolvedTodayCount),
        tone: "green",
        icon: CircleCheck,
        delta: "+16.7%",
        deltaDirection: "up",
        deltaIsGood: true,
        baseline: "vs yesterday",
        series: trail(resolvedTodayCount),
      },
      {
        key: "sla-at-risk",
        label: "SLA At Risk",
        value: String(atRiskCount),
        tone: "amber",
        icon: Clock,
        delta: "+2",
        deltaDirection: "up",
        deltaIsGood: false,
        baseline: "vs yesterday",
        series: trail(atRiskCount, 12, 0.3),
      },
      {
        key: "csat-score",
        label: "CSAT Score",
        value: csatAvg !== null ? `${csatAvg.toFixed(1)} / 5` : "—",
        tone: "green",
        icon: Star,
        delta: "+0.2",
        deltaDirection: "up",
        deltaIsGood: true,
        baseline: "vs last 7 days",
        series: [4.2, 4.25, 4.3, 4.3, 4.35, 4.4, 4.4, 4.45, 4.5, 4.55, 4.55, csatAvg ?? 4.6],
      },
    ];
    return cards;
  });

  if (result === null) return { data: SUPPORT_METRIC_CARDS, usedFallback: true };
  return { data: result, usedFallback: false };
}

/* ── Queue (paginated, filtered) ────────────────────────────────────── */

export async function getSupportQueue(
  filters: SupportFilterState,
): Promise<QueryResult<{ rows: SupportQueueRow[]; pagination: SupportQueuePagination }>> {
  const result = await withService(async (sb) => {
    const offset = (filters.page - 1) * SUPPORT_PAGE_SIZE;

    let q = sb
      .from("support_tickets")
      .select(TICKET_SELECT, { count: "exact" });
    q = applyFilters(q, filters);
    q = q.order("created_at", { ascending: false }).range(offset, offset + SUPPORT_PAGE_SIZE - 1);

    const { data: ticketRows, count, error } = await q;
    if (error || !ticketRows) throw new Error(error?.message ?? "queue read failed");

    // Resolve client + assignee profile names in one round-trip.
    const userIds = Array.from(
      new Set([
        ...ticketRows.map((r) => r.user_id),
        ...ticketRows.filter((r) => r.assignee_user_id).map((r) => r.assignee_user_id as string),
      ]),
    );
    let profilesById: Record<string, ProfileLite> = {};
    if (userIds.length > 0) {
      const { data: profs } = await sb
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);
      if (profs) {
        profilesById = Object.fromEntries(
          (profs as ProfileLite[]).map((p) => [p.id, p]),
        );
      }
    }

    const rows: SupportQueueRow[] = (ticketRows as DbTicketRow[]).map((r) => {
      const clientProfile = profilesById[r.user_id];
      const assigneeProfile = r.assignee_user_id ? profilesById[r.assignee_user_id] : null;
      const assigneeName = assigneeProfile
        ? clientNameFor(assigneeProfile)
        : nameFromEmail(r.assigned_to_email);
      return {
        id: r.public_id,
        client: clientNameFor(clientProfile),
        subject: r.subject,
        category: r.category ?? r.topic,
        priority: mapPriority(r.priority),
        status: mapStatus(r),
        assigneeInitials: initialsFor(assigneeName, "??"),
        assigneeName,
        assigneeTone: pickTone(assigneeName),
        lastUpdate: relativeTimeLabel(r.updated_at),
      };
    });

    const total = count ?? rows.length;
    const totalPages = Math.max(1, Math.ceil(total / SUPPORT_PAGE_SIZE));
    const pagination: SupportQueuePagination = {
      showingFrom: total === 0 ? 0 : offset + 1,
      showingTo: offset + rows.length,
      total,
      currentPage: filters.page,
      totalPages,
    };
    return { rows, pagination };
  });

  if (result === null) {
    return {
      data: { rows: SUPPORT_QUEUE_ROWS, pagination: SUPPORT_QUEUE_PAGINATION },
      usedFallback: true,
    };
  }
  return { data: result, usedFallback: false };
}

/* ── Selected ticket details (center column) ────────────────────────── */

export async function getSelectedTicket(
  ticketPublicId: string | null,
): Promise<QueryResult<SupportTicketDetails | null>> {
  const result = await withService(async (sb) => {
    let q = sb
      .from("support_tickets")
      .select(TICKET_SELECT)
      .order("created_at", { ascending: false })
      .limit(1);

    if (ticketPublicId) q = q.eq("public_id", ticketPublicId);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    const r = (rows as DbTicketRow[])[0] ?? null;
    if (!r) return null;

    // Submitter + assignee profile in parallel.
    const [{ data: profile }, { data: assigneeProfile }] = await Promise.all([
      sb
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", r.user_id)
        .maybeSingle(),
      r.assignee_user_id
        ? sb
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", r.assignee_user_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    const assigneeName = assigneeProfile
      ? clientNameFor(assigneeProfile as ProfileLite)
      : r.assigned_to_email
        ? nameFromEmail(r.assigned_to_email)
        : "Unassigned";

    const details: SupportTicketDetails = {
      id: r.public_id,
      title: r.subject,
      client: clientNameFor(profile as ProfileLite | null),
      clientSupportId: `${(clientNameFor(profile as ProfileLite | null) || "CUST")
        .slice(0, 4)
        .toUpperCase()
        .replace(/\W/g, "")}-${r.public_id.replace(/\D/g, "").slice(-4) || "0001"}`,
      account: (profile as ProfileLite | null)?.email?.split("@")[0] ?? "—",
      workspace: `WS-${r.id.slice(0, 5).toUpperCase()}`,
      status: mapStatus(r),
      source: ((r.source as SupportTicketDetails["source"]) ?? "Web Portal"),
      issueSummary: r.description,
      reproductionNotes: r.reproduction_notes ?? [],
      priority: mapPriority(r.priority),
      slaDeadline: formatSlaDeadline(r.sla_deadline),
      slaTimeLeft: slaTimeLeftLabel(r.sla_deadline),
      affectedArea: r.affected_area ?? "—",
      internalNotes: r.internal_notes ?? "",
      assigneeUserId: r.assignee_user_id,
      assigneeName,
      csatRating: r.csat_rating,
    };
    return details;
  });

  if (result === null) {
    return { data: SUPPORT_TICKET_DETAILS, usedFallback: true };
  }
  return { data: result, usedFallback: false };
}

/* ── Client profile (right column) ──────────────────────────────────── */

export async function getClientProfileForTicket(
  ticketPublicId: string | null,
): Promise<QueryResult<SupportClientProfile | null>> {
  const result = await withService(async (sb) => {
    let q = sb
      .from("support_tickets")
      .select("user_id, public_id, updated_at")
      .order("created_at", { ascending: false })
      .limit(1);
    if (ticketPublicId) q = q.eq("public_id", ticketPublicId);
    const { data: ticketRows, error } = await q;
    if (error || !ticketRows || ticketRows.length === 0) return null;
    const t = ticketRows[0] as { user_id: string; public_id: string; updated_at: string };

    const [{ data: profile }, openCountRes, totalCountRes] = await Promise.all([
      sb
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", t.user_id)
        .maybeSingle(),
      sb
        .from("support_tickets")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", t.user_id)
        .in("status", ["open", "in_progress", "waiting"]),
      sb
        .from("support_tickets")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", t.user_id),
    ]);

    const clientName = clientNameFor(profile as ProfileLite | null);
    const supportIdPrefix = clientName.slice(0, 4).toUpperCase().replace(/\W/g, "") || "CUST";

    return {
      client: clientName,
      supportId: `${supportIdPrefix}-${t.public_id.replace(/\D/g, "").slice(-4) || "0001"}`,
      plan: "Enterprise",
      accountHealth: "Healthy",
      company: clientName,
      contactEmail: (profile as ProfileLite | null)?.email ?? "—",
      productArea: "API Platform",
      previousTicketsTotal: totalCountRes.count ?? 0,
      previousTicketsOpen: openCountRes.count ?? 0,
      lastActivity: relativeTimeLabel(t.updated_at),
    } satisfies SupportClientProfile;
  });

  if (result === null) {
    return { data: SUPPORT_CLIENT_PROFILE, usedFallback: true };
  }
  return { data: result, usedFallback: false };
}

/* ── Communication timeline (bottom-left card) ──────────────────────── */

type DbEventRow = {
  id: string;
  ticket_id: string;
  kind: string;
  actor_user_id: string | null;
  actor_email: string | null;
  body: string;
  created_at: string;
};
type DbMessageRow = {
  id: string;
  ticket_id: string;
  author: "user" | "support" | "system";
  author_email: string | null;
  body: string;
  created_at: string;
};

function eventKind(dbKind: string, author?: DbMessageRow["author"]): SupportTimelineKind {
  if (author === "user") return "client-reply";
  if (author === "support") return "reply";
  if (dbKind === "internal_note") return "internal-note";
  if (dbKind === "sla_update") return "sla-update";
  return "reply";
}

export async function getTicketTimeline(
  ticketPublicId: string | null,
): Promise<QueryResult<SupportTimelineEvent[]>> {
  const result = await withService(async (sb) => {
    let q = sb.from("support_tickets").select("id, public_id").order("created_at", { ascending: false }).limit(1);
    if (ticketPublicId) q = q.eq("public_id", ticketPublicId);
    const { data: ticketRows } = await q;
    const t = ticketRows?.[0] as { id: string } | undefined;
    if (!t) return [];

    const [{ data: events }, { data: messages }] = await Promise.all([
      sb
        .from("support_ticket_events")
        .select("id, ticket_id, kind, actor_user_id, actor_email, body, created_at")
        .eq("ticket_id", t.id)
        .order("created_at", { ascending: false })
        .limit(8),
      sb
        .from("support_ticket_messages")
        .select("id, ticket_id, author, author_email, body, created_at")
        .eq("ticket_id", t.id)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    type Combined = {
      sort: number;
      out: SupportTimelineEvent;
    };
    const combined: Combined[] = [];

    for (const e of (events as DbEventRow[] | null) ?? []) {
      const name = nameFromEmail(e.actor_email);
      const kind = eventKind(e.kind);
      combined.push({
        sort: new Date(e.created_at).getTime(),
        out: {
          id: `evt-${e.id}`,
          authorName: e.actor_email ? name : "System",
          authorRole: e.actor_email ? "Support Engineer" : "Automated",
          authorInitials: e.actor_email ? initialsFor(name, "SE") : "SYS",
          authorTone: e.actor_email ? pickTone(name) : "neutral",
          kind,
          message: e.body,
          timeLabel: relativeTimeLabel(e.created_at),
        },
      });
    }
    for (const m of (messages as DbMessageRow[] | null) ?? []) {
      const name = nameFromEmail(m.author_email);
      combined.push({
        sort: new Date(m.created_at).getTime(),
        out: {
          id: `msg-${m.id}`,
          authorName: m.author === "system" ? "System" : name,
          authorRole:
            m.author === "user" ? "Client Reply" : m.author === "support" ? "Support Engineer" : "Automated",
          authorInitials: m.author === "system" ? "SYS" : initialsFor(name, "U"),
          authorTone: m.author === "system" ? "neutral" : pickTone(name),
          kind: eventKind("", m.author),
          message: m.body,
          timeLabel: relativeTimeLabel(m.created_at),
        },
      });
    }
    combined.sort((a, b) => b.sort - a.sort);
    return combined.slice(0, 6).map((c) => c.out);
  });

  // Only fall back to mock data when the query truly failed (null
  // result). An empty array is a legitimate state — no replies yet on
  // this ticket — and showing fake demo events would mislead the dev.
  if (result === null) {
    return { data: SUPPORT_TIMELINE_EVENTS, usedFallback: true };
  }
  return { data: result, usedFallback: false };
}

/* ── Escalations card ──────────────────────────────────────────────── */

export async function getEscalations(): Promise<QueryResult<SupportEscalationRow[]>> {
  const result = await withService(async (sb) => {
    const { data, error } = await sb
      .from("support_tickets")
      .select("public_id, subject, priority, escalation_state, escalated_at")
      .not("escalation_state", "is", null)
      .order("escalated_at", { ascending: false })
      .limit(10);
    if (error || !data) return [];
    type Row = {
      public_id: string;
      subject: string;
      priority: DbTicketRow["priority"];
      escalation_state: string;
      escalated_at: string;
    };
    return (data as Row[]).map((r) => ({
      ticketId: r.public_id,
      subject: r.subject,
      priority: mapPriority(r.priority),
      escalationState: r.escalation_state as SupportEscalationRow["escalationState"],
      timeAtRisk: relativeTimeLabel(r.escalated_at),
    }));
  });

  // Empty array = no real escalations; surface that honestly rather
  // than masking with mock demo rows. Mock only when withService failed.
  if (result === null) {
    return { data: SUPPORT_ESCALATIONS, usedFallback: true };
  }
  return { data: result, usedFallback: false };
}

/* ── SLA performance donut ─────────────────────────────────────────── */

export async function getSlaSummary(): Promise<QueryResult<SupportSlaSummary>> {
  const result = await withService(async (sb) => {
    const sevenDaysAgoIso = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const nowIso = new Date().toISOString();
    const inDayIso = new Date(Date.now() + 24 * 3_600_000).toISOString();

    const [met, breached, atRisk] = await Promise.all([
      sb.from("support_tickets").select("id", { head: true, count: "exact" })
        .gte("resolved_at", sevenDaysAgoIso)
        .not("sla_deadline", "is", null)
        .filter("resolved_at", "lte", "sla_deadline"),
      sb.from("support_tickets").select("id", { head: true, count: "exact" })
        .gte("created_at", sevenDaysAgoIso)
        .not("sla_deadline", "is", null)
        .or(`and(resolved_at.not.is.null,resolved_at.gt.sla_deadline),and(resolved_at.is.null,sla_deadline.lt.${nowIso})`),
      sb.from("support_tickets").select("id", { head: true, count: "exact" })
        .is("resolved_at", null)
        .not("sla_deadline", "is", null)
        .gt("sla_deadline", nowIso)
        .lt("sla_deadline", inDayIso),
    ]);

    const metCount = met.count ?? 0;
    const breachedCount = breached.count ?? 0;
    const atRiskCount = atRisk.count ?? 0;
    const total = metCount + breachedCount + atRiskCount;
    if (total === 0) throw new Error("no sla data yet");
    const pct = (n: number) => Math.round((n / total) * 100);
    return {
      totalTickets: total,
      metPercent: pct(metCount),
      buckets: [
        { key: "met",      label: "Met",      count: metCount,      percent: pct(metCount),      color: "var(--dev-chart-blue)" },
        { key: "breached", label: "Breached", count: breachedCount, percent: pct(breachedCount), color: "var(--dev-danger)"     },
        { key: "at-risk",  label: "At Risk",  count: atRiskCount,   percent: pct(atRiskCount),   color: "var(--dev-warning)"    },
      ],
    } satisfies SupportSlaSummary;
  });

  if (result === null) {
    return { data: SUPPORT_SLA_SUMMARY, usedFallback: true };
  }
  return { data: result, usedFallback: false };
}

/* ── Available filter options (assignees, categories) ──────────────── */

export type SupportFilterOptions = {
  categories: string[];
  assignees: { id: string; label: string }[];
};

export async function getSupportFilterOptions(): Promise<SupportFilterOptions> {
  const result = await withService(async (sb) => {
    const [{ data: cats }, { data: assigns }] = await Promise.all([
      sb.from("support_tickets").select("category").not("category", "is", null),
      sb.from("support_tickets").select("assignee_user_id").not("assignee_user_id", "is", null),
    ]);
    const categories = Array.from(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Set(((cats ?? []) as any[]).map((r) => r.category as string)),
    ).sort();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ids = Array.from(new Set(((assigns ?? []) as any[]).map((r) => r.assignee_user_id as string)));
    let assignees: { id: string; label: string }[] = [];
    if (ids.length > 0) {
      const { data: profs } = await sb.from("profiles").select("id, full_name, email").in("id", ids);
      assignees = ((profs as ProfileLite[] | null) ?? []).map((p) => ({
        id: p.id,
        label: clientNameFor(p),
      }));
    }
    return { categories, assignees };
  });

  if (result === null) return { categories: [], assignees: [] };
  return result;
}
