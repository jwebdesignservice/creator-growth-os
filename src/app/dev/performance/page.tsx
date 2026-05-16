import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Performance · Dev Dashboard" };

export default function DevPerformancePage() {
  const route = getDevRoute("/dev/performance");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Performance"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
