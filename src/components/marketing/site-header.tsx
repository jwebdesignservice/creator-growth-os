import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "#pricing" },
  { label: "Events", href: "#events" },
  { label: "Contact", href: "#contact" },
  { label: "Resources", href: "#resources" },
];

/**
 * Marketing top navigation. Three-column grid keeps the link cluster optically
 * centered between the wordmark (left) and the CTA (right), matching the
 * reference. The "Profluencer" wordmark is real rendered text — it satisfies
 * Google's OAuth homepage app-name check.
 */
export function SiteHeader() {
  return (
    <header className="relative z-20">
      <div className="mx-auto grid h-20 max-w-[1320px] grid-cols-[1fr_auto_1fr] items-center px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 justify-self-start">
          <BrandMark size={28} className="text-ink-900" />
          <span className="text-[22px] font-bold tracking-tight text-ink-900">
            Profluencer
          </span>
        </Link>

        <nav className="hidden items-center gap-9 justify-self-center md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="text-[15px] font-medium text-ink-700 transition-colors hover:text-ink-900"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/sign-up"
          className="inline-flex h-11 items-center rounded-[12px] bg-rose-600 px-5 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 justify-self-end"
        >
          Book a Call
        </Link>
      </div>
    </header>
  );
}
