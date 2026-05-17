import { Download, Image as ImageIcon, FileText, Globe, Monitor } from "lucide-react";
import { DevSectionCard } from "../../../dev-section-card";
import type {
  SupportAttachment,
  SupportClientSubmission,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const ATTACHMENT_ICON: Record<SupportAttachment["kind"], React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  image: ImageIcon,
  text:  FileText,
  log:   FileText,
  video: FileText,
  other: FileText,
};

const ATTACHMENT_TONE: Record<SupportAttachment["kind"], string> = {
  image: "text-[var(--dev-chart-blue)]",
  text:  "text-[var(--dev-chart-green)]",
  log:   "text-[var(--dev-chart-green)]",
  video: "text-[var(--dev-chart-violet)]",
  other: "text-[var(--dev-text-muted)]",
};

/* Visual structure
   ────────────────
   The card is split into three vertically-stacked sub-sections, each on
   its own elevated surface so the content hierarchy reads top-to-bottom:

     • Header strip — who submitted, contact, area, environment.
     • Issue body  — issue summary + reproduction / expected / actual.
     • Attachments — file chips in a 2-up grid.
     • Footer      — browser / device + submission source.

   Each sub-section has a clear uppercase heading and consistent left/right
   gutter, so scanning is easy without losing density. */
export function ClientSubmissionCard({ data }: { data: SupportClientSubmission }) {
  return (
    <DevSectionCard title="Client Submission">
      {/* ── Header strip — submitter context as a quiet metadata band. */}
      <div className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] px-4 py-3 mb-5">
        <div
          className="grid gap-x-5 gap-y-3"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 11rem), 1fr))" }}
        >
          <Field label="Submitted by">
            <span className="inline-flex items-center gap-2">
              <span className="size-6 rounded-full bg-[var(--dev-accent-soft)] border border-[var(--dev-accent-border)] inline-flex items-center justify-center text-[10px] font-semibold text-[var(--dev-accent-text)] shrink-0">
                {initialsOf(data.submittedByName)}
              </span>
              <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium truncate">
                {data.submittedByName}
                <span className="text-[var(--dev-text-muted)] font-normal"> · {data.submittedByCompany}</span>
              </span>
            </span>
          </Field>
          <Field label="Contact">
            <span className="text-[12.5px] text-[var(--dev-text-primary)] truncate">{data.contactEmail}</span>
          </Field>
          <Field label="Affected area">
            <span className="text-[12.5px] text-[var(--dev-text-primary)] font-medium">{data.affectedProductArea}</span>
          </Field>
          <Field label="Environment">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--dev-text-primary)] font-medium">
              <span className="size-1.5 rounded-full bg-[var(--dev-success-text)]" aria-hidden />
              {data.environment}
            </span>
          </Field>
        </div>
      </div>

      {/* ── Issue summary — leading paragraph, slightly larger so it pops. */}
      <section className="mb-6">
        <h4 className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-2">
          Issue summary
        </h4>
        <p className="text-[13.5px] text-[var(--dev-text-primary)] leading-relaxed">
          {data.issueSummary}
        </p>
      </section>

      {/* ── Repro + Expected/Actual — two-col grid, both columns elevated. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <section className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] px-4 py-3.5">
          <h4 className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-2.5">
            Reproduction steps
          </h4>
          <ol className="space-y-1.5 text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed list-decimal pl-4 marker:text-[var(--dev-text-muted)]">
            {data.reproductionSteps.map((step, i) => (
              <li key={i} className="pl-1">{step}</li>
            ))}
          </ol>
        </section>

        <div className="space-y-3">
          <section className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] px-4 py-3.5">
            <h4 className="text-[10.5px] uppercase tracking-wider text-[var(--dev-success-text)] font-semibold mb-1.5">
              Expected behavior
            </h4>
            <p className="text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed">
              {data.expectedBehavior}
            </p>
          </section>
          <section className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] px-4 py-3.5">
            <h4 className="text-[10.5px] uppercase tracking-wider text-[var(--dev-danger-text)] font-semibold mb-1.5">
              Actual behavior
            </h4>
            <p className="text-[12.5px] text-[var(--dev-text-secondary)] leading-relaxed">
              {data.actualBehavior}
            </p>
          </section>
        </div>
      </div>

      {/* ── Attachments — heading + 2-up grid. */}
      <section className="mb-5">
        <h4 className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-2.5">
          Attachments ({data.attachments.length})
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {data.attachments.map((a) => {
            const Icon = ATTACHMENT_ICON[a.kind];
            return (
              <div
                key={a.name}
                className="flex items-center gap-2.5 p-2.5 rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] hover:border-[var(--dev-border)] transition-colors"
              >
                <div className={cn(
                  "size-8 rounded-md inline-flex items-center justify-center bg-[var(--dev-surface-elev)] shrink-0",
                  ATTACHMENT_TONE[a.kind],
                )}>
                  <Icon className="size-4" strokeWidth={1.9} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] text-[var(--dev-text-primary)] font-medium truncate">
                    {a.name}
                  </div>
                  <div className="text-[11px] text-[var(--dev-text-muted)] tabular-nums">
                    {a.kind.toUpperCase()} · {a.sizeLabel}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Download ${a.name}`}
                  className="size-8 inline-flex items-center justify-center rounded-md text-[var(--dev-text-muted)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-elev)] transition-colors shrink-0"
                >
                  <Download className="size-4" strokeWidth={1.9} />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer — browser/device + source. */}
      <footer className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--dev-border-soft)] text-[11.5px]">
        <span className="inline-flex items-center gap-1.5 text-[var(--dev-text-secondary)]">
          <Monitor className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.9} aria-hidden />
          <span className="text-[var(--dev-text-muted)]">Browser / Device</span>
          <span className="font-medium text-[var(--dev-text-primary)]">{data.browser}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-[var(--dev-text-secondary)]">
          <Globe className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.9} aria-hidden />
          <span className="text-[var(--dev-text-muted)]">Submitted via</span>
          <span className="font-medium text-[var(--dev-text-primary)]">{data.submittedVia}</span>
        </span>
      </footer>
    </DevSectionCard>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold mb-1">
        {label}
      </div>
      <div className="truncate">{children}</div>
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}
