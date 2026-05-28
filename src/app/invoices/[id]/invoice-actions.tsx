"use client";

import { Download, ExternalLink } from "lucide-react";

/**
 * Screen-only action bar for the invoice page. "Download PDF" uses the
 * browser's print-to-PDF (the page carries print: styles that strip the app
 * chrome and render a clean single sheet). An optional link opens the
 * original Stripe-hosted receipt.
 */
export function InvoiceActions({ hostedUrl }: { hostedUrl: string | null }) {
  return (
    <div className="flex items-center gap-2">
      {hostedUrl && (
        <a
          href={hostedUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-50 transition-colors"
        >
          <ExternalLink className="size-4 text-ink-500" strokeWidth={2} />
          Stripe receipt
        </a>
      )}
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold transition-colors shadow-sm"
      >
        <Download className="size-4" strokeWidth={2} />
        Download PDF
      </button>
    </div>
  );
}
