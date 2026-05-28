import { Info } from "lucide-react";
import { ProgramPlaceholder } from "@/components/admin/program-placeholder";

export const metadata = { title: "Information · Admin" };

export default function InformationPage() {
  return <ProgramPlaceholder title="Information" icon={Info} />;
}
