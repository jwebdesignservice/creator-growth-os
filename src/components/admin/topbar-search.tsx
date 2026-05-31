"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Admin topbar search.
 *
 * Submitting (Enter) routes to the Users list with the query applied —
 * `/admin/users` already performs server-side name/email search, so it's the
 * most complete search surface to land on. Kept deliberately simple and honest
 * (placeholder reflects what it actually searches); a future cross-entity
 * command palette can replace this without changing the layout.
 */
export function TopbarSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/admin/users?q=${encodeURIComponent(query)}` : "/admin/users");
  }

  return (
    <form onSubmit={onSubmit} role="search" className="relative">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 size-[16px] text-ink-400"
        strokeWidth={2}
        aria-hidden
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search members by name or email…"
        aria-label="Search members"
        className="w-full h-11 pl-11 pr-4 rounded-[14px] bg-white border border-ink-100 placeholder:text-ink-400 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
      />
    </form>
  );
}
