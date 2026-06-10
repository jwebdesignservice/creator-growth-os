/**
 * Light "trusted by" strip at the foot of the hero viewport. Wordmarks are
 * placeholder partner logos from the reference — swap for real logos later.
 */
const LOGOS = ["Reverse", "Scale", "Primex", "Walter.", "monosen"];

export function TrustedBy() {
  return (
    <section className="border-y border-ink-100 bg-cream-100">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-6 py-7 md:flex-row md:items-center md:gap-10 lg:px-10">
        <div className="flex items-center gap-6">
          <p className="max-w-[180px] text-[15px] font-medium leading-snug text-ink-700">
            Trusted by World&apos;s leading companies
          </p>
          <span className="hidden h-12 w-px bg-ink-200 md:block" />
        </div>
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4 md:flex-1 md:justify-between">
          {LOGOS.map((l) => (
            <span
              key={l}
              className="text-[22px] font-bold tracking-tight text-ink-400"
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
