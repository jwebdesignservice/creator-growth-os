"use client";

import { useState, useTransition } from "react";
import { Save, Share2, Eye, EyeOff, Plus, X } from "lucide-react";
import type { MediaKit } from "@/lib/monetization/queries";
import {
  saveMediaKit,
  toggleMediaKitPublished,
} from "@/app/(app)/monetization/actions";

type LinkRow = { label: string; url: string };

const RATE_KEYS = [
  { key: "reel", label: "Reel / Short-form video" },
  { key: "carousel", label: "Carousel post" },
  { key: "story_set", label: "Story set" },
  { key: "ugc", label: "UGC asset" },
  { key: "bundle", label: "Bundle / package" },
] as const;

const STAT_KEYS = [
  { key: "instagram", label: "Instagram followers" },
  { key: "tiktok", label: "TikTok followers" },
  { key: "youtube", label: "YouTube subscribers" },
  { key: "avg_views", label: "Avg views (last 30d)" },
  { key: "eng_rate", label: "Engagement rate (%)" },
] as const;

export function MediaKitBuilder({
  initial,
}: {
  initial: MediaKit | null;
}) {
  const [headline, setHeadline] = useState(initial?.headline ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [niche, setNiche] = useState(initial?.niche ?? "");
  const [stats, setStats] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {};
    for (const k of STAT_KEYS) {
      const v = (initial?.audience_stats as Record<string, unknown> | undefined)?.[k.key];
      s[k.key] = v != null ? String(v) : "";
    }
    return s;
  });
  const [rates, setRates] = useState<Record<string, string>>(() => {
    const s: Record<string, string> = {};
    for (const k of RATE_KEYS) {
      const v = (initial?.rates as Record<string, unknown> | undefined)?.[k.key];
      s[k.key] = v != null ? String(v) : "";
    }
    return s;
  });
  const [links, setLinks] = useState<LinkRow[]>(
    (initial?.links as LinkRow[] | undefined) ?? [],
  );
  const [pending, startTransition] = useTransition();
  const [pendingPublish, startPublishing] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const published = initial?.published ?? false;
  const shareSlug = initial?.share_slug ?? null;

  const submit = () => {
    setMsg(null);
    setErr(null);
    startTransition(async () => {
      const res = await saveMediaKit({
        headline,
        bio,
        niche,
        audience_stats: Object.fromEntries(
          Object.entries(stats).filter(([, v]) => v !== ""),
        ),
        rates: Object.fromEntries(
          Object.entries(rates).filter(([, v]) => v !== ""),
        ),
        links: links.filter((l) => l.label && l.url),
      });
      if (!res.ok) setErr(res.error);
      else setMsg("Media kit saved.");
    });
  };

  const togglePublish = () => {
    setErr(null);
    startPublishing(async () => {
      const res = await toggleMediaKitPublished(!published);
      if (!res.ok) setErr(res.error);
    });
  };

  return (
    <div className="card p-[var(--space-card-padding)]">
      <header className="flex items-start justify-between gap-3 mb-5 flex-wrap">
        <div>
          <h2 className="font-display text-[22px] text-ink-900 leading-tight">
            Media Kit Builder
          </h2>
          <p className="text-[13px] text-ink-500 mt-1">
            Build a shareable one-pager for brand outreach.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {published && shareSlug && (
            <a
              href={`/media-kit/${shareSlug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] border border-ink-200 text-[12.5px] font-semibold text-ink-900 hover:bg-cream-100 transition-colors"
            >
              <Share2 className="size-3.5" strokeWidth={2} />
              Open public kit
            </a>
          )}
          <button
            type="button"
            onClick={togglePublish}
            disabled={pendingPublish}
            className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-[10px] text-[12.5px] font-semibold transition-colors ${
              published
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-ink-100 text-ink-700 hover:bg-ink-200"
            }`}
          >
            {published ? (
              <>
                <Eye className="size-3.5" strokeWidth={2} />
                Published
              </>
            ) : (
              <>
                <EyeOff className="size-3.5" strokeWidth={2} />
                Draft
              </>
            )}
          </button>
        </div>
      </header>

      <div className="space-y-5">
        <Field label="Headline">
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Lifestyle creator helping new mums find their style."
            className="input"
          />
        </Field>

        <Field label="Bio">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="2–3 sentences about you, your audience, and what brands you partner with."
            className="input"
          />
        </Field>

        <Field label="Niche">
          <input
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            placeholder="e.g. Sustainable beauty, indie fashion, family travel"
            className="input"
          />
        </Field>

        <div>
          <h3 className="text-[14px] font-semibold text-ink-900 mb-3">
            Audience stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STAT_KEYS.map((s) => (
              <Field key={s.key} label={s.label}>
                <input
                  type="number"
                  value={stats[s.key]}
                  onChange={(e) =>
                    setStats((p) => ({ ...p, [s.key]: e.target.value }))
                  }
                  placeholder="0"
                  className="input"
                />
              </Field>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[14px] font-semibold text-ink-900 mb-3">
            Rates (NOK)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {RATE_KEYS.map((r) => (
              <Field key={r.key} label={r.label}>
                <input
                  type="number"
                  value={rates[r.key]}
                  onChange={(e) =>
                    setRates((p) => ({ ...p, [r.key]: e.target.value }))
                  }
                  placeholder="0"
                  className="input"
                />
              </Field>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-semibold text-ink-900">Links</h3>
            <button
              type="button"
              onClick={() =>
                setLinks((p) => [...p, { label: "", url: "" }])
              }
              className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700"
            >
              <Plus className="size-3.5" strokeWidth={2} />
              Add link
            </button>
          </div>
          <ul className="space-y-2">
            {links.length === 0 && (
              <li className="text-[12.5px] text-ink-500">
                No links yet — add Instagram, TikTok, portfolio, etc.
              </li>
            )}
            {links.map((l, i) => (
              <li key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <input
                  placeholder="Label"
                  value={l.label}
                  onChange={(e) =>
                    setLinks((p) =>
                      p.map((row, j) =>
                        j === i ? { ...row, label: e.target.value } : row,
                      ),
                    )
                  }
                  className="input"
                />
                <input
                  placeholder="https://"
                  value={l.url}
                  onChange={(e) =>
                    setLinks((p) =>
                      p.map((row, j) =>
                        j === i ? { ...row, url: e.target.value } : row,
                      ),
                    )
                  }
                  className="input"
                />
                <button
                  type="button"
                  onClick={() =>
                    setLinks((p) => p.filter((_, j) => j !== i))
                  }
                  aria-label="Remove"
                  className="size-10 rounded-[10px] hover:bg-cream-100 inline-flex items-center justify-center text-ink-500"
                >
                  <X className="size-4" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {err && (
          <div className="text-[12.5px] text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-[10px]">
            {err}
          </div>
        )}
        {msg && !err && (
          <div className="text-[12.5px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-[10px]">
            {msg}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-[12px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[14px] font-semibold transition-colors"
          >
            <Save className="size-4" strokeWidth={2} />
            {pending ? "Saving…" : "Save media kit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium text-ink-700 mb-1 block">
        {label}
      </span>
      {children}
    </label>
  );
}
