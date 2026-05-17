/* ─────────────────────────────────────────────────────────────────────────
   Server-domain types for the Support system.
   These mirror the DB schema in 0013_support.sql closely so query results
   can be mapped to UI shapes with minimal transformation.
   ───────────────────────────────────────────────────────────────────────── */

export type SupportTicketTopic =
  | "billing"
  | "technical"
  | "account"
  | "content"
  | "posting"
  | "community"
  | "coaching"
  | "feature"
  | "other";

export type SupportTicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportTicketStatus =
  | "open"
  | "waiting"
  | "in_progress"
  | "resolved"
  | "closed";

export type SupportMessageAuthor = "user" | "support" | "system";

/* Row shape as returned by getMyRecentTickets / getTicketById. */
export type SupportTicket = {
  id:           string;     // uuid
  publicId:     string;     // "TK-48291"
  userId:       string;
  subject:      string;
  topic:        SupportTicketTopic;
  pageAffected: string | null;
  priority:     SupportTicketPriority;
  device:       string | null;
  description:  string;
  ticketRef:    string | null;
  attachmentName: string | null;
  attachmentPath: string | null;
  attachmentSize: number | null;
  status:       SupportTicketStatus;
  assignedToEmail: string | null;
  resolvedAt:   string | null;
  createdAt:    string;
  updatedAt:    string;
};

export type SupportTicketMessage = {
  id:          string;
  ticketId:    string;
  author:      SupportMessageAuthor;
  authorEmail: string | null;
  body:        string;
  createdAt:   string;
};

export type HelpArticle = {
  id:          string;
  slug:        string;
  title:       string;
  excerpt:     string | null;
  body:        string | null;
  category:    string | null;
  viewCount:   number;
  isPopular:   boolean;
  publishedAt: string;
};

/* Submission payload — what the form actually sends. Validated by the
 * server action before any DB write. */
export type SupportSubmissionInput = {
  topic:        SupportTicketTopic;
  subject:      string;
  pageAffected: string;
  priority:     SupportTicketPriority;
  device:       string;
  description:  string;
  ticketRef?:   string;
};
