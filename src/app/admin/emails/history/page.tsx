import { createServiceClient } from "@/lib/supabase/server";
import { getEmailSafetyConfig } from "@/lib/email/safety";
import { getAdminContext } from "@/lib/admin/is-admin";
import {
  HistoryView,
  type EmailHistoryRow,
  type EmailStatus,
  type HistoryStat,
} from "./history-view";

export const metadata = {
  title: "History · Email · Admin · Creator Growth OS",
};

type DbRow = {
  id: string;
  subject: string | null;
  body: string | null;
  audience_label: string | null;
  status: EmailStatus;
  recipients_total: number | null;
  recipients_delivered: number | null;
  recipients_opened: number | null;
  recipients_clicked: number | null;
  recipients_bounced: number | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
};

/**
 * /admin/emails/history — real review of every campaign / draft / scheduled
 * send recorded in email_messages. Computes headline delivery stats and
 * hands the interactive table (search / filter / pagination / row actions /
 * preview) off to the client view.
 */
export default async function EmailHistoryPage() {
  const { user } = await getAdminContext();
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("email_messages")
    .select(
      "id, subject, body, audience_label, status, recipients_total, recipients_delivered, recipients_opened, recipients_clicked, recipients_bounced, scheduled_for, sent_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  const dbRows = (data ?? []) as DbRow[];

  const rows: EmailHistoryRow[] = dbRows.map((r) => ({
    id: r.id,
    subject: r.subject ?? "",
    body: r.body ?? "",
    audience: r.audience_label ?? "All users",
    status: r.status,
    sentAtLabel: r.sent_at ? formatDateTime(r.sent_at) : null,
    scheduledLabel: r.scheduled_for ? formatDateTime(r.scheduled_for) : null,
    delivered:
      r.status === "sent" || r.status === "failed"
        ? { n: r.recipients_delivered ?? 0, total: r.recipients_total ?? 0 }
        : null,
  }));

  /* ── Headline stats (real where measurable; honest "—" otherwise) ──── */
  const sentRows = dbRows.filter((r) => r.status === "sent");
  const totalDelivered = sentRows.reduce((s, r) => s + (r.recipients_delivered ?? 0), 0);
  const totalRecipients = sentRows.reduce((s, r) => s + (r.recipients_total ?? 0), 0);
  const totalOpened = sentRows.reduce((s, r) => s + (r.recipients_opened ?? 0), 0);
  const totalClicked = sentRows.reduce((s, r) => s + (r.recipients_clicked ?? 0), 0);
  const totalBounced = sentRows.reduce((s, r) => s + (r.recipients_bounced ?? 0), 0);

  const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");
  // Open/click/bounce require Resend webhook ingestion (a documented future
  // phase). Until that lands we have no signal, so show "—" rather than a
  // misleading 0%.
  const hasEngagement = totalOpened + totalClicked + totalBounced > 0;

  const stats: HistoryStat[] = [
    {
      key: "sent",
      label: "Total emails sent",
      value: totalDelivered.toLocaleString(),
      hint: `${sentRows.length} campaign${sentRows.length === 1 ? "" : "s"} delivered`,
    },
    {
      key: "delivered",
      label: "Delivered",
      value: pct(totalDelivered, totalRecipients),
      hint: `${totalDelivered.toLocaleString()} / ${totalRecipients.toLocaleString()} recipients`,
    },
    {
      key: "open",
      label: "Open rate",
      value: hasEngagement ? pct(totalOpened, totalDelivered) : "—",
      hint: hasEngagement ? `${totalOpened.toLocaleString()} opens` : "Needs open tracking (webhooks)",
    },
    {
      key: "click",
      label: "Click rate",
      value: hasEngagement ? pct(totalClicked, totalDelivered) : "—",
      hint: hasEngagement ? `${totalClicked.toLocaleString()} clicks` : "Needs click tracking (webhooks)",
    },
    {
      key: "bounce",
      label: "Bounced",
      value: hasEngagement ? pct(totalBounced, totalRecipients) : "—",
      hint: hasEngagement ? `${totalBounced.toLocaleString()} bounced` : "Needs bounce tracking (webhooks)",
    },
  ];

  /* ── Usage (last 24h delivery vs daily cap) ────────────────────────── */
  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const used = sentRows
    .filter((r) => r.sent_at && r.sent_at >= sinceIso)
    .reduce((s, r) => s + (r.recipients_delivered ?? 0), 0);
  const safety = getEmailSafetyConfig(user?.email);

  return (
    <HistoryView
      rows={rows}
      stats={stats}
      usage={{ used, limit: 250, safeMode: safety.safeMode }}
    />
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
