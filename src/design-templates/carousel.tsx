/* Carousel ────────────────────────────────────────────────────────────────
   Horizontal carousel — a card carousel with prev/next + dots, and a
   standalone dot stepper. A scroll/slide pattern the gallery was missing.
   ───────────────────────────────────────────────────────────────────── */

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function CardCarousel() {
  const cards = [
    { title: "Creator Launchpad", meta: "12 lessons", hue: "from-rose-100 to-cream-200" },
    { title: "Hook Mastery", meta: "6 lessons", hue: "from-violet-100 to-rose-100" },
    { title: "Brand Deals 101", meta: "9 lessons", hue: "from-amber-100 to-rose-100" },
  ];
  return (
    <div className="w-[460px] max-w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-h5 text-ink-900">Continue learning</h3>
        <div className="flex gap-1.5">
          <span className="size-8 rounded-full border border-ink-100 inline-flex items-center justify-center text-ink-400 hover:bg-cream-100">
            <ChevronLeft className="size-4" strokeWidth={2} />
          </span>
          <span className="size-8 rounded-full border border-ink-100 inline-flex items-center justify-center text-ink-700 hover:bg-cream-100">
            <ChevronRight className="size-4" strokeWidth={2} />
          </span>
        </div>
      </div>
      <div className="flex gap-3 overflow-hidden">
        {cards.map((c, i) => (
          <div key={c.title} className={cn("shrink-0 w-[200px] rounded-[14px] border border-ink-100 overflow-hidden bg-white", i === 2 && "opacity-60")}>
            <div className={cn("h-24 bg-gradient-to-br", c.hue)} />
            <div className="p-3">
              <div className="text-[13px] font-semibold text-ink-900 truncate">{c.title}</div>
              <div className="text-[11.5px] text-ink-400">{c.meta}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1.5 rounded-full transition-all", i === 0 ? "w-5 bg-rose-600" : "w-1.5 bg-cream-300")} />
        ))}
      </div>
    </div>
  );
}

export function Dots() {
  return (
    <div className="flex items-center gap-2">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={cn("rounded-full transition-all", i === 2 ? "size-2.5 bg-rose-600" : "size-2 bg-cream-300")} />
      ))}
    </div>
  );
}
