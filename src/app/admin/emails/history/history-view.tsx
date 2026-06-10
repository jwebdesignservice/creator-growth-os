"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  CheckCircle2,
  Shield,
  Search,
  UserRound,
  ChevronDown,
  RefreshCw,
  Download,
  Mail,
  Eye,
  MousePointerClick,
  AlertTriangle,
  MoreHorizontal,
  Type,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  XCircle,
  Loader2,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  resendCampaign,
  cancelScheduledMessage,
  deleteEmailMessage,
} from "../actions";

/* ───────────────────────────────────────────────────────────────────── */
/* Types — real data fed from the server component (history/page.tsx).    */

export type EmailStatus =
  | "draft"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "canceled";

export type EmailHistoryRow = {
  id: string;
  subject: string;
  body: string;
  audience: string;
  status: EmailStatus;
  /** Pretty "May 13, 2025 9:41 AM" or null when never sent. */
  sentAtLabel: string | null;
  /** Pretty scheduled time or null. */
  scheduledLabel: string | null;
  delivered: { n: number; total: number } | null;
};

export type HistoryStat = {
  /** stable key so we can pick an icon + good/bad trend semantics */
  key: "sent" | "delivered" | "open" | "click" | "bounce";
  label: string;
  value: string;
  hint: string;
};

export type HistoryUsage = { used: number; limit: number; safeMode: boolean };

const STATUS_LABEL: Record<EmailStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
  canceled: "Canceled",
};

const STAT_ICON: Record<HistoryStat["key"], LucideIcon> = {
  sent: Mail,
  delivered: CheckCircle2,
  open: Eye,
  click: MousePointerClick,
  bounce: AlertTriangle,
};

/* ───────────────────────────────────────────────────────────────────── */

