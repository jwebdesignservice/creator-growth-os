import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Config · Dev Dashboard" };

export default function DevConfigPage() {
  const route = getDevRoute("/dev/config");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Config"} subtitle={route?.description} />
      <StubSection
        title="Configuration status only"
        description="Environment values shown here will always be safe indicators — Configured, Missing, Healthy, Warning. Real secret values are never displayed in this console."
      />
    </div>
  );
}
