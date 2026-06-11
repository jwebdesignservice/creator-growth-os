import { createServiceClient } from "@/lib/supabase/server";
import { TemplatesView, type TemplateRow } from "./templates-view";

export const metadata = {
  title: "Templates · Email · Admin",
};

/**
 * /admin/emails/templates — library of reusable email templates an admin
 * can save into and load from on the Compose page. Lists every template
 * (active + archived) and hands the interactive surface off to the
 * client view.
 */
export default async function EmailTemplatesPage() {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("email_templates")
    .select(
      "id, name, subject, body, use_branded_template, track_opens, archived, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  const templates: TemplateRow[] = (data ?? []).map((t) => ({
    id:                   t.id as string,
    name:                 t.name as string,
    subject:              t.subject as string,
    body:                 t.body as string,
    useBrandedTemplate:   Boolean(t.use_branded_template),
    trackOpens:           Boolean(t.track_opens),
    archived:             Boolean(t.archived),
    createdAt:            t.created_at as string,
    updatedAt:            t.updated_at as string,
  }));

  return <TemplatesView templates={templates} />;
}
