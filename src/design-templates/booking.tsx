/* Booking ──────────────────────────────────────────────────────────────────────
   Scheduling a 1:1 — a time-slot picker (date strip + available slots) and a
   booking-confirmed card with the join link. For coaching calls / check-ins.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Clock, Check, Video, CalendarDays } from "lucide-react";
import { cn } from "@/lib/cn";

const DAYS = [
  { d: "Mon", n: "12", on: false },
  { d: "Tue", n: "13", on: true },
  { d: "Wed", n: "14", on: false },
  { d: "Thu", n: "15", on: false },
  { d: "Fri", n: "16", on: false },
];

const SLOTS = [
  { t: "9:00", state: "free" },
  { t: "10:30", state: "taken" },
  { t: "13:00", state: "selected" },
  { t: "14:30", state: "free" },
  { t: "16:00", state: "free" },
  { t: "17:30", state: "taken" },
];

/* 1 · Time-slot picker — date strip + slots grid. */
export function TimeSlotPicker() {
  return (
    <div className="w-[380px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays className="size-4 text-rose-600" strokeWidth={2} />
        <h3 className="text-[14px] font-bold text-ink-900">Book a coaching call</h3>
      </div>
      <div className="flex items-center gap-1.5 mb-4">
        {DAYS.map((day) => (
          <button
            key={day.n}
            type="button"
            aria-pressed={day.on}
            className={cn(
              "flex-1 rounded-[10px] border py-2 flex flex-col items-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-1",
              day.on ? "border-rose-300 bg-rose-50 text-rose-700" : "border-ink-100 text-ink-500 hover:bg-cream-50 active:bg-cream-100",
            )}
          >
            <span className="text-[10.5px] uppercase tracking-wide">{day.d}</span>
            <span className="text-[15px] font-bold tabular-nums">{day.n}</span>
          </button>
        ))}
      </div>
      <div className="text-[11.5px] font-medium text-ink-500 mb-2">Tue, May 13 · 30-min slots</div>
      <div className="grid grid-cols-3 gap-2">
        {SLOTS.map((s) => (
          <button
            key={s.t}
            type="button"
            disabled={s.state === "taken"}
            aria-pressed={s.state === "selected"}
            className={cn(
              "h-10 rounded-[10px] text-[12.5px] font-semibold inline-flex items-center justify-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-1",
              s.state === "selected" && "bg-rose-600 text-white cursor-pointer active:bg-rose-800",
              s.state === "free" && "bg-white border border-ink-200 text-ink-700 cursor-pointer hover:border-rose-300 hover:text-rose-700 hover:bg-rose-50 active:bg-rose-100",
              s.state === "taken" && "bg-cream-100 text-ink-300 line-through cursor-not-allowed",
            )}
          >
            {s.state !== "taken" && <Clock className="size-3" strokeWidth={2} />}
            {s.t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* 2 · Booking confirmed — the success card with a join link. */
export function BookingConfirm() {
  return (
    <div className="w-[340px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 text-center shadow-card">
      <span className="mx-auto size-12 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center mb-3 ring-8 ring-emerald-50">
        <Check className="size-6" strokeWidth={2.4} />
      </span>
      <h3 className="text-[15px] font-bold text-ink-900">You&apos;re booked!</h3>
      <p className="text-[12.5px] text-ink-500 mt-1">A calendar invite is on its way.</p>
      <div className="mt-4 rounded-[12px] bg-cream-50 border border-ink-100 px-4 py-3 text-left">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-900">
          <CalendarDays className="size-4 text-rose-500" strokeWidth={2} />
          Tue, May 13 · 1:00 PM
        </div>
        <div className="text-[12px] text-ink-500 mt-1 pl-6">30 min with Coach Dee</div>
      </div>
      <button type="button" className="mt-3 w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
        <Video className="size-4" strokeWidth={2} /> Join call link
      </button>
    </div>
  );
}
