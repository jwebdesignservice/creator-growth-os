/* Certificate ─────────────────────────────────────────────────────────────────
   Course-completion certificate surfaces — the printable certificate itself and
   the in-app "you earned it" card with share/download. Programs award these on
   100% completion. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Award, Download, Share2, Sparkles } from "lucide-react";

/* 1 · The certificate — landscape, decorative border, seal, signature line. */
export function CompletionCertificate() {
  return (
    <div className="w-[480px] max-w-full rounded-[16px] bg-white p-1.5 shadow-card">
      <div className="rounded-[12px] border-2 border-rose-200 bg-gradient-to-b from-rose-50/40 to-white px-8 py-7 text-center relative overflow-hidden">
        <div className="flex items-center justify-center gap-1.5 text-rose-500 mb-3">
          <span className="h-px w-8 bg-rose-200" />
          <Sparkles className="size-4" strokeWidth={2} />
          <span className="h-px w-8 bg-rose-200" />
        </div>
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.25em] text-ink-400">
          Certificate of Completion
        </div>
        <div className="mt-4 text-[12px] text-ink-500">This certifies that</div>
        <div className="mt-1 text-h3 text-ink-900 font-serif">Deividas Burkauskas</div>
        <div className="mt-3 text-[12.5px] text-ink-500 leading-relaxed max-w-[34ch] mx-auto">
          has successfully completed the program
        </div>
        <div className="mt-1 text-[15px] font-bold text-rose-700">
          How to Reach Your Niche Audience
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div className="text-left">
            <div className="h-8 w-28 border-b border-ink-300" />
            <div className="text-[10.5px] text-ink-400 mt-1">Profluencer</div>
          </div>
          <span className="size-12 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0 ring-4 ring-rose-50">
            <Award className="size-6" strokeWidth={1.8} />
          </span>
          <div className="text-right">
            <div className="h-8 w-28 border-b border-ink-300 text-[13px] text-ink-500 flex items-end justify-center pb-0.5 font-serif">
              May 2026
            </div>
            <div className="text-[10.5px] text-ink-400 mt-1">Date issued</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 2 · The reward card — earned state with download + share. */
export function CertificateEarnedCard() {
  return (
    <div className="w-[340px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 text-center shadow-card">
      <span className="mx-auto size-14 rounded-full bg-amber-100 text-amber-600 inline-flex items-center justify-center mb-3 ring-8 ring-amber-50">
        <Award className="size-7" strokeWidth={1.8} />
      </span>
      <h3 className="text-[16px] font-bold text-ink-900">Certificate earned! 🎉</h3>
      <p className="text-[12.5px] text-ink-500 mt-1 leading-relaxed">
        You completed every lesson in{" "}
        <span className="font-semibold text-ink-700">Niche Audience</span>. Nice work.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
        >
          <Download className="size-4" strokeWidth={2} />
          Download
        </button>
        <button
          type="button"
          className="inline-flex items-center justify-center size-10 rounded-[10px] bg-white border border-ink-200 text-ink-500 transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2"
          aria-label="Share certificate"
        >
          <Share2 className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
