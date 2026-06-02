/* Tables ───────────────────────────────────────────────────────────────
   User / record lists. Includes header, body rows, status badges, and
   actions column.
   ───────────────────────────────────────────────────────────────────── */

import { MoreHorizontal } from "lucide-react";

type Row = { name: string; email: string; role: string; status: "active" | "invited" | "blocked" };

const ROWS: Row[] = [
  { name: "Jack Wilson",   email: "jack@profluencer.app",    role: "Owner",  status: "active" },
  { name: "Amelia Park",   email: "amelia@profluencer.app",  role: "Editor", status: "active" },
  { name: "Marcus Lee",    email: "marcus@profluencer.app",  role: "Viewer", status: "invited" },
  { name: "Priya Sharma",  email: "priya@profluencer.app",   role: "Editor", status: "blocked" },
];

const STATUS_STYLES: Record<Row["status"], string> = {
  active:  "bg-emerald-100 text-emerald-700",
  invited: "bg-amber-100 text-amber-700",
  blocked: "bg-rose-100 text-rose-700",
};

export function UsersTable() {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-cream-100/70 border-b border-ink-100">
          <tr>
            <th className="px-4 py-3 text-[11.5px] uppercase tracking-wider text-ink-500 font-semibold">Name</th>
            <th className="px-4 py-3 text-[11.5px] uppercase tracking-wider text-ink-500 font-semibold">Role</th>
            <th className="px-4 py-3 text-[11.5px] uppercase tracking-wider text-ink-500 font-semibold">Status</th>
            <th className="px-4 py-3 text-right"></th>
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
                <span className={"inline-flex items-center px-2 h-6 rounded-full text-[11px] font-semibold " + STATUS_STYLES[r.status]}>
                  {r.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  aria-label="Row actions"
                  className="inline-flex items-center justify-center size-8 rounded-full hover:bg-cream-200 text-ink-500"
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
