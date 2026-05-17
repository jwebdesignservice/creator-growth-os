"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { addTicketMessage } from "@/lib/support/actions";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   UserTicketReplyForm — composer on /support/tickets/[id].

   Wires the existing `addTicketMessage` server action. The action inserts
   a `support_ticket_messages` row with `author: 'user'`, which the dev
   /dev/support timeline already renders (interleaved with audit events).

   Realtime is enabled on support_ticket_messages (migration 0017) so a
   message posted here propagates to the dev's open `/dev/support` tab
   instantly via <SupportRealtime />.
   ───────────────────────────────────────────────────────────────────────── */

const MAX_LEN = 4000;
const MIN_LEN = 1;

type Status = { kind: "idle" } | { kind: "ok" } | { kind: "err"; msg: string };

export function UserTicketReplyForm({
  ticketId,
  disabled = false,
}: {
  /** Internal uuid of the ticket (support_tickets.id) — what
   *  support_ticket_messages.ticket_id FKs to. */
  ticketId: string;
  /** Set true when the ticket is closed/resolved so the user can't
   *  keep adding messages. The form renders a quiet placeholder. */
  disabled?: boolean;
}) {
  const router = useRouter();
  const [body, setBody]       = useState("");
  const [status, setStatus]   = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();

  if (disabled) {
    return (
      <div className="rounded-[12px] bg-cream-100 border border-cream-300 px-4 py-3 text-center text-[12.5px] text-ink-500">
        This ticket is closed. Open a new request from{" "}
        <span className="font-semibold text-ink-700">Support</span> if you need more help.
      </div>
    );
  }

  const trimmed   = body.trim();
  const canSubmit = trimmed.length >= MIN_LEN && trimmed.length <= MAX_LEN && !isPending;
  const charsLeft = MAX_LEN - body.length;
  const overLimit = body.length > MAX_LEN;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    startTransition(async () => {
      const res = await addTicketMessage(ticketId, trimmed);
      if (res.ok) {
        setBody("");
        setStatus({ kind: "ok" });
        router.refresh();
        setTimeout(() => setStatus({ kind: "idle" }), 2500);
      } else {
        setStatus({ kind: "err", msg: res.error });
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="card p-5 sm:p-6 space-y-3"
      aria-label="Reply to support"
    >
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="user-reply-body"
          className="text-[14px] font-semibold text-ink-900"
        >
          Reply
        </label>
        {status.kind === "ok" && (
          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-success">
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
            Sent
          </span>
        )}
        {status.kind === "err" && (
          <span
            className="inline-flex items-center gap-1 text-[12px] font-medium text-rose-700"
            title={status.msg}
          >
            <AlertTriangle className="size-3.5" strokeWidth={2} />
            {status.msg.length > 40 ? "Could not send" : status.msg}
          </span>
        )}
      </div>

      <textarea
        id="user-reply-body"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (status.kind !== "idle") setStatus({ kind: "idle" });
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
            e.preventDefault();
            submit(e as unknown as React.FormEvent);
          }
        }}
        rows={4}
        placeholder="Add more context, a screenshot link, or follow up on the latest reply."
        className={cn(
          "w-full resize-y min-h-[110px] rounded-[10px] bg-white border px-3.5 py-2.5 text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-colors",
          overLimit
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
            : "border-ink-200 hover:border-ink-300 focus:border-rose-300 focus:ring-rose-100",
        )}
      />

      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-[11.5px] tabular-nums",
            overLimit ? "text-rose-700 font-semibold" : "text-ink-400",
          )}
          aria-live="polite"
        >
          {charsLeft.toLocaleString()} chars left · ⌘↵ to send
        </span>
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-[13px] font-semibold transition-colors",
            canSubmit
              ? "bg-rose-600 text-white hover:bg-rose-700"
              : "bg-cream-200 text-ink-400 cursor-not-allowed",
          )}
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" strokeWidth={2} />
          ) : (
            <Send className="size-3.5" strokeWidth={2} />
          )}
          Send reply
        </button>
      </div>
    </form>
  );
}
