"use client";

/**
 * The app's stock toast — a non-blocking, bottom-right notification card for
 * every transient thing a user should see: successes, errors, info, warnings
 * and in-flight ("loading") states.
 *
 * Deliberately provider-free: it lazily mounts a single fixed container on
 * <body> and appends transient toasts, so it can be fired from any client
 * event handler or server-action result without threading a React context
 * through every layout. (For surfaces that already have their own React
 * ToastProvider — e.g. the dev support ticket page — keep using that.)
 *
 * Backward compatible — `toast("Saved", "success")` still works and now simply
 * renders as the title line of the new card. Richer calls use the options form:
 *
 *   toast.success("“Sienna Hewitt” details updated", {
 *     secondaryAction: { label: "Undo", onClick: undoEdit },
 *     action:          { label: "View profile", href: `/people/${id}` },
 *   });
 *
 *   toast.error("Couldn't save changes", { description: err.message });
 *   const t = toast.loading("Uploading…");  // …later: t.dismiss();
 *
 * All Tailwind classes are written as literals so the JIT compiler picks them
 * up; markup is built as escaped HTML strings (no React) to stay dependency-free.
 */

export type ToastKind = "success" | "error" | "info" | "warning" | "loading";

export type ToastAction = {
  label: string;
  /** Click handler. Return `false` to keep the toast open; otherwise it closes. */
  onClick?: () => void | boolean;
  /** Navigate here on click (same tab). Runs after `onClick`. */
  href?: string;
};

export type ToastOptions = {
  /** Bold heading line — the main message. */
  title: string;
  /** Optional secondary line under the title. */
  description?: string;
  kind?: ToastKind;
  /** ms before auto-dismiss. `0` = stay until dismissed. Defaults per kind. */
  duration?: number;
  /** Primary action (white, e.g. "View profile"). */
  action?: ToastAction;
  /** Secondary action (muted, e.g. "Undo"). Rendered to the left of `action`. */
  secondaryAction?: ToastAction;
  /** Show the ✕ close button (default `true`). */
  dismissible?: boolean;
};

export type ToastHandle = { dismiss: () => void };

const CONTAINER_ID = "app-toast-container";
const MAX_VISIBLE = 4;

const DEFAULT_DURATION: Record<ToastKind, number> = {
  success: 4500,
  info: 4500,
  warning: 6000,
  error: 7000,
  loading: 0, // persists until dismissed/updated
};

/* ── Icons (inline lucide-style paths, no import) ───────────────────────── */

function svg(paths: string, extra = ""): string {
  return (
    `<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" ` +
    `stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra ? ` class="${extra}"` : ""}>` +
    `${paths}</svg>`
  );
}

const ICON: Record<ToastKind, string> = {
  success: svg('<path d="M20 6 9 17l-5-5"/>'),
  error: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
  info: svg('<path d="M12 11v5"/><path d="M12 7.5h.01"/>'),
  warning: svg('<path d="M12 8v4.5"/><path d="M12 16h.01"/>'),
  loading: svg('<path d="M21 12a9 9 0 1 1-6.219-8.56"/>', "animate-spin"),
};

/* Icon-badge tint per kind — a soft fill, a thin ring and a low color glow. */
const ACCENT: Record<ToastKind, string> = {
  success:
    "bg-emerald-500/12 ring-emerald-400/30 text-emerald-400 shadow-[0_0_16px_-3px_rgba(16,185,129,0.55)]",
  error:
    "bg-rose-500/12 ring-rose-400/30 text-rose-400 shadow-[0_0_16px_-3px_rgba(244,63,94,0.5)]",
  info: "bg-sky-500/12 ring-sky-400/30 text-sky-400 shadow-[0_0_16px_-3px_rgba(56,189,248,0.5)]",
  warning:
    "bg-amber-500/12 ring-amber-400/30 text-amber-400 shadow-[0_0_16px_-3px_rgba(251,191,36,0.5)]",
  loading: "bg-white/10 ring-white/15 text-white/70",
};

const CARD_CLASSES =
  "group pointer-events-auto relative flex w-full items-center gap-3 overflow-hidden " +
  "rounded-[15px] border border-white/10 bg-ink-900 py-3.5 pl-4 pr-10 " +
  "shadow-[0_22px_50px_-16px_rgba(0,0,0,0.62)] transition-all duration-300 ease-out";

const CLOSE_HTML =
  `<button type="button" data-toast-close aria-label="Dismiss" ` +
  `class="absolute right-2.5 top-2.5 grid size-6 place-items-center rounded-md text-white/35 transition-colors hover:bg-white/10 hover:text-white/70">` +
  svg('<path d="M18 6 6 18M6 6l12 12"/>') +
  `</button>`;

/* ── HTML escaping (titles/messages may carry user content) ─────────────── */

const ESC: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}

