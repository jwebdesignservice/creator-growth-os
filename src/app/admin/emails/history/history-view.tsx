"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  CheckCircle2,
  Shield,
  Search,
  UserRound,
  ChevronDown,
  Calendar,
  RefreshCw,
  Download,
  Mail,
  Eye,
  MousePointerClick,
  AlertTriangle,
  ExternalLink,
  MoreHorizontal,
  Type,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Send,
  Copy,
  Trash2,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ───────────────────────────────────────────────────────────────────── */
/* Types + mock data                                                      */

type EmailStatus = "sent" | "scheduled" | "draft";
type EmailTab = "custom" | "automated";

type EmailHistoryRow = {
  id: string;
  subject: string;
  audience: string;
  sentAt: string | null;
  scheduledLabel?: string | null;
  delivered: { rate: string; n: number; total: number } | null;
  openRate: { rate: string; n: number; total: number } | null;
  status: EmailStatus;
  tab: EmailTab;
};

const ROWS: EmailHistoryRow[] = [
  {
    id: "e1",
    subject: "Welcome to Profluencer",
    audience: "New users",
    sentAt: "May 13, 2025 9:41 AM",
    delivered: { rate: "99.1%", n: 221, total: 223 },
    openRate: { rate: "52.4%", n: 116, total: 221 },
    status: "sent",
    tab: "custom",
  },
  {
    id: "e2",
    subject: "New lesson now live",
    audience: "Active learners",
    sentAt: "May 12, 2025 10:00 AM",
    delivered: { rate: "98.7%", n: 1024, total: 1037 },
    openRate: { rate: "44.2%", n: 452, total: 1024 },
    status: "sent",
    tab: "custom",
  },
  {
    id: "e3",
    subject: "Weekly creator recap",
    audience: "Creators",
    sentAt: "May 11, 2025 9:00 AM",
    delivered: { rate: "97.8%", n: 872, total: 892 },
    openRate: { rate: "38.7%", n: 337, total: 872 },
    status: "sent",
    tab: "custom",
  },
  {
    id: "e4",
    subject: "Reminder: finish your task",
    audience: "Incomplete tasks",
    sentAt: "May 14, 2025 8:00 AM",
    scheduledLabel: "May 14, 8:00 AM",
    delivered: null,
    openRate: null,
    status: "scheduled",
    tab: "custom",
  },
  {
    id: "e5",
    subject: "Your program is ready",
    audience: "Program participants",
    sentAt: null,
    delivered: null,
    openRate: null,
    status: "draft",
    tab: "custom",
  },
  // Automated-tab samples (used when the user switches tabs)
  {
    id: "a1",
    subject: "Lesson completion follow-up",
    audience: "Lesson completers",
    sentAt: "May 13, 2025 6:00 AM",
    delivered: { rate: "99.4%", n: 412, total: 414 },
    openRate: { rate: "61.2%", n: 252, total: 412 },
    status: "sent",
    tab: "automated",
  },
  {
    id: "a2",
    subject: "Re-engagement: we miss you",
    audience: "Inactive 14d+",
    sentAt: "May 12, 2025 8:00 AM",
    delivered: { rate: "96.9%", n: 188, total: 194 },
    openRate: { rate: "29.8%", n: 56, total: 188 },
    status: "sent",
    tab: "automated",
  },
];

const STATS: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta: number;
  vs: string;
}[] = [
  {
    icon: Mail,
    label: "Total emails sent",
    value: "1,248",
    delta: 12.4,
    vs: "vs Apr 29 – May 5",
  },
  {
    icon: CheckCircle2,
    label: "Delivered",
    value: "98.2%",
    delta: 2.1,
    vs: "vs Apr 29 – May 5",
  },
  {
    icon: Eye,
    label: "Open rate",
    value: "41.6%",
    delta: 5.3,
    vs: "vs Apr 29 – May 5",
  },
  {
    icon: MousePointerClick,
    label: "Click rate",
    value: "7.8%",
    delta: 1.6,
    vs: "vs Apr 29 – May 5",
  },
  {
    icon: AlertTriangle,
    label: "Bounced",
    value: "1.1%",
    delta: -0.6,
    vs: "vs Apr 29 – May 5",
  },
];

const STATUS_LABEL: Record<EmailStatus, string> = {
  sent: "Sent",
  scheduled: "Scheduled",
  draft: "Draft",
};

/* ───────────────────────────────────────────────────────────────────── */

