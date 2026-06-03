"use client";

/**
 * Minimal imperative toast — a non-blocking replacement for `window.alert()`.
 *
 * Deliberately provider-free: it lazily mounts a single fixed container on
 * <body> and appends transient toasts, so it can be called from any client
 * event handler without threading a context through every admin layout. For
 * surfaces that already have a React ToastProvider (e.g. the dev support
 * ticket page), keep using that — this is for the one-off action handlers
 * (admin program/tutorial editors) that previously used a native alert.
 *
 * All Tailwind classes are written as literals here so the JIT compiler
 * picks them up.
 */

type ToastKind = "success" | "error" | "info";

const CONTAINER_ID = "app-toast-container";
const VISIBLE_MS = 3600;

function toneClasses(kind: ToastKind): string {
  switch (kind) {
    case "success":
      return "bg-emerald-50 border-emerald-200 text-emerald-800";
    case "error":
      return "bg-rose-50 border-rose-200 text-rose-700";
    default:
      return "bg-white border-ink-200 text-ink-800";
  }
}

export function toast(message: string, kind: ToastKind = "info"): void {
  if (typeof document === "undefined" || !message) return;

  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    container.className =
      "fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-[360px] pointer-events-none";
    document.body.appendChild(container);
  }

  const el = document.createElement("div");
  el.setAttribute("role", kind === "error" ? "alert" : "status");
  el.className =
    "pointer-events-auto p-3 rounded-[10px] border shadow-lg text-[13px] leading-snug " +
    "transition-all duration-200 ease-out translate-x-3 opacity-0 " +
    toneClasses(kind);
  el.textContent = message;
  container.appendChild(el);

  // Animate in on the next frame.
  requestAnimationFrame(() => {
    el.classList.remove("translate-x-3", "opacity-0");
    el.classList.add("translate-x-0", "opacity-100");
  });

  // Auto-dismiss.
  window.setTimeout(() => {
    el.classList.add("opacity-0");
    window.setTimeout(() => el.remove(), 220);
  }, VISIBLE_MS);
}
