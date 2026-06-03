/* Support ─────────────────────────────────────────────────────────────────────
   Help / resolution-center surfaces — a support-ticket list row, the ticket
   conversation thread (member ↔ support), and the status/priority badge set.
   From Settings → Resolution center and the admin support inbox. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { LifeBuoy, Paperclip, CircleDot, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Status = "open" | "pending" | "resolved";

const STATUS: Record<Status, { label: string; cls: string; dot: string }> = {
  open:     { label: "Open",     cls: "bg-rose-50 text-rose-700 border-rose-100",        dot: "bg-rose-500" },
  pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-700 border-amber-100",     dot: "bg-amber-500" },
  resolved: { label: "Resolved", cls: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
};

function StatusPill({ s }: { s: Status }) {
  const m = STATUS[s];
  return (
    <span className={cn("inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border text-[11px] font-semibold", m.cls)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

/* 1 · Ticket list rows — subject, status, last update, ref. */
const TICKETS: { ref: string; subject: string; status: Status; when: string }[] = [
  { ref: "#4821", subject: "Video upload stuck at 67%", status: "open", when: "12m ago" },
  { ref: "#4810", subject: "Can't connect my TikTok account", status: "pending", when: "3h ago" },
  { ref: "#4788", subject: "Refund for duplicate charge", status: "resolved", when: "Yesterday" },
];

export function TicketList() {
  return (
    <div className="w-[460px] max-w-full rounded-[16px] border border-ink-100 bg-white overflow-hidden shadow-card">
      <div className="px-5 py-3.5 border-b border-ink-100 flex items-center gap-2">
        <LifeBuoy className="size-4 text-rose-500" strokeWidth={2} />
        <h3 className="text-[14px] font-bold text-ink-900">My support tickets</h3>
      </div>
      <ul className="divide-y divide-ink-100">
        {TICKETS.map((t) => (
          <li key={t.ref} className="flex items-center gap-3 px-5 py-3.5 hover:bg-cream-50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-[13.5px] font-semibold text-ink-900 truncate">{t.subject}</div>
              <div className="text-[11.5px] text-ink-400 mt-0.5 tabular-nums">
                {t.ref} · updated {t.when}
              </div>
            </div>
            <StatusPill s={t.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 2 · Ticket thread — the conversation, member vs. support bubbles. */
export function TicketThread() {
  return (
    <div className="w-[460px] max-w-full rounded-[16px] border border-ink-100 bg-white overflow-hidden shadow-card">
      <div className="px-5 py-3.5 border-b border-ink-100 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13.5px] font-bold text-ink-900 truncate">Video upload stuck at 67%</div>
          <div className="text-[11px] text-ink-400 tabular-nums">#4821 · opened 12m ago</div>
        </div>
        <StatusPill s="open" />
      </div>
      <div className="p-5 space-y-4 bg-cream-50/40">
        {/* Member */}
        <div className="flex justify-end">
          <div className="max-w-[80%]">
            <div className="rounded-[14px] rounded-br-[4px] bg-rose-600 text-white px-3.5 py-2.5 text-[13px] leading-relaxed">
              My 2 GB lesson video freezes at 67% every time. Tried twice.
            </div>
            <div className="text-[10.5px] text-ink-400 mt-1 text-right">You · 12m ago</div>
          </div>
        </div>
        {/* Support */}
        <div className="flex justify-start">
          <div className="max-w-[80%]">
            <div className="rounded-[14px] rounded-bl-[4px] bg-white border border-ink-100 text-ink-700 px-3.5 py-2.5 text-[13px] leading-relaxed">
              Thanks for the report! Resumable uploads should recover — can you tell me your browser? We&apos;ll take a look right away.
            </div>
            <div className="text-[10.5px] text-ink-400 mt-1">Support · 4m ago</div>
          </div>
        </div>
      </div>
      {/* Reply bar */}
      <div className="px-4 py-3 border-t border-ink-100 flex items-center gap-2">
        <button type="button" aria-label="Attach file" className="size-10 inline-flex items-center justify-center rounded-[10px] text-ink-400 cursor-pointer transition-colors hover:bg-cream-100 hover:text-ink-700 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">
          <Paperclip className="size-4" strokeWidth={2} />
        </button>
        <input
          type="text"
          placeholder="Write a reply…"
          className="flex-1 h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13px] outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
        />
        <button type="button" className="h-10 px-4 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
          Send
        </button>
      </div>
    </div>
  );
}

/* 3 · Status & priority badge set — the full vocabulary at a glance. */
export function TicketBadges() {
  return (
    <div className="w-[360px] max-w-full space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <StatusPill s="open" />
        <StatusPill s="pending" />
        <StatusPill s="resolved" />
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-rose-100 text-rose-700 text-[11px] font-semibold">
          <CircleDot className="size-3" strokeWidth={2.5} /> Urgent
        </span>
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-amber-100 text-amber-700 text-[11px] font-semibold">
          <Clock className="size-3" strokeWidth={2.5} /> Normal
        </span>
        <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full bg-cream-200 text-ink-500 text-[11px] font-semibold">
          <CheckCircle2 className="size-3" strokeWidth={2.5} /> Low
        </span>
      </div>
    </div>
  );
}
