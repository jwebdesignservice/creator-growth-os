import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { getMyRecentTickets, getPopularHelpArticles } from "@/lib/support/queries";
import { SupportPageClient } from "./support-panel";
import type { SupportStepKey } from "./types";

export const metadata = { title: "Support · Creator Growth OS" };

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

export default async function SupportPage({ searchParams }: PageProps) {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;
  const initialStep = parseStep(params.step);
  const initialTopic = parseTopic(params.topic);

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
    />
  );
}
