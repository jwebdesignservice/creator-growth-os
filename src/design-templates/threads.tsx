/* Threads ─────────────────────────────────────────────────────────────────
   Nested comment thread — a parent comment with indented replies, each with
   avatar, like + reply actions. Distinct from the flat chat message list.
   ───────────────────────────────────────────────────────────────────── */

import { Heart, Reply } from "lucide-react";
import { cn } from "@/lib/cn";

function Comment({
  initials,
  name,
  time,
  body,
  likes,
  mine,
}: {
  initials: string;
  name: string;
  time: string;
  body: string;
  likes: number;
  mine?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={cn("size-8 rounded-full inline-flex items-center justify-center text-white text-[11px] font-semibold shrink-0", mine ? "bg-rose-600" : "bg-ink-400")}>
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-ink-900">{name}</span>
          <span className="text-[11px] text-ink-400">{time}</span>
        </div>
        <p className="text-[13px] text-ink-700 leading-snug mt-0.5">{body}</p>
        <div className="flex items-center gap-3 mt-1.5 text-[11.5px] text-ink-400">
          <span className="inline-flex items-center gap-1 hover:text-rose-600">
            <Heart className="size-3.5" strokeWidth={2} />
            {likes}
          </span>
          <span className="inline-flex items-center gap-1 hover:text-ink-700">
            <Reply className="size-3.5" strokeWidth={2} />
            Reply
          </span>
        </div>
      </div>
    </div>
  );
}

export function CommentThread() {
  return (
    <div className="card p-5 w-[460px] max-w-full">
      <Comment initials="AP" name="Amelia Park" time="2h" body="This hook framework is gold — landed me 3 brand DMs this week." likes={12} />
      <div className="mt-3 pl-3.5 ml-4 border-l-2 border-cream-200 space-y-3">
        <Comment initials="JW" name="Jack Wilson" time="1h" mine body="Amazing! Which hook angle worked best for you?" likes={3} />
        <Comment initials="ML" name="Marcus Lee" time="45m" body="Following — I want to try this too 🙌" likes={1} />
      </div>
    </div>
  );
}
