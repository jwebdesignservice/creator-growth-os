/* Modals ───────────────────────────────────────────────────────────────
   Dialog surfaces. Static here (always-open) so you can iterate on the
   visual. In real usage, wire to open/close state via parent.
   ───────────────────────────────────────────────────────────────────── */

"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function ModalLauncher() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-medium shadow-sm transition-colors"
      >
        Open modal
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="card max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 inline-flex items-center justify-center size-8 rounded-full hover:bg-cream-200 text-ink-500"
            >
              <X className="size-4" strokeWidth={2} />
            </button>
            <h3 className="text-h4 text-ink-900 mb-1">Confirm action</h3>
            <p className="text-[13.5px] text-ink-500 leading-snug">
              This will disconnect your TikTok account and remove its
              data from your weekly KPIs. You can reconnect later.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center h-10 px-4 rounded-[10px] bg-cream-200 hover:bg-cream-300 text-ink-900 text-[13.5px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center h-10 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13.5px] font-medium shadow-sm transition-colors"
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
