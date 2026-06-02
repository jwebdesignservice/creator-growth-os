/* Timeline ──────────────────────────────────────────────────────────────
   Vertical activity feed and a support-style communication thread — the
   shapes used in community activity, dashboards, and support tickets.
   ───────────────────────────────────────────────────────────────────── */

import { UserPlus, CircleCheck, Upload, MessageCircle, type LucideIcon } from "lucide-react";

export function ActivityTimeline() {
  const events: { icon: LucideIcon; tone: string; text: string; time: string }[] = [
    { icon: UserPlus, tone: "bg-rose-100 text-rose-600", text: "Amelia Park joined Creator Launchpad", time: "2m ago" },
    { icon: CircleCheck, tone: "bg-success-bg text-success", text: "Marcus completed Module 3", time: "1h ago" },
    { icon: Upload, tone: "bg-cream-200 text-ink-500", text: "New tutorial published — Hook writing", time: "3h ago" },
    { icon: MessageCircle, tone: "bg-cream-200 text-ink-500", text: "Priya posted in #wins", time: "5h ago" },
  ];
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-4">Activity</h3>
      <ol>
        {events.map((e, i) => {
          const Icon = e.icon;
          const last = i === events.length - 1;
          return (
            <li key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className={"size-8 rounded-full inline-flex items-center justify-center shrink-0 " + e.tone}>
                  <Icon className="size-4" strokeWidth={1.9} />
                </span>
                {!last && <span className="w-0.5 flex-1 my-1 bg-cream-200 rounded" />}
              </div>
              <div className="pb-5 min-w-0">
                <p className="text-[13px] text-ink-700 leading-snug">{e.text}</p>
                <span className="text-[11.5px] text-ink-400">{e.time}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function CommunicationThread() {
  const msgs = [
    { who: "S", you: false, text: "Hi! Thanks for reaching out — can you share a screenshot?", time: "10:02" },
    { who: "You", you: true, text: "Just sent it over. The export button does nothing.", time: "10:05" },
    { who: "S", you: false, text: "Got it — escalating to the team now. Fix incoming today.", time: "10:09" },
  ];
  return (
    <div className="card p-4 w-[460px] max-w-full space-y-3">
      {msgs.map((m, i) => (
        <div key={i} className={"flex gap-2.5 " + (m.you ? "flex-row-reverse" : "")}>
          <span
            className={
              "size-8 rounded-full inline-flex items-center justify-center text-white text-[11px] font-semibold shrink-0 " +
              (m.you ? "bg-rose-600" : "bg-ink-400")
            }
          >
            {m.who}
          </span>
          <div className={m.you ? "max-w-[78%] text-right" : "max-w-[78%]"}>
            <div
              className={
                "rounded-[14px] px-3.5 py-2.5 text-[13px] leading-snug text-left " +
                (m.you
                  ? "bg-rose-600 text-white rounded-tr-[4px]"
                  : "bg-cream-100 text-ink-700 rounded-tl-[4px]")
              }
            >
              {m.text}
            </div>
            <span className="text-[10.5px] text-ink-400 mt-1 inline-block">{m.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
