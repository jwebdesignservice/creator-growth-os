"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Loader2 } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import {
  searchMembersAction,
  startConversation,
} from "@/lib/community/dm/actions";
import type { DmParticipant } from "@/lib/community/dm/types";

/** Modal: search any member and start (or resume) a DM with them. */
export function NewMessage({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<DmParticipant[]>([]);
  const [searching, setSearching] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Debounced search. Clearing on empty input is done in `handleQuery` so we
  // never call setState synchronously inside the effect body.
  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const t = setTimeout(() => {
      searchMembersAction(term).then((r) => {
        setResults(r);
        setSearching(false);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  function handleQuery(v: string) {
    setQ(v);
    if (v.trim()) setSearching(true);
    else {
      setResults([]);
      setSearching(false);
    }
  }

  function start(userId: string) {
    setError(null);
    startTransition(async () => {
      const res = await startConversation(userId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      if (res.id) {
        onClose();
        router.push(`/messages/${res.id}`);
        router.refresh();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-24"
      onClick={onClose}
    >
      <div aria-hidden className="absolute inset-0 bg-ink-900/40 backdrop-blur-[2px]" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New message"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-[18px] bg-white shadow-card border border-ink-100 overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ink-100">
          <h3 className="text-[16px] font-bold text-ink-900">New message</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-8 rounded-full hover:bg-cream-100 inline-flex items-center justify-center text-ink-500 hover:text-ink-900 transition-colors"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 pointer-events-none"
              strokeWidth={2}
            />
            <input
              autoFocus
              value={q}
              onChange={(e) => handleQuery(e.target.value)}
              placeholder="Search creators by name or @handle…"
              className="w-full h-11 pl-9 pr-9 rounded-[12px] border border-ink-200 bg-white text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-400 animate-spin" />
            )}
          </div>

          {error && (
            <p className="mt-2 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-[8px] px-3 py-2">
              {error}
            </p>
          )}

          <ul className="mt-2 max-h-[320px] overflow-y-auto">
            {q.trim() && !searching && results.length === 0 && (
              <li className="px-3 py-6 text-center text-[12.5px] text-ink-400">
                No creators match “{q.trim()}”.
              </li>
            )}
            {results.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => start(m.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-left hover:bg-cream-100 disabled:opacity-50 transition-colors"
                >
                  <Avatar name={m.name} src={m.avatar ?? undefined} size={36} />
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink-900 truncate">
                      {m.name}
                    </div>
                    {m.handle && (
                      <div className="text-[11.5px] text-ink-400 truncate">
                        @{m.handle}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
