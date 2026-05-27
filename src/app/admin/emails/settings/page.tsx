import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  Gauge,
  ShieldCheck,
  Mail,
  ExternalLink,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/admin/is-admin";
import { BRAND_NAME } from "@/lib/brand";
import { ClientCopy } from "./client-copy";

export const metadata = {
  title: "Settings · Email · Admin · Creator Growth OS",
};

/**
 * /admin/emails/settings — combines the two surfaces the Compose page
 * deep-links to: the "Usage details" sending-quota view, and the
 * "Verify domain" sender authentication walkthrough. Both are read-only
 * for now — a real DKIM/SPF flow hangs off the Resend dashboard, and the
 * 24-hour usage counter wires in when the email backend lands.
 */
export default async function EmailSettingsPage() {
  const { user, isAdmin } = await getAdminContext();
  if (!user) redirect("/sign-in?redirect=/admin/emails/settings");
  if (!isAdmin) redirect("/dashboard");

  const fromAddress =
    process.env.EMAIL_FROM ?? `${BRAND_NAME} <onboarding@resend.dev>`;
  const fromDomain = fromAddress.match(/@([^>]+?)>?$/)?.[1] ?? "resend.dev";
  const verified = fromDomain !== "resend.dev";
  const apiConfigured = Boolean(process.env.RESEND_API_KEY);

  // Demo numbers — these read from a real usage-tracking table once the
  // email backend ships. Format matches the Compose page's banner copy.
  const QUOTA = { used: 0, limit: 250 };

  return (
    <div className="max-w-[920px] mx-auto">
      {/* Back link */}
      <Link
        href="/admin/emails"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-500 hover:text-ink-900 mb-4 transition-colors"
      >
        <ChevronLeft className="size-3.5" strokeWidth={2} />
        Back to Compose
      </Link>

      {/* Header */}
      <header className="mb-6">
        <h1 className="text-h1 text-ink-900 leading-tight mb-1">
          Email settings
        </h1>
        <p className="text-ink-500 text-[14px]">
          Manage your sending quota, sender domain, and deliverability.
        </p>
      </header>

      {/* ── Usage details ──────────────────────────────────────────── */}
      <section id="usage" className="card p-5 sm:p-6 mb-5">
        <header className="flex items-center gap-2 mb-4">
          <Gauge className="size-4 text-rose-600" strokeWidth={2} />
          <h2 className="text-[15px] font-bold text-ink-900">Usage details</h2>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Stat label="Sent (24h)" value={QUOTA.used.toLocaleString()} sub="emails delivered" />
          <Stat
            label="Remaining"
            value={(QUOTA.limit - QUOTA.used).toLocaleString()}
            sub={`of ${QUOTA.limit.toLocaleString()} limit`}
            tone="success"
          />
          <Stat
            label="Backend"
            value={apiConfigured ? "Connected" : "Not connected"}
            sub={apiConfigured ? "RESEND_API_KEY set" : "Set RESEND_API_KEY"}
            tone={apiConfigured ? "success" : "warning"}
          />
        </div>

        <div className="rounded-[12px] border border-ink-100 bg-cream-50/40 p-4">
          <p className="text-[12.5px] text-ink-700 leading-relaxed">
            <strong className="text-ink-900">How limits work:</strong> the
            24-hour window rolls forward continuously. If you need a higher
            limit for a launch campaign, raise the cap in your{" "}
            <a
              href="https://resend.com/settings/general"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
            >
              Resend project settings
              <ExternalLink className="size-3" strokeWidth={2} />
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── Sender domain ──────────────────────────────────────────── */}
      <section id="domain" className="card p-5 sm:p-6 mb-5">
        <header className="flex items-center gap-2 mb-4">
          <ShieldCheck className="size-4 text-rose-600" strokeWidth={2} />
          <h2 className="text-[15px] font-bold text-ink-900">Sender domain</h2>
        </header>

        <div className="space-y-4">
          <Row
            label="Current sender"
            value={
              <span className="font-mono text-[12.5px] text-ink-900">
                {fromAddress}
              </span>
            }
          />
          <Row
            label="Domain"
            value={
              <span className="font-mono text-[12.5px] text-ink-900">{fromDomain}</span>
            }
          />
          <Row
            label="Verification"
            value={
              verified ? (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-success">
                  <CheckCircle2 className="size-3.5" strokeWidth={2} />
                  Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-amber-700">
                  <AlertTriangle className="size-3.5" strokeWidth={2} />
                  Using Resend default — set EMAIL_FROM to your domain
                </span>
              )
            }
          />
        </div>

        {!verified && (
          <div className="mt-5 rounded-[12px] border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-[13.5px] font-bold text-ink-900 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-amber-600" strokeWidth={2} />
              Verify your domain to improve deliverability
            </h3>
            <ol className="text-[12.5px] text-ink-700 leading-relaxed space-y-1.5 pl-5 list-decimal">
              <li>
                Add your domain in your{" "}
                <a
                  href="https://resend.com/domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-rose-600 hover:text-rose-700 underline"
                >
                  Resend dashboard
                </a>{" "}
                and copy the DNS records (SPF, DKIM, optional DMARC).
              </li>
              <li>Paste the records into your DNS provider and wait for propagation (usually under an hour).</li>
              <li>
                Once Resend reports the domain as verified, set{" "}
                <code className="px-1.5 py-0.5 rounded-[4px] bg-cream-100 text-rose-700 text-[11px] font-mono">
                  EMAIL_FROM=&ldquo;{BRAND_NAME} &lt;you@your-domain.com&gt;&rdquo;
                </code>{" "}
                in your environment and redeploy.
              </li>
            </ol>
          </div>
        )}
      </section>

      {/* ── Sending account ────────────────────────────────────────── */}
      <section className="card p-5 sm:p-6">
        <header className="flex items-center gap-2 mb-4">
          <Mail className="size-4 text-rose-600" strokeWidth={2} />
          <h2 className="text-[15px] font-bold text-ink-900">
            Reply-to address
          </h2>
        </header>
        <Row
          label="Default"
          value={
            <span className="inline-flex items-center gap-2">
              <span className="font-mono text-[12.5px] text-ink-900">
                {user.email}
              </span>
              <ClientCopy text={user.email ?? ""} />
            </span>
          }
        />
        <p className="mt-3 text-[12px] text-ink-500 leading-relaxed">
          Recipients who reply to a campaign land back in this inbox. To use a
          shared inbox like <code>hello@your-domain.com</code>, set a per-campaign
          reply-to once that field is enabled in Compose.
        </p>
      </section>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

function Stat({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const valueClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-amber-700"
        : "text-ink-900";
  return (
    <div className="rounded-[12px] border border-ink-100 bg-white p-4">
      <div className="text-[11.5px] uppercase tracking-wider font-semibold text-ink-500 mb-1">
        {label}
      </div>
      <div className={`text-[22px] font-bold tabular-nums leading-none ${valueClass}`}>
        {value}
      </div>
      <div className="text-[11.5px] text-ink-500 mt-1.5">{sub}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[12.5px]">
      <span className="text-ink-500 shrink-0">{label}</span>
      <span className="text-right min-w-0">{value}</span>
    </div>
  );
}

