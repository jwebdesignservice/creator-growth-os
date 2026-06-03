/* Engagement ───────────────────────────────────────────────────────────────
   Audience-interaction surfaces — an incoming-comments inbox (to reply to)
   and a story-poll result. Creator engagement.
   ───────────────────────────────────────────────────────────────────── */

import { MessageCircle, Reply } from "lucide-react";

export function CommentsInbox() {
  const comments = [
    { i: "AP", n: "amelia", c: "This helped so much, thank you! 🙏", t: "2m" },
    { i: "ML", n: "marcus_fit", c: "What camera do you use?", t: "14m" },
    { i: "PS", n: "priya", c: "First! 🔥", t: "1h" },
  ];
  return (
    <div className="card p-2 w-[400px] max-w-full">
      <div className="px-3 py-2 flex items-center justify-between">
        <h3 className="text-h5 text-ink-900">Comments</h3>
        <span className="chip chip-rose">7 new</span>
      </div>
      <div className="divide-y divide-ink-100">
        {comments.map((c, i) => (
          <div key={i} className="flex items-start gap-3 px-3 py-3">
            <span className="size-8 rounded-full bg-rose-100 text-rose-600 text-[11px] font-semibold inline-flex items-center justify-center shrink-0">{c.i}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[12px]">
                <span className="font-semibold text-ink-900">@{c.n}</span> <span className="text-ink-400">· {c.t}</span>
              </div>
              <p className="text-[13px] text-ink-700 leading-snug">{c.c}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[12px] font-medium text-rose-600 shrink-0">
              <Reply className="size-3.5" strokeWidth={2} />
              Reply
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PollResult() {
  const opts = [
    { label: "Morning workouts", pct: 68 },
    { label: "Evening workouts", pct: 32 },
  ];
  return (
    <div className="card p-5 w-[340px] max-w-full">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="size-4 text-rose-500" strokeWidth={2} />
        <h3 className="text-[13.5px] font-bold text-ink-900">Story poll · 2,481 votes</h3>
      </div>
      <div className="space-y-2.5">
        {opts.map((o, i) => (
          <div key={i} className="relative h-10 rounded-[10px] bg-cream-100 overflow-hidden flex items-center px-3">
            <div className={"absolute inset-y-0 left-0 " + (i === 0 ? "bg-rose-200" : "bg-cream-200")} style={{ width: `${o.pct}%` }} />
            <span className="relative text-[13px] font-medium text-ink-900 flex-1">{o.label}</span>
            <span className="relative text-[13px] font-bold text-ink-900 tabular-nums">{o.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