export function HistoryView() {
  const [tab, setTab] = useState<EmailTab>("custom");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [recipientQuery, setRecipientQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EmailStatus>("all");
  const [verifyDismissed, setVerifyDismissed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    let rows = ROWS.filter((r) => r.tab === tab);
    if (subjectQuery)
      rows = rows.filter((r) =>
        r.subject.toLowerCase().includes(subjectQuery.toLowerCase()),
      );
    if (recipientQuery)
      rows = rows.filter((r) =>
        r.audience.toLowerCase().includes(recipientQuery.toLowerCase()),
      );
    if (statusFilter !== "all")
      rows = rows.filter((r) => r.status === statusFilter);
    return rows;
  }, [tab, subjectQuery, recipientQuery, statusFilter]);

  function refresh() {
    // Visual spinner only — no remote data yet.
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }

  function exportCsv() {
    const header = [
      "Subject",
      "Audience",
      "Sent at",
      "Delivered",
      "Open rate",
      "Status",
    ];
    const lines = filtered.map((r) => [
      r.subject,
      r.audience,
      r.sentAt ?? "",
      r.delivered ? `${r.delivered.n} / ${r.delivered.total}` : "",
      r.openRate ? `${r.openRate.n} / ${r.openRate.total}` : "",
      STATUS_LABEL[r.status],
    ]);
    const csv = [header, ...lines]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-history-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-h1 text-ink-900 leading-tight mb-1">
            History
          </h1>
          <p className="text-ink-500 text-[14px]">
            Review sent emails, automated emails, and delivery performance
            across your audience.
          </p>
        </div>
        <button
          type="button"
          onClick={() => alert("Email history help — coming soon.")}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
        >
          <HelpCircle className="size-4" strokeWidth={2} />
          Help
        </button>
      </header>

      {/* ── Banners ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-[14px] border border-success/20 bg-success-bg/40 px-4 py-3 flex items-center gap-3">
          <CheckCircle2
            className="size-5 text-success shrink-0"
            strokeWidth={2}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold text-ink-900">
              Sending available
            </div>
            <p className="text-[12.5px] text-ink-500 mt-0.5">
              250 emails remaining in the current 24-hour window.
            </p>
          </div>
          <Link
            href="/admin/emails/settings"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-success hover:opacity-90 shrink-0"
          >
            View limits
            <ChevronRight className="size-3.5" strokeWidth={2} />
          </Link>
        </div>
        {!verifyDismissed && (
          <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-3">
            <Shield
              className="size-5 text-amber-600 shrink-0"
              strokeWidth={2}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-ink-900">
                Verify your sending domain to improve deliverability.
              </div>
              <p className="text-[12.5px] text-ink-500 mt-0.5">
                Authenticating your domain builds trust and reduces spam risk.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVerifyDismissed(true)}
              className="inline-flex items-center h-9 px-3.5 rounded-[10px] bg-white border border-amber-300 text-amber-700 text-[12.5px] font-semibold hover:bg-amber-100 transition-colors shrink-0"
            >
              Verify domain
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-ink-100 mb-5 flex items-center gap-1">
        <TabButton
          active={tab === "custom"}
          onClick={() => setTab("custom")}
        >
          Custom emails
        </TabButton>
        <TabButton
          active={tab === "automated"}
          onClick={() => setTab("automated")}
        >
          Automated emails
        </TabButton>
      </div>

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="card p-3 mb-5 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400"
            strokeWidth={2}
          />
          <input
            type="search"
            value={subjectQuery}
            onChange={(e) => setSubjectQuery(e.target.value)}
            placeholder="Search by subject..."
            className="w-full h-11 pl-10 pr-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <UserRound
            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400"
            strokeWidth={2}
          />
          <input
            type="search"
            value={recipientQuery}
            onChange={(e) => setRecipientQuery(e.target.value)}
            placeholder="Search by recipient..."
            className="w-full h-11 pl-10 pr-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
          />
        </div>
        <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
        <button
          type="button"
          onClick={() => alert("Date range picker — coming soon.")}
          className="inline-flex items-center gap-2 h-11 px-3.5 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors"
        >
          <Calendar className="size-3.5 text-ink-500" strokeWidth={2} />
          May 6 – May 13, 2025
        </button>
        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
        >
          <RefreshCw
            className={cn(
              "size-3.5 text-ink-500",
              refreshing && "animate-spin",
            )}
            strokeWidth={2}
          />
          Refresh
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
        >
          <Download className="size-3.5 text-ink-500" strokeWidth={2} />
          Export
        </button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {STATS.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </div>

      {/* ── Body: table + insights ───────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <section className="card overflow-hidden">
          <header className="px-5 py-4 border-b border-ink-100">
            <h2 className="text-[15px] font-bold text-ink-900">
              Recent email activity
            </h2>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 bg-cream-50/40">
                  <th className="py-3 pl-5 pr-3">Subject</th>
                  <th className="py-3 pr-3">Audience</th>
                  <th className="py-3 pr-3">Sent at</th>
                  <th className="py-3 pr-3">Delivered</th>
                  <th className="py-3 pr-3">Open rate</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-[13px] text-ink-500"
                    >
                      No emails match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <EmailRow key={row.id} row={row} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <footer className="px-5 py-3 border-t border-ink-100 flex items-center justify-between gap-3 flex-wrap">
            <span className="text-[12px] text-ink-500">
              Showing{" "}
              <span className="font-semibold text-ink-700 tabular-nums">
                1 to {filtered.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-ink-700 tabular-nums">
                {filtered.length}
              </span>{" "}
              emails
            </span>
            <Pagination />
          </footer>
        </section>

        {/* Delivery insights */}
        <aside className="card p-5 xl:sticky xl:top-4">
          <header className="flex items-center gap-2 mb-4">
            <Sparkles
              className="size-4 text-rose-600"
              strokeWidth={2}
              fill="currentColor"
            />
            <h3 className="text-[14px] font-bold text-ink-900">
              Delivery insights
            </h3>
          </header>
          <div className="space-y-4">
            <InsightCard
              icon={Type}
              title="Short subject lines perform best"
              body="Emails with 6–8 words in the subject had 22% higher open rates."
            />
            <InsightCard
              icon={Clock}
              title="Tuesday at 10 AM performs best"
              body="This time slot had the highest open rate in the last 30 days."
            />
            <InsightCard
              icon={Shield}
              title="Verify your domain"
              body="Authenticated domains reduce spam risk and improve deliverability."
            />
          </div>
          <button
            type="button"
            onClick={() => alert("Full insights report — coming soon.")}
            className="mt-5 w-full inline-flex items-center justify-center h-11 rounded-[12px] bg-rose-100 text-rose-700 hover:bg-rose-200 text-[13.5px] font-semibold transition-colors"
          >
            View all insights
          </button>
        </aside>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/* Helpers                                                                */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 px-4 inline-flex items-center text-[13.5px] font-semibold border-b-2 -mb-px transition-colors",
        active
          ? "text-rose-600 border-rose-500"
          : "text-ink-500 hover:text-ink-900 border-transparent",
      )}
    >
      {children}
    </button>
  );
}

