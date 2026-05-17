import { DevSectionCard } from "../../dev-section-card";
import { AUTH_ROUTE_HEALTH } from "@/lib/dev-dashboard/mock-data";
import type { AuthRouteRow, AuthRouteStatus } from "@/lib/dev-dashboard/types";
import { cn } from "@/lib/cn";

const STATUS_PILL: Record<AuthRouteStatus, string> = {
  Healthy:  "bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border-[var(--dev-success-border)]",
  Warning:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border-[var(--dev-warning-border)]",
  Critical: "bg-[var(--dev-danger-soft)]  text-[var(--dev-danger-text)]  border-[var(--dev-danger-border)]",
};

const STATUS_DOT: Record<AuthRouteStatus, string> = {
  Healthy:  "bg-[var(--dev-success-text)]",
  Warning:  "bg-[var(--dev-warning-text)]",
  Critical: "bg-[var(--dev-danger-text)]",
};

export function AuthRouteHealthCard({ data }: { data?: AuthRouteRow[] }) {
  const rows = data ?? AUTH_ROUTE_HEALTH;
  return (
    <DevSectionCard title="Auth Route Health">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <th className="font-semibold py-2 px-2.5 align-middle whitespace-nowrap">Route</th>
              <th className="font-semibold py-2 px-2.5 align-middle whitespace-nowrap">Status</th>
              <th className="font-semibold py-2 px-2.5 align-middle whitespace-nowrap text-right">
                P95 Latency
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.route}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px]"
              >
                <td className="py-2.5 px-2.5 align-middle">
                  <span className="font-mono text-[12px] text-[var(--dev-text-primary)] whitespace-nowrap">
                    {row.route}
                  </span>
                </td>
                <td className="py-2.5 px-2.5 align-middle">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 h-[22px] rounded-md text-[11px] font-semibold border whitespace-nowrap",
                      STATUS_PILL[row.status],
                    )}
                  >
                    <span
                      className={cn("size-1.5 rounded-full", STATUS_DOT[row.status])}
                      aria-hidden
                    />
                    {row.status}
                  </span>
                </td>
                <td className="py-2.5 px-2.5 align-middle text-right tabular-nums text-[var(--dev-text-primary)] font-semibold whitespace-nowrap">
                  {row.p95Ms}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DevSectionCard>
  );
}
