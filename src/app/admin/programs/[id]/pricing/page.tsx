import { Tag } from "lucide-react";
import { ProgramPlaceholder } from "@/components/admin/program-placeholder";

export const metadata = { title: "Pricing · Admin" };

export default function PricingPage() {
  return <ProgramPlaceholder title="Pricing" icon={Tag} />;
}
