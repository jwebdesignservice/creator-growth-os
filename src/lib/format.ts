// Shared date/number formatting helpers, consolidated from per-file private
// copies. Variants that genuinely differ in user-visible output are exported
// under distinct names — pick the one whose output matches your surface
// instead of adding another local copy.

/** Compact relative timestamp: "just now" / "5m ago" / "3h ago" / "12d ago" / "2mo ago" / "1y ago". */
export function relativeTime(iso: string): string {
  const created = new Date(iso).getTime();
  const diffMs = Date.now() - created;
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Like {@link relativeTime} but caps at whole days ("90d ago" — no month/year
 * tiers) and echoes unparseable input back instead of formatting it. Used by
 * dev/support dashboards.
 */
export function relativeTimeDays(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/**
 * Relative timestamp with short units below a day and long units from there:
 * "just now" / "5m ago" / "3h ago" / "1 day ago" / "4 days ago" / "2 months ago".
 * Invalid timestamps render as "—".
 */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const ms = Math.max(0, Date.now() - then);
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const mo = Math.floor(days / 30);
  return mo === 1 ? "1 month ago" : `${mo} months ago`;
}

/** Compact count notation: 1_234_567 → "1.2M", 12_345 → "12.3K", below 1K locale-formatted. */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000)
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (Math.abs(n) >= 1_000)
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return n.toLocaleString();
}

/** Seconds → "MM:SS" (90 → "01:30"); zero, negative or missing → "—". */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
