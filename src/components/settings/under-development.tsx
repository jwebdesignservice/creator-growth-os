import { Wrench, type LucideIcon } from "lucide-react";

/**
 * Reusable placeholder for settings pages that aren't built out yet.
 * Renders a polished "Under development" card with the page's title,
 * a tailored sub-description, and a status pill — so each stub still
 * feels intentional rather than empty.
 */
export function UnderDevelopment({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  /** Short context line shown under the page heading. */
  description?: string;
  /** Icon paired with the page (defaults to a wrench). */
  icon?: LucideIcon;
}) {
  const Picked = Icon ?? Wrench;
  return (
    <section className="container-app">
      <header className="mb-7">
        <h1 className="text-h1 text-ink-900 mb-1">{title}</h1>
        {description && (
          <p className="text-ink-500 text-[14px] leading-relaxed">
            {description}
          </p>
        )}
      </header>

      <div className="relative overflow-hidden rounded-[20px] border border-ink-100 bg-white p-10 sm:p-16 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {/* Soft rose wash so the card feels alive rather than empty. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-rose-50/60 via-transparent to-transparent"
        />

        <div className="relative">
          <span className="inline-flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-5 ring-8 ring-rose-50">
            <Picked className="size-8" strokeWidth={1.8} />
          </span>
          <h2 className="text-h3 text-ink-900 mb-2">Under development</h2>
          <p className="text-ink-500 text-[14px] max-w-md mx-auto leading-relaxed">
            We&apos;re crafting this page. Check back soon — it&apos;ll be
            ready before you know it.
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-rose-50 border border-rose-100 text-[11.5px] font-semibold uppercase tracking-wide text-rose-700">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-rose-500 animate-pulse"
            />
            In progress
          </span>
        </div>
      </div>
    </section>
  );
}
