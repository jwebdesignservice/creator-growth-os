import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Plus, Inbox } from "lucide-react";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getMyTickets } from "@/lib/support/queries";
import { PageShell } from "@/components/app-shell/page-shell";
import { Button } from "@/components/ui/button";
import { ticketStatusLabel, ticketMeta } from "../support-panel";
import type { SupportTicket, SupportTicketStatus } from "@/lib/support/types";
import { cn } from "@/lib/cn";

export const metadata = { title: "Your Tickets · Creator Growth OS" };

const STATUS_FILTERS: { value: SupportTicketStatus | "all"; label: string }[] = [
  { value: "all",         label: "All"          },
  { value: "open",        label: "Open"         },
  { value: "waiting",     label: "Waiting"      },
  { value: "in_progress", label: "In Progress"  },
  { value: "resolved",    label: "Resolved"     },
];

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function TicketsListPage({ searchParams }: Props) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;
  const statusFilter = parseStatus(params.status);
  const tickets = await getMyTickets({ status: statusFilter, limit: 100 });

  return (
    <PageShell>
      <div className="max-w-[var(--container-content)] space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-ink-500 hover:text-rose-700 transition-colors mb-2"
            >
              <ArrowLeft className="size-3.5" strokeWidth={2} />
              Back to Support
            </Link>
            <h1 className="font-display text-[26px] sm:text-[30px] text-ink-900 leading-tight">
              Your tickets
            </h1>
            <p className="mt-1.5 text-[13.5px] sm:text-[14px] text-ink-500 max-w-2xl leading-relaxed">
              Track the status of every request you’ve submitted. Click a row to
              open the full ticket and follow up.
            </p>
          </div>
          <Link
            href="/support"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] text-[14px] font-medium bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
          >
            <Plus className="size-4" strokeWidth={2} />
            New request
          </Link>
        </div>

        {/* Status filter pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_FILTERS.map((f) => {
            const active = f.value === statusFilter;
            return (
              <Link
                key={f.value}
                href={f.value === "all" ? "/support/tickets" : `/support/tickets?status=${f.value}`}
                className={cn(
                  "inline-flex items-center h-9 px-3.5 rounded-full text-[12.5px] font-medium transition-colors",
                  active
                    ? "bg-rose-600 text-white"
                    : "bg-white border border-ink-200 text-ink-700 hover:bg-cream-100",
                )}
              >
                {f.label}
              </Link>
            );
          })}
        </div>

        {tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <section className="card p-0 overflow-hidden">
            <ul className="divide-y divide-ink-100">
              {tickets.map((t) => (
                <li key={t.id}>
                  <TicketRow t={t} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function parseStatus(v: string | undefined): SupportTicketStatus | "all" {
  if (!v) return "all";
  if (v === "open" || v === "waiting" || v === "in_progress" || v === "resolved" || v === "closed") {
    return v;
  }
  return "all";
}

function TicketRow({ t }: { t: SupportTicket }) {
  const status = ticketStatusLabel(t.status);
  return (
    <Link
      href={`/support/tickets/${t.publicId}`}
      className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_140px_120px] items-center gap-4 px-4 sm:px-5 py-4 hover:bg-cream-100 transition-colors"
    >
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-ink-900 truncate">
          {t.subject}
        </div>
        <div className="mt-0.5 text-[12px] text-ink-500 truncate tabular-nums">
          #{t.publicId} <span className="text-ink-300">•</span> {ticketMeta(t)}
        </div>
      </div>
      <span
        className={cn(
          "hidden sm:inline-flex items-center px-2 h-[22px] rounded-full text-[11px] font-semibold whitespace-nowrap justify-self-start",
          STATUS_PILL[status],
        )}
      >
        {status}
      </span>
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-rose-700 justify-self-end">
        Open
        <ArrowRight className="size-3.5" strokeWidth={2} />
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <section className="card p-10 text-center">
      <div className="mx-auto size-12 rounded-full inline-flex items-center justify-center bg-cream-200 text-ink-500">
        <Inbox className="size-5" strokeWidth={1.8} />
      </div>
      <h2 className="mt-3 text-[16px] font-semibold text-ink-900">No tickets yet</h2>
      <p className="mt-1 text-[13px] text-ink-500 max-w-md mx-auto leading-relaxed">
        When you submit a support request it’ll appear here so you can track
        progress and replies.
      </p>
      <div className="mt-5">
        <Link href="/support">
          <Button variant="primary" size="md" className="gap-1.5">
            <Plus className="size-4" strokeWidth={2} />
            Submit a request
          </Button>
        </Link>
      </div>
    </section>
  );
}

const STATUS_PILL: Record<
  ReturnType<typeof ticketStatusLabel>,
  string
> = {
  Open:          "bg-rose-100 text-rose-700",
  Waiting:       "bg-[#FBE5C7] text-[#9A6A22]",
  "In Progress": "bg-rose-100 text-rose-700",
  Resolved:      "bg-success-bg text-success",
  Closed:        "bg-ink-100 text-ink-500",
};
