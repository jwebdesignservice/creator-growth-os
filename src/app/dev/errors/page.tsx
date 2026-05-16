import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Errors · Dev Dashboard" };

export default function DevErrorsPage() {
  const route = getDevRoute("/dev/errors");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Errors"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
