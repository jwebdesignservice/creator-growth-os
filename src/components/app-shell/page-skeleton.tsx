/**
 * Shared loading skeleton for every page in the (app) route group.
 *
 * The shell (sidebar + topbar + right-rail) stays mounted during a
 * client-side navigation, so this component only needs to fake the
 * main canvas. A subtle pulse + a brand-tinted gradient + a thin
 * indeterminate progress bar at the top keeps the transition feeling
 * smooth and reassuring instead of jarring.
 *
 * Variants:
 *   - "page"   — generic page (header + KPI tiles + content blocks)
 *   - "detail" — single-record page (hero + tabs + body)
 *   - "table"  — list / admin pages (header + filter row + rows)
 */
type Variant = "page" | "detail" | "table";

export function PageSkeleton({ variant = "page" }: { variant?: Variant }) {
  return (
    <div className="relative">
      {/* Indeterminate top progress bar — slides across continuously */}
      <ProgressBar />

      <div
        className="space-y-6 px-[var(--mobile-content-x)] py-[var(--mobile-content-y)] lg:px-[var(--space-page-x)] lg:py-[var(--space-page-y)] animate-pulse"
        aria-hidden
        aria-busy="true"
      >
      {/* Header — title + subtitle + tiny active dot */}
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Bar w="w-32" h="h-3" tone="rose" />
          <Bar w="w-72" h="h-10" />
          <Bar w="w-96" h="h-4" />
        </div>
        <Spinner />
      </div>

      {variant === "page" && (
        <>
          {/* KPI tile row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Block key={i} className="h-[92px]" />
            ))}
          </div>
          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
            <Block className="h-[320px]" />
            <Block className="h-[320px]" />
          </div>
          {/* Bottom row */}
          <Block className="h-[200px]" />
        </>
      )}

      {variant === "detail" && (
        <>
          {/* Hero / featured */}
          <Block className="h-[280px]" />
          {/* Tabs */}
          <div className="flex items-center gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Bar key={i} w="w-24" h="h-8" />
            ))}
          </div>
          {/* Body */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Block className="h-[280px]" />
            <Block className="h-[280px]" />
          </div>
        </>
      )}

      {variant === "table" && (
        <>
          {/* Search / filter row */}
          <Block className="h-[60px]" />
          {/* Rows */}
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Block key={i} className="h-[64px]" />
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────── */
/* Animated indicators                                                  */
/* ──────────────────────────────────────────────────────────────────── */

function ProgressBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden bg-rose-100/40">
      <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-rose-500 to-transparent skeleton-progress" />
    </div>
  );
}

function Spinner() {
  return (
    <div
      className="relative size-9 shrink-0 hidden sm:inline-flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <span className="absolute inset-0 rounded-full border-2 border-rose-100" />
      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-rose-500 animate-spin" />
    </div>
  );
}

function Block({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-[16px] bg-gradient-to-br from-cream-200 via-cream-100 to-rose-50 border border-ink-100/60 ${className ?? ""}`}
    />
  );
}

function Bar({
  w,
  h,
  tone = "cream",
}: {
  w: string;
  h: string;
  tone?: "cream" | "rose";
}) {
  const bg = tone === "rose" ? "bg-rose-100" : "bg-cream-200";
  return <div className={`rounded-full ${bg} ${w} ${h}`} />;
}
