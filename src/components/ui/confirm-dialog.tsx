"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  title: string;
  /** Optional longer message under the title. */
  message?: string;
  /** Confirm button label. Defaults to "Confirm". */
  confirmLabel?: string;
  /** Cancel button label. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Style the confirm button as destructive (rose). Default: true. */
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Whether the confirm action is currently running. Disables both buttons. */
  pending?: boolean;
};

/**
 * Replacement for the browser's native `confirm()` dialog. Renders as a
 * centered modal with a backdrop, matches the rose / cream design system,
 * supports Escape-to-cancel and click-outside-to-cancel.
 *
 * Use from a client component:
 *   const [open, setOpen] = useState(false);
 *   <ConfirmDialog
 *     open={open}
 *     title="Disconnect Instagram?"
 *     message="Your past analytics stay; new data won't sync until you reconnect."
 *     confirmLabel="Disconnect"
 *     onConfirm={() => { run(); setOpen(false); }}
 *     onCancel={() => setOpen(false)}
 *   />
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = true,
  onConfirm,
  onCancel,
  pending = false,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Esc closes; auto-focus the confirm button on open.
  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel, pending]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-[2px]"
      onClick={(e) => {
        // Clicking the backdrop cancels — but ignore clicks on the dialog.
        if (e.target === e.currentTarget && !pending) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-[420px] rounded-[18px] bg-white shadow-xl border border-ink-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-3">
          <span
            className={cn(
              "size-10 rounded-full inline-flex items-center justify-center shrink-0",
              destructive
                ? "bg-rose-100 text-rose-600"
                : "bg-cream-100 text-ink-600",
            )}
          >
            <AlertTriangle className="size-5" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <h2
              id="confirm-dialog-title"
              className="text-[16px] font-semibold text-ink-900 leading-tight"
            >
              {title}
            </h2>
            {message && (
              <p className="mt-1.5 text-[13px] text-ink-500 leading-relaxed">
                {message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            aria-label="Close"
            className="size-8 inline-flex items-center justify-center rounded-[10px] text-ink-400 hover:text-ink-700 hover:bg-cream-100 transition-colors shrink-0"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-cream-50/50 border-t border-ink-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex items-center justify-center h-10 px-4 rounded-[12px] text-[13px] font-medium bg-white border border-ink-200 text-ink-700 hover:bg-cream-100 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              "inline-flex items-center justify-center h-10 px-4 rounded-[12px] text-[13px] font-medium text-white disabled:opacity-50 transition-colors",
              destructive
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-ink-900 hover:bg-ink-800",
            )}
          >
            {pending ? "…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
