import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { AuthMetricCards } from "@/components/dev-dashboard/sections/auth/auth-metric-cards";
import { AuthFilterBar } from "@/components/dev-dashboard/sections/auth/auth-filter-bar";
import { AuthActivityTrendsCard } from "@/components/dev-dashboard/sections/auth/auth-activity-trends-card";
import { ProviderBreakdownCard } from "@/components/dev-dashboard/sections/auth/provider-breakdown-card";
import { SessionHealthCard } from "@/components/dev-dashboard/sections/auth/session-health-card";
import { SignupFunnelCard } from "@/components/dev-dashboard/sections/auth/signup-funnel-card";
import { FailedLoginReasonsCard } from "@/components/dev-dashboard/sections/auth/failed-login-reasons-card";
import { SecuritySignalsCard } from "@/components/dev-dashboard/sections/auth/security-signals-card";
import { AuthRouteHealthCard } from "@/components/dev-dashboard/sections/auth/auth-route-health-card";
import { RegionalSignInCard } from "@/components/dev-dashboard/sections/auth/regional-signin-card";
import { RecentAuthEventsTable } from "@/components/dev-dashboard/sections/auth/recent-auth-events-table";
import { ExportAuthEventsButton } from "@/components/dev-dashboard/sections/auth/export-auth-events-button";
import { AuthEventDetailProvider } from "@/components/dev-dashboard/sections/auth/auth-event-detail-modal";
import { parseAuthFilters, type AuthRawSearchParams } from "@/lib/dev-dashboard/auth-filters";
import {
  getAuthActivityChart,
  getAuthEvents,
  getAuthMetrics,
  getAuthProviderBreakdown,
  getAuthRouteHealth,
  getFailedLoginReasons,
  getRegionalSignIns,
  getSecuritySignals,
  getSessionHealth,
  getSignupFunnel,
} from "@/lib/dev-dashboard/auth-queries";

export const metadata = { title: "Auth · Dev Dashboard" };

type PageProps = {
  searchParams: Promise<AuthRawSearchParams>;
};

export default async function DevAuthPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseAuthFilters(raw);

  // All reads are independent — fetch in parallel.
  const [
    metrics,
    activity,
    providers,
    sessions,
    funnel,
    failedReasons,
    signals,
    routeHealth,
    regional,
    eventsList,
  ] = await Promise.all([
    getAuthMetrics(filters),
    getAuthActivityChart(filters),
    getAuthProviderBreakdown(filters),
    getSessionHealth(filters),
    getSignupFunnel(filters),
    getFailedLoginReasons(filters),
    getSecuritySignals(),
    getAuthRouteHealth(),
    getRegionalSignIns(filters),
    getAuthEvents(filters),
  ]);

  return (
    <AuthEventDetailProvider>
      <div className="space-y-5">
        <DevPageHeader
          title="Auth"
          subtitle="Monitor authentication health, login activity, signup flow, session quality, and security events across the platform."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/dev/auth/security-rules"
                className="inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] bg-[var(--dev-accent)] hover:bg-[var(--dev-accent-hover)] text-white text-[12.5px] font-semibold transition-colors"
              >
                <ShieldCheck className="size-3.5" strokeWidth={2} />
                Review Security Rules
              </Link>
              <ExportAuthEventsButton />
            </div>
          }
        />

        <AuthMetricCards data={metrics} />
        <AuthFilterBar />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-10 space-y-4 min-w-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-10 gap-4">
              <div className="xl:col-span-5">
                <AuthActivityTrendsCard data={activity} />
              </div>
              <div className="xl:col-span-3">
                <ProviderBreakdownCard data={providers} />
              </div>
              <div className="md:col-span-2 xl:col-span-2">
                <SessionHealthCard data={sessions} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <SignupFunnelCard data={funnel} />
              <FailedLoginReasonsCard data={failedReasons} />
              <AuthRouteHealthCard data={routeHealth} />
              <RegionalSignInCard data={regional} />
            </div>
          </div>

          <div className="xl:col-span-2 space-y-4 min-w-0">
            <SecuritySignalsCard data={signals} />
          </div>
        </div>

        <RecentAuthEventsTable
          rows={eventsList.rows}
          total={eventsList.total}
          totalPages={eventsList.totalPages}
          filters={filters}
        />
      </div>
    </AuthEventDetailProvider>
  );
}
