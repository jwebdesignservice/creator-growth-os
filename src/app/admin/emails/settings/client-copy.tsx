"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Tiny client island used by the (RSC) Email Settings page to copy a
 * string to the clipboard with feedback. Standalone so the settings
 * page itself stays a server component.
 */
export function ClientCopy({ text }: { text: string }) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context) — silent fail.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy to clipboard"
      className="size-7 rounded-[6px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-ink-900 transition-colors"
    >
      {done ? (
        <Check className="size-3.5 text-success" strokeWidth={2.5} />
      ) : (
        <Copy className="size-3.5" strokeWidth={2} />
      )}
    </button>
  );
}
