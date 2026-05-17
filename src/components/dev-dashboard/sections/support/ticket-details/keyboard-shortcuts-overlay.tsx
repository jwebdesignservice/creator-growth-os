"use client";

import { useEffect } from "react";

/**
 * Global keyboard shortcuts for the ticket detail page.
 *
 *   r   →  focus the reply composer (#reply-composer textarea)
 *
 * Intentionally minimal — Cmd+Enter / Cmd+Shift+Enter live inside the
 * composer itself so they only fire when the textarea is focused.
 *
 * Shortcuts ignore keypresses when the user is already typing in a
 * form field, so "r" inside the composer types an "r" instead of
 * stealing focus.
 */
export function KeyboardShortcutsOverlay() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Skip when the user is typing somewhere.
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (target.isContentEditable) return;
      }
      // Skip when a modifier is held (let browser/OS keep its bindings).
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "r") {
        const ta = document.querySelector<HTMLTextAreaElement>(
          "#reply-composer textarea",
        );
        if (ta) {
          e.preventDefault();
          ta.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
