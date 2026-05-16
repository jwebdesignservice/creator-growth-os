import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "Data Integrity · Dev Dashboard" };

export default function DevDataIntegrityPage() {
  const route = getDevRoute("/dev/data-integrity");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "Data Integrity"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
