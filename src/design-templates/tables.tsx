/* Tables ───────────────────────────────────────────────────────────────
   Every distinct table *system* in the product, shown with sample data —
   from a simple record list to rich scheduling and pipeline tables. They
   share one header / row / chip / pagination rhythm:

     • UsersTable         — basic record list (card + status chips)
     • AdminUsersTable    — advanced data table (sortable headers, column
                            controls, avatar cells, contact actions)
     • SupportTicketsTable— filter chips + priority/status pills + pagination
     • PlannedPostsTable  — rich scheduling table (icon tiles, colored rails)
     • DealTrackerTable   — pipeline table with stat tiles + stage pills
     • EmailHistoryTable  — delivery table (% delivered, status pills, menu)
   ───────────────────────────────────────────────────────────────────── */

import {
  MoreHorizontal,
  GripVertical,
  ArrowDown,
  Download,
  Settings2,
  Mail,
  MessageSquare,
  Search,
  Plus,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ChevronDown,
  BarChart3,
  ArrowRight,
  Clapperboard,
  Video,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { InstagramIcon, TiktokIcon, YoutubeIcon } from "@/components/brand-icons";

/* ═══════════════════════════════════════════════════════════════════════
   1 · Basic table — card + plain rows + status chips
   ═══════════════════════════════════════════════════════════════════════ */

type Row = {
  name: string;
  email: string;
  role: string;
  status: "active" | "invited" | "blocked";
};

const ROWS: Row[] = [
  { name: "Jack Wilson", email: "jack@profluencer.app", role: "Owner", status: "active" },
  { name: "Amelia Park", email: "amelia@profluencer.app", role: "Editor", status: "active" },
  { name: "Marcus Lee", email: "marcus@profluencer.app", role: "Viewer", status: "invited" },
  { name: "Priya Sharma", email: "priya@profluencer.app", role: "Editor", status: "blocked" },
];

const STATUS_STYLES: Record<Row["status"], string> = {
  active: "bg-emerald-100 text-emerald-700",
  invited: "bg-amber-100 text-amber-700",
  blocked: "bg-rose-100 text-rose-700",
};

export function UsersTable() {
  return (
    <div className="card overflow-hidden w-full">
      <table className="w-full text-left">
        <thead className="bg-cream-100/70 border-b border-ink-100">
          <tr>
            <th scope="col" className="px-4 py-3 text-[11.5px] uppercase tracking-wider text-ink-500 font-semibold">Name</th>
            <th scope="col" className="px-4 py-3 text-[11.5px] uppercase tracking-wider text-ink-500 font-semibold">Role</th>
            <th scope="col" className="px-4 py-3 text-[11.5px] uppercase tracking-wider text-ink-500 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">
          {ROWS.map((r) => (
            <tr key={r.email} className="hover:bg-cream-50 transition-colors">
              <td className="px-4 py-3">
                <div className="text-[13.5px] text-ink-900 font-medium">{r.name}</div>
                <div className="text-[12px] text-ink-500">{r.email}</div>
              </td>
              <td className="px-4 py-3 text-[13px] text-ink-700">{r.role}</td>
              <td className="px-4 py-3">
                <span className={"inline-flex items-center px-2 h-6 rounded-full text-[11px] font-semibold capitalize " + STATUS_STYLES[r.status]}>
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  aria-label="Row actions"
                  className="inline-flex items-center justify-center size-8 rounded-full hover:bg-cream-200 text-ink-500 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
                >
                  <MoreHorizontal className="size-4" strokeWidth={2} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   2 · Advanced admin data table — sortable headers (drag grips + sort
   arrows), Export / Edit-columns controls, avatar cells, plan/status
   chips, and pinned contact actions.
   ═══════════════════════════════════════════════════════════════════════ */

type AdminRow = {
  name: string;
  email: string;
  plan: "Pro" | "Basic" | "Free";
  planChip: string;
  status: string;
  statusChip: string;
  joined: string;
};

const ADMIN_ROWS: AdminRow[] = [
  { name: "Jack Wilson", email: "jack@profluencer.app", plan: "Pro", planChip: "chip-success", status: "Active", statusChip: "chip-success", joined: "12 Jan 2025" },
  { name: "Amelia Park", email: "amelia@profluencer.app", plan: "Basic", planChip: "chip-rose", status: "Active", statusChip: "chip-success", joined: "3 Feb 2025" },
  { name: "Marcus Lee", email: "marcus@profluencer.app", plan: "Free", planChip: "bg-cream-100 text-ink-700", status: "Onboarding", statusChip: "bg-amber-50 text-amber-700 border border-amber-200", joined: "21 Feb 2025" },
  { name: "Priya Sharma", email: "priya@profluencer.app", plan: "Pro", planChip: "chip-success", status: "Joined", statusChip: "bg-cream-100 text-ink-700", joined: "5 Mar 2025" },
];

const ADMIN_COLS: { label: string; sorted?: boolean; draggable?: boolean }[] = [
  { label: "User", draggable: true },
  { label: "Email", draggable: true },
  { label: "Plan", draggable: true },
  { label: "Status", draggable: true },
  { label: "Joined", draggable: true, sorted: true },
];

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function AdminUsersTable() {
  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-end gap-2">
        <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 bg-white hover:bg-cream-100 active:bg-cream-200 text-[12.5px] font-medium text-ink-700 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50">
          <Download className="size-3.5" strokeWidth={2} />
          Export
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 bg-white hover:bg-cream-100 active:bg-cream-200 text-[12.5px] font-medium text-ink-700 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2 focus-visible:ring-offset-cream-50">
          <Settings2 className="size-3.5" strokeWidth={2} />
          Edit
        </button>
      </div>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 bg-cream-100/60 border-b border-ink-100">
                {ADMIN_COLS.map((c) => (
                  <th key={c.label} className="font-semibold py-3 px-3 first:pl-5 select-none cursor-grab">
                    <span className="inline-flex items-center gap-1.5">
                      <GripVertical className="size-3 text-ink-300 -ml-0.5" strokeWidth={2} aria-hidden />
                      <span>{c.label}</span>
                      <ArrowDown className={cn("size-3", c.sorted ? "opacity-100" : "opacity-25")} strokeWidth={c.sorted ? 2.5 : 2} />
                    </span>
                  </th>
                ))}
                <th className="font-semibold py-3 px-3 pr-5 text-right">Contact</th>
              </tr>
            </thead>
            <tbody>
              {ADMIN_ROWS.map((r) => (
                <tr key={r.email} className="border-t border-ink-100 hover:bg-cream-50/60 transition-colors">
                  <td className="py-3 px-3 pl-5 align-middle">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="size-8 rounded-full bg-cream-200 text-ink-700 inline-flex items-center justify-center text-[11px] font-semibold shrink-0">
                        {initials(r.name)}
                      </span>
                      <span className="font-medium text-ink-900 truncate">{r.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 align-middle text-ink-600">{r.email}</td>
                  <td className="py-3 px-3 align-middle">
                    <span className={cn("chip capitalize", r.planChip)}>{r.plan}</span>
                  </td>
                  <td className="py-3 px-3 align-middle">
                    <span className={cn("chip", r.statusChip)}>{r.status}</span>
                  </td>
                  <td className="py-3 px-3 align-middle tabular-nums text-ink-500">{r.joined}</td>
                  <td className="py-3 px-3 pr-5 align-middle">
                    <div className="flex items-center justify-end gap-1.5">
                      <span className="size-8 rounded-[9px] border border-ink-200 bg-white inline-flex items-center justify-center text-ink-500">
                        <Mail className="size-3.5" strokeWidth={2} />
                      </span>
                      <span className="size-8 rounded-[9px] border border-ink-200 bg-white inline-flex items-center justify-center text-ink-500">
                        <MessageSquare className="size-3.5" strokeWidth={2} />
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   3 · Support tickets table — search, status filter chips, priority +
   status pills, row actions, ellipsis pagination.
   ═══════════════════════════════════════════════════════════════════════ */

type Ticket = {
  id: string;
  title: string;
  priority: { label: string; cls: string };
  status: { label: string; cls: string };
};

const TICKETS: Ticket[] = [
  { id: "1042", title: "Can't connect my TikTok account", priority: { label: "Urgent", cls: "bg-rose-100 text-rose-700" }, status: { label: "Open", cls: "bg-emerald-100 text-emerald-700" } },
  { id: "1041", title: "Billing question about the Pro plan", priority: { label: "Normal", cls: "bg-ink-100 text-ink-700" }, status: { label: "In Progress", cls: "bg-rose-100 text-rose-700" } },
  { id: "1038", title: "Feature request: bulk CSV export", priority: { label: "Low", cls: "bg-ink-100 text-ink-700" }, status: { label: "Waiting", cls: "bg-amber-100 text-amber-700" } },
  { id: "1035", title: "Password reset email never arrives", priority: { label: "High", cls: "bg-amber-100 text-amber-700" }, status: { label: "Resolved", cls: "bg-emerald-100 text-emerald-700" } },
];

const TICKET_FILTERS = ["All", "Open", "Waiting", "In Progress", "Resolved", "Closed"];

export function SupportTicketsTable() {
  return (
    <section className="card p-0 overflow-hidden w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap p-5 sm:p-6">
        <div className="min-w-0">
          <h1 className="text-h3 text-ink-900 leading-tight">Support tickets</h1>
          <p className="mt-1 text-[12.5px] text-ink-500">
            Track every request you&rsquo;ve submitted and follow up on ongoing conversations.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="relative w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-[14px] text-ink-400" strokeWidth={2} aria-hidden />
            <input readOnly placeholder="Search" className="w-full h-10 pl-10 pr-3 rounded-[10px] bg-white border border-ink-200 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-colors" />
          </div>
          <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold shadow-sm">
            <Plus className="size-[15px]" strokeWidth={2.4} />
            Create new ticket
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap px-5 sm:px-6 pb-4">
        {TICKET_FILTERS.map((f, i) => (
          <span
            key={f}
            className={cn(
              "inline-flex items-center h-7 px-2.5 rounded-full text-[11.5px] font-medium border",
              i === 0 ? "bg-rose-600 text-white border-rose-600" : "bg-white border-ink-200 text-ink-700",
            )}
          >
            {f}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <thead>
            <tr className="border-y border-ink-100 bg-cream-100/50">
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 px-3 py-3 w-[90px] pl-5 sm:pl-6">ID</th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 px-3 py-3">Title</th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 px-3 py-3 w-[110px]">Priority</th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 px-3 py-3 w-[110px]">Status</th>
              <th className="text-left text-[11px] uppercase tracking-wider font-semibold text-ink-500 px-3 py-3 w-[110px] text-right pr-5 sm:pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {TICKETS.map((t) => (
              <tr key={t.id} className="border-b border-ink-100 last:border-b-0 hover:bg-cream-100/40 transition-colors">
                <td className="pl-5 sm:pl-6 pr-3 py-3.5 text-[12.5px] text-ink-500 tabular-nums">#{t.id}</td>
                <td className="px-3 py-3.5">
                  <span className="block text-[13px] font-medium text-ink-800 truncate">{t.title}</span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={cn("inline-flex items-center px-2.5 h-[22px] rounded-full text-[11px] font-semibold", t.priority.cls)}>{t.priority.label}</span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={cn("inline-flex items-center px-2.5 h-[22px] rounded-full text-[11px] font-semibold", t.status.cls)}>{t.status.label}</span>
                </td>
                <td className="pl-3 pr-5 sm:pr-6 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <span className="inline-flex items-center justify-center size-8 rounded-full text-ink-500 hover:bg-cream-200"><Eye className="size-[16px]" strokeWidth={1.8} /></span>
                    <span className="inline-flex items-center justify-center size-8 rounded-full text-ink-500 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="size-[15px]" strokeWidth={1.9} /></span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className="flex items-center justify-between flex-wrap gap-3 px-5 sm:px-6 py-4 border-t border-ink-100">
        <p className="text-[12px] text-ink-500 tabular-nums">Showing 1&ndash;4 of 42</p>
        <div className="flex items-center gap-1">
          <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-ink-200 bg-white text-[12.5px] font-medium text-ink-400">
            <ChevronLeft className="size-3.5" strokeWidth={2.2} aria-hidden /> Previous
          </span>
          {["1", "2", "3", "4", "5"].map((p) => (
            <span key={p} className={cn("inline-flex items-center justify-center size-8 rounded-full text-[12.5px] font-semibold tabular-nums", p === "1" ? "bg-rose-600 text-white" : "text-ink-700")}>{p}</span>
          ))}
          <span className="inline-flex items-center justify-center size-8 text-[12.5px] text-ink-400">&hellip;</span>
          <span className="inline-flex items-center justify-center size-8 rounded-full text-[12.5px] font-semibold tabular-nums text-ink-700">12</span>
          <span className="inline-flex items-center gap-1 h-8 px-3 rounded-full border border-ink-200 bg-white text-[12.5px] font-medium text-ink-700">
            Next <ChevronRight className="size-3.5" strokeWidth={2.2} aria-hidden />
          </span>
        </div>
      </nav>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   4 · Planned posts table — content-type colored left rail, calendar /
   platform / content-type icon tiles, status pill, footer summary.
   ═══════════════════════════════════════════════════════════════════════ */

type Post = {
  date: string;
  time: string;
  platform: "instagram" | "tiktok" | "youtube";
  ct: "reel" | "short_video" | "video";
  topic: string;
  status: { label: string; cls: string };
};

const PLATFORM_META: Record<Post["platform"], { label: string; tile: string; icon: React.ReactNode }> = {
  instagram: { label: "Instagram", tile: "bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-white", icon: <InstagramIcon size={15} /> },
  tiktok: { label: "TikTok", tile: "bg-ink-900 text-white", icon: <TiktokIcon size={15} /> },
  youtube: { label: "YouTube", tile: "bg-red-600 text-white", icon: <YoutubeIcon size={16} /> },
};

const CT_META: Record<Post["ct"], { label: string; format: string; tile: string; label_cls: string; rail: string; Icon: typeof Video }> = {
  reel: { label: "Reel", format: "Short Form", tile: "bg-rose-100 text-rose-600", label_cls: "text-rose-700", rail: "border-rose-300", Icon: Clapperboard },
  short_video: { label: "Short Video", format: "Short Form", tile: "bg-amber-100 text-amber-600", label_cls: "text-amber-700", rail: "border-amber-300", Icon: Video },
  video: { label: "Video", format: "Video", tile: "bg-indigo-100 text-indigo-600", label_cls: "text-indigo-700", rail: "border-indigo-300", Icon: Video },
};

const POSTS: Post[] = [
  { date: "Jan 18, 2025", time: "9:00 AM", platform: "instagram", ct: "reel", topic: "5 editing tricks for beginners", status: { label: "Scheduled", cls: "bg-amber-100 text-amber-700" } },
  { date: "Jan 19, 2025", time: "2:30 PM", platform: "tiktok", ct: "short_video", topic: "A day in my creator life", status: { label: "Draft", cls: "bg-ink-100 text-ink-600" } },
  { date: "Jan 20, 2025", time: "6:00 PM", platform: "youtube", ct: "video", topic: "Full studio tour 2025", status: { label: "Planned", cls: "bg-rose-100 text-rose-700" } },
];

export function PlannedPostsTable() {
  return (
    <section className="card overflow-hidden w-full">
      <header className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-ink-100">
        <div className="min-w-0">
          <h3 className="text-h4 text-ink-900">Planned Posts</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">Review and manage your upcoming content across all platforms.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[12px] border border-rose-200 text-rose-600 text-[13px] font-semibold shrink-0">
          <CalendarDays className="size-4" strokeWidth={2} />
          View Calendar
        </span>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10.5px] tracking-[0.12em] uppercase text-ink-500 border-b border-ink-100">
              <th className="font-semibold py-3 px-5 sm:px-6">
                <span className="inline-flex items-center gap-1">Date &amp; Time <ChevronDown className="size-3 text-ink-400" strokeWidth={2.5} /></span>
              </th>
              <th className="font-semibold py-3 px-3">Platform</th>
              <th className="font-semibold py-3 px-3">Content Type</th>
              <th className="font-semibold py-3 px-3">Topic</th>
              <th className="font-semibold py-3 px-3">Status</th>
              <th className="py-3 px-5 sm:px-6" />
            </tr>
          </thead>
          <tbody>
            {POSTS.map((p) => {
              const plat = PLATFORM_META[p.platform];
              const ct = CT_META[p.ct];
              const Icon = ct.Icon;
              return (
                <tr key={p.topic} className="border-b border-ink-100 last:border-0 hover:bg-cream-50/60 transition-colors">
                  <td className={cn("py-3.5 px-5 sm:px-6 border-l-4", ct.rail)}>
                    <div className="flex items-center gap-2.5">
                      <span className="size-9 rounded-[10px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
                        <CalendarDays className="size-4" strokeWidth={2} />
                      </span>
                      <div className="leading-tight">
                        <div className="text-[13px] font-semibold text-ink-900">{p.date}</div>
                        <div className="text-[11.5px] text-ink-500">{p.time}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <span className={cn("size-9 rounded-[10px] inline-flex items-center justify-center shrink-0", plat.tile)}>{plat.icon}</span>
                      <span className="text-[13px] font-medium text-ink-800">{plat.label}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={cn("size-9 rounded-[10px] inline-flex items-center justify-center shrink-0", ct.tile)}>
                        <Icon className="size-4" strokeWidth={1.9} />
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("text-[13px] font-semibold truncate", ct.label_cls)}>{ct.label}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cream-100 text-ink-500 text-[10px] font-semibold shrink-0">{ct.format}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 max-w-[280px]">
                    <div className="text-[13px] font-semibold text-ink-900 truncate">{p.topic}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={cn("inline-flex items-center px-2.5 h-[22px] rounded-full text-[11px] font-semibold", p.status.cls)}>{p.status.label}</span>
                  </td>
                  <td className="py-3.5 px-5 sm:px-6 text-right">
                    <span className="inline-flex items-center justify-center size-8 rounded-full text-ink-500 hover:bg-cream-200"><MoreHorizontal className="size-4" strokeWidth={2} /></span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <footer className="border-t border-ink-100 px-5 sm:px-6 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2.5">
          <span className="size-9 rounded-full bg-cream-100 text-rose-500 inline-flex items-center justify-center shrink-0">
            <BarChart3 className="size-4" strokeWidth={2} />
          </span>
          <span className="text-[13px] text-ink-700">
            <span className="font-bold text-ink-900 tabular-nums">{POSTS.length}</span> Upcoming Posts
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 h-10 px-5 rounded-[12px] bg-rose-600 text-white text-[13px] font-semibold shadow-sm">
          View All Posts <ArrowRight className="size-4" strokeWidth={2} />
        </span>
      </footer>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   5 · Brand deal tracker — stat tiles + pipeline table with stage pills.
   ═══════════════════════════════════════════════════════════════════════ */

type Deal = {
  brand: string;
  contact?: string;
  stage: { label: string; tone: string };
  value: string;
  due: string;
};

const DEALS: Deal[] = [
  { brand: "Glow Cosmetics", contact: "Sarah M.", stage: { label: "Live", tone: "bg-indigo-100 text-indigo-700" }, value: "25,000 NOK", due: "14 Feb 2025" },
  { brand: "FitFuel", stage: { label: "Negotiating", tone: "bg-amber-100 text-amber-700" }, value: "18,000 NOK", due: "20 Feb 2025" },
  { brand: "NordVPN", contact: "Erik H.", stage: { label: "Paid", tone: "bg-emerald-100 text-emerald-700" }, value: "32,000 NOK", due: "—" },
  { brand: "Acme Co", stage: { label: "Lead", tone: "bg-ink-100 text-ink-700" }, value: "—", due: "—" },
];

function DealStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] bg-cream-50 border border-ink-100 p-3.5">
      <div className="text-[11px] text-ink-500 font-medium uppercase tracking-wide">{label}</div>
      <div className="text-h4 text-ink-900 tabular-nums mt-1">{value}</div>
    </div>
  );
}

export function DealTrackerTable() {
  return (
    <div className="card p-5 sm:p-6 w-full">
      <header className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="text-h3 text-ink-900 leading-tight">Brand Deal Tracker</h2>
          <p className="text-[13px] text-ink-500 mt-1">From cold lead to paid invoice — keep every deal in one view.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] bg-rose-600 text-white text-[13px] font-semibold">
          <Plus className="size-3.5" strokeWidth={2.4} /> Add deal
        </span>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <DealStat label="Total deals" value="6" />
        <DealStat label="Pipeline value" value="75,000 kr" />
        <DealStat label="Paid" value="32,000 kr" />
        <DealStat label="Live" value="1" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-semibold text-ink-500 uppercase tracking-wide bg-cream-50">
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-50">
            {DEALS.map((d) => (
              <tr key={d.brand} className="text-[13px] text-ink-800">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink-900">{d.brand}</div>
                  {d.contact && <div className="text-[11.5px] text-ink-500">{d.contact}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex items-center gap-1 text-[12px] font-semibold rounded-full px-2.5 h-7", d.stage.tone)}>
                    {d.stage.label}
                    <ChevronDown className="size-3 opacity-60" strokeWidth={2.5} />
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{d.value}</td>
                <td className="px-4 py-3 text-ink-700">{d.due}</td>
                <td className="px-4 py-3 text-right">
                  <span className="size-8 rounded-[8px] hover:bg-rose-50 inline-flex items-center justify-center text-ink-500"><Trash2 className="size-4" strokeWidth={2} /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   6 · Email history table — delivery %, status pills, row action menu.
   ═══════════════════════════════════════════════════════════════════════ */

type Email = {
  subject: string;
  audience: string;
  sentAt: string | null;
  delivered: { n: number; total: number } | null;
  status: { label: string; cls: string };
};

const EMAILS: Email[] = [
  { subject: "Weekly creator digest — January", audience: "All creators", sentAt: "May 13, 2025 9:41 AM", delivered: { n: 1204, total: 1230 }, status: { label: "Sent", cls: "bg-success-bg text-success border border-success/20" } },
  { subject: "Pro plan: new analytics are live", audience: "Pro members", sentAt: "May 10, 2025 8:00 AM", delivered: { n: 410, total: 427 }, status: { label: "Sent", cls: "bg-success-bg text-success border border-success/20" } },
  { subject: "We miss you — come back", audience: "Inactive 30d", sentAt: null, delivered: null, status: { label: "Scheduled", cls: "bg-amber-100 text-amber-700 border border-amber-200" } },
  { subject: "Feature announcement (draft)", audience: "Draft", sentAt: null, delivered: null, status: { label: "Draft", cls: "bg-ink-100 text-ink-600 border border-ink-200" } },
];

export function EmailHistoryTable() {
  return (
    <section className="card overflow-hidden w-full">
      <header className="px-5 py-4 border-b border-ink-100">
        <h2 className="text-[15px] font-bold text-ink-900">Recent email activity</h2>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wider font-bold text-ink-400 bg-cream-50/40">
              <th className="py-3 pl-5 pr-3">Subject</th>
              <th className="py-3 pr-3">Audience</th>
              <th className="py-3 pr-3">Sent at</th>
              <th className="py-3 pr-3">Delivered</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {EMAILS.map((e) => (
              <tr key={e.subject} className="border-t border-ink-100 hover:bg-cream-50/60 transition-colors">
                <td className="py-4 pl-5 pr-3">
                  <span className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-900">
                    {e.subject}
                    <Eye className="size-3.5 text-ink-400 shrink-0" strokeWidth={2} />
                  </span>
                </td>
                <td className="py-4 pr-3 text-[13px] text-ink-700">{e.audience}</td>
                <td className="py-4 pr-3 text-[13px] text-ink-700 whitespace-nowrap">
                  {e.sentAt ?? <span className="text-ink-400">—</span>}
                </td>
                <td className="py-4 pr-3 text-[13px] tabular-nums">
                  {e.delivered ? (
                    <>
                      <div className="text-ink-900 font-semibold">{Math.round((e.delivered.n / e.delivered.total) * 100)}%</div>
                      <div className="text-[11.5px] text-ink-500">{e.delivered.n.toLocaleString()} / {e.delivered.total.toLocaleString()}</div>
                    </>
                  ) : (
                    <span className="text-ink-400">—</span>
                  )}
                </td>
                <td className="py-4 pr-3">
                  <span className={cn("inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold", e.status.cls)}>{e.status.label}</span>
                </td>
                <td className="py-4 pr-5 text-right">
                  <span className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-500 hover:bg-cream-100"><MoreHorizontal className="size-4" strokeWidth={2} /></span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="px-5 py-3 border-t border-ink-100 flex items-center justify-between gap-3 flex-wrap">
        <span className="text-[12px] text-ink-500 tabular-nums">Showing 1 to 4 of 4 emails</span>
        <div className="flex items-center gap-1 text-[12.5px]">
          <span className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-300"><ChevronLeft className="size-3.5" strokeWidth={2} /></span>
          <span className="size-9 inline-flex items-center justify-center rounded-[10px] bg-rose-100 text-rose-700 font-semibold tabular-nums">1</span>
          <span className="text-ink-400 px-1 tabular-nums">/ 1</span>
          <span className="size-9 rounded-[10px] inline-flex items-center justify-center text-ink-300"><ChevronRight className="size-3.5" strokeWidth={2} /></span>
        </div>
      </footer>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
   7 · Dev-dashboard monitoring table — the dark "technical console" system
   used across /dev. Wrapped in `.dev-theme` so its dark-navy tokens
   (--dev-*, defined globally in styles/tokens/dev-dashboard.css) activate
   here exactly as they do on the dev dashboard.
   ═══════════════════════════════════════════════════════════════════════ */

const DEV_EVENTS = [
  { time: "09:41:22", event: "page_view", source: "Web", user: "u_8f2a", route: "/dashboard", device: "Desktop" },
  { time: "09:41:18", event: "post_scheduled", source: "App", user: "u_3c1b", route: "/posting", device: "Mobile" },
  { time: "09:40:55", event: "signup_completed", source: "Web", user: "u_9d4e", route: "/sign-up", device: "Desktop" },
  { time: "09:40:31", event: "plan_upgraded", source: "App", user: "u_2a7f", route: "/settings/billing", device: "Desktop" },
  { time: "09:39:12", event: "referral_sent", source: "Web", user: "u_6b8c", route: "/settings/invites", device: "Mobile" },
];

function DevPage({ children, active = false, faint = false }: { children: React.ReactNode; active?: boolean; faint?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-[8px] text-[12px] font-medium tabular-nums",
        active
          ? "bg-[var(--dev-accent)] text-white"
          : faint
            ? "text-[var(--dev-text-faint)]"
            : "bg-[var(--dev-surface)] border border-[var(--dev-border)] text-[var(--dev-text-secondary)]",
      )}
    >
      {children}
    </span>
  );
}

export function DevMonitoringTable() {
  return (
    <div className="dev-theme rounded-[16px] p-4 sm:p-5 w-full">
      <section className="dev-card flex flex-col p-5">
        <header className="mb-1">
          <h3 className="text-[15px] font-semibold text-[var(--dev-text-primary)]">Recent Analytics Events</h3>
          <p className="text-[12.5px] text-[var(--dev-text-secondary)] mt-1">Latest tracked events across the platform.</p>
        </header>

        <div className="overflow-x-auto -mx-1 mt-4">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="text-[10.5px] uppercase tracking-wider text-[var(--dev-text-muted)] font-semibold">
                {["Time", "Event", "Source", "User", "Route", "Device", "Status"].map((h) => (
                  <th key={h} className="font-semibold py-2 px-2 align-middle">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEV_EVENTS.map((e) => (
                <tr key={e.time} className="border-t border-[var(--dev-border-soft)] text-[12.5px]">
                  <td className="py-2.5 px-2 align-middle text-[var(--dev-text-secondary)] tabular-nums whitespace-nowrap">{e.time}</td>
                  <td className="py-2.5 px-2 align-middle text-[var(--dev-text-primary)] font-mono whitespace-nowrap">{e.event}</td>
                  <td className="py-2.5 px-2 align-middle text-[var(--dev-text-secondary)] whitespace-nowrap">{e.source}</td>
                  <td className="py-2.5 px-2 align-middle text-[var(--dev-text-secondary)] font-mono whitespace-nowrap">{e.user}</td>
                  <td className="py-2.5 px-2 align-middle text-[var(--dev-text-secondary)] font-mono whitespace-nowrap">{e.route}</td>
                  <td className="py-2.5 px-2 align-middle text-[var(--dev-text-secondary)] whitespace-nowrap">{e.device}</td>
                  <td className="py-2.5 px-2 align-middle whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-2 h-[22px] rounded-md text-[11px] font-semibold bg-[var(--dev-success-soft)] text-[var(--dev-success-text)] border border-[var(--dev-success-border)]">
                      Tracked
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
          <div className="text-[12px] text-[var(--dev-text-muted)] tabular-nums">
            Showing 1 to 5 of 1,284 events
          </div>
          <nav className="flex items-center gap-1">
            <DevPage faint>
              <ChevronLeft className="size-3.5" strokeWidth={2} />
            </DevPage>
            <DevPage active>1</DevPage>
            <DevPage>2</DevPage>
            <DevPage>3</DevPage>
            <span className="px-1.5 text-[12px] text-[var(--dev-text-muted)] select-none">…</span>
            <DevPage>257</DevPage>
            <DevPage>
              <ChevronRight className="size-3.5" strokeWidth={2} />
            </DevPage>
          </nav>
        </div>
      </section>
    </div>
  );
}
