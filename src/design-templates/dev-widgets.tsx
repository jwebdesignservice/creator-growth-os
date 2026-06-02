/* Dev widgets ────────────────────────────────────────────────────────────
   Internal dev-dashboard widgets — status badges, a system-health strip,
   and a compact metric strip. Mirrors src/components/dev-dashboard/* but
   recoloured from the dev-only CSS vars to the app's rose/cream/ink tokens
   so they fit the rest of the gallery.
   ───────────────────────────────────────────────────────────────────── */

import { cn } from "@/lib/cn";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const BADGE: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-rose-50 text-rose-600",
  neutral: "bg-cream-200 text-ink-500",
};
const DOT: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
  info: "bg-rose-400",
  neutral: "bg-ink-400",
};

export function StatusBadges() {
  const items: { tone: Tone; label: string }[] = [
    { tone: "success", label: "Operational" },
    { tone: "warning", label: "Degraded" },
    { tone: "danger", label: "Down" },
    { tone: "info", label: "Deploying" },
    { tone: "neutral", label: "Idle" },
  ];
  return (
    <div className="flex flex-wrap gap-2 max-w-[440px]">
      {items.map((it) => (
        <span
          key={it.label}
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 h-[24px] rounded-md text-[11.5px] font-semibold",
            BADGE[it.tone],
          )}
        >
          <span className={cn("size-1.5 rounded-full", DOT[it.tone])} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

export function SystemHealthStrip() {
  const svc: { name: string; status: string; tone: Tone; ms: string }[] = [
    { name: "API", status: "Operational", tone: "success", ms: "82ms" },
    { name: "Database", status: "Operational", tone: "success", ms: "14ms" },
    { name: "Auth", status: "Degraded", tone: "warning", ms: "340ms" },
    { name: "Storage", status: "Operational", tone: "success", ms: "56ms" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-[600px] max-w-full">
      {svc.map((s) => (
        <div key={s.name} className="card p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("size-2 rounded-full", DOT[s.tone])} />
            <span className="text-[12.5px] font-semibold text-ink-900">{s.name}</span>
          </div>
          <div className="text-[11.5px] text-ink-500">{s.status}</div>
          <div className="text-[16px] font-bold text-ink-900 tabular-nums mt-1">{s.ms}</div>
        </div>
      ))}
    </div>
  );
}

export function MetricStrip() {
  const metrics = [
    { label: "Requests", value: "1.2M", delta: "+4.2%" },
    { label: "Error rate", value: "0.18%", delta: "−0.03" },
    { label: "p95 latency", value: "212ms", delta: "+8ms" },
    { label: "Uptime", value: "99.98%", delta: "30d" },
  ];
  return (
    <div className="card grid grid-cols-4 divide-x divide-ink-100 w-[640px] max-w-full">
      {metrics.map((m) => (
        <div key={m.label} className="px-5 py-4">
          <div className="text-[11.5px] text-ink-500">{m.label}</div>
          <div className="text-h4 text-ink-900 tabular-nums leading-tight mt-0.5">{m.value}</div>
          <div className="text-[11px] font-semibold text-ink-400 mt-1">{m.delta}</div>
        </div>
      ))}
    </div>
  );
}
