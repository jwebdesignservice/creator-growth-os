import { ExternalLink } from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { LATEST_STACK_TRACE } from "@/lib/dev-dashboard/mock-data";
import type { StackTracePreview } from "@/lib/dev-dashboard/types";
import { OpenStackTraceButton } from "./stack-trace-modal";

export function LatestStackTraceCard({ data }: { data?: StackTracePreview }) {
  const trace = data ?? LATEST_STACK_TRACE;
  return (
    <DevSectionCard title="Latest Stack Trace">
      <div className="rounded-[10px] bg-[var(--dev-bg)] border border-[var(--dev-border)] overflow-hidden">
        <pre className="m-0 py-3 text-[12px] font-mono leading-[1.6] text-[var(--dev-text-secondary)]">
          {trace.lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="select-none w-8 shrink-0 text-right pr-3 text-[var(--dev-text-faint)] tabular-nums">
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 break-all">{line}</span>
            </div>
          ))}
        </pre>
      </div>

      <OpenStackTraceButton
        trace={trace}
        title="Latest Stack Trace"
        className="mt-3 ml-auto flex items-center gap-1.5 h-8 px-3 rounded-[8px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View full trace
        <ExternalLink className="size-3.5" strokeWidth={2} />
      </OpenStackTraceButton>
    </DevSectionCard>
  );
}
