import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { DATABASE_HEALTH } from "@/lib/dev-dashboard/mock-data";

export function DatabaseHealthCard() {
  const d = DATABASE_HEALTH;
  return (
    <DevSectionCard title="Database Health">
      <ul className="space-y-2.5">
        <Row label="Connection" value={
          <span className="text-[var(--dev-success-text)] font-semibold">{d.connection}</span>
        } />
        <Row label="Active Connections" value={
          <span className="text-[var(--dev-text-primary)] font-semibold tabular-nums">{d.activeConnections}</span>
        } />
        <Row label="Slow Queries" value={
          <span className="inline-flex items-center gap-1.5 text-[var(--dev-text-primary)] font-semibold tabular-nums">
            <Dot color="var(--dev-warning-text)" />
            {d.slowQueries}
          </span>
        } />
        <Row label="Failed Queries" value={
          <span className="inline-flex items-center gap-1.5 text-[var(--dev-text-primary)] font-semibold tabular-nums">
            <Dot color="var(--dev-success-text)" />
            {d.failedQueries}
          </span>
        } />
        <Row label="Replication Lag" value={
          <span className="text-[var(--dev-success-text)] font-semibold tabular-nums">{d.replicationLag}</span>
        } />
      </ul>

      <Link
        href="/dev/database"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View database
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between text-[13px]">
      <span className="text-[var(--dev-text-secondary)]">{label}</span>
      {value}
    </li>
  );
}

function Dot({ color }: { color: string }) {
  return <span className="size-2 rounded-full" style={{ background: color }} aria-hidden />;
}