function StatusDropdown({
  value,
  onChange,
}: {
  value: "all" | EmailStatus;
  onChange: (v: "all" | EmailStatus) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as "all" | EmailStatus)}
        className="appearance-none h-11 pl-3.5 pr-9 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-medium text-ink-700 cursor-pointer hover:bg-cream-100 focus:outline-none focus:border-rose-400 transition-colors"
      >
        <option value="all">All statuses</option>
        <option value="sent">Sent</option>
        <option value="scheduled">Scheduled</option>
        <option value="draft">Draft</option>
      </select>
      <ChevronDown
        className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
    </div>
  );
}

function StatCard({
  stat,
}: {
  stat: { icon: LucideIcon; label: string; value: string; delta: number; vs: string };
}) {
  const { icon: Icon, label, value, delta, vs } = stat;
  const up = delta >= 0;
  // For "Bounced", a downward delta is good — keep arrow direction but flip color.
  const isBounced = label === "Bounced";
  const goodTrend = isBounced ? !up : up;
  const Arrow = up ? ArrowUp : ArrowDown;
  return (
    <div className="card p-4 sm:p-5">
      <span className="size-10 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="text-[26px] font-bold text-ink-900 leading-tight tabular-nums">
        {value}
      </div>
      <div className="text-[12.5px] text-ink-500 mt-0.5">{label}</div>
      <div className="text-[11.5px] mt-2 flex items-center gap-1 tabular-nums">
        <Arrow
          className={cn(
            "size-3",
            goodTrend ? "text-success" : "text-rose-500",
          )}
          strokeWidth={2.5}
        />
        <span
          className={cn(
            "font-semibold",
            goodTrend ? "text-success" : "text-rose-500",
          )}
        >
          {Math.abs(delta)}%
        </span>
        <span className="text-ink-400">{vs}</span>
      </div>
    </div>
  );
}

