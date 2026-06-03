/* QR code ──────────────────────────────────────────────────────────────────────
   Scan-to-open surfaces — a QR card for sharing a profile / link-in-bio and a
   compact inline QR. The pattern is a deterministic faux-QR (finder squares +
   data fill), purely visual. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Download, Smartphone } from "lucide-react";

const N = 21;

/* Deterministic faux-QR: 3 finder squares + a stable data fill. */
function isFilled(r: number, c: number): boolean {
  const inFinder = (br: number, bc: number) => {
    const dr = r - br;
    const dc = c - bc;
    if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return false;
    const ring = dr === 0 || dr === 6 || dc === 0 || dc === 6;
    const center = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
    return ring || center;
  };
  if (r <= 6 && c <= 6) return inFinder(0, 0);
  if (r <= 6 && c >= N - 7) return inFinder(0, N - 7);
  if (r >= N - 7 && c <= 6) return inFinder(N - 7, 0);
  // quiet zone next to the finders
  if ((r <= 7 && c <= 7) || (r <= 7 && c >= N - 8) || (r >= N - 8 && c <= 7)) return false;
  return (r * 7 + c * 13 + r * c) % 3 === 0;
}

function QrGrid({ size = 116 }: { size?: number }) {
  return (
    <div
      className="grid bg-white"
      style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, width: size, height: size }}
      aria-label="QR code"
    >
      {Array.from({ length: N * N }).map((_, i) => {
        const r = Math.floor(i / N);
        const c = i % N;
        return <span key={i} className={isFilled(r, c) ? "bg-ink-900" : "bg-transparent"} />;
      })}
    </div>
  );
}

/* 1 · QR card — share your profile, with download. */
export function QrCard() {
  return (
    <div className="w-[260px] max-w-full rounded-[18px] border border-ink-100 bg-white p-5 text-center shadow-card">
      <div className="inline-flex p-3 rounded-[14px] bg-white border border-ink-100 shadow-sm">
        <QrGrid size={128} />
      </div>
      <div className="text-[14px] font-bold text-ink-900 mt-3">@yourcreator</div>
      <div className="text-[12px] text-ink-500 mt-0.5 inline-flex items-center gap-1">
        <Smartphone className="size-3.5" strokeWidth={2} /> Scan to open profile
      </div>
      <button type="button" className="mt-4 w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-[10px] bg-cream-100 text-ink-900 text-[13px] font-semibold transition-colors cursor-pointer hover:bg-cream-200 active:bg-cream-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2">
        <Download className="size-4" strokeWidth={2} /> Download
      </button>
    </div>
  );
}

/* 2 · Inline QR — compact, beside a label. */
export function QrInline() {
  return (
    <div className="w-[300px] max-w-full rounded-[14px] border border-ink-100 bg-white p-4 flex items-center gap-4 shadow-card">
      <div className="p-1.5 rounded-[10px] border border-ink-100 shrink-0">
        <QrGrid size={72} />
      </div>
      <div className="min-w-0">
        <div className="text-[13.5px] font-bold text-ink-900">Link in bio</div>
        <p className="text-[12px] text-ink-500 leading-snug mt-0.5">
          Point your phone camera here to open your link hub.
        </p>
      </div>
    </div>
  );
}
