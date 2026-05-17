import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Deployments · Dev Dashboard" };

export default function DevDeploymentsPage() {
  const route = getDevRoute("/dev/deployments");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Deployments"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
