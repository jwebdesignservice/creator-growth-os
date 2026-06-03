/* Testimonials ────────────────────────────────────────────────────────────────
   Social-proof surfaces — a testimonial card with rating, a large pull-quote,
   and a compact proof grid. For landing / sales / media-kit pages where a
   creator shows results. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Star, Quote } from "lucide-react";

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < n ? "size-3.5 text-amber-400" : "size-3.5 text-ink-200"}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

function Face({ name, tone }: { name: string; tone: string }) {
  return (
    <span className={`size-10 rounded-full inline-flex items-center justify-center text-[13px] font-bold shrink-0 ${tone}`}>
      {name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
    </span>
  );
}

/* 1 · Testimonial card — quote + rating + attribution. */
export function TestimonialCard() {
  return (
    <div className="w-[340px] max-w-full rounded-[18px] border border-ink-100 bg-white p-5 shadow-card">
      <Stars n={5} />
      <p className="text-[14px] text-ink-700 leading-relaxed mt-3 mb-4">
        “I launched my first cohort in a weekend and made $4,200. The setup guide held my hand the whole way.”
      </p>
      <div className="flex items-center gap-3">
        <Face name="Priya Anand" tone="bg-rose-100 text-rose-700" />
        <div className="min-w-0">
          <div className="text-[13px] font-bold text-ink-900 leading-tight">Priya Anand</div>
          <div className="text-[12px] text-ink-500">@priyacreates · 84K followers</div>
        </div>
      </div>
    </div>
  );
}

/* 2 · Pull quote — the large featured testimonial. */
export function TestimonialQuote() {
  return (
    <div className="w-[440px] max-w-full rounded-[20px] bg-gradient-to-br from-rose-50 to-cream-100 border border-rose-100 p-7 text-center shadow-card">
      <Quote className="size-7 text-rose-400 mx-auto mb-3" strokeWidth={2} fill="currentColor" />
      <p className="text-[18px] font-semibold text-ink-900 leading-snug max-w-[32ch] mx-auto">
        This is the first creator tool that actually paid for itself in week one.
      </p>
      <div className="flex items-center justify-center gap-3 mt-5">
        <Face name="Marcus Bell" tone="bg-ink-900 text-cream-100" />
        <div className="text-left">
          <div className="text-[13px] font-bold text-ink-900 leading-tight">Marcus Bell</div>
          <div className="text-[12px] text-ink-500">Fitness creator · 220K</div>
        </div>
      </div>
    </div>
  );
}

/* 3 · Proof grid — compact stacked mini-testimonials. */
export function TestimonialGrid() {
  const items = [
    { name: "Lena K.", tone: "bg-emerald-100 text-emerald-700", text: "Retention doubled in a month." },
    { name: "Sam O.", tone: "bg-indigo-100 text-indigo-700", text: "My members actually finish now." },
    { name: "Avery T.", tone: "bg-amber-100 text-amber-700", text: "Brand deals tripled this quarter." },
  ];
  return (
    <div className="w-[340px] max-w-full space-y-2.5">
      {items.map((it) => (
        <div key={it.name} className="flex items-center gap-3 rounded-[12px] border border-ink-100 bg-white px-3.5 py-2.5">
          <Face name={it.name} tone={it.tone} />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] text-ink-700 leading-snug">“{it.text}”</p>
            <div className="text-[11px] text-ink-400 mt-0.5">{it.name}</div>
          </div>
          <Stars n={5} />
        </div>
      ))}
    </div>
  );
}
