import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getMyRecentTickets, getPopularHelpArticles } from "@/lib/support/queries";
import { SupportPageClient } from "../support-panel";
import type { SupportStepKey } from "../types";

export const metadata = { title: "Contact Support | Creator Growth OS" };

/**
 * Contact-support wizard.
 *
 * This is the multi-step "open a ticket" flow that used to live at /support.
 * It moved here when /support became the Help & Support hub — the hub's
 * "Open support form" / "Contact support" actions link to this route.
 *
 * Behaviour is unchanged: step + topic are URL-driven (?step=, ?topic=) so
 * the wizard stays shareable, refresh-safe, and back-button friendly.
 */

type PageProps = {
  searchParams: Promise<{ step?: string | string[]; topic?: string | string[] }>;
};

function parseStep(v: string | string[] | undefined): SupportStepKey {
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw === "details" || raw === "review") return raw;
  return "topic";
}

const VALID_TOPIC_KEYS = new Set([
  "billing",
  "technical",
  "account",
  "content",
  "posting",
  "community",
  "coaching",
  "feature",
]);

function parseTopic(v: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw && VALID_TOPIC_KEYS.has(raw)) return raw;
  return undefined;
}

export default async function ContactSupportPage({ searchParams }: PageProps) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;
  const initialStep = parseStep(params.step);
  const initialTopic = parseTopic(params.topic);
  const firstName =
    (ctx.profile?.display_name ?? ctx.profile?.full_name ?? ctx.user.email?.split("@")[0] ?? "Creator")
      .split(" ")[0];

  const [recentTickets, helpArticles] = await Promise.all([
    getMyRecentTickets(3),
    getPopularHelpArticles(4),
  ]);

  return (
    <SupportPageClient
      initialStep={initialStep}
      initialTopic={initialTopic}
      recentTickets={recentTickets}
      helpArticles={helpArticles}
      firstName={firstName}
    />
  );
}
