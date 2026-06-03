/* FAQ ─────────────────────────────────────────────────────────────────────────
   Frequently-asked-questions surfaces — an expandable Q&A accordion (one open)
   and a searchable FAQ with category chips. For help center / pricing / landing
   pages. Distinct from the generic `feedback` accordion: this is Q&A content.
   Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { ChevronDown, Search, MessageCircleQuestion } from "lucide-react";

const QA: { q: string; a: string; open?: boolean }[] = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes — upgrade or downgrade whenever you like. Changes are prorated, and your programs and data stay exactly where they are.",
    open: true,
  },
  { q: "How big a video can I upload?" , a: "Up to 50 GB per video, on every plan." },
  { q: "Do my members need an account?", a: "Members sign in with email — no app download required." },
  { q: "Can I export my audience?", a: "Anytime, as a CSV from Settings." },
];

/* 1 · FAQ accordion — one item expanded. */
export function FaqAccordion() {
  return (
    <div className="w-[440px] max-w-full rounded-[16px] border border-ink-100 bg-white divide-y divide-ink-100 overflow-hidden shadow-card">
      {QA.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            aria-expanded={!!item.open}
            className="w-full flex items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors cursor-pointer hover:bg-cream-50 active:bg-cream-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-200"
          >
            <span className={`text-[13.5px] font-semibold ${item.open ? "text-rose-700" : "text-ink-900"}`}>
              {item.q}
            </span>
            <ChevronDown
              className={`size-4 shrink-0 transition-transform ${item.open ? "rotate-180 text-rose-600" : "text-ink-400"}`}
              strokeWidth={2}
            />
          </button>
          {item.open && (
            <div className="px-5 pb-4 -mt-1">
              <p className="text-[13px] text-ink-500 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* 2 · Searchable FAQ — search bar + category chips + result. */
export function FaqSearch() {
  const cats = ["Billing", "Programs", "Uploads", "Account"];
  return (
    <div className="w-[440px] max-w-full">
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink-400" strokeWidth={2} />
        <input
          type="text"
          defaultValue="upload size"
          className="w-full h-11 pl-10 pr-3.5 rounded-[12px] border border-ink-200 bg-white text-[13.5px] text-ink-900 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition"
        />
      </div>
      <div className="flex items-center gap-1.5 flex-wrap mb-3">
        {cats.map((c, i) => (
          <span
            key={c}
            className={`inline-flex items-center h-7 px-3 rounded-full text-[12px] font-medium ${i === 2 ? "bg-rose-600 text-white" : "bg-cream-100 border border-ink-100 text-ink-500"}`}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="rounded-[14px] border border-rose-200 bg-rose-50/40 p-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircleQuestion className="size-4 text-rose-600" strokeWidth={2} />
          <span className="text-[13.5px] font-semibold text-ink-900">How big a video can I upload?</span>
        </div>
        <p className="text-[13px] text-ink-500 leading-relaxed pl-6">
          Up to <span className="font-semibold text-ink-700">50 GB per video</span>, on every plan. Large files resume automatically if your connection drops.
        </p>
      </div>
    </div>
  );
}
