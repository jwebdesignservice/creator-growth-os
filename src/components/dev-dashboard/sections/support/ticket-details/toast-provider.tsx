"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────────────────
   Lightweight toast system for the ticket detail page.

   Why bespoke instead of a library: every action on this page (status
   change, assign, escalate, reply, internal note) needs a quick,
   non-blocking confirmation. A 60-line provider keeps the bundle tight
   and matches the dev-dashboard visual language exactly.
   ───────────────────────────────────────────────────────────────────────── */

type ToastKind = "success" | "error" | "info";

type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastCtx = {
  success: (message: string) => void;
  error:   (message: string) => void;
  info:    (message: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

const DEFAULT_DURATION_MS = 3200;

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  // Returning a no-op keeps server-rendered placeholders harmless if the
  // provider hasn't mounted yet — preferable to throwing during hydration.
  if (!ctx) {
    return {
      success: () => undefined,
      error:   () => undefined,
      info:    () => undefined,
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, DEFAULT_DURATION_MS);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const api: ToastCtx = {
    success: (m) => push("success", m),
    error:   (m) => push("error", m),
    info:    (m) => push("info", m),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-[360px] pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function ToastRow({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  // Slide-in on mount for a polished feel without a full animation library.
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setVisible(true), 16);
    return () => window.clearTimeout(id);
  }, []);

  const Icon =
    toast.kind === "success" ? CircleCheck :
    toast.kind === "error"   ? CircleAlert :
    Info;

  const tone =
    toast.kind === "success" ? "bg-[var(--dev-success-soft)]  border-[var(--dev-success-border)] text-[var(--dev-success-text)]" :
    toast.kind === "error"   ? "bg-[var(--dev-danger-soft)]   border-[var(--dev-danger-border)]  text-[var(--dev-danger-text)]"  :
    "bg-[var(--dev-accent-soft)] border-[var(--dev-accent-border)] text-[var(--dev-accent-text)]";

  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex items-start gap-2.5 p-3 rounded-[10px] border shadow-lg backdrop-blur-md",
        "transition-all duration-200",
        visible ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0",
        tone,
      )}
    >
      <Icon className="size-4 shrink-0 mt-0.5" strokeWidth={2} aria-hidden />
      <span className="flex-1 text-[12.5px] leading-snug text-[var(--dev-text-primary)]">
        {toast.message}
      </span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 size-5 inline-flex items-center justify-center rounded-md text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors"
      >
        <X className="size-3" strokeWidth={2} />
      </button>
    </div>
  );
}
