/* Content ─────────────────────────────────────────────────────────────────
   Rich-content blocks used inside lessons, docs and marketing — callouts
   (note / tip / warning), a testimonial blockquote, and a code block.
   Presentational.
   ───────────────────────────────────────────────────────────────────── */

import { Info, Lightbulb, TriangleAlert, Quote, Copy, type LucideIcon } from "lucide-react";

export function Callout() {
  const callouts: { key: string; Icon: LucideIcon; ring: string; icon: string; title: string; body: string }[] = [
    { key: "note", Icon: Info, ring: "border-sky-200 bg-sky-50", icon: "text-sky-600", title: "Note", body: "Program access is based on your plan tier, not a per-course purchase." },
    { key: "tip", Icon: Lightbulb, ring: "border-emerald-200 bg-emerald-50", icon: "text-emerald-600", title: "Tip", body: "Batch-film on one day to stay consistent without burning out." },
    { key: "warn", Icon: TriangleAlert, ring: "border-amber-200 bg-amber-50", icon: "text-amber-600", title: "Heads up", body: "Disconnecting a platform stops new analytics from syncing." },
  ];
  return (
    <div className="w-[460px] max-w-full space-y-3">
      {callouts.map((c) => {
        const Icon = c.Icon;
        return (
          <div key={c.key} className={"flex items-start gap-3 rounded-[12px] border p-3.5 " + c.ring}>
            <Icon className={"size-[18px] shrink-0 mt-0.5 " + c.icon} strokeWidth={2} />
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-ink-900">{c.title}</div>
              <div className="text-[12.5px] text-ink-700 leading-snug mt-0.5">{c.body}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Blockquote() {
  return (
    <figure className="w-[460px] max-w-full card p-6">
      <Quote className="size-7 text-rose-200" fill="currentColor" strokeWidth={0} />
      <blockquote className="text-[16px] text-ink-900 leading-relaxed font-medium mt-2">
        “The Launchpad program completely changed how I think about hooks. I hit 10k
        followers in six weeks.”
      </blockquote>
      <figcaption className="flex items-center gap-3 mt-4">
        <span className="size-9 rounded-full bg-rose-600 text-white text-[12px] font-semibold inline-flex items-center justify-center">AP</span>
        <div>
          <div className="text-[13px] font-semibold text-ink-900">Amelia Park</div>
          <div className="text-[11.5px] text-ink-500">Fitness creator · 48K followers</div>
        </div>
      </figcaption>
    </figure>
  );
}

export function CodeBlock() {
  return (
    <div className="w-[460px] max-w-full rounded-[12px] overflow-hidden border border-ink-100 bg-ink-900">
      <div className="flex items-center justify-between px-3 h-9 border-b border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-400" />
          <span className="size-2.5 rounded-full bg-amber-400" />
          <span className="size-2.5 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[11px] text-white/40 font-mono">hook.ts</span>
        <button type="button" aria-label="Copy code" className="text-white/50 hover:text-white transition-colors">
          <Copy className="size-3.5" strokeWidth={2} />
        </button>
      </div>
      <pre className="p-4 text-[12px] leading-relaxed font-mono text-cream-100 overflow-x-auto">
        <code>{`export function hook(line: string) {
  return line.slice(0, 60).trim();
}`}</code>
      </pre>
    </div>
  );
}
