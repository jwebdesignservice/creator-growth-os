/* Chat ──────────────────────────────────────────────────────────────────
   Community chat building blocks — message bubbles (with admin badge,
   mentions and reply quotes), the message composer, and a channel list.
   Mirrors src/components/community/chat/*. Presentational only.
   ───────────────────────────────────────────────────────────────────── */

import {
  Hash,
  Pin,
  Reply,
  Send,
  Paperclip,
  Smile,
  Image as ImageIcon,
} from "lucide-react";

function Avatar({ initials, tone = "bg-rose-600" }: { initials: string; tone?: string }) {
  return (
    <span
      className={
        "size-9 rounded-full inline-flex items-center justify-center text-white text-[12.5px] font-semibold shrink-0 " +
        tone
      }
    >
      {initials}
    </span>
  );
}

export function MessageThread() {
  return (
    <div className="w-[480px] max-w-full space-y-1">
      {/* Message with admin badge */}
      <div className="flex items-start gap-3 px-2 py-1.5 rounded-[12px]">
        <Avatar initials="JW" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold text-ink-900 leading-none">Jack Wilson</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 leading-none">
              Admin
            </span>
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
              <Pin className="size-2.5" strokeWidth={2.5} />
              Pinned
            </span>
            <span className="text-[11px] text-ink-400 ml-auto">9:24 AM</span>
          </div>
          <p className="mt-0.5 text-[13.5px] text-ink-700 leading-relaxed">
            Welcome to the community! Drop your goals for the week below 👇
          </p>
        </div>
      </div>

      {/* Reply with a mention */}
      <div className="flex items-start gap-3 px-2 py-1.5 rounded-[12px] bg-cream-100/60">
        <Avatar initials="AP" tone="bg-ink-400" />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold text-ink-900 leading-none">Amelia Park</span>
            <span className="text-[11px] text-ink-400 ml-auto">9:31 AM</span>
          </div>
          <div className="mt-1 flex items-start gap-1.5 pl-2 border-l-2 border-rose-200 text-[12px] text-ink-500">
            <Reply className="size-3 text-rose-400 mt-0.5 shrink-0" strokeWidth={2} />
            <span className="min-w-0">
              <span className="font-semibold text-ink-700">Jack Wilson</span>
              <span className="ml-1.5">Drop your goals for the week…</span>
            </span>
          </div>
          <p className="mt-0.5 text-[13.5px] text-ink-700 leading-relaxed">
            Posting 5× this week —{" "}
            <span className="inline-flex items-center px-1 rounded-[4px] bg-rose-100 text-rose-700 font-medium">
              @jack
            </span>{" "}
            holding me to it!
          </p>
        </div>
      </div>
    </div>
  );
}

export function ChatComposer() {
  return (
    <div className="w-[480px] max-w-full rounded-[14px] border border-ink-100 bg-white p-2.5">
      <textarea
        readOnly
        rows={2}
        placeholder="Message #general…"
        className="w-full px-2 py-1 bg-transparent text-[13.5px] text-ink-900 placeholder:text-ink-400 outline-none resize-none"
      />
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-0.5">
          {[Paperclip, ImageIcon, Smile].map((Icon, i) => (
            <button
              key={i}
              type="button"
              aria-label="Attach"
              className="size-8 rounded-[9px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100 hover:text-ink-700 transition-colors"
            >
              <Icon className="size-4" strokeWidth={1.9} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors"
        >
          <Send className="size-3.5" strokeWidth={2.2} />
          Send
        </button>
      </div>
    </div>
  );
}

export function ChannelList() {
  const channels = [
    { name: "general", active: true, unread: 0 },
    { name: "wins", active: false, unread: 3 },
    { name: "feedback", active: false, unread: 0 },
    { name: "accountability", active: false, unread: 12 },
  ];
  return (
    <div className="w-[240px] max-w-full card p-2">
      <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
        Channels
      </p>
      <div className="flex flex-col gap-0.5">
        {channels.map((c) => (
          <button
            key={c.name}
            type="button"
            className={
              "flex items-center gap-2 h-9 px-2.5 rounded-[9px] text-[13.5px] transition-colors " +
              (c.active
                ? "bg-rose-50 text-rose-700 font-semibold"
                : "text-ink-500 hover:bg-cream-100 hover:text-ink-900")
            }
          >
            <Hash
              className={"size-4 shrink-0 " + (c.active ? "text-rose-600" : "text-ink-400")}
              strokeWidth={2}
            />
            <span className="flex-1 text-left">{c.name}</span>
            {c.unread > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-rose-600 text-white text-[10.5px] font-semibold tabular-nums">
                {c.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
