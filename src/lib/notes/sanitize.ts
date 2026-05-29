/* ════════════════════════════════════════════════════════════════════════
   Lesson-note rich text — isomorphic helpers (no DOM required).

   Notes are stored as a small, safe subset of HTML produced by the
   `RichNoteEditor` (bold / italic / underline / lists / links). These helpers
   run on BOTH the server (action validation, defense-in-depth sanitize) and
   the client (length/empty checks, render-time hardening), so they must never
   touch `document`. Output is deterministic → safe to use during SSR without
   hydration mismatches.

   Notes are owner-only (RLS), so the real-world XSS surface is self-only; the
   strip below is belt-and-suspenders against anything written outside the
   editor (e.g. a direct API call).
   ════════════════════════════════════════════════════════════════════════ */

/** Tags the editor is allowed to emit. Used by the `looksLikeHtml` heuristic. */
export const NOTE_TAGS = [
  "b",
  "strong",
  "i",
  "em",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "br",
  "p",
  "div",
  "span",
] as const;

/**
 * Remove anything dangerous from a note's HTML while leaving the safe
 * formatting subset intact. Conservative + deterministic.
 */
export function stripUnsafeNoteHtml(input: string | null | undefined): string {
  if (!input) return "";
  let s = input;

  // Drop entire dangerous elements (tag + contents).
  s = s.replace(
    /<\s*(script|style|iframe|object|embed|noscript|template|svg|math)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,
    "",
  );
  // Drop any stray (unclosed) instance of those tags.
  s = s.replace(
    /<\s*\/?\s*(script|style|iframe|object|embed|noscript|template|svg|math)\b[^>]*>/gi,
    "",
  );
  // Strip inline event handlers (onclick=, onerror=, …) in any quote style.
  s = s.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, "");
  s = s.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, "");
  // Neutralise dangerous URL schemes on href/src.
  s = s.replace(
    /\b(href|src)\s*=\s*"(?:\s*(?:javascript|vbscript|data)\s*:[^"]*)"/gi,
    '$1="#"',
  );
  s = s.replace(
    /\b(href|src)\s*=\s*'(?:\s*(?:javascript|vbscript|data)\s*:[^']*)'/gi,
    "$1='#'",
  );

  return s;
}

/** Collapse a note's HTML down to its visible text (for counts / empty checks). */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*(p|div|li)\s*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .trim();
}

/** Visible character count — what we show in the counter and cap at MAX_LEN. */
export function noteTextLength(html: string | null | undefined): number {
  return htmlToPlainText(html).length;
}

/** True when a note has no visible text (handles `<br>`, empty `<div>`, …). */
export function noteIsEmpty(html: string | null | undefined): boolean {
  return htmlToPlainText(html).length === 0;
}

/**
 * Heuristic: does this stored value contain note markup, or is it a legacy
 * plain-text note? Lets the renderer pick HTML vs. plain-text display.
 */
export function looksLikeNoteHtml(value: string | null | undefined): boolean {
  if (!value) return false;
  return new RegExp(`<\\/?(?:${NOTE_TAGS.join("|")})\\b`, "i").test(value);
}

/** Allow only http(s) / mailto / relative links; reject script-y schemes. */
export function isSafeNoteUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u) return false;
  if (/^(javascript|vbscript|data|file):/i.test(u)) return false;
  return true;
}
