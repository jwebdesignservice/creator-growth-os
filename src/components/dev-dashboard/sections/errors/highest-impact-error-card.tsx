import { ExternalLink } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { DevStatusBadge } from "../../dev-status-badge";
import { HIGHEST_IMPACT_ERROR, LATEST_STACK_TRACE } from "@/lib/dev-dashboard/mock-data";
import type { HighestImpactError, StackTracePreview } from "@/lib/dev-dashboard/types";
import { OpenStackTraceButton } from "./stack-trace-modal";

type Props = {
  data?: HighestImpactError;
  trace?: StackTracePreview | null;
};

export function HighestImpactErrorCard({ data, trace }: Props) {
  const e = data ?? HIGHEST_IMPACT_ERROR;
  // Best-effort fallback so the "View Stack Trace" button has something to
  // open even before the per-error trace is wired up.
  const stack: StackTracePreview = trace ?? LATEST_STACK_TRACE;

  return (
    <DevSectionCard
      title="Highest Impact Error"
      trailing={<DevStatusBadge tone="danger">Critical</DevStatusBadge>}
    >
      <div className="text-[15px] font-semibold text-[var(--dev-text-primary)] leading-snug mb-4 break-words">
        {e.title}
      </div>

      <dl className="space-y-2">
        <Row label="Error ID"          value={<span className="font-mono">{e.id}</span>} />
        <Row label="Type"              value={e.type} />
        <Row label="Status Code"       value={<span className="tabular-nums">{e.statusCode}</span>} />
        <Row label="Route"             value={<span className="font-mono text-[12.5px]">{e.route}</span>} />
        <Row label="First Seen"        value={<span className="tabular-nums">{e.firstSeen}</span>} />
        <Row label="Last Seen"         value={<span className="text-[var(--dev-danger-text)] tabular-nums">{e.lastSeen}</span>} />
        <Row label="Occurrences (24h)" value={<span className="tabular-nums">{e.occurrences}</span>} />
        <Row label="Affected Users"    value={<span className="tabular-nums">{e.affectedUsers.toLocaleString()}</span>} />
        <Row
          label="Environment"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--dev-success-text)]" />
              {e.environment}
            </span>
          }
        />
        <Row label="Release" value={e.release} />
        <Row
          label="Owner"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span className="size-5 rounded-full bg-[var(--dev-accent-soft)] border border-[var(--dev-accent-border)] inline-flex items-center justify-center text-[9.5px] font-semibold text-[var(--dev-accent-text)]">
                {initialsOf(e.owner)}
              </span>
              {e.owner}
            </span>
          }
        />
        <Row
          label="Impact"
          value={
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--dev-danger-text)]" />
              {e.impact}
            </span>
          }
        />
      </dl>

      <div className="mt-4 pt-4 border-t border-[var(--dev-border-soft)]">
        <div className="text-[11px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1.5">
          Suggested Next Action
        </div>
        <p className="text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed">
          {e.suggestedNextAction}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {/* "Open Incident" would route to a per-incident page — that route
            isn't built yet, so the button is rendered as a disabled affordance
            with a hint, matching the brief's "skip if it needs a new page"
            rule. Hover tooltip surfaces the reason. */}
        <button
          type="button"
          disabled
          title="Per-incident detail page not built in this pass."
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-[10px] bg-[var(--dev-accent)] opacity-50 cursor-not-allowed text-white text-[12.5px] font-semibold"
        >
          Open Incident
          <ExternalLink className="size-3.5" strokeWidth={2} />
        </button>
        <OpenStackTraceButton
          trace={stack}
          title={`Stack Trace · ${e.id}`}
          className="inline-flex items-center justify-center h-9 px-3 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-semibold text-[var(--dev-text-primary)] transition-colors"
        >
          View Stack Trace
        </OpenStackTraceButton>
      </div>
    </DevSectionCard>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <dt className="text-[var(--dev-text-muted)]">{label}</dt>
      <dd className="text-[var(--dev-text-primary)] font-medium text-right">{value}</dd>
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
