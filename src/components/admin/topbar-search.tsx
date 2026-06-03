"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Admin topbar search — adapts to the current admin section.
 *
 * On sections that filter by the shared `?q=` param it searches that page in
 * place, live: typing updates `?q=` on the current route (debounced) and the
 * page re-filters. The placeholder reflects what it actually searches.
 * Everywhere else it falls back to the global member search
 * (`/admin/users?q=`), which is the most complete search surface.
 *
 * To make another section live-searchable: read `?q=` on that page and add it
 * to LIVE_SECTIONS below.
 */
const LIVE_SECTIONS: { prefix: string; placeholder: string; label: string }[] = [
  { prefix: "/admin/tutorials", placeholder: "Search tutorials…", label: "Search tutorials" },
  { prefix: "/admin/users", placeholder: "Search members by name or email…", label: "Search members" },
];

const GLOBAL = {
  placeholder: "Search members by name or email…",
  label: "Search members",
};

export function TopbarSearch() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();

  const section = LIVE_SECTIONS.find((s) => pathname.startsWith(s.prefix));
  const live = Boolean(section);
  const cfg = section ?? GLOBAL;

  const [q, setQ] = useState(() => searchParams.get("q") ?? "");

  // Reset the field to the section's active query when the section changes
  // (search is per-page). Done during render — React's "adjust state when a
  // prop changes" pattern — so our own `?q=` writes below never clobber typing.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setQ(searchParams.get("q") ?? "");
  }

  // Live sections: push the query into `?q=` on the current route, debounced so
  // server-backed pages (Users) don't refetch on every keystroke.
  useEffect(() => {
    if (!live) return;
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const value = q.trim();
      if ((params.get("q") ?? "") === value) return;
      if (value) params.set("q", value);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 220);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, live, pathname]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = q.trim();
    if (live) {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("q", value);
      else params.delete("q");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    } else {
      router.push(value ? `/admin/users?q=${encodeURIComponent(value)}` : "/admin/users");
    }
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
        placeholder={cfg.placeholder}
        aria-label={cfg.label}
        className="w-full h-11 pl-11 pr-4 rounded-[14px] bg-white border border-ink-100 placeholder:text-ink-400 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
      />
    </form>
  );
}
