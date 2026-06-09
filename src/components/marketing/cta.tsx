import Link from "next/link";
import Image from "next/image";

/**
 * Closing CTA — the final conversion moment. A 1:1 recreation of the
 * tr9.webflow.io closing section ("Skip the Hold Music. Forever.") rebuilt in
 * our warm rose / ink language:
 *
 *   • a tall, full-bleed cinematic image area (a creator filming content),
 *     colour-graded dark with a warm rose glow + a faint grid overlay — the
 *     brand equivalent of the reference's blue/cyan gradient image
 *   • an oversized two-line headline pinned bottom-left, line 1 white,
 *     line 2 in the brand accent
 *   • a bottom split CTA bar: left = a low-friction "try" action (email +
 *     "Get started") over the dark image; right = a bright accent panel with
 *     the main "Book a demo" action — divided by a strong seam
 *
 * Reference mechanics (via DevTools): headline 102px/lh 1.04; bottom bar
 * two 50/50 panels, 299px tall; labels 16px; CTAs 56px, underlined; 36px
 * side gutters. Reference blue → our ink-dark grade; reference lime → rose-400.
 */

const ACCENT = "#D08171"; // rose-400 — the brand accent (matches the hero)

export function Cta() {
  return (
    <section className="relative w-full overflow-hidden bg-ink-900 text-white">
      {/* ── Background: creator photo, colour-graded + grid ─────────── */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/stephanie-berbec-H1wkEdyqfvY-unsplash.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[70%_40%]"
        />
        {/* cinematic duotone grade — multiplies the photo into a moody rose/ink
            colour story: near-black on the left (where the copy lives), warm
            rose toward the right (the brand equivalent of the reference's
            dark-left / bright-right split) */}
        <div
          className="absolute inset-0 mix-blend-multiply"
          style={{
            backgroundImage:
              "linear-gradient(116deg, #14110f 0%, #241a18 34%, #532932 70%, #934b57 100%)",
          }}
        />
        {/* warm glow top-right + deepen toward the lower-left and the bar */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(88% 72% at 93% 6%, rgba(224,168,158,0.26), transparent 56%)," +
              "radial-gradient(120% 120% at 0% 104%, rgba(20,17,15,0.82), transparent 56%)," +
              "linear-gradient(180deg, rgba(20,17,15,0.30) 0%, rgba(20,17,15,0.26) 48%, rgba(20,17,15,0.80) 100%)",
          }}
        />
        {/* faint grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px)," +
              "linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize:
              "clamp(58px, 5.4vw, 92px) clamp(58px, 5.4vw, 92px)",
          }}
        />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full flex-col">
        {/* Headline — pinned to the bottom-left of the image area */}
        <div className="flex min-h-[54vh] items-end px-6 pb-10 pt-28 sm:px-9 lg:min-h-[66vh] lg:pb-16 lg:pt-40">
          <h2 className="font-sans text-[clamp(2.75rem,8vw,6.5rem)] font-semibold leading-[1.0] tracking-[-0.035em]">
            <span className="block text-white">Skip the Guesswork.</span>
            <span className="block" style={{ color: ACCENT }}>
              Forever.
            </span>
          </h2>
        </div>

        {/* Bottom split CTA bar */}
        <div className="grid grid-cols-1 border-t border-white/15 lg:grid-cols-2">
          {/* LEFT — low-friction try (dark, over the image) */}
          <div className="relative flex min-h-[252px] flex-col justify-between gap-10 px-6 py-8 sm:px-9 sm:py-9 lg:min-h-[300px] lg:border-r lg:border-white/20">
            <span className="text-[15px] leading-none text-white/80 sm:text-[16px]">
              Try it free
            </span>
            <form
              action="/sign-up"
              className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Your email"
                aria-label="Your email"
                className="h-14 w-full rounded-[12px] bg-white/[0.06] px-5 text-[16px] text-white outline-none ring-1 ring-white/20 backdrop-blur-sm transition placeholder:text-white/45 focus:bg-white/[0.10] focus:ring-2 focus:ring-rose-400 sm:max-w-[300px]"
              />
              <button
                type="submit"
                className="inline-flex items-center self-start whitespace-nowrap text-[clamp(2rem,3.6vw,3.5rem)] font-semibold leading-none text-white underline decoration-[2px] underline-offset-[10px] transition-colors hover:text-rose-200 hover:decoration-rose-300 sm:self-auto"
              >
                Get started
              </button>
            </form>
          </div>

          {/* RIGHT — main conversion (bright accent panel, fully clickable) */}
          <Link
            href="/sign-up"
            className="group relative flex min-h-[252px] flex-col justify-between gap-10 border-t border-ink-900/10 px-6 py-8 text-ink-900 transition-[filter] hover:brightness-[1.03] sm:px-9 sm:py-9 lg:min-h-[300px] lg:border-t-0"
            style={{ backgroundColor: ACCENT }}
          >
            <span className="text-[15px] leading-none text-ink-900/75 sm:text-[16px]">
              See it in action
            </span>
            <span className="inline-flex items-center self-start whitespace-nowrap text-[clamp(2rem,3.6vw,3.5rem)] font-semibold leading-none text-ink-900 underline decoration-[2px] underline-offset-[10px] transition-[text-decoration-color] group-hover:decoration-ink-900/45">
              Book a demo
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
