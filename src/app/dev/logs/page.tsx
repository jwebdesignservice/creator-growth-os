import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Logs · Dev Dashboard" };

export default function DevLogsPage() {
  const route = getDevRoute("/dev/logs");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Logs"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
