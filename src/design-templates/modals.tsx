/* Modals ───────────────────────────────────────────────────────────────
   Dialog surface: a dimmed, blurred backdrop and a centred card. Opens on
   click; closes on the backdrop, the X, or Escape. Body scroll locks while
   open and the panel fades + scales in.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/cn";

export function ModalLauncher() {
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);

  // Single close path so `shown` resets and the next open re-animates.
  const close = () => {
    setShown(false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    // Flip to the shown state on the next frame so the panel transitions in
    // (setState lives in the rAF callback, never synchronously in the effect).
    const raf = requestAnimationFrame(() => setShown(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[13.5px] font-medium shadow-sm cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
      >
        Open modal
      </button>

      {open && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4 transition-opacity duration-200",
            shown ? "opacity-100" : "opacity-0",
          )}
          onClick={close}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="dt-modal-title"
            aria-describedby="dt-modal-desc"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "card max-w-md w-full p-6 relative transition-all duration-200",
              shown ? "opacity-100 scale-100" : "opacity-0 scale-95",
            )}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute top-3 right-3 inline-flex items-center justify-center size-8 rounded-full hover:bg-cream-200 text-ink-500 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            <div className="flex items-start gap-3">
              <span className="size-10 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5" strokeWidth={2} />
              </span>
              <div className="min-w-0 pr-6">
                <h3 id="dt-modal-title" className="text-h4 text-ink-900 mb-1">Disconnect TikTok?</h3>
                <p id="dt-modal-desc" className="text-[13.5px] text-ink-500 leading-snug">
                  This removes its data from your weekly KPIs. You can reconnect
                  the account later — nothing is deleted permanently.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center h-10 px-4 rounded-[10px] bg-white border border-ink-200 hover:bg-cream-100 active:bg-cream-200 text-ink-900 text-[13.5px] font-medium cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-[13.5px] font-medium shadow-sm cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
