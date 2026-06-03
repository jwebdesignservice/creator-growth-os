"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

/**
 * Admin topbar search — adapts to the current admin section.
 *
 * On a known section it searches that page in place, live: typing updates the
 * page's own URL search param (debounced) and the page re-filters. The
 * placeholder reflects what it actually searches. Everywhere else it falls back
 * to the global member search (`/admin/users?q=`), the most complete surface.
 *
 * To make another section live-searchable: ensure that page reads a URL search
 * param, then add it here with the matching `param` key.
 */
const SECTIONS: { prefix: string; placeholder: string; label: string; param: string }[] = [
  { prefix: "/admin/tutorials", placeholder: "Search tutorials…", label: "Search tutorials", param: "q" },
  { prefix: "/admin/users", placeholder: "Search members by name or email…", label: "Search members", param: "q" },
  { prefix: "/admin/programs", placeholder: "Search programs…", label: "Search programs", param: "search" },
];

const FALLBACK = {
  placeholder: "Search members by name or email…",
  label: "Search members",
};

export function TopbarSearch() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();

  const section = SECTIONS.find((s) => pathname.startsWith(s.prefix));
  const live = Boolean(section);
  const param = section?.param ?? null;
  const placeholder = section?.placeholder ?? FALLBACK.placeholder;
  const label = section?.label ?? FALLBACK.label;
  const activeQuery = param ? (searchParams.get(param) ?? "") : "";

  const [q, setQ] = useState(activeQuery);

  // Reset the field to the section's active query when the section changes
  // (search is per-page). Done during render — React's "adjust state when a
  // prop changes" pattern — so our own URL writes below never clobber typing.
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setQ(activeQuery);
  }

  // Apply the query to the page's own search param on the current route,
  // preserving other params and resetting pagination. Debounced so server-
  // backed pages don't refetch on every keystroke.
  function apply(value: string) {
    if (!param) return;
    const params = new URLSearchParams(searchParams.toString());
    const v = value.trim();
    if ((params.get(param) ?? "") === v) return;
    if (v) params.set(param, v);
    else params.delete(param);
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    if (!live) return;
    const handle = setTimeout(() => apply(q), 220);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, live, param, pathname]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const v = q.trim();
    if (live) {
      apply(q);
    } else {
      router.push(v ? `/admin/users?q=${encodeURIComponent(v)}` : "/admin/users");
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
        placeholder={placeholder}
        aria-label={label}
        className="w-full h-11 pl-11 pr-4 rounded-[14px] bg-white border border-ink-100 placeholder:text-ink-400 text-[13.5px] text-ink-900 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors"
      />
    </form>
  );
}
