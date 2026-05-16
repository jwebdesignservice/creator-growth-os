import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Analytics · Dev Dashboard" };

export default function DevAnalyticsPage() {
  const route = getDevRoute("/dev/analytics");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Analytics"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
