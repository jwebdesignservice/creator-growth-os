import { Award } from "lucide-react";
import { ProgramPlaceholder } from "@/components/admin/program-placeholder";

export const metadata = { title: "Certificates · Admin" };

export default function CertificatesPage() {
  return <ProgramPlaceholder title="Certificates" icon={Award} />;
}
