/* Comments ───────────────────────────────────────────────────────────────────
   Threaded comments on lessons & community posts — a comment with a nested
   reply, like / reply actions, and the composer. Grounded in the program
   comments surface (admin/programs/[id]/comments) and community posts.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Heart, Reply, MoreHorizontal, CornerDownRight } from "lucide-react";

function Initial({ name, tone }: { name: string; tone: string }) {
  return (
    <span className={`size-8 rounded-full inline-flex items-center justify-center text-[12px] font-bold shrink-0 ${tone}`}>
      {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
    </span>
  );
}

/* One action button so like / reply read identically everywhere (states incl.). */
function Action({ children, active = false }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`inline-flex items-center gap-1 text-[12px] font-medium rounded px-1 -mx-1 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 ${active ? "text-rose-600 hover:text-rose-700 active:text-rose-800" : "text-ink-500 hover:text-ink-700 active:text-ink-900"}`}
    >
      {children}
    </button>
  );
}

/* 1 · A comment with a nested reply — likes + reply affordances. */
export function CommentThread() {
  return (
    <div className="w-[460px] max-w-full space-y-4">
      {/* Parent */}
      <div className="flex gap-3">
        <Initial name="Mia Chen" tone="bg-rose-100 text-rose-700" />
        <div className="flex-1 min-w-0">
          <div className="rounded-[14px] bg-cream-50 border border-ink-100 px-3.5 py-2.5">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-semibold text-ink-900">Mia Chen</span>
              <span className="text-[11px] text-ink-400">2h ago</span>
            </div>
            <p className="text-[13px] text-ink-700 leading-relaxed">
              This hook framework completely changed my retention — went from 18% to 41% on my last three Reels. 🙌
            </p>
          </div>
          <div className="flex items-center gap-4 mt-1.5 pl-1">
            <Action active>
              <Heart className="size-3.5" fill="currentColor" strokeWidth={0} /> 24
            </Action>
            <Action>
              <Reply className="size-3.5" strokeWidth={2} /> Reply
            </Action>
            <button
              type="button"
              aria-label="More options"
              className="ml-auto rounded p-0.5 text-ink-400 cursor-pointer transition-colors hover:text-ink-700 hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
            >
              <MoreHorizontal className="size-4" strokeWidth={2} />
            </button>
          </div>

          {/* Reply */}
          <div className="flex gap-3 mt-3 pl-3 border-l-2 border-ink-100">
            <Initial name="Coach Dee" tone="bg-emerald-100 text-emerald-700" />
            <div className="flex-1 min-w-0">
              <div className="rounded-[14px] bg-white border border-ink-100 px-3.5 py-2.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-ink-900">Coach Dee</span>
                  <span className="inline-flex items-center h-4 px-1.5 rounded-full bg-rose-100 text-rose-700 text-[9.5px] font-bold uppercase">Coach</span>
                  <span className="text-[11px] text-ink-400">1h ago</span>
                </div>
                <p className="text-[13px] text-ink-700 leading-relaxed">
                  Love to see it, Mia! Try the open-loop variant next — it stacks well with this.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-1.5 pl-1">
                <Action>
                  <Heart className="size-3.5" strokeWidth={2} /> 7
                </Action>
                <Action>
                  <Reply className="size-3.5" strokeWidth={2} /> Reply
                </Action>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2 · The composer — add a comment. */
export function CommentComposer() {
  return (
    <div className="w-[460px] max-w-full flex gap-3">
      <Initial name="You" tone="bg-ink-900 text-cream-100" />
      <div className="flex-1 min-w-0">
        <div className="rounded-[14px] border border-ink-200 bg-white focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition">
          <textarea
            rows={2}
            placeholder="Add a comment…"
            defaultValue="Such a great breakdown — saving this for my next batch."
            className="w-full px-3.5 py-2.5 bg-transparent text-[13px] text-ink-900 placeholder:text-ink-400 outline-none resize-none"
          />
          <div className="flex items-center justify-between px-3 py-2 border-t border-ink-100">
            <span className="text-[11px] text-ink-400">Be kind. Comments are public.</span>
            <button
              type="button"
              className="inline-flex items-center h-8 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 3 · A compact comment row (moderation / admin list). */
export function CommentRow() {
  return (
    <div className="w-[460px] max-w-full rounded-[12px] border border-ink-100 bg-white px-4 py-3 flex items-start gap-3">
      <Initial name="Jordan Lee" tone="bg-indigo-100 text-indigo-700" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-ink-900">Jordan Lee</span>
          <CornerDownRight className="size-3 text-ink-300" strokeWidth={2} />
          <span className="text-[11.5px] text-ink-500 truncate">on “The 3-second hook framework”</span>
        </div>
        <p className="text-[12.5px] text-ink-500 leading-snug mt-0.5 line-clamp-2">
          Does this work for long-form YouTube too, or is it just short-form?
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button type="button" className="h-7 px-2.5 rounded-[8px] text-[11.5px] font-semibold text-ink-500 cursor-pointer transition-colors hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200">Hide</button>
        <button type="button" className="h-7 px-2.5 rounded-[8px] text-[11.5px] font-semibold text-rose-600 cursor-pointer transition-colors hover:bg-rose-50 active:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300">Reply</button>
      </div>
    </div>
  );
}
