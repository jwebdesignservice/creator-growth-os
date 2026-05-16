import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DevSectionCard } from "../dev-section-card";
import { RECENT_LOGS } from "@/lib/dev-dashboard/mock-data";
import type { LogLevel } from "@/lib/dev-dashboard/types";

const LEVEL_STYLE: Record<LogLevel, string> = {
  ERROR: "bg-[var(--dev-danger-soft)] text-[var(--dev-danger-text)] border border-[var(--dev-danger-border)]",
  WARN:  "bg-[var(--dev-warning-soft)] text-[var(--dev-warning-text)] border border-[var(--dev-warning-border)]",
  INFO:  "bg-[var(--dev-accent-soft)]  text-[var(--dev-accent-text)]  border border-[var(--dev-accent-border)]",
};

export function RecentLogsTable() {
  return (
    <DevSectionCard
      title="Recent Logs"
      trailing={
        <Link
          href="/dev/logs"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          View all logs
          <ArrowRight className="size-3.5" strokeWidth={2} />
        </Link>
      }
    >
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
              <Th>Time</Th>
              <Th>Level</Th>
              <Th>Source</Th>
              <Th>Message</Th>
              <Th>User</Th>
              <Th>Route</Th>
            </tr>
          </thead>
          <tbody>
            {RECENT_LOGS.map((log) => (
              <tr
                key={log.id}
                className="border-t border-[var(--dev-border-soft)] text-[12.5px]"
              >
                <Td className="text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">
                  {log.time}
                </Td>
                <Td>
                  <span
                    className={
                      "inline-flex items-center px-1.5 h-[20px] rounded-md text-[10px] font-semibold tracking-wider " +
                      LEVEL_STYLE[log.level]
                    }
                  >
                    {log.level}
                  </span>
                </Td>
                <Td className="text-[var(--dev-text-secondary)] whitespace-nowrap">{log.source}</Td>
                <Td className="text-[var(--dev-text-primary)]">{log.message}</Td>
                <Td className="text-[var(--dev-text-secondary)] font-mono whitespace-nowrap">
                  {log.user ?? "—"}
                </Td>
                <Td className="text-[var(--dev-text-secondary)] font-mono whitespace-nowrap">
                  {log.route ?? "—"}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DevSectionCard>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="font-semibold py-2 px-2 align-middle">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={"py-2.5 px-2 align-middle " + className}>{children}</td>;
}
