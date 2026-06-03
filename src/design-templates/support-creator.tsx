/* Support creator ──────────────────────────────────────────────────────────
   Fan-support surfaces — a tip-jar card (preset amounts) and a recent-
   supporters list. Creator monetization (tips / "buy me a coffee").
   ───────────────────────────────────────────────────────────────────── */

import { Heart, Coffee } from "lucide-react";

export function TipJarCard() {
  const amts = ["$3", "$5", "$10"];
  return (
    <div className="card p-5 w-[340px] max-w-full text-center">
      <span className="size-12 rounded-full bg-amber-100 text-amber-600 inline-flex items-center justify-center mx-auto">
        <Coffee className="size-6" strokeWidth={1.8} />
      </span>
      <h3 className="text-[15px] font-bold text-ink-900 mt-3">Buy me a coffee</h3>
      <p className="text-[12.5px] text-ink-500 mt-1">Support my free content ☕</p>
      <div className="flex items-center justify-center gap-2 mt-4">
        {amts.map((a, i) => (
          <span key={a} className={"h-10 px-4 rounded-[10px] text-[13px] font-semibold inline-flex items-center " + (i === 1 ? "bg-rose-600 text-white" : "bg-cream-100 text-ink-700 border border-ink-100")}>
            {a}
          </span>
        ))}
      </div>
      <button type="button" className="mt-3 w-full inline-flex items-center justify-center gap-2 h-11 rounded-[12px] bg-rose-600 text-white text-[13.5px] font-semibold">
        <Heart className="size-4" fill="currentColor" strokeWidth={0} />
        Support
      </button>
    </div>
  );
}

export function SupporterList() {
  const subs = [
    { i: "AP", n: "Amelia", a: "$10", m: "Love your morning routines!" },
    { i: "ML", n: "Marcus", a: "$5", m: "Keep it up 🙌" },
    { i: "PS", n: "Priya", a: "$3", m: "" },
  ];
  return (
    <div className="card p-5 w-[360px] max-w-full">
      <h3 className="text-h5 text-ink-900 mb-3">Recent supporters</h3>
      <ul className="space-y-3">
        {subs.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="size-8 rounded-full bg-rose-100 text-rose-600 text-[11px] font-semibold inline-flex items-center justify-center shrink-0">{s.i}</span>
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px]">
                <span className="font-semibold text-ink-900">{s.n}</span> tipped{" "}
                <span className="font-semibold text-rose-600">{s.a}</span>
              </div>
              {s.m && <div className="text-[12px] text-ink-500 leading-snug">{s.m}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
