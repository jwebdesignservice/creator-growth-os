"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Loader2,
  Check,
} from "lucide-react";
import { closeTicket } from "@/lib/support/actions";
import { cn } from "@/lib/cn";

/**
 * Header-bar actions for the ticket detail page.
 *
 *  • <CloseTicketButton />  — opens an inline confirm popover and calls the
 *    existing `closeTicket` server action (which sets status=resolved + a
 *    resolvedAt timestamp). When the ticket is already final we render a
 *    quiet "Closed" badge instead so the surface stays informative without
 *    inviting a no-op click.
 *
 *  • <CopyLinkButton />     — copies the current ticket URL to the user's
 *    clipboard. Confirms with a brief check-mark swap, then resets. Falls
 *    back to a manual prompt if the Clipboard API isn't available (older
 *    Safari, non-secure contexts, etc.).
 *
 * Both buttons are intentionally small and sit in the hero card next to
 * the ticket ID + status pill — Apple-style: present but never shouting.
 */

/* ─── Close ticket ─────────────────────────────────────────────────────── */

export function CloseTicketButton({
  publicId,
  disabled = false,
}: {
  publicId: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Outside-click and Escape close the popover. The wrapping div contains
  // both the trigger and the popover so a click on the trigger itself
  // doesn't fire the outside-click handler (which would race with toggle).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleConfirm = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const result = await closeTicket(publicId);
      if (result.ok) {
        setOpen(false);
        // Server re-renders the page, sidebar status + composer-disabled
        // state both flip to "resolved" without any further wiring here.
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }, [publicId, router]);

  if (disabled) {
    return (
      <span className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded-full bg-success-bg text-success text-[11.5px] font-semibold">
        <CheckCircle2 className="size-3.5" strokeWidth={2} aria-hidden />
        Closed
      </span>
    );
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-1.5 h-[28px] px-3 rounded-full bg-white border border-ink-200 hover:border-ink-300 hover:bg-cream-100 text-ink-700 hover:text-ink-900 text-[11.5px] font-semibold transition-colors"
      >
        <CheckCircle2 className="size-3.5" strokeWidth={2} aria-hidden />
        Close ticket
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Confirm close ticket"
          className="absolute right-0 top-[calc(100%+8px)] w-[280px] z-30 rounded-[14px] bg-white border border-ink-100 shadow-[0_20px_60px_-12px_rgba(15,12,22,0.22)] p-4"
        >
          <div className="flex items-start gap-2.5 mb-3">
            <span
              aria-hidden
              className="inline-flex items-center justify-center size-9 rounded-full bg-rose-50 text-rose-600 shrink-0"
            >
              <AlertTriangle className="size-[16px]" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-ink-900 leading-snug">
                Close this ticket?
              </p>
              <p className="mt-0.5 text-[11.5px] text-ink-500 leading-snug">
                We&rsquo;ll mark it as resolved. You can still reply if you
                need to follow up.
              </p>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-3 text-[11.5px] text-rose-700 bg-rose-50 border border-rose-100 rounded-[8px] px-2.5 py-1.5"
            >
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="h-8 px-3 rounded-full bg-white border border-ink-200 hover:bg-cream-100 text-ink-700 text-[12px] font-semibold transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold transition-colors disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={2} aria-hidden />
              ) : (
                <CheckCircle2 className="size-3.5" strokeWidth={2} aria-hidden />
              )}
              {pending ? "Closing…" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Copy link ────────────────────────────────────────────────────────── */

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the timer on unmount so we don't setState on a dead component.
  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older Safari / non-secure contexts. Quietly skip
        // visual confirmation if even this fails — better than throwing.
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      // No-op — silent failure beats a crash for a nice-to-have action.
    }
  }, []);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Link copied" : "Copy link to ticket"}
      title={copied ? "Link copied" : "Copy link"}
      className={cn(
        "inline-flex items-center justify-center size-8 rounded-full bg-white border border-ink-100 hover:border-ink-200 hover:bg-cream-100 transition-colors",
        copied ? "text-success" : "text-ink-500 hover:text-ink-900",
      )}
    >
      {copied ? (
        <Check className="size-[14px]" strokeWidth={2.4} aria-hidden />
      ) : (
        <Copy className="size-[14px]" strokeWidth={1.9} aria-hidden />
      )}
    </button>
  );
}
