import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  HelpArticle,
  SupportTicket,
  SupportTicketMessage,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketTopic,
} from "./types";

/* ─────────────────────────────────────────────────────────────────────────
   Server-side reads for the Support system.

   Strategy:
   - Try Supabase first (the canonical source after migration 0013).
   - On any error (table missing, permission denied) return empty arrays
     so the page still renders without throwing.
   - All exports return UI-friendly shapes (camelCase fields).
   ───────────────────────────────────────────────────────────────────────── */

/* ── DB row → UI shape ───────────────────────────────────────────────── */

type DbTicketRow = {
  id: string;
  public_id: string;
  user_id: string;
  subject: string;
  topic: SupportTicketTopic;
  page_affected: string | null;
  priority: SupportTicketPriority;
  device: string | null;
  description: string;
  ticket_ref: string | null;
  attachment_name: string | null;
  attachment_path: string | null;
  attachment_size: number | null;
  status: SupportTicketStatus;
  assigned_to_email: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

function rowToTicket(r: DbTicketRow): SupportTicket {
  return {
    id:              r.id,
    publicId:        r.public_id,
    userId:          r.user_id,
    subject:         r.subject,
    topic:           r.topic,
    pageAffected:    r.page_affected,
    priority:        r.priority,
    device:          r.device,
    description:     r.description,
    ticketRef:       r.ticket_ref,
    attachmentName:  r.attachment_name,
    attachmentPath:  r.attachment_path,
    attachmentSize:  r.attachment_size,
    status:          r.status,
    assignedToEmail: r.assigned_to_email,
    resolvedAt:      r.resolved_at,
    createdAt:       r.created_at,
    updatedAt:       r.updated_at,
  };
}

type DbHelpArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  category: string | null;
  view_count: number;
  is_popular: boolean;
  published_at: string;
};

function rowToArticle(r: DbHelpArticleRow): HelpArticle {
  return {
    id:          r.id,
    slug:        r.slug,
    title:       r.title,
    excerpt:     r.excerpt,
    body:        r.body,
    category:    r.category,
    viewCount:   r.view_count,
    isPopular:   r.is_popular,
    publishedAt: r.published_at,
  };
}

/* ── Public queries ──────────────────────────────────────────────────── */

const TICKET_COLUMNS =
  "id, public_id, user_id, subject, topic, page_affected, priority, device, description, ticket_ref, attachment_name, attachment_path, attachment_size, status, assigned_to_email, resolved_at, created_at, updated_at";

/** Most recent tickets for the signed-in user. Used by the right rail
 *  on /support and the list page on /support/tickets. */
export async function getMyRecentTickets(limit = 5): Promise<SupportTicket[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("support_tickets")
      .select(TICKET_COLUMNS)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as DbTicketRow[]).map(rowToTicket);
  } catch {
    return [];
  }
}

/** Full list for /support/tickets with simple status / limit options. */
export async function getMyTickets(
  opts: { status?: SupportTicketStatus | "all"; limit?: number } = {},
): Promise<SupportTicket[]> {
  const { status = "all", limit = 100 } = opts;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    let q = supabase
      .from("support_tickets")
      .select(TICKET_COLUMNS)
      .eq("user_id", user.id);

    if (status !== "all") q = q.eq("status", status);

    const { data, error } = await q
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as DbTicketRow[]).map(rowToTicket);
  } catch {
    return [];
  }
}

/** Single ticket by its public_id (e.g. "TK-48291"). Returns null if not
 *  found or not owned by the current user (RLS will block cross-user reads). */
export async function getMyTicketByPublicId(publicId: string): Promise<SupportTicket | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from("support_tickets")
      .select(TICKET_COLUMNS)
      .eq("public_id", publicId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !data) return null;
    return rowToTicket(data as DbTicketRow);
  } catch {
    return null;
  }
}

/** Conversation thread for a ticket. */
export async function getTicketMessages(ticketId: string): Promise<SupportTicketMessage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("support_ticket_messages")
      .select("id, ticket_id, author, author_email, body, created_at")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data.map((r) => ({
      id:          r.id as string,
      ticketId:    r.ticket_id as string,
      author:      r.author as SupportTicketMessage["author"],
      authorEmail: (r.author_email as string | null) ?? null,
      body:        r.body as string,
      createdAt:   r.created_at as string,
    }));
  } catch {
    return [];
  }
}

/** Popular help articles for the right rail. */
export async function getPopularHelpArticles(limit = 4): Promise<HelpArticle[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("help_articles")
      .select("id, slug, title, excerpt, body, category, view_count, is_popular, published_at")
      .eq("is_popular", true)
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as DbHelpArticleRow[]).map(rowToArticle);
  } catch {
    return [];
  }
}

/** All articles for the Help Center landing. */
export async function getAllHelpArticles(): Promise<HelpArticle[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("help_articles")
      .select("id, slug, title, excerpt, body, category, view_count, is_popular, published_at")
      .order("is_popular", { ascending: false })
      .order("view_count", { ascending: false })
      .limit(50);

    if (error || !data) return [];
    return (data as DbHelpArticleRow[]).map(rowToArticle);
  } catch {
    return [];
  }
}
