import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { TOP_PERFORMING_PAGES } from "@/lib/dev-dashboard/analytics-data";

export function TopPagesCard() {
  return (
    <DevSectionCard title="Top Performing Pages">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th className="w-[28px]"></Th>
              <Th>Route</Th>
              <Th className="text-right">Views</Th>
              <Th className="text-right">Avg. Time</Th>
              <Th className="text-right">Conversion</Th>
            </tr>
          </thead>
          <tbody>
            {TOP_PERFORMING_PAGES.map((p) => (
              <tr
                key={p.route}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px]"
              >
                <Td className="text-[var(--dev-text-muted)] tabular-nums">{p.rank}</Td>
                <Td className="text-[var(--dev-text-primary)] font-medium font-mono">
                  {p.route}
                </Td>
                <Td className="text-[var(--dev-text-primary)] tabular-nums text-right">
                  {p.views.toLocaleString()}
                </Td>
                <Td className="text-[var(--dev-text-secondary)] tabular-nums text-right">
                  {p.avgTime}
                </Td>
                <Td className="text-[var(--dev-success-text)] font-semibold tabular-nums text-right">
                  {p.conversion}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        href="/dev/analytics"
        className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
      >
        View all pages
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </Link>
    </DevSectionCard>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={"font-semibold py-2 px-2 align-middle " + className}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={"py-2.5 px-2 align-middle " + className}>{children}</td>;
}
