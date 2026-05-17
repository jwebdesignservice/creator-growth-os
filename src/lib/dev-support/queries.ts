import "server-only";
import { createClient } from "@/lib/supabase/server";
import { SUPPORT_TICKET_DETAIL_SUP_10482 } from "@/lib/dev-dashboard/mock-data";
import type {
  SupportConversationEntry,
  SupportConversationKind,
  SupportEscalationWorkflow,
  SupportResolutionStage,
  SupportTicketDetailBundle,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/dev-dashboard/types";
import type { SupportTicketStatus as DbSupportTicketStatus } from "@/lib/support/types";
import type { DevAssignableUser } from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Dev-side reads for /dev/support/[ticketId].

   The page calls `getDevTicketDetailByPublicId(publicId)` and gets back the
   same `SupportTicketDetailBundle` shape the existing detail components
   already consume. On any DB error (missing tables, permission denied) the
   loader falls back to the centralized mock so the page never breaks
   before migrations 0013 + 0016 have been applied.
   ───────────────────────────────────────────────────────────────────────── */

/* ── Status mapping ──────────────────────────────────────────────────────── */

function mapDbStatus(
  dbStatus: DbSupportTicketStatus,
  escalationState: string | null,
): SupportTicketStatus {
  if (escalationState) return "escalated";
  switch (dbStatus) {
    case "open":        return "open";
    case "in_progress": return "in-progress";
    case "waiting":     return "waiting-client";
    case "resolved":    return "resolved";
    case "closed":      return "resolved";
  }
}

function mapDbPriority(p: string | null): SupportTicketPriority {
  if (p === "high" || p === "urgent") return "high";
  if (p === "medium")                 return "medium";
  return "low";
}

function initialsOf(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function formatRemaining(deadlineIso: string | null): string {
  if (!deadlineIso) return "—";
  const ms = new Date(deadlineIso).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return "Breached";
  const totalMin = Math.floor(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/* ── Conversation timeline merge ─────────────────────────────────────────── */

type DbMessageRow = {
  id: string;
  body: string;
  created_at: string;
  author_role: "user" | "support" | "system";
  author_email: string | null;
};

type DbEventRow = {
  id: string;
  body: string;
  kind: string;
  created_at: string;
  actor_email: string | null;
};

function messageKind(role: DbMessageRow["author_role"]): SupportConversationKind {
  if (role === "user")    return "client-reply";
  if (role === "support") return "support-reply";
  return "system-update";
}

function eventKindToConversationKind(kind: string): SupportConversationKind {
  if (kind === "internal_note") return "internal-note";
  return "system-update";
}

function authorNameFromEmail(email: string | null): string {
  if (!email) return "—";
  const local = email.split("@")[0] ?? "";
  return local
    .split(/[._-]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ") || email;
}

/* ── Public loader ───────────────────────────────────────────────────────── */

export async function getDevTicketDetailByPublicId(
  publicId: string,
): Promise<SupportTicketDetailBundle> {
  try {
    const supabase = await createClient();

    // Look up the ticket by its human-friendly public_id (e.g. "SUP-10482").
    // Loose row type: the project doesn't yet ship generated Supabase
    // types covering the migration-0013/0016 support tables, so we cast
    // the row after fetching. Narrow the cast to only the fields we read.
    type RawTicketRow = {
      id: string;
      public_id: string;
      subject: string;
      description: string;
      topic: string | null;
      priority: string | null;
      status: DbSupportTicketStatus;
      created_at: string;
      updated_at: string;
      sla_deadline: string | null;
      source: string | null;
      category: string | null;
      affected_area: string | null;
      reproduction_notes: string[] | null;
      internal_notes: string | null;
      escalation_state: string | null;
      escalated_at: string | null;
      page_affected: string | null;
      attachment_name: string | null;
      attachment_path: string | null;
      attachment_size: number | null;
      user_id: string;
      assignee_user_id: string | null;
      assigned_to_email: string | null;
      device: string | null;
      ticket_ref?: string | null;
    };

    const { data: ticketRaw, error: ticketErr } = await supabase
      .from("support_tickets")
      .select(
        "id, public_id, subject, description, topic, priority, status, " +
        "created_at, updated_at, sla_deadline, source, category, " +
        "affected_area, reproduction_notes, internal_notes, " +
        "escalation_state, escalated_at, page_affected, " +
        "attachment_name, attachment_path, attachment_size, " +
        "user_id, assignee_user_id, assigned_to_email, device, ticket_ref",
      )
      .eq("public_id", publicId.toUpperCase())
      .maybeSingle();

    const ticket = ticketRaw as RawTicketRow | null;
    if (ticketErr || !ticket) {
      // Table missing or row not found — fall back to the centralized mock
      // and override the id so the URL still feels accurate.
      return {
        ...SUPPORT_TICKET_DETAIL_SUP_10482,
        summary: {
          ...SUPPORT_TICKET_DETAIL_SUP_10482.summary,
          id: publicId.toUpperCase(),
        },
      };
    }

    // Submitter profile + assignee profile + messages + events in parallel.
    const [
      { data: submitter },
      { data: assignee },
      { data: messages },
      { data: events },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, display_name, email")
        .eq("id", ticket.user_id)
        .maybeSingle(),
      ticket.assignee_user_id
        ? supabase
            .from("profiles")
            .select("id, full_name, display_name, email")
            .eq("id", ticket.assignee_user_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("support_ticket_messages")
        .select("id, body, created_at, author_role, author_email")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("support_ticket_events")
        .select("id, body, kind, created_at, actor_email")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: false }),
    ]);

    // Merge messages + events into a single newest-first conversation list.
    const messageEntries: SupportConversationEntry[] = (messages ?? []).map((m: DbMessageRow) => ({
      id: m.id,
      kind: messageKind(m.author_role),
      authorName: authorNameFromEmail(m.author_email),
      message: m.body,
      timeLabel: relativeTime(m.created_at),
      createdAtIso: m.created_at,
    }));

    const eventEntries: SupportConversationEntry[] = (events ?? []).map((e: DbEventRow) => ({
      id: e.id,
      kind: eventKindToConversationKind(e.kind),
      authorName: authorNameFromEmail(e.actor_email),
      authorContext: e.kind === "internal_note" ? "Internal" : undefined,
      message: e.body,
      timeLabel: relativeTime(e.created_at),
      createdAtIso: e.created_at,
    }));

    // Merge by real timestamp, newest-first. Falling back to timeLabel
    // comparison is unsafe ("2m ago" vs "10m ago" doesn't sort lexicographically).
    const conversation = [...messageEntries, ...eventEntries].sort((a, b) => {
      const aMs = a.createdAtIso ? new Date(a.createdAtIso).getTime() : 0;
      const bMs = b.createdAtIso ? new Date(b.createdAtIso).getTime() : 0;
      return bMs - aMs;
    });

    // ── Summary ───────────────────────────────────────────────────────────
    const submitterName =
      submitter?.display_name ??
      submitter?.full_name ??
      authorNameFromEmail(submitter?.email);
    const assigneeName =
      assignee?.display_name ??
      assignee?.full_name ??
      ticket.assigned_to_email ??
      "Unassigned";

    const uiStatus = mapDbStatus(ticket.status, ticket.escalation_state);
    const uiPriority = mapDbPriority(ticket.priority);

    const summary: SupportTicketDetailBundle["summary"] = {
      id: ticket.public_id,
      subject: ticket.subject,
      client: submitterName,
      clientSupportId: ticket.public_id, // No separate field in DB — use public_id
      status: uiStatus,
      priority: uiPriority,
      category: ticket.category ?? ticket.topic ?? "General",
      assignee: {
        name: assigneeName,
        initials: initialsOf(assigneeName),
        tone: "violet",
      },
      createdAt: formatLong(ticket.created_at),
      lastUpdatedAt: relativeTime(ticket.updated_at),
      slaDeadline: ticket.sla_deadline ? formatLong(ticket.sla_deadline) : "—",
      slaRemaining: formatRemaining(ticket.sla_deadline),
      accountPlan: "Enterprise", // No DB column — display value
    };

    // ── Submission ────────────────────────────────────────────────────────
    const submission: SupportTicketDetailBundle["submission"] = {
      submittedByName: submitterName,
      submittedByCompany: ticket.category ?? "—",
      contactEmail: submitter?.email ?? "—",
      affectedProductArea: ticket.affected_area ?? "—",
      environment: "Production",
      issueSummary: ticket.description,
      reproductionSteps: (ticket.reproduction_notes ?? []) as string[],
      expectedBehavior: "Behavior should match the documented contract.",
      actualBehavior: ticket.description,
      attachments: ticket.attachment_name
        ? [{
            name: ticket.attachment_name,
            sizeLabel: ticket.attachment_size
              ? `${Math.round(ticket.attachment_size / 1024)} KB`
              : "—",
            kind: "other",
          }]
        : [],
      browser: ticket.device ?? "—",
      submittedVia: ticket.source ?? "Web Portal",
    };

    // ── Investigation ─────────────────────────────────────────────────────
    const investigation: SupportTicketDetailBundle["investigation"] = {
      notes: ticket.internal_notes
        ? ticket.internal_notes.split(/\n+/).filter(Boolean)
        : [],
      affectedService: ticket.affected_area ?? "—",
      suspectedSeverity: uiPriority,
      occurrences24h: 0,
      affectedAccounts: 0,
    };

    // ── Workflow ──────────────────────────────────────────────────────────
    const stages: SupportResolutionStage[] = [
      { key: "submitted",     label: "Submitted",     timestamp: formatShort(ticket.created_at) },
      { key: "in-review",     label: "In Review"     },
      { key: "investigating", label: "Investigating" },
      { key: "awaiting-fix",  label: "Awaiting Fix"  },
      { key: "resolved",      label: "Resolved"      },
    ];
    const currentStageIndex =
      ticket.status === "open"        ? 0 :
      ticket.status === "in_progress" ? 2 :
      ticket.status === "waiting"     ? 3 :
      ticket.status === "resolved"    ? 4 :
      ticket.status === "closed"      ? 4 : 0;

    if (ticket.status === "in_progress" || ticket.escalation_state) {
      stages[1].timestamp = formatShort(ticket.updated_at);
    }
    if (ticket.status === "in_progress") {
      stages[2].timestamp = formatShort(ticket.updated_at);
    }
    if (ticket.status === "resolved" || ticket.status === "closed") {
      stages[1].timestamp = formatShort(ticket.updated_at);
      stages[2].timestamp = formatShort(ticket.updated_at);
      stages[4].timestamp = formatShort(ticket.updated_at);
    }

    const workflow: SupportEscalationWorkflow = {
      escalationStatus: ticket.escalation_state ?? "Not escalated",
      escalationTone: ticket.escalation_state
        ? (ticket.escalation_state === "Escalated to Engineering" ? "danger" : "warning")
        : "info",
      ownerName: assigneeName,
      ownerInitials: initialsOf(assigneeName),
      ownerTone: "violet",
      nextAction: ticket.escalation_state
        ? "Review with engineering"
        : "Triage and assign",
      incidentLink: { id: ticket.ticket_ref ?? "—", href: "#" },
      stages,
      currentStageIndex,
    };

    // ── Client profile / metadata / related / SLA — keep mock for now ────
    const mock = SUPPORT_TICKET_DETAIL_SUP_10482;

    const bundle: SupportTicketDetailBundle = {
      summary,
      submission,
      investigation,
      clientProfile: {
        ...mock.clientProfile,
        company: submitterName,
      },
      metadata: {
        ...mock.metadata,
        source: ticket.source ?? mock.metadata.source,
        productArea: ticket.affected_area ?? mock.metadata.productArea,
      },
      conversation: conversation.length > 0 ? conversation : mock.conversation,
      workflow,
      relatedIssues: mock.relatedIssues,
      slaRisk: mock.slaRisk,
    };

    return bundle;
  } catch {
    return {
      ...SUPPORT_TICKET_DETAIL_SUP_10482,
      summary: {
        ...SUPPORT_TICKET_DETAIL_SUP_10482.summary,
        id: publicId.toUpperCase(),
      },
    };
  }
}

/** List of profiles that can be assigned a ticket. Returned profiles are
 *  the dev allowlist members; falls back to all profiles if the dev
 *  allowlist isn't reachable. */
export async function getAssignableUsers(): Promise<DevAssignableUser[]> {
  try {
    const supabase = await createClient();

    // Try the dev allowlist first — these are the operators of the dev
    // console and the most likely assignees.
    const { data: devEmails } = await supabase
      .from("dev_users")
      .select("email");

    if (devEmails && devEmails.length > 0) {
      const emails = devEmails.map((d) => d.email);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, email")
        .in("email", emails);
      if (profiles && profiles.length > 0) {
        return profiles.map((p) => {
          const name = p.display_name ?? p.full_name ?? authorNameFromEmail(p.email);
          return { id: p.id, name, initials: initialsOf(name) };
        });
      }
    }

    // Fallback: any 10 most-recent profiles.
    const { data: any10 } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, email")
      .order("created_at", { ascending: false })
      .limit(10);
    return (any10 ?? []).map((p) => {
      const name = p.display_name ?? p.full_name ?? authorNameFromEmail(p.email);
      return { id: p.id, name, initials: initialsOf(name) };
    });
  } catch {
    return [];
  }
}
