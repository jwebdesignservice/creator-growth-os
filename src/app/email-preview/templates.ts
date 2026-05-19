import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { renderWelcomeEmail } from "@/lib/email/welcome-template";

export type Template = {
  slug: string;
  name: string;
  subject: string;
  html: string;
};

const SAMPLE_VARS: Record<string, string> = {
  "{{ .ConfirmationURL }}":
    "http://localhost:3001/auth/confirm?token_hash=sample-token&type=signup",
  "{{ .Token }}": "482917",
  "{{ .Email }}": "creator@example.com",
  "{{ .SiteURL }}": "http://localhost:3001",
};

function substituteSupabaseVars(html: string): string {
  return Object.entries(SAMPLE_VARS).reduce(
    (acc, [k, v]) => acc.split(k).join(v),
    html,
  );
}

async function loadSupabaseTemplates(): Promise<Template[]> {
  const filePath = path.join(
    process.cwd(),
    "docs",
    "supabase-email-templates.md",
  );
  const src = await fs.readFile(filePath, "utf8");

  // Lookahead matches the next `## ` heading (any `## `, numbered or not — e.g.
  // "## Brand color reference" acts as the terminator for the last template).
  const sectionRe = /^## \d+\.\s+(.+?)\n([\s\S]*?)(?=^## )/gm;
  const out: Template[] = [];

  let match: RegExpExecArray | null;
  while ((match = sectionRe.exec(src)) !== null) {
    const name = match[1].trim();
    const body = match[2];

    const subjectMatch = body.match(/\*\*Subject:\*\*\s*`([^`]+)`/);
    const subject = subjectMatch ? subjectMatch[1] : "(no subject)";

    const htmlMatch = body.match(/```html\n([\s\S]*?)\n```/);
    if (!htmlMatch) continue;

    out.push({
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name,
      subject,
      html: substituteSupabaseVars(htmlMatch[1]),
    });
  }

  return out;
}

function buildWelcomeTemplate(): Template {
  const { subject, html } = renderWelcomeEmail({
    firstName: "Jack",
    dashboardUrl: "http://localhost:3001/dashboard",
    summary: {
      category: "Lifestyle & wellness",
      primary_platform: "Instagram",
      main_goal: "Hit 50K followers in 6 months",
      weekly_pace: "5 posts per week",
    },
  });
  return {
    slug: "welcome",
    name: "Welcome (post-onboarding)",
    subject,
    html,
  };
}

export async function getAllPreviewTemplates(): Promise<Template[]> {
  const supabaseTemplates = await loadSupabaseTemplates();
  return [buildWelcomeTemplate(), ...supabaseTemplates];
}
