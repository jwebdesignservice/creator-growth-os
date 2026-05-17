import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";

export const metadata = { title: "Security Rules · Dev Dashboard" };

/**
 * Placeholder for the security-rules editor. Reached from the "Review
 * Security Rules" header action on /dev/auth. The actual rule engine
 * (rate limits, geo blocks, suspicious-IP allowlists, MFA enforcement)
 * lives outside this dashboard and will be wired in a future pass.
 */
export default function DevAuthSecurityRulesPage() {
  return (
    <div className="space-y-5">
      <DevPageHeader
        title="Security Rules"
        subtitle="Review and (soon) edit the rules that govern login throttling, MFA enforcement, geo restrictions, and suspicious-IP handling."
        action={
          <Link
            href="/dev/auth"
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-surface)] border border-[var(--dev-border)] hover:border-[var(--dev-border-strong)] text-[12.5px] font-medium text-[var(--dev-text-primary)] transition-colors"
          >
            <ArrowLeft className="size-3.5 text-[var(--dev-text-secondary)]" strokeWidth={1.9} />
            Back to Auth
          </Link>
        }
      />

      <section className="dev-card p-8 flex flex-col items-start gap-3 max-w-2xl">
        <div className="size-10 rounded-[10px] inline-flex items-center justify-center bg-[var(--dev-accent-soft)] text-[var(--dev-accent-text)] border border-[var(--dev-accent-border)]">
          <ShieldCheck className="size-5" strokeWidth={1.8} />
        </div>
        <h2 className="text-[16px] font-semibold text-[var(--dev-text-primary)]">
          Rule editor coming soon
        </h2>
        <p className="text-[13px] text-[var(--dev-text-secondary)] leading-relaxed">
          The rules engine is gated behind an internal review. Until it ships,
          authentication-side defaults (rate limits, magic-link TTL, MFA
          enforcement on admin accounts) continue to be managed in Supabase
          project settings.
        </p>
        <Link
          href="/dev/auth"
          className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--dev-accent-text)] hover:text-[var(--dev-accent)] transition-colors"
        >
          Return to the Auth dashboard
        </Link>
      </section>
    </div>
  );
}
