"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { postReply } from "@/lib/dev-dashboard/support-actions";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   TicketReplyForm — dev-side composer for replying to a support ticket.

   Wires the existing `postReply` server action (src/lib/dev-dashboard/
   support-actions.ts). The action inserts a `support_ticket_messages` row
   with `author: 'support'`, which the user-facing /support/tickets/[id]
   page already renders as a tinted "Support" block (verified — see
   src/app/(app)/support/tickets/[id]/page.tsx:107-117).

   Realtime is also enabled on support_ticket_messages (migration 0017)
   so a reply posted here propagates to the user without a refresh — as
   long as their browser tab is open.
   ───────────────────────────────────────────────────────────────────────── */

const MAX_LEN = 4000;
const MIN_LEN = 1;

type Status = { kind: "idle" } | { kind: "ok" } | { kind: "err"; msg: string };

export function TicketReplyForm({
  ticketPublicId,
}: {
  ticketPublicId: string | null;
}) {
  const router = useRouter();
  const [body, setBody]       = useState("");
  const [status, setStatus]   = useState<Status>({ kind: "idle" });
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // No selected ticket → render a quiet placeholder so the bottom row
  // never collapses when the queue is empty.
  if (!ticketPublicId) {
    return (
      <div className="dev-card p-4 text-[12px] text-[var(--dev-text-muted)] text-center">
        Select a ticket above to reply.
      </div>
    );
  }

  const trimmed     = body.trim();
  const canSubmit   = trimmed.length >= MIN_LEN && trimmed.length <= MAX_LEN && !isPending;
  const charsLeft   = MAX_LEN - body.length;
  const overLimit   = body.length > MAX_LEN;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    startTransition(async () => {
      const res = await postReply(ticketPublicId!, trimmed);
      if (res.ok) {
        setBody("");
        setStatus({ kind: "ok" });
        // Refresh the timeline so the new message appears immediately
        // (Realtime will also fire, but refresh guarantees a sync render).
        router.refresh();
        // Auto-clear the success badge after 2.5s so it doesn't linger.
        setTimeout(() => setStatus({ kind: "idle" }), 2500);
      } else {
        setStatus({ kind: "err", msg: res.error });
      }
    });
  }

  return (
    <form
      onSubmit={submit}
      className="dev-card p-4 flex flex-col gap-3"
      aria-label={`Reply to ticket ${ticketPublicId}`}
    >
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="dev-reply-body"
          className="text-[12px] font-semibold text-[var(--dev-text-primary)]"
        >
          Reply to client
          <span className="ml-1.5 font-mono text-[11px] text-[var(--dev-text-muted)]">
            {ticketPublicId}
          </span>
        </label>
        {status.kind === "ok" && (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--dev-success-text)]">
            <CheckCircle2 className="size-3.5" strokeWidth={2} />
            Sent
          </span>
        )}
        {status.kind === "err" && (
          <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[var(--dev-danger-text)]" title={status.msg}>
            <AlertTriangle className="size-3.5" strokeWidth={2} />
            Failed
          </span>
        )}
      </div>

      <textarea
        id="dev-reply-body"
        ref={inputRef}
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (status.kind !== "idle") setStatus({ kind: "idle" });
        }}
        onKeyDown={(e) => {
          // Cmd/Ctrl-Enter to send is the standard for ops consoles.
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
            e.preventDefault();
            submit(e as unknown as React.FormEvent);
          }
        }}
        rows={3}
        placeholder="Write a reply. The client will see this in their support thread."
        className={cn(
          "w-full resize-y min-h-[88px] rounded-[10px] bg-[var(--dev-surface-soft)] border px-3 py-2 text-[13px] text-[var(--dev-text-primary)] placeholder:text-[var(--dev-text-muted)] focus:outline-none focus:ring-2 transition-colors",
          overLimit
            ? "border-[var(--dev-danger-border)] focus:border-[var(--dev-danger-border)] focus:ring-[var(--dev-danger-soft)]"
            : "border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] focus:border-[var(--dev-accent-border)] focus:ring-[var(--dev-accent-soft)]",
        )}
      />

      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "text-[11px] tabular-nums",
            overLimit
              ? "text-[var(--dev-danger-text)] font-semibold"
              : "text-[var(--dev-text-muted)]",
          )}
          aria-live="polite"
        >
          {charsLeft.toLocaleString()} chars left · ⌘↵ to send
        </span>
        <button
          type="submit"
          disabled={!canSubmit}
          className={cn(
            "inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] text-[12.5px] font-semibold border transition-colors",
            canSubmit
              ? "bg-[var(--dev-accent)] border-[var(--dev-accent)] text-white hover:bg-[var(--dev-accent-hover)]"
              : "bg-[var(--dev-surface-soft)] border-[var(--dev-border)] text-[var(--dev-text-faint)] cursor-not-allowed",
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
