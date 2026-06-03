/* Agenda ──────────────────────────────────────────────────────────────────
   Schedule surfaces — a day agenda (time slots with positioned events) and a
   single event card. Distinct from the month/strip Calendar and the
   activity Timeline.
   ───────────────────────────────────────────────────────────────────── */

import { Clock } from "lucide-react";
import { cn } from "@/lib/cn";

export function DayAgenda() {
  const slots = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM"];
  const events = [
    { start: 1, span: 1, title: "Film reel — hook series", tone: "bg-rose-100 border-rose-300 text-rose-700" },
    { start: 3, span: 2, title: "Edit + schedule posts", tone: "bg-violet-100 border-violet-300 text-violet-700" },
  ];
  const slotH = 48;
  return (
    <div className="card p-4 w-[360px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-ink-900">Wed, May 20</h3>
        <span className="text-[12px] text-ink-500">2 events</span>
      </div>
      <div className="relative">
        {slots.map((s) => (
          <div key={s} className="flex gap-3 border-t border-ink-100 first:border-t-0" style={{ height: slotH }}>
            <span className="w-12 text-[10.5px] text-ink-400 pt-1 shrink-0">{s}</span>
            <div className="flex-1" />
          </div>
        ))}
        <div className="absolute left-[60px] right-0 top-0 bottom-0">
          {events.map((e, i) => (
            <div
              key={i}
              className={cn("absolute left-0 right-1 rounded-[8px] border px-2.5 py-1.5 text-[12px] font-medium leading-snug", e.tone)}
              style={{ top: `${e.start * slotH + 2}px`, height: `${e.span * slotH - 6}px` }}
            >
              {e.title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function EventCard() {
  return (
    <div className="card p-4 w-[320px] max-w-full flex gap-3">
      <div className="flex flex-col items-center justify-center rounded-[10px] bg-rose-100 text-rose-700 w-12 py-2 shrink-0">
        <span className="text-[10px] font-semibold uppercase">May</span>
        <span className="text-[18px] font-bold leading-none">20</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-bold text-ink-900">Office hours</div>
        <div className="text-[12px] text-ink-500 inline-flex items-center gap-1 mt-0.5">
          <Clock className="size-3" strokeWidth={2} />
          3:00–4:00 PM
        </div>
        <div className="flex items-center gap-1 mt-2">
          {["A", "J", "M"].map((x, i) => (
            <span key={i} className="size-6 rounded-full bg-rose-200 text-rose-700 text-[10px] font-semibold inline-flex items-center justify-center ring-2 ring-white -ml-1 first:ml-0">
              {x}
            </span>
          ))}
          <span className="text-[11px] text-ink-400 ml-1.5">+12 going</span>
        </div>
      </div>
    </div>
  );
}
