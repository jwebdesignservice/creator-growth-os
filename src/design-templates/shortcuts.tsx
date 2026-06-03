/* Shortcuts ───────────────────────────────────────────────────────────────
   Keyboard-shortcuts cheat sheet — grouped shortcut rows with <kbd> keys.
   Mirrors the support keyboard-shortcuts overlay.
   ───────────────────────────────────────────────────────────────────── */

import { X } from "lucide-react";

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-[6px] bg-cream-100 border border-ink-100 text-[11px] font-semibold text-ink-700 font-mono">
      {children}
    </kbd>
  );
}

export function ShortcutsSheet() {
  const groups = [
    { title: "General", rows: [{ label: "Open command palette", keys: ["⌘", "K"] }, { label: "Search", keys: ["/"] }, { label: "Close / cancel", keys: ["Esc"] }] },
    { title: "Navigation", rows: [{ label: "Go to dashboard", keys: ["G", "D"] }, { label: "Go to programs", keys: ["G", "P"] }, { label: "Next item", keys: ["J"] }] },
    { title: "Actions", rows: [{ label: "New post", keys: ["N"] }, { label: "Save", keys: ["⌘", "S"] }, { label: "Send", keys: ["⌘", "↵"] }] },
    { title: "Editing", rows: [{ label: "Bold", keys: ["⌘", "B"] }, { label: "Italic", keys: ["⌘", "I"] }, { label: "Undo", keys: ["⌘", "Z"] }] },
  ];
  return (
    <div className="w-[480px] max-w-full rounded-[16px] border border-ink-100 bg-white shadow-card overflow-hidden">
      <header className="flex items-center justify-between px-5 h-14 border-b border-ink-100">
        <h3 className="text-[15px] font-bold text-ink-900">Keyboard shortcuts</h3>
        <span className="size-8 rounded-[10px] inline-flex items-center justify-center text-ink-400 hover:bg-cream-100"><X className="size-4" strokeWidth={2} /></span>
      </header>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-400 mb-2">{g.title}</p>
            <ul className="space-y-2">
              {g.rows.map((r) => (
                <li key={r.label} className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px] text-ink-700">{r.label}</span>
                  <span className="flex items-center gap-1">
                    {r.keys.map((k, i) => (
                      <Kbd key={i}>{k}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
