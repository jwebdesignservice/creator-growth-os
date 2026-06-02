/* Notifications ────────────────────────────────────────────────────────
   Inline alert banners for success / info / warning / error.
   ───────────────────────────────────────────────────────────────────── */

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

type Tone = "success" | "info" | "warning" | "error";

const TONE_STYLES: Record<Tone, { wrap: string; icon: typeof CheckCircle2; iconColor: string }> = {
  success: { wrap: "bg-emerald-50 border-emerald-200 text-emerald-900", icon: CheckCircle2, iconColor: "text-emerald-600" },
  info:    { wrap: "bg-sky-50 border-sky-200 text-sky-900",             icon: Info,         iconColor: "text-sky-600" },
  warning: { wrap: "bg-amber-50 border-amber-200 text-amber-900",       icon: AlertTriangle,iconColor: "text-amber-600" },
  error:   { wrap: "bg-rose-50 border-rose-200 text-rose-900",          icon: AlertCircle,  iconColor: "text-rose-600" },
};

export function AlertBanner({
  tone = "success",
  title = "Saved successfully",
  body = "Your changes have been applied.",
}: {
  tone?: Tone;
  title?: string;
  body?: string;
}) {
  const t = TONE_STYLES[tone];
  const Icon = t.icon;
  return (
    <div className={"flex items-start gap-3 rounded-[12px] border p-3 " + t.wrap}>
      <Icon className={"size-5 shrink-0 mt-0.5 " + t.iconColor} strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold leading-snug">{title}</p>
        <p className="text-[13px] opacity-90 leading-snug mt-0.5">{body}</p>
      </div>
      <button
        type="button"
        aria-label="Dismiss"
        className="shrink-0 inline-flex items-center justify-center size-7 rounded-full hover:bg-black/5 text-current"
      >
        <X className="size-4" strokeWidth={2} />
      </button>
    </div>
  );
}

export function AllAlerts() {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <AlertBanner tone="success" title="Synced" body="Latest follower count pulled from Instagram." />
      <AlertBanner tone="info"    title="Heads up" body="Your weekly entry is due tomorrow." />
      <AlertBanner tone="warning" title="Almost full" body="You've used 9 of 10 referrals this month." />
      <AlertBanner tone="error"   title="Couldn't connect" body="TikTok rejected the credentials. Reconnect." />
    </div>
  );
}
