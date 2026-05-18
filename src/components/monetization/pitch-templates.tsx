"use client";

import { useState } from "react";
import { Copy, Check, Crown } from "lucide-react";
import type { PitchTemplate } from "@/lib/monetization/queries";

export function PitchTemplates({
  templates,
  plan,
}: {
  templates: PitchTemplate[];
  plan: "free" | "basic" | "pro";
}) {
  const [active, setActive] = useState<string>(templates[0]?.id ?? "");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const current = templates.find((t) => t.id === active) ?? templates[0];

  if (!current) {
    return (
      <div className="card p-[var(--space-card-padding)] text-center text-[13px] text-ink-500">
        No pitch templates yet.
      </div>
    );
  }

  const locked = current.is_premium && plan !== "pro";

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="card p-[var(--space-card-padding)]">
      <header className="mb-5">
        <h2 className="font-display text-[22px] text-ink-900 leading-tight">
          Brand Pitch Templates
        </h2>
        <p className="text-[13px] text-ink-500 mt-1">
          Field-tested emails. Swap the placeholders and send.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
        <ul className="space-y-1">
          {templates.map((t) => {
            const isActive = t.id === active;
            const isPremiumLocked = t.is_premium && plan !== "pro";
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`w-full text-left px-3 py-3 rounded-[10px] transition-colors flex items-start gap-2 ${
                    isActive
                      ? "bg-rose-50 border border-rose-200"
                      : "border border-transparent hover:bg-cream-100"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-semibold text-ink-900 flex items-center gap-1.5">
                      {t.title}
                      {isPremiumLocked && (
                        <Crown
                          className="size-3 text-rose-500"
                          strokeWidth={2.2}
                        />
                      )}
                    </div>
                    <div className="text-[11.5px] text-ink-500 line-clamp-2 mt-0.5">
                      {t.description}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="rounded-[14px] border border-ink-100 bg-cream-50 p-5">
          {locked ? (
            <div className="text-center py-8">
              <Crown
                className="size-7 text-rose-500 mx-auto mb-3"
                strokeWidth={1.8}
              />
              <h3 className="font-display text-[18px] text-ink-900 mb-1">
                Premium template
              </h3>
              <p className="text-[13px] text-ink-500 mb-4 max-w-sm mx-auto">
                Upgrade to Pro to unlock advanced negotiation and renewal
                scripts proven to lift deal value.
              </p>
              <a
                href="/billing?upgrade=pro"
                className="inline-flex items-center justify-center h-10 px-5 rounded-[10px] bg-rose-600 hover:bg-rose-700 text-white text-[13px] font-semibold"
              >
                Upgrade to Pro
              </a>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide mb-1">
                  Subject
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="text-[14px] font-semibold text-ink-900 flex-1">
                    {current.subject}
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(current.subject, "subject")}
                    className="size-9 rounded-[8px] hover:bg-white inline-flex items-center justify-center text-ink-500 shrink-0"
                    aria-label="Copy subject"
                  >
                    {copiedKey === "subject" ? (
                      <Check
                        className="size-4 text-emerald-600"
                        strokeWidth={2.2}
                      />
                    ) : (
                      <Copy className="size-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-[11.5px] font-medium text-ink-500 uppercase tracking-wide">
                    Body
                  </div>
                  <button
                    type="button"
                    onClick={() => copy(current.body, "body")}
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 hover:text-rose-700"
                  >
                    {copiedKey === "body" ? (
                      <>
                        <Check className="size-3.5" strokeWidth={2.2} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" strokeWidth={2} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <pre className="whitespace-pre-wrap text-[13px] text-ink-800 font-sans bg-white border border-ink-100 rounded-[10px] p-4 leading-relaxed">
                  {current.body}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
