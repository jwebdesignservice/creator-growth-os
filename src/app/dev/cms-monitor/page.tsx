import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "CMS Monitor · Dev Dashboard" };

export default function DevCmsMonitorPage() {
  const route = getDevRoute("/dev/cms-monitor");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "CMS Monitor"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
