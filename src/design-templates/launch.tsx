/* Launch ────────────────────────────────────────────────────────────────────
   Launch surfaces — a countdown timer card and a waitlist signup. Creator
   product launches / drops.
   ───────────────────────────────────────────────────────────────────── */

import { Rocket, ArrowRight } from "lucide-react";

export function CountdownCard() {
  const units = [
    { v: "04", l: "Days" },
    { v: "12", l: "Hrs" },
    { v: "38", l: "Min" },
    { v: "21", l: "Sec" },
  ];
  return (
    <div className="card p-6 w-[380px] max-w-full text-center">
      <span className="size-11 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center mx-auto">
        <Rocket className="size-5" strokeWidth={1.9} />
      </span>
      <h3 className="text-h4 text-ink-900 mt-3">Course launches in</h3>
      <div className="flex items-center justify-center gap-2 mt-4">
        {units.map((u) => (
          <div key={u.l} className="flex flex-col items-center">
            <span className="size-14 rounded-[12px] bg-ink-900 text-white text-[22px] font-bold tabular-nums inline-flex items-center justify-center">{u.v}</span>
            <span className="text-[10.5px] text-ink-400 mt-1.5 uppercase tracking-wide">{u.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WaitlistForm() {
  return (
    <div className="card p-6 w-[380px] max-w-full text-center">
      <h3 className="text-h4 text-ink-900">Join the waitlist</h3>
      <p className="text-[13px] text-ink-500 mt-1">Be first to know when the course drops.</p>
      <div className="flex items-center gap-2 mt-4">
        <div className="flex-1 h-11 rounded-[12px] border border-ink-200 bg-white px-3.5 flex items-center text-[13.5px] text-ink-400">you@example.com</div>
        <span className="inline-flex items-center gap-1.5 h-11 px-4 rounded-[12px] bg-rose-600 text-white text-[13.5px] font-semibold shrink-0">
          Join
          <ArrowRight className="size-4" strokeWidth={2} />
        </span>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="flex -space-x-1.5">
          {["A", "M", "P"].map((x, i) => (
            <span key={i} className="size-5 rounded-full bg-rose-200 text-rose-700 text-[9px] font-semibold inline-flex items-center justify-center ring-2 ring-white">{x}</span>
          ))}
        </span>
        <span className="text-[11.5px] text-ink-400">2,140 already joined</span>
      </div>
    </div>
  );
}
