import { Copy, ExternalLink, Circle, FileText } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import type { LiveLogLevel, SelectedLogDetail } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const LEVEL_PILL: Record<LiveLogLevel, string> = {
  INFO:  "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
  WARN:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  ERROR: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border border-[var(--dev-danger-border)]",
  DEBUG: "bg-[var(--dev-surface-elev)] text-[var(--dev-text-secondary)] border border-[var(--dev-border)]",
};

export function SelectedLogDetailsCard({ detail }: { detail: SelectedLogDetail | null }) {
  if (!detail) {
    return (
      <DevSectionCard title="Selected Log Details">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="size-10 rounded-full bg-[var(--dev-surface-elev)] inline-flex items-center justify-center mb-3">
            <FileText className="size-5 text-[var(--dev-text-muted)]" strokeWidth={1.8} aria-hidden />
          </span>
          <p className="text-[13px] text-[var(--dev-text-secondary)]">
            Select a log row above to inspect its full details.
          </p>
        </div>
      </DevSectionCard>
    );
  }
  const d = detail;
  return (
    <DevSectionCard
      title={
        <span className="inline-flex items-center gap-2.5">
          Selected Log Details
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 h-[20px] rounded-md text-[10.5px] font-semibold tracking-wider whitespace-nowrap",
              LEVEL_PILL[d.level],
            )}
          >
            <Circle className="size-2 fill-current" strokeWidth={0} aria-hidden />
            {d.level}
          </span>
        </span>
      }
      trailing={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12px] font-medium text-[var(--dev-text-primary)] transition-colors"
          >
            <ExternalLink className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
            View Full Trace
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12px] font-medium text-[var(--dev-text-primary)] transition-colors"
          >
            <Copy className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
            Copy JSON
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-6 gap-y-4">
        {/* Left meta column */}
        <dl className="lg:col-span-3 space-y-2.5">
          <Field label="Timestamp" value={d.timestamp} mono />
          <Field label="Level" value={d.level} />
          <Field label="Service" value={d.service} />
          <Field
            label="Environment"
            value={
              <span className="inline-flex items-center gap-1.5">
                <Circle
                  className="size-2 fill-[var(--dev-success-text)] text-[var(--dev-success-text)]"
                  strokeWidth={0}
                  aria-hidden
                />
                {d.environment}
              </span>
            }
          />
          <Field label="Route" value={d.route} mono />
        </dl>

        {/* Middle meta column */}
        <dl className="lg:col-span-3 space-y-2.5">
          <Field
            label="Trace ID"
            value={
              <a
                href="#"
                className="inline-flex items-center gap-1 text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
              >
                {d.traceId}
                <ExternalLink className="size-3" strokeWidth={2} aria-hidden />
              </a>
            }
            mono
          />
          <Field
            label="Request ID"
            value={
              <a
                href="#"
                className="inline-flex items-center gap-1 text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
              >
                {d.requestId}
                <ExternalLink className="size-3" strokeWidth={2} aria-hidden />
              </a>
            }
            mono
          />
          <Field label="User ID" value={d.userId} mono />
          <Field label="Status Code" value={String(d.statusCode)} tone="danger" />
          <Field label="Duration" value={d.duration} />
        </dl>

        {/* Right message + stack trace */}
        <div className="lg:col-span-6 space-y-3 min-w-0">
          <div>
            <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1.5">
              Message
            </div>
            <p className="text-[13px] text-[var(--dev-text-primary)]">{d.message}</p>
          </div>

          <pre className="m-0 p-3.5 rounded-[10px] bg-[var(--dev-sidebar-bg)] border border-[var(--dev-border)] text-[12px] font-mono text-[var(--dev-text-secondary)] overflow-x-auto whitespace-pre">
            {d.stackTrace.map((line, i) => (
              <span
                key={i}
                className={cn(
                  "block",
                  i === 0 && "text-[var(--dev-danger-text)] font-semibold",
                )}
              >
                {line}
              </span>
            ))}
          </pre>
        </div>
      </div>
    </DevSectionCard>
  );
}

function Field({
  label,
  value,
  mono = false,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  tone?: "danger";
}) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-1">
        {label}
      </dt>
      <dd
        className={cn(
          "text-[12.5px] text-[var(--dev-text-primary)] break-all",
          mono && "font-mono text-[12px]",
          tone === "danger" && "text-[var(--dev-danger-text)] font-semibold",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
