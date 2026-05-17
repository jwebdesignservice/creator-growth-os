"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Copy, X, Check } from "lucide-react";
import type { StackTracePreview } from "@/lib/dev-dashboard/types";

/* ─────────────────────────────────────────────────────────────────────────
   Stack trace viewer modal — shared across the page so multiple triggers
   (Highest Impact card, Latest Stack Trace card, future row-level link)
   all open the same dialog.
   ───────────────────────────────────────────────────────────────────────── */

type StackTraceCtx = {
  open: (trace: StackTracePreview, title?: string) => void;
};

const Ctx = createContext<StackTraceCtx | null>(null);

export function useStackTraceModal(): StackTraceCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Returning a no-op keeps server-rendered placeholders harmless if the
    // provider hasn't mounted yet — preferable to throwing during hydration.
    return { open: () => undefined };
  }
  return ctx;
}

export function StackTraceModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ trace: StackTracePreview; title: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const open = useCallback((trace: StackTracePreview, title = "Stack Trace") => {
    setState({ trace, title });
    setCopied(false);
  }, []);

  const close = useCallback(() => setState(null), []);

  // ESC + body-scroll lock while a trace is open.
  useEffect(() => {
    if (!state) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state, close]);

  const onCopy = useCallback(async () => {
    if (!state) return;
    try {
      await navigator.clipboard.writeText(state.trace.lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard rejected — silently ignore; the lines are still visible.
    }
  }, [state]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      {state && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={state.title}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-[720px] dev-card p-5 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <header className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-[var(--dev-text-primary)]">
                  {state.title}
                </h2>
                {state.trace.filePath && (
                  <p className="mt-0.5 text-[12px] font-mono text-[var(--dev-text-muted)] truncate">
                    {state.trace.filePath}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onCopy}
                  className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] transition-colors"
                >
                  {copied ? (
                    <Check className="size-3.5 text-[var(--dev-success-text)]" strokeWidth={2} />
                  ) : (
                    <Copy className="size-3.5" strokeWidth={1.9} />
                  )}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="size-8 inline-flex items-center justify-center rounded-[8px] hover:bg-[var(--dev-surface-soft)] text-[var(--dev-text-secondary)]"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </div>
            </header>

            <div className="rounded-[10px] bg-[var(--dev-bg)] border border-[var(--dev-border)] overflow-hidden">
              <pre className="m-0 py-3 text-[12.5px] font-mono leading-[1.6] text-[var(--dev-text-secondary)] overflow-x-auto">
                {state.trace.lines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="select-none w-10 shrink-0 text-right pr-3 text-[var(--dev-text-faint)] tabular-nums">
                      {i + 1}
                    </span>
                    <span className="flex-1 min-w-0 whitespace-pre break-words">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

/* Helper button — wraps an inline trigger with no styling so callers can
   pass their own button element. Convenient when other parts of the page
   want to open a trace they already have in scope. */
export function OpenStackTraceButton({
  trace,
  title,
  children,
  className,
}: {
  trace: StackTracePreview;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { open } = useStackTraceModal();
  return (
    <button type="button" onClick={() => open(trace, title)} className={className}>
      {children}
    </button>
  );
}