function actionsHtml(action?: ToastAction, secondary?: ToastAction): string {
  if (!action && !secondary) return "";
  const sec = secondary
    ? `<button type="button" data-toast-secondary class="text-[13px] font-medium text-white/45 transition-colors hover:text-white/75">${esc(secondary.label)}</button>`
    : "";
  const pri = action
    ? `<button type="button" data-toast-primary class="text-[13px] font-semibold text-white transition-colors hover:text-white/80">${esc(action.label)}</button>`
    : "";
  return `<div class="mt-2 flex items-center gap-4">${sec}${pri}</div>`;
}

function ensureContainer(): HTMLElement {
  let c = document.getElementById(CONTAINER_ID);
  if (!c) {
    c = document.createElement("div");
    c.id = CONTAINER_ID;
    c.setAttribute("aria-live", "polite");
    c.setAttribute("aria-atomic", "false");
    c.className =
      "fixed bottom-5 right-5 z-[100] flex w-[380px] max-w-[calc(100vw-2.5rem)] flex-col gap-2.5 pointer-events-none";
    document.body.appendChild(c);
  }
  return c;
}

function createToast(opts: ToastOptions): ToastHandle {
  const noop: ToastHandle = { dismiss: () => {} };
  if (typeof document === "undefined" || !opts || !opts.title) return noop;

  const { title, description, action, secondaryAction } = opts;
  const kind: ToastKind = opts.kind ?? "info";
  const dismissible = opts.dismissible !== false;
  const duration = opts.duration ?? DEFAULT_DURATION[kind];
  const reduce =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const container = ensureContainer();

  const el = document.createElement("div");
  el.setAttribute("role", kind === "error" ? "alert" : "status");
  el.className = `${CARD_CLASSES} opacity-0${reduce ? "" : " translate-x-2"}`;
  el.innerHTML =
    `<span aria-hidden="true" class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"></span>` +
    `<span class="relative grid size-9 shrink-0 place-items-center rounded-full ring-1 ${ACCENT[kind]}">${ICON[kind]}</span>` +
    `<div class="min-w-0 flex-1">` +
    `<p class="text-[15px] font-semibold leading-snug text-white">${esc(title)}</p>` +
    (description
      ? `<p class="mt-1 text-[13px] leading-snug text-white/55">${esc(description)}</p>`
      : "") +
    actionsHtml(action, secondaryAction) +
    `</div>` +
    (dismissible ? CLOSE_HTML : "");

  // Soft cap — drop the oldest toast(s) so the stack never grows unbounded.
  while (container.children.length >= MAX_VISIBLE) {
    container.firstElementChild?.remove();
  }
  container.appendChild(el);

  let removed = false;
  let timer = 0;
  const dismiss = () => {
    if (removed) return;
    removed = true;
    window.clearTimeout(timer);
    el.classList.add("opacity-0");
    if (!reduce) el.classList.add("translate-x-2");
    el.classList.remove("opacity-100", "translate-x-0");
    window.setTimeout(() => el.remove(), reduce ? 0 : 300);
  };
  const schedule = () => {
    if (duration > 0) {
      window.clearTimeout(timer);
      timer = window.setTimeout(dismiss, duration);
    }
  };

  // Animate in on the next frame.
  requestAnimationFrame(() => {
    el.classList.remove("translate-x-2", "opacity-0");
    el.classList.add("translate-x-0", "opacity-100");
  });
  schedule();

  // Pause the auto-dismiss while the pointer is over the toast.
  el.addEventListener("mouseenter", () => window.clearTimeout(timer));
  el.addEventListener("mouseleave", schedule);

  const wire = (selector: string, a?: ToastAction) => {
    if (!a) return;
    el.querySelector<HTMLButtonElement>(selector)?.addEventListener("click", () => {
      const keepOpen = a.onClick?.() === false;
      if (a.href) window.location.href = a.href;
      if (!keepOpen) dismiss();
    });
  };
  wire("[data-toast-primary]", action);
  wire("[data-toast-secondary]", secondaryAction);
  if (dismissible) {
    el.querySelector("[data-toast-close]")?.addEventListener("click", dismiss);
  }

  return { dismiss };
}

/* ── Public API ─────────────────────────────────────────────────────────── */

function toastBase(
  message: string | ToastOptions,
  kind: ToastKind = "info",
): ToastHandle {
  return createToast(
    typeof message === "string" ? { title: message, kind } : message,
  );
}

const make =
  (kind: ToastKind) =>
  (title: string, opts?: Partial<ToastOptions>): ToastHandle =>
    createToast({ ...opts, title, kind });

type ToastFn = typeof toastBase & {
  success: (title: string, opts?: Partial<ToastOptions>) => ToastHandle;
  error: (title: string, opts?: Partial<ToastOptions>) => ToastHandle;
  info: (title: string, opts?: Partial<ToastOptions>) => ToastHandle;
  warning: (title: string, opts?: Partial<ToastOptions>) => ToastHandle;
  loading: (title: string, opts?: Partial<ToastOptions>) => ToastHandle;
};

export const toast: ToastFn = Object.assign(toastBase, {
  success: make("success"),
  error: make("error"),
  info: make("info"),
  warning: make("warning"),
  loading: make("loading"),
});
