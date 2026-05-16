import { DevPageHeader } from "@/components/dev-dashboard/dev-page-header";
import { StubSection } from "@/components/dev-dashboard/sections/stub-section";
import { getDevRoute } from "@/lib/dev-dashboard/dev-routes";

export const metadata = { title: "QA Checklist · Dev Dashboard" };

export default function DevQaChecklistPage() {
  const route = getDevRoute("/dev/qa-checklist");
  return (
    <div className="space-y-5">
      <DevPageHeader title={route?.label ?? "QA Checklist"} subtitle={route?.description} />
      <StubSection />
    </div>
  );
}
