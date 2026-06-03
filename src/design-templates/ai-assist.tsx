/* AI assist ───────────────────────────────────────────────────────────────
   AI helper surfaces — an AI caption generator (output + regenerate) and
   AI hook suggestions. Creator content-assist.
   ───────────────────────────────────────────────────────────────────── */

import { Sparkles, RefreshCw, Copy } from "lucide-react";

export function CaptionGenerator() {
  return (
    <div className="card p-5 w-[420px] max-w-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="size-8 rounded-full bg-gradient-to-br from-rose-500 to-violet-500 text-white inline-flex items-center justify-center">
          <Sparkles className="size-4" strokeWidth={2} />
        </span>
        <h3 className="text-[14px] font-bold text-ink-900">AI caption</h3>
      </div>
      <div className="rounded-[12px] bg-cream-50 border border-ink-100 p-3.5 text-[13px] text-ink-700 leading-relaxed">
        Struggling to stay consistent? Here are 3 micro-habits that took my training from
        “someday” to daily. Save this for your next slump 💪 #fitnesstips
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold">
          <RefreshCw className="size-3.5" strokeWidth={2} />
          Regenerate
        </span>
        <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] border border-ink-200 text-ink-700 text-[12.5px] font-medium">
          <Copy className="size-3.5" strokeWidth={2} />
          Copy
        </span>
        <span className="ml-auto text-[11px] text-ink-400">Tone: Motivational</span>
      </div>
    </div>
  );
}

export function HookSuggestions() {
  const hooks = [
    "I tried X every day for 30 days — here's what changed",
    "The mistake 90% of beginners make",
    "Stop scrolling if you want to grow faster",
  ];
  return (
    <div className="card p-5 w-[400px] max-w-full">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="size-4 text-rose-500" strokeWidth={2} />
        <h3 className="text-[14px] font-bold text-ink-900">Hook ideas</h3>
      </div>
      <ul className="space-y-2">
        {hooks.map((h, i) => (
          <li key={i} className="flex items-start gap-2.5 rounded-[10px] border border-ink-100 p-2.5">
            <span className="text-[11px] font-bold text-rose-400 mt-0.5">{i + 1}</span>
            <span className="text-[13px] text-ink-700 leading-snug flex-1">{h}</span>
            <Copy className="size-3.5 text-ink-300 shrink-0 mt-0.5" strokeWidth={2} />
          </li>
        ))}
      </ul>
    </div>
  );
}
