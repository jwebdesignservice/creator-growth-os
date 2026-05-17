import Link from "next/link";
import {
  BadgeCheck,
  ArrowUpRight,
  UserSquare,
  Inbox,
  UserCog,
  Mail,
} from "lucide-react";
import { DevSectionCard } from "../../dev-section-card";
import { SUPPORT_CLIENT_PROFILE } from "@/lib/dev-dashboard/mock-data";
import type {
  SupportClientAccountHealth,
  SupportClientProfile,
} from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const HEALTH_DOT: Record<SupportClientAccountHealth, string> = {
  Healthy:  "bg-[var(--dev-success)]",
  "At Risk": "bg-[var(--dev-warning)]",
  Critical: "bg-[var(--dev-danger)]",
};

const HEALTH_TEXT: Record<SupportClientAccountHealth, string> = {
  Healthy:  "text-[var(--dev-success-text)]",
  "At Risk": "text-[var(--dev-warning-text)]",
  Critical: "text-[var(--dev-danger-text)]",
};

type Props = {
  data?: SupportClientProfile | null;
};

export function ClientProfileCard({ data }: Props) {
  const p: SupportClientProfile | null =
    data === undefined ? SUPPORT_CLIENT_PROFILE : data;

  if (!p) {
    return (
      <DevSectionCard title="Client Profile" contentClassName="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-[12.5px] text-[var(--dev-text-muted)] text-center px-4">
          Select a ticket to see the client&apos;s account, plan, contact, and
          activity here.
        </p>
      </DevSectionCard>
    );
  }

  // Build URL-driven quick-action targets. None of these mutate auth or do a
  // real session swap — Impersonate User just navigates to the dev-side user
  // detail view, which is the safest interpretation.
  const ticketsHref  = `/dev/support?q=${encodeURIComponent(p.client)}`;
  const accountHref  = `/dev/users?q=${encodeURIComponent(p.contactEmail)}`;
  const mailtoHref   = p.contactEmail !== "—" ? `mailto:${p.contactEmail}` : undefined;

  return (
    <DevSectionCard
      title="Client Profile"
      contentClassName="flex flex-col gap-4"
    >
      {/* Field grid */}
      <dl className="rounded-[10px] bg-[var(--dev-surface-soft)] border border-[var(--dev-border-soft)] divide-y divide-[var(--dev-border-soft)]">
        <Field label="Client">
          <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--dev-text-primary)]">
            {p.client}
            <BadgeCheck className="size-3.5 text-[var(--dev-success-text)]" strokeWidth={2} />
          </span>
        </Field>
        <Field label="Support ID">
          <span className="font-mono text-[12px] text-[var(--dev-text-primary)]">{p.supportId}</span>
        </Field>
        <Field label="Plan">
          <span className="text-[12.5px] font-medium text-[var(--dev-text-primary)]">{p.plan}</span>
        </Field>
        <Field label="Account Health">
          <span className={cn("inline-flex items-center gap-1.5 text-[12.5px] font-semibold", HEALTH_TEXT[p.accountHealth])}>
            <span className={cn("inline-block size-2 rounded-full", HEALTH_DOT[p.accountHealth])} aria-hidden />
            {p.accountHealth}
          </span>
        </Field>
        <Field label="Company">
          <span className="text-[12.5px] text-[var(--dev-text-primary)] truncate">{p.company}</span>
        </Field>
        <Field label="Contact Email">
          {mailtoHref ? (
            <a
              href={mailtoHref}
              className="text-[12.5px] text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors truncate"
            >
              {p.contactEmail}
            </a>
          ) : (
            <span className="text-[12.5px] text-[var(--dev-text-muted)]">{p.contactEmail}</span>
          )}
        </Field>
        <Field label="Product Area">
          <span className="text-[12.5px] text-[var(--dev-text-primary)]">{p.productArea}</span>
        </Field>
        <Field label="Previous Tickets">
          <span className="text-[12.5px] text-[var(--dev-text-primary)] tabular-nums">
            {p.previousTicketsTotal}{" "}
            <span className="text-[var(--dev-text-muted)]">({p.previousTicketsOpen} open)</span>
          </span>
        </Field>
        <Field label="Last Activity">
          <span className="text-[12.5px] text-[var(--dev-text-muted)] tabular-nums">{p.lastActivity}</span>
        </Field>
      </dl>

      {/* Quick actions */}
      <div>
        <div className="text-[10.5px] uppercase tracking-wider font-semibold text-[var(--dev-text-muted)] mb-2">
          Quick Actions
        </div>
        <ul className="space-y-1">
          <ActionRow icon={UserSquare} label="View Client Account" href={accountHref} />
          <ActionRow icon={Inbox}      label="View All Tickets"     href={ticketsHref} />
          <ActionRow icon={UserCog}    label="Impersonate User"     href={accountHref} title="Opens the user's dev-side account view. Session-swap impersonation is not enabled." />
          {mailtoHref ? (
            <ActionRow icon={Mail} label="Contact Client" href={mailtoHref} external />
          ) : (
            <ActionRow icon={Mail} label="Contact Client" disabled />
          )}
        </ul>
      </div>
    </DevSectionCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  // Stack label above value on narrow widths (cards in narrow columns), then
  // switch to label-left / value-right at sm+. Removes the hard `max-w-[60%]`
  // value clamp that made long values truncate aggressively at xl col-span-2/3.
  return (
    <div className="flex flex-col gap-0.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <dt className="text-[11.5px] text-[var(--dev-text-muted)] font-medium shrink-0">{label}</dt>
      <dd className="min-w-0 sm:text-right sm:max-w-[65%]">{children}</dd>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  href,
  external,
  disabled,
  title,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  const inner = (
    <>
      <Icon className="size-4 text-[var(--dev-text-muted)] group-hover:text-[var(--dev-text-secondary)]" strokeWidth={1.8} />
      <span className="flex-1 text-left truncate">{label}</span>
      <ArrowUpRight className="size-3.5 text-[var(--dev-text-muted)]" strokeWidth={1.9} />
    </>
  );

  const className =
    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] text-[12.5px] font-medium text-[var(--dev-text-secondary)] hover:text-[var(--dev-text-primary)] hover:bg-[var(--dev-surface-soft)] transition-colors group";

  if (disabled || !href) {
    return (
      <li>
        <span aria-disabled className={cn(className, "opacity-50 cursor-not-allowed hover:bg-transparent hover:text-[var(--dev-text-secondary)]")}>
          {inner}
        </span>
      </li>
    );
  }

  if (external) {
    return (
      <li>
        <a href={href} title={title} className={className}>
          {inner}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Link href={href} title={title} className={className}>
        {inner}
      </Link>
    </li>
  );
}
