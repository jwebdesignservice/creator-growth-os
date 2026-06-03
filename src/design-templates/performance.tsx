/* Performance ───────────────────────────────────────────────────────────
   Analytics surfaces from the Performance page: the Connect-Social account
   card (connect / sync / disconnect rows), a KPI tile with the honest
   empty/hint state, and the platform-mix donut with legend. Pure
   presentational mirrors of src/components/performance/*.
   ───────────────────────────────────────────────────────────────────── */

import {
  Share2,
  Check,
  RefreshCw,
  Clock,
  Target,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";
import { PlatformGlyph } from "@/components/posting/platform-glyphs";
import type { PlatformKey } from "@/lib/posting/queries";

// ─────────────────────────────────────────────────────────────────────────────
// Connect Social card — per-platform connect / sync / disconnect rows.
// ─────────────────────────────────────────────────────────────────────────────

type Row = {
  platform: PlatformKey;
  label: string;
  state: "connected" | "pending" | "disconnected";
  hint: string;
};

export function ConnectSocialCard() {
  const rows: Row[] = [
    { platform: "instagram", label: "Instagram", state: "connected", hint: "Synced 2 hours ago · 24.5K followers" },
    { platform: "tiktok", label: "TikTok", state: "pending", hint: "Connecting… finishing authorization" },
    { platform: "youtube", label: "YouTube", state: "disconnected", hint: "Connect to sync subscribers & views" },
  ];

  return (
    <div className="card p-5 w-[480px] max-w-full">
      <header className="flex items-start gap-3 mb-4">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Share2 className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-ink-900 leading-tight">Connect Social Accounts</h3>
          <p className="text-[12.5px] text-ink-500 mt-0.5">Sync your analytics automatically.</p>
        </div>
        <span className="inline-flex items-center h-6 px-2.5 rounded-full bg-cream-100 text-ink-500 text-[10.5px] font-semibold uppercase tracking-wide shrink-0">
          Analytics sync
        </span>
      </header>

      <ul className="divide-y divide-ink-100">
        {rows.map((r) => (
          <li key={r.platform} className="flex items-center gap-3 py-3">
            <PlatformGlyph platform={r.platform} className="size-9" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13.5px] font-semibold text-ink-900">{r.label}</span>
                {r.state === "connected" && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600">
                    <Check className="size-3" strokeWidth={2.6} /> Connected
                  </span>
                )}
                {r.state === "pending" && (
                  <span className="text-[11px] font-semibold text-amber-600">Pending</span>
                )}
              </div>
              <div className="text-[11.5px] text-ink-500 truncate">{r.hint}</div>
            </div>
            {r.state === "connected" ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="inline-flex items-center gap-1 h-8 px-3 rounded-[10px] border border-ink-200 text-[12px] font-semibold text-ink-700">
                  <RefreshCw className="size-3.5" strokeWidth={2} /> Sync
                </span>
                <span className="inline-flex items-center h-8 px-3 rounded-[10px] text-[12px] font-semibold text-ink-500 hover:text-rose-600">
                  Disconnect
                </span>
              </div>
            ) : r.state === "pending" ? (
              <span className="inline-flex items-center gap-1 h-8 px-3 rounded-[10px] bg-cream-100 text-[12px] font-semibold text-ink-500 shrink-0">
                <RefreshCw className="size-3.5 animate-spin" strokeWidth={2} /> Working…
              </span>
            ) : (
              <span className="inline-flex items-center h-8 px-3.5 rounded-[10px] bg-rose-600 text-white text-[12px] font-semibold shrink-0">
                Connect
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Performance KPI tile — value state vs. honest empty/hint state. The posting
// & performance pages render the hint when no goal/data source exists yet.
// ─────────────────────────────────────────────────────────────────────────────

function KpiTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  hint: string;
}) {
  return (
    <div className="card p-5 w-[230px]">
      <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center mb-3">
        <Icon className="size-[18px]" strokeWidth={2} />
      </span>
      <div className="text-[13px] font-semibold text-ink-900">{label}</div>
      {value ? (
        <div className="text-[26px] font-bold text-ink-900 tabular-nums leading-tight mt-1">
          {value}
        </div>
      ) : (
        <>
          <div className="text-[26px] font-bold text-ink-300 leading-tight mt-1">—</div>
          <p className="text-[11.5px] text-ink-500 leading-snug mt-1">{hint}</p>
        </>
      )}
    </div>
  );
}

export function PerformanceKpiTiles() {
  return (
    <div className="flex flex-wrap gap-4">
      <KpiTile icon={CalendarCheck} label="This Week's Posts" value="3" hint="" />
      <KpiTile icon={Target} label="Consistency Goal" value={null} hint="Set a weekly posting goal in Settings." />
      <KpiTile icon={Clock} label="Best Time to Post" value={null} hint="We'll learn your best time once you have a few weeks of posts." />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform mix — multi-slice donut with a legend (followers share per network).
// ─────────────────────────────────────────────────────────────────────────────

export function PlatformMixDonut() {
  const slices = [
    { label: "Instagram", value: 52, color: "var(--rose-500)" },
    { label: "TikTok", value: 31, color: "var(--ink-700)" },
    { label: "YouTube", value: 17, color: "var(--rose-300)" },
  ];
  const total = slices.reduce((n, s) => n + s.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="card p-5 w-[300px] max-w-full">
      <h3 className="text-[14px] font-bold text-ink-900 mb-4">Audience by platform</h3>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 140 140" className="size-[120px] shrink-0 -rotate-90" aria-hidden>
          <circle cx="70" cy="70" r={r} fill="none" stroke="var(--cream-200)" strokeWidth="16" />
          {slices.map((s) => {
            const len = (s.value / total) * c;
            const dash = `${len} ${c - len}`;
            const el = (
              <circle
                key={s.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="16"
                strokeDasharray={dash}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        </svg>
        <ul className="space-y-2 flex-1 min-w-0">
          {slices.map((s) => (
            <li key={s.label} className="flex items-center gap-2">
              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[12.5px] text-ink-700 flex-1 truncate">{s.label}</span>
              <span className="text-[12.5px] font-bold text-ink-900 tabular-nums">{s.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
