/* Composer ────────────────────────────────────────────────────────────────
   Message composers — a support reply box (Reply / Internal-note toggle,
   quick-reply chips, toolbar, char count) and a simple comment box. Distinct
   from the conversational chat composer.
   ───────────────────────────────────────────────────────────────────── */

import { Send, Paperclip, AtSign, Smile, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

function Tool({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="size-8 rounded-[8px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-700 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
    >
      <Icon className="size-4" strokeWidth={1.9} />
    </button>
  );
}

export function ReplyComposer() {
  const tabs = ["Reply", "Internal note"];
  return (
    <div className="card p-3 w-[460px] max-w-full">
      <div className="flex items-center gap-1 mb-2">
        {tabs.map((t, i) => (
          <button
            key={t}
            type="button"
            aria-pressed={i === 0}
            className={cn(
              "h-8 px-3 rounded-[9px] text-[12.5px] font-medium inline-flex items-center cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200",
              i === 0 ? "bg-rose-50 text-rose-700" : "text-ink-500 hover:bg-cream-100 hover:text-ink-800",
            )}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-[11px] text-ink-400">⌘↵ to send</span>
      </div>
      <textarea
        readOnly
        rows={3}
        className="w-full rounded-[10px] border border-ink-200 bg-white p-3 text-[13px] text-ink-900 resize-none focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
        defaultValue="Thanks for reaching out — I've escalated this to the team and we'll have a fix out today."
      />
      <div className="flex flex-wrap gap-1.5 mt-2">
        {["Thanks!", "Investigating", "Resolved"].map((q) => (
          <button
            key={q}
            type="button"
            className="inline-flex items-center h-6 px-2.5 rounded-full bg-cream-100 text-ink-600 text-[11.5px] font-medium cursor-pointer transition-colors hover:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2 pt-2 border-t border-ink-100">
        <Tool icon={Paperclip} label="Attach file" />
        <Tool icon={AtSign} label="Mention" />
        <Tool icon={Smile} label="Emoji" />
        <span className="ml-auto text-[11px] text-ink-400 mr-1 tabular-nums">142/500</span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[13px] font-semibold cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
        >
          <Send className="size-3.5" strokeWidth={2} />
          Send
        </button>
      </div>
    </div>
  );
}

export function CommentBox() {
  return (
    <div className="w-[420px] max-w-full flex items-start gap-2.5">
      <span className="size-9 rounded-full bg-rose-600 text-white text-[12px] font-semibold inline-flex items-center justify-center shrink-0">JW</span>
      <div className="flex-1 rounded-[12px] border border-ink-200 bg-white p-2.5 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-colors">
        <div className="text-[13px] text-ink-400 px-1 py-1">Add a comment…</div>
        <div className="flex items-center justify-end gap-1.5 mt-1">
          <button type="button" aria-label="Emoji" className="size-8 rounded-[8px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-ink-700 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">
            <Smile className="size-4" strokeWidth={1.9} />
          </button>
          <button type="button" aria-label="Send comment" className="inline-flex items-center justify-center size-8 rounded-[8px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50">
            <Send className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
