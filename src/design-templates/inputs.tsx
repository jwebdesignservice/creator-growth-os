/* Inputs ───────────────────────────────────────────────────────────────
   Text inputs, textareas, selects. Includes labelled, with helper text,
   error state, disabled.
   ───────────────────────────────────────────────────────────────────── */

import { Search } from "lucide-react";

export function TextInput() {
  return (
    <div className="w-full max-w-xs">
      <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
        Email
      </label>
      <input
        type="email"
        placeholder="you@example.com"
        className="w-full h-10 px-3 rounded-[10px] border border-ink-200 bg-cream-50 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
      />
    </div>
  );
}

export function TextInputWithError() {
  return (
    <div className="w-full max-w-xs">
      <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
        Username
      </label>
      <input
        type="text"
        defaultValue="jack"
        className="w-full h-10 px-3 rounded-[10px] border border-rose-400 bg-rose-50/30 text-[14px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-colors"
      />
      <p className="mt-1.5 text-[12px] text-rose-700">
        That username is already taken.
      </p>
    </div>
  );
}

export function SearchInput() {
  return (
    <div className="relative w-full max-w-xs">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400"
        strokeWidth={2}
      />
      <input
        type="search"
        placeholder="Search…"
        className="w-full h-10 pl-9 pr-3 rounded-[10px] border border-ink-200 bg-cream-50 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors"
      />
    </div>
  );
}

export function Textarea() {
  return (
    <div className="w-full max-w-md">
      <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
        Notes
      </label>
      <textarea
        rows={3}
        placeholder="What did you learn this week?"
        className="w-full px-3 py-2 rounded-[10px] border border-ink-200 bg-cream-50 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-colors resize-y"
      />
    </div>
  );
}