export function HistoryView({
  rows,
  stats,
  usage,
}: {
  rows: EmailHistoryRow[];
  stats: HistoryStat[];
  usage: HistoryUsage;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"custom" | "automated">("custom");
  const [subjectQuery, setSubjectQuery] = useState("");
  const [recipientQuery, setRecipientQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | EmailStatus>("all");
  const [verifyDismissed] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, startRefresh] = useTransition();
  const [preview, setPreview] = useState<EmailHistoryRow | null>(null);

  const PAGE_SIZE = 10;

  const filtered = useMemo(() => {
    let list = rows.slice();
    if (subjectQuery)
      list = list.filter((r) =>
        r.subject.toLowerCase().includes(subjectQuery.toLowerCase()),
      );
    if (recipientQuery)
      list = list.filter((r) =>
        r.audience.toLowerCase().includes(recipientQuery.toLowerCase()),
      );
    if (statusFilter !== "all")
      list = list.filter((r) => r.status === statusFilter);
    return list;
  }, [rows, subjectQuery, recipientQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  function refresh() {
    startRefresh(() => router.refresh());
  }

  function exportCsv() {
    const header = ["Subject", "Audience", "Sent at", "Delivered", "Status"];
    const lines = filtered.map((r) => [
      r.subject,
      r.audience,
      r.sentAtLabel ?? "",
      r.delivered ? `${r.delivered.n} / ${r.delivered.total}` : "",
      STATUS_LABEL[r.status],
    ]);
    const csv = [header, ...lines]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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

  const remaining = Math.max(0, usage.limit - usage.used);

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-h1 text-ink-900 leading-tight mb-1">History</h1>
          <p className="text-ink-500 text-[14px]">
            Review sent emails, scheduled sends, drafts, and delivery activity
            across your audience.
          </p>
        </div>
        <Link
          href="/admin/emails/settings"
          className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
        >
          <HelpCircle className="size-4" strokeWidth={2} />
          Email settings
        </Link>
      </header>

      {/* ── Banners ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <div className="rounded-[14px] border border-success/20 bg-success-bg/40 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="size-5 text-success shrink-0" strokeWidth={2} />
          <div className="flex-1 min-w-0">
            <div className="text-[13.5px] font-semibold text-ink-900">
              {usage.safeMode ? "Safe mode is on" : "Sending available"}
            </div>
            <p className="text-[12.5px] text-ink-500 mt-0.5 tabular-nums">
              {usage.safeMode
                ? "Campaigns are redirected to your test inbox — real users are protected."
                : `${remaining.toLocaleString()} of ${usage.limit.toLocaleString()} emails remaining in the current 24-hour window.`}
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
            <Shield className="size-5 text-amber-600 shrink-0" strokeWidth={2} />
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-ink-900">
                Verify your sending domain to improve deliverability.
              </div>
              <p className="text-[12.5px] text-ink-500 mt-0.5">
                Authenticating your domain builds trust and reduces spam risk.
              </p>
            </div>
            <Link
              href="/admin/emails/settings#domain"
              className="inline-flex items-center h-9 px-3.5 rounded-[10px] bg-white border border-amber-300 text-amber-700 text-[12.5px] font-semibold hover:bg-amber-100 transition-colors shrink-0"
            >
              Verify domain
            </Link>
          </div>
        )}
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="border-b border-ink-100 mb-5 flex items-center gap-1">
        <TabButton active={tab === "custom"} onClick={() => setTab("custom")}>
          Custom emails
        </TabButton>
        <TabButton active={tab === "automated"} onClick={() => setTab("automated")}>
          Automated emails
        </TabButton>
      </div>

      {tab === "automated" ? (
        <div className="card p-10 text-center">
          <span className="size-12 rounded-full bg-cream-200 text-ink-500 inline-flex items-center justify-center mb-3 mx-auto">
            <Sparkles className="size-5" strokeWidth={1.8} />
          </span>
          <h2 className="text-h4 text-ink-900 mb-1">Automated emails aren&apos;t set up yet</h2>
          <p className="text-[13px] text-ink-500 max-w-md mx-auto">
            Lifecycle automations (welcome series, re-engagement, completion
            follow-ups) are a future phase. Custom campaigns you send today appear
            under the Custom emails tab.
          </p>
        </div>
      ) : (
        <>
          {/* ── Toolbar ──────────────────────────────────────────────── */}
          <div className="card p-3 mb-5 flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
              <input
                type="search"
                value={subjectQuery}
                onChange={(e) => { setSubjectQuery(e.target.value); setPage(1); }}
                placeholder="Search by subject..."
                className="w-full h-11 pl-10 pr-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
              />
            </div>
            <div className="relative flex-1 min-w-[200px]">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
              <input
                type="search"
                value={recipientQuery}
                onChange={(e) => { setRecipientQuery(e.target.value); setPage(1); }}
                placeholder="Search by audience..."
                className="w-full h-11 pl-10 pr-3 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 transition-colors"
              />
            </div>
            <StatusDropdown value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors"
            >
              <RefreshCw className={cn("size-3.5 text-ink-500", refreshing && "animate-spin")} strokeWidth={2} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-2 h-11 px-4 rounded-[12px] border border-ink-200 bg-white text-[13.5px] font-semibold text-ink-700 hover:bg-cream-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="size-3.5 text-ink-500" strokeWidth={2} />
              Export
            </button>
          </div>

          {/* ── Stat cards ─────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
            {stats.map((s) => (
              <StatCard key={s.key} stat={s} />
            ))}
          </div>

          {/* ── Body: table + insights ─────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
            <section className="card overflow-hidden">
              <header className="px-5 py-4 border-b border-ink-100">
                <h2 className="text-[15px] font-bold text-ink-900">Recent email activity</h2>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 bg-cream-50/40">
                      <th className="py-3 pl-5 pr-3">Subject</th>
                      <th className="py-3 pr-3">Audience</th>
                      <th className="py-3 pr-3">Sent at</th>
                      <th className="py-3 pr-3">Delivered</th>
                      <th className="py-3 pr-3">Status</th>
                      <th className="py-3 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-[13px] text-ink-500">
                          {rows.length === 0
                            ? "No emails yet — campaigns you send or schedule will appear here."
                            : "No emails match your filters."}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((row) => (
                        <EmailRow
                          key={row.id}
                          row={row}
                          onPreview={() => setPreview(row)}
                          onChanged={() => router.refresh()}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <footer className="px-5 py-3 border-t border-ink-100 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[12px] text-ink-500 tabular-nums">
                  {filtered.length === 0
                    ? "0 emails"
                    : `Showing ${start + 1} to ${start + pageRows.length} of ${filtered.length} emails`}
                </span>
                <Pagination current={currentPage} total={totalPages} onChange={setPage} />
              </footer>
            </section>

            {/* Delivery insights */}
            <aside className="card p-5 xl:sticky xl:top-4">
              <header className="flex items-center gap-2 mb-4">
                <Sparkles className="size-4 text-rose-600" strokeWidth={2} fill="currentColor" />
                <h3 className="text-[14px] font-bold text-ink-900">Best practices</h3>
              </header>
              <div className="space-y-4">
                <InsightCard icon={Type} title="Short subject lines perform best" body="Subjects with 6–8 words tend to see higher open rates." />
                <InsightCard icon={Clock} title="Send mid-morning on weekdays" body="Tuesday–Thursday around 10 AM is a reliable window." />
                <InsightCard icon={Shield} title="Verify your domain" body="Authenticated domains reduce spam risk and improve deliverability." />
              </div>
              <Link
                href="/admin/emails/settings"
                className="mt-5 w-full inline-flex items-center justify-center h-11 rounded-[12px] bg-rose-100 text-rose-700 hover:bg-rose-200 text-[13.5px] font-semibold transition-colors"
              >
                Open email settings
              </Link>
            </aside>
          </div>
        </>
      )}

      {preview && <PreviewModal row={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/* Row + actions                                                          */

function EmailRow({
  row,
  onPreview,
  onChanged,
}: {
  row: EmailHistoryRow;
  onPreview: () => void;
  onChanged: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setMenuOpen(false);
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? "Action failed.");
        return;
      }
      onChanged();
    });
  }

  const canResend = row.status === "sent" || row.status === "failed";
  const canSendNow = row.status === "draft" || row.status === "scheduled";
  const canCancel = row.status === "scheduled";

  return (
    <tr className="border-t border-ink-100 hover:bg-cream-50/60 transition-colors">
      <td className="py-4 pl-5 pr-3">
        <button
          type="button"
          onClick={onPreview}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-900 hover:text-rose-700 text-left cursor-pointer transition-colors"
        >
          {row.subject || "(no subject)"}
          <Eye className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} />
        </button>
        {error && <div className="text-[11.5px] text-rose-600 mt-1">{error}</div>}
      </td>
      <td className="py-4 pr-3 text-[13px] text-ink-700">{row.audience}</td>
      <td className="py-4 pr-3 text-[13px] text-ink-700 whitespace-nowrap">
        {row.sentAtLabel ?? <span className="text-ink-400">—</span>}
      </td>
      <td className="py-4 pr-3 text-[13px] tabular-nums">
        {row.delivered ? (
          <>
            <div className="text-ink-900 font-semibold">
              {row.delivered.total > 0
                ? `${Math.round((row.delivered.n / row.delivered.total) * 100)}%`
                : "—"}
            </div>
            <div className="text-[11.5px] text-ink-500">
              {row.delivered.n.toLocaleString()} / {row.delivered.total.toLocaleString()}
            </div>
          </>
        ) : (
          <span className="text-ink-400">—</span>
        )}
      </td>
      <td className="py-4 pr-3">
        <StatusPill status={row.status} scheduledLabel={row.scheduledLabel} />
      </td>
      <td className="py-4 pr-5 text-right">
        <div ref={menuRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open row actions"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            disabled={pending}
            className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 cursor-pointer transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <MoreHorizontal className="size-4" strokeWidth={2} />}
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-20 w-48 rounded-[12px] bg-white border border-ink-100 shadow-card py-1">
              <MenuItem icon={<Eye className="size-3.5" strokeWidth={2} />} label="Preview" onClick={() => { setMenuOpen(false); onPreview(); }} />
              {canSendNow && (
                <MenuItem icon={<Send className="size-3.5" strokeWidth={2} />} label="Send now" onClick={() => run(() => resendCampaign(row.id))} />
              )}
              {canResend && (
                <MenuItem icon={<Send className="size-3.5" strokeWidth={2} />} label={row.status === "failed" ? "Retry send" : "Resend"} onClick={() => run(() => resendCampaign(row.id))} />
              )}
              {canCancel && (
                <MenuItem icon={<XCircle className="size-3.5" strokeWidth={2} />} label="Cancel schedule" onClick={() => run(() => cancelScheduledMessage(row.id))} />
              )}
              <div aria-hidden className="h-px my-1 bg-ink-100" />
              <MenuItem
                icon={<Trash2 className="size-3.5" strokeWidth={2} />}
                label="Delete"
                danger
                onClick={() => {
                  if (!confirm(`Delete "${row.subject || "(no subject)"}"? This can't be undone.`)) {
                    setMenuOpen(false);
                    return;
                  }
                  run(() => deleteEmailMessage(row.id));
                }}
              />
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/* Preview modal                                                          */

function PreviewModal({ row, onClose }: { row: EmailHistoryRow; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Email preview"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-ink-900/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div className="w-full max-w-[600px] bg-white rounded-[16px] shadow-card border border-ink-100 overflow-hidden my-6" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-ink-100">
          <div className="flex items-center gap-2 min-w-0">
            <Eye className="size-4 text-rose-600 shrink-0" strokeWidth={2} />
            <h2 className="text-[15px] font-bold text-ink-900 truncate">Email preview</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="size-8 rounded-full inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900">
            <X className="size-4" strokeWidth={2} />
          </button>
        </header>
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusPill status={row.status} scheduledLabel={row.scheduledLabel} />
            <span className="text-[12px] text-ink-500">{row.audience}</span>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 mb-1">Subject</div>
            <div className="text-[15px] font-semibold text-ink-900">{row.subject || "(no subject)"}</div>
          </div>
          <div>
            <div className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 mb-1">Message</div>
            <div className="rounded-[12px] border border-ink-100 bg-cream-50/40 p-4 text-[13.5px] text-ink-800 leading-relaxed whitespace-pre-wrap">
              {row.body || "(empty message)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────── */
/* Helpers                                                                */

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-11 px-4 inline-flex items-center text-[13.5px] font-semibold border-b-2 -mb-px transition-colors",
        active ? "text-rose-600 border-rose-500" : "text-ink-500 hover:text-ink-900 border-transparent",
      )}
    >
      {children}
    </button>
  );
}

function StatusDropdown({ value, onChange }: { value: "all" | EmailStatus; onChange: (v: "all" | EmailStatus) => void }) {
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
        <option value="failed">Failed</option>
        <option value="canceled">Canceled</option>
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-3.5 text-ink-400 pointer-events-none" strokeWidth={2} />
    </div>
  );
}

