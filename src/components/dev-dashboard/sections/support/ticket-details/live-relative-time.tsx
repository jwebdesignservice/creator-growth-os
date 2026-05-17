"use client";

import { useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────────
   Renders a relative time string ("2m ago") that updates itself every
   30 seconds. Used by the summary bar and the conversation thread so
   timestamps stay current while a dev keeps the page open all day.

   Server-side it renders the initial `fallback` so SSR hydration matches.
   ───────────────────────────────────────────────────────────────────────── */

type Props = {
  /** ISO timestamp of the event. */
  iso: string;
  /** Initial text rendered server-side (and as fallback if `iso` is invalid). */
  fallback: string;
  className?: string;
};

const TICK_MS = 30_000;

export function LiveRelativeTime({ iso, fallback, className }: Props) {
  const [label, setLabel] = useState<string>(fallback);

  useEffect(() => {
    const ms = new Date(iso).getTime();
    if (Number.isNaN(ms)) return;

    function tick() {
      setLabel(relative(ms));
    }
    // Defer the first compute to a microtask so we don't update state
    // synchronously in the effect body — same pattern used elsewhere in
    // the codebase to satisfy react-hooks/set-state-in-effect.
    const first = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, TICK_MS);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, [iso]);

  return <span className={className}>{label}</span>;
}

function relative(then: number): string {
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1)   return "just now";
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
