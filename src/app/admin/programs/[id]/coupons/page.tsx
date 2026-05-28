import { Ticket } from "lucide-react";
import { ProgramPlaceholder } from "@/components/admin/program-placeholder";

export const metadata = { title: "Coupons · Admin" };

export default function CouponsPage() {
  return <ProgramPlaceholder title="Coupons" icon={Ticket} />;
}