function StatCard({ stat }: { stat: HistoryStat }) {
  const Icon = STAT_ICON[stat.key];
  return (
    <div className="card p-4 sm:p-5">
      <span className="size-10 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="text-[26px] font-bold text-ink-900 leading-tight tabular-nums">{stat.value}</div>
      <div className="text-[12.5px] text-ink-500 mt-0.5">{stat.label}</div>
      <div className="text-[11px] text-ink-400 mt-2 leading-snug">{stat.hint}</div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center gap-2 px-3 py-2 text-[12.5px] cursor-pointer",
        danger ? "text-rose-600 hover:bg-rose-50" : "text-ink-700 hover:bg-cream-100",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusPill({ status, scheduledLabel }: { status: EmailStatus; scheduledLabel: string | null }) {
  const styles: Record<EmailStatus, string> = {
    sent: "bg-success-bg text-success border border-success/20",
    sending: "bg-blue-100 text-blue-700 border border-blue-200",
    scheduled: "bg-amber-100 text-amber-700 border border-amber-200",
    draft: "bg-ink-100 text-ink-600 border border-ink-200",
    failed: "bg-rose-100 text-rose-700 border border-rose-200",
    canceled: "bg-ink-100 text-ink-500 border border-ink-200",
  };
  return (
    <div>
      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold", styles[status])}>
        {STATUS_LABEL[status]}
      </span>
      {status === "scheduled" && scheduledLabel && (
        <div className="text-[11px] text-ink-500 mt-1">— {scheduledLabel}</div>
      )}
    </div>
  );
}

function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
  return (
    <div className="flex items-center gap-1 text-[12.5px]">
      <button
        type="button"
        aria-label="Previous page"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 disabled:text-ink-300 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="size-3.5" strokeWidth={2} />
      </button>
      <span className="size-9 inline-flex items-center justify-center rounded-[10px] bg-rose-100 text-rose-700 font-semibold tabular-nums">
        {current}
      </span>
      <span className="text-ink-400 px-1 tabular-nums">/ {total}</span>
      <button
        type="button"
        aria-label="Next page"
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 disabled:text-ink-300 disabled:cursor-not-allowed"
      >
        <ChevronRight className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  );
}

function InsightCard({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 leading-snug">{title}</div>
        <p className="text-[11.5px] text-ink-500 leading-snug mt-0.5">{body}</p>
      </div>
    </div>
  );
}
