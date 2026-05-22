// Verify migration 0025 (reactions table + edited_at/image_url/link_preview cols) is applied.
// Run: node scripts/check-chat-extras-schema.mjs

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
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

const checks = [
  {
    name: "community_chat_reactions table",
    url: `${URL}/rest/v1/community_chat_reactions?select=message_id,emoji&limit=1`,
  },
  {
    name: "edited_at + image_url + link_preview columns",
    url: `${URL}/rest/v1/community_chat_messages?select=edited_at,image_url,link_preview&limit=1`,
  },
];

let allOk = true;
for (const c of checks) {
  const r = await fetch(c.url, { headers: H });
  if (r.ok) {
    console.log(`✓ ${c.name}`);
  } else {
    allOk = false;
    console.error(`✗ ${c.name}: ${r.status} ${await r.text()}`);
  }
}
process.exit(allOk ? 0 : 1);
