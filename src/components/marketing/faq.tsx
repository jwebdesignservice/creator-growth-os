"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Marketing FAQ — a calm accordion of the questions creators actually ask.
 * One item open at a time; first opens by default.
 */

const FAQS: { q: string; a: string }[] = [
  {
    q: "Which platforms can I connect?",
    a: "Instagram, TikTok, YouTube, Snapchat and more — plan, publish and track them all from one workspace.",
  },
  {
    q: "Do I need a credit card to start?",
    a: "No. The Free plan is free forever and needs no card — upgrade only when you're ready to grow faster.",
  },
  {
    q: "Can I switch or cancel my plan anytime?",
    a: "Yes. Change or cancel whenever you like, right from your billing settings — no calls, no hassle.",
  },
  {
    q: "How does Profluencer actually help me grow?",
    a: "It turns “grow my channel” into clear weekly posting plans, daily missions you can finish, and performance you can act on.",
  },
  {
    q: "Is coaching included?",
    a: "Pro includes 1-on-1 coaching calls, AI content ideas, unlimited posting plans and priority support.",
  },
  {
    q: "Is my data private?",
    a: "Your connected accounts and data are private to you and never shared. You stay in full control.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 bg-cream-50">
      <div className="mx-auto max-w-[760px] px-6 py-20 lg:py-28">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full bg-rose-50 px-3.5 py-1.5 text-[12.5px] font-semibold tracking-wide text-rose-600">
            FAQ
          </span>
          <h2 className="mt-5 font-sans text-[2rem] font-bold leading-[1.1] tracking-[-0.03em] text-ink-900 sm:text-[2.75rem]">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={cn(
                  "rounded-[16px] border bg-white transition-colors",
                  isOpen ? "border-rose-200" : "border-ink-100",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[15.5px] font-semibold text-ink-900">{f.q}</span>
                  <span
                    className={cn(
                      "inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
                      isOpen ? "bg-rose-600 text-white" : "bg-cream-100 text-ink-500",
                    )}
                  >
                    {isOpen ? (
                      <Minus className="size-4" strokeWidth={2.4} />
                    ) : (
                      <Plus className="size-4" strokeWidth={2.4} />
                    )}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-5 pb-5 text-[14.5px] leading-relaxed text-ink-500">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
