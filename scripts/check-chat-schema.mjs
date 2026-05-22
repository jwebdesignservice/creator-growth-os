// Verify both chat migrations (0023 + 0024) are applied to Supabase.
// Run: node scripts/check-chat-schema.mjs

import { readFileSync } from "node:fs";
import path from "node:path";

const env = Object.fromEntries(
  readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;

// Probe: SELECT the columns we expect. Any missing column will 400.
const probe = await fetch(
  `${URL}/rest/v1/community_chat_messages?select=id,reply_to_id,reply_to_preview&limit=1`,
  { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } },
);
const text = await probe.text();

if (probe.ok) {
  console.log("✓ Both migrations applied. community_chat_messages has the expected columns.");
  console.log("  Sample row:", text);
} else if (text.includes("does not exist") && text.includes("community_chat_messages")) {
  console.error("✗ Migration 0023 NOT applied — table community_chat_messages does not exist.");
  process.exit(1);
} else if (text.includes("reply_to") || text.includes("column")) {
  console.error("✗ Migration 0024 NOT applied — table exists but reply_to_id / reply_to_preview columns missing.");
  console.error("  Server said:", text);
  process.exit(1);
} else {
  console.error("? Unexpected response (HTTP", probe.status + "):", text);
  process.exit(1);
}
