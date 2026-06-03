/* Inputs ───────────────────────────────────────────────────────────────
   Text inputs, search, and textareas. Each shows a complete field: label,
   helper or error text, and the shared focus treatment used across the app
   (rose border + soft rose ring).
   ───────────────────────────────────────────────────────────────────── */

import { Search, AlertCircle } from "lucide-react";

// One focus treatment for every field — matches the live app's inputs.
const FIELD =
  "w-full rounded-[10px] border bg-cream-50 text-[14px] text-ink-900 placeholder:text-ink-400 transition-colors focus:outline-none";
const OK = "border-ink-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export function TextInput() {
  return (
    <div className="w-full max-w-xs">
      <label htmlFor="dt-email" className="block text-[12px] font-medium text-ink-700 mb-1.5">
        Email
      </label>
      <input
        id="dt-email"
        type="email"
        placeholder="you@example.com"
        className={`${FIELD} ${OK} h-10 px-3`}
      />
      <p className="mt-1.5 text-[12px] text-ink-500">We&apos;ll only use this for account updates.</p>
    </div>
  );
}

export function TextInputWithError() {
  return (
    <div className="w-full max-w-xs">
      <label htmlFor="dt-user" className="block text-[12px] font-medium text-ink-700 mb-1.5">
        Username
      </label>
      <input
        id="dt-user"
        type="text"
        defaultValue="jack"
        aria-invalid="true"
        aria-describedby="dt-user-err"
        className={`${FIELD} h-10 px-3 border-rose-400 bg-rose-50/30 focus:border-rose-500 focus:ring-2 focus:ring-rose-200`}
      />
      <p id="dt-user-err" className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-700">
        <AlertCircle className="size-3.5 shrink-0" strokeWidth={2} />
        That username is already taken.
      </p>
    </div>
  );
}

export function SearchInput() {
  return (
    <div className="relative w-full max-w-xs">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
        strokeWidth={2}
      />
      <input
        type="search"
        placeholder="Search programs, tutorials…"
        className={`${FIELD} ${OK} h-10 pl-9 pr-14`}
      />
      <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 h-5 px-1.5 rounded-[6px] border border-ink-200 bg-white text-[10.5px] font-semibold text-ink-400 pointer-events-none">
        ⌘K
      </kbd>
    </div>
  );
}

export function Textarea() {
  return (
    <div className="w-full max-w-md">
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor="dt-notes" className="block text-[12px] font-medium text-ink-700">
          Notes
        </label>
        <span className="text-[11px] text-ink-400 tabular-nums">0 / 280</span>
      </div>
      <textarea
        id="dt-notes"
        rows={3}
        placeholder="What did you learn this week?"
        className={`${FIELD} ${OK} px-3 py-2 resize-y leading-relaxed`}
      />
    </div>
  );
}