function EmailRow({ row }: { row: EmailHistoryRow }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  function action(label: string) {
    setMenuOpen(false);
    if (label === "Delete") {
      if (!confirm(`Delete "${row.subject}"? This can't be undone.`)) return;
    }
    alert(`${label} — coming soon.`);
  }

  return (
    <tr className="border-t border-ink-100 hover:bg-cream-50/60 transition-colors">
      <td className="py-4 pl-5 pr-3">
        <button
          type="button"
          onClick={() => action("View details")}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-900 hover:text-rose-700 text-left cursor-pointer transition-colors"
        >
          {row.subject}
          <ExternalLink
            className="size-3.5 text-ink-400 shrink-0"
            strokeWidth={2}
          />
        </button>
      </td>
      <td className="py-4 pr-3 text-[13px] text-ink-700">{row.audience}</td>
      <td className="py-4 pr-3 text-[13px] text-ink-700 whitespace-nowrap">
        {row.sentAt ?? <span className="text-ink-400">—</span>}
      </td>
      <td className="py-4 pr-3 text-[13px] tabular-nums">
        {row.delivered ? (
          <>
            <div className="text-ink-900 font-semibold">
              {row.delivered.rate}
            </div>
            <div className="text-[11.5px] text-ink-500">
              {row.delivered.n.toLocaleString()} / {row.delivered.total.toLocaleString()}
            </div>
          </>
        ) : (
          <span className="text-ink-400">—</span>
        )}
      </td>
      <td className="py-4 pr-3 text-[13px] tabular-nums">
        {row.openRate ? (
          <>
            <div className="text-ink-900 font-semibold">
              {row.openRate.rate}
            </div>
            <div className="text-[11.5px] text-ink-500">
              {row.openRate.n.toLocaleString()} / {row.openRate.total.toLocaleString()}
            </div>
          </>
        ) : (
          <span className="text-ink-400">—</span>
        )}
      </td>
      <td className="py-4 pr-3">
        <StatusPill status={row.status} scheduledLabel={row.scheduledLabel ?? null} />
      </td>
      <td className="py-4 pr-5 text-right">
        <div ref={menuRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open row actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 cursor-pointer transition-colors"
          >
            <MoreHorizontal className="size-4" strokeWidth={2} />
          </button>
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] z-20 w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1"
            >
              <MenuItem
                icon={<Eye className="size-3.5" strokeWidth={2} />}
                label="View details"
                onClick={() => action("View details")}
              />
              {row.status === "sent" && (
                <MenuItem
                  icon={<Send className="size-3.5" strokeWidth={2} />}
                  label="Resend"
                  onClick={() => action("Resend")}
                />
              )}
              {row.status === "scheduled" && (
                <MenuItem
                  icon={<Pencil className="size-3.5" strokeWidth={2} />}
                  label="Edit schedule"
                  onClick={() => action("Edit schedule")}
                />
              )}
              {row.status === "draft" && (
                <MenuItem
                  icon={<Pencil className="size-3.5" strokeWidth={2} />}
                  label="Edit draft"
                  onClick={() => action("Edit draft")}
                />
              )}
              <MenuItem
                icon={<Copy className="size-3.5" strokeWidth={2} />}
                label="Duplicate"
                onClick={() => action("Duplicate")}
              />
              <div aria-hidden className="h-px my-1 bg-ink-100" />
              <MenuItem
                icon={<Trash2 className="size-3.5" strokeWidth={2} />}
                label="Delete"
                onClick={() => action("Delete")}
                danger
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] cursor-pointer",
        danger
          ? "text-rose-600 hover:bg-rose-50"
          : "text-ink-700 hover:bg-cream-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusPill({
  status,
  scheduledLabel,
}: {
  status: EmailStatus;
  scheduledLabel: string | null;
}) {
  const styles: Record<EmailStatus, string> = {
    sent: "bg-success-bg text-success border border-success/20",
    scheduled: "bg-amber-100 text-amber-700 border border-amber-200",
    draft: "bg-ink-100 text-ink-600 border border-ink-200",
  };
  return (
    <div>
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold",
          styles[status],
        )}
      >
        {STATUS_LABEL[status]}
      </span>
      {status === "scheduled" && scheduledLabel && (
        <div className="text-[11px] text-ink-500 mt-1">— {scheduledLabel}</div>
      )}
    </div>
  );
}

function Pagination() {
  // Mock data fits on one page — control is wired but only "1" is reachable.
  return (
    <div className="flex items-center gap-1 text-[12.5px]">
      <button
        type="button"
        aria-label="Previous page"
        disabled
        className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-300 cursor-not-allowed"
      >
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </button>
      <span className="size-9 inline-flex items-center justify-center rounded-[10px] bg-rose-100 text-rose-700 font-semibold tabular-nums">
        1
      </span>
      <button
        type="button"
        aria-label="Next page"
        disabled
        className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-300 cursor-not-allowed"
      >
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 leading-snug">
          {title}
        </div>
        <p className="text-[11.5px] text-ink-500 leading-snug mt-0.5">
          {body}
        </p>
      </div>
    </div>
  );
}
