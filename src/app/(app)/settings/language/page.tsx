import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { PageShell } from "@/components/app-shell/page-shell";
import { LanguageForm } from "./language-form";

export const metadata = {
  title: "Language · Settings · Profluencer",
};

export default async function LanguageSettingsPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  return (
    <PageShell>
      <div className="container-app">
        <LanguageForm />
      </div>
    </PageShell>
  );
}
