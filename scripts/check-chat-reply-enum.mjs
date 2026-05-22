// Verify the chat_reply enum value exists by attempting a no-op notification insert.
// Run: node scripts/check-chat-reply-enum.mjs

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

// We can't easily query pg_enum via REST, so probe by inserting a row with
// type='chat_reply' and then deleting it. If the enum value doesn't exist,
// the insert will 400 with an "invalid input value for enum" error.
const PROBE_USER = "00000000-0000-0000-0000-000000000000";

const ins = await fetch(`${URL}/rest/v1/notifications`, {
  method: "POST",
  headers: {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify({
    user_id: PROBE_USER,
    title: "_probe_",
    type: "chat_reply",
    category: "community",
  }),
});

const text = await ins.text();
if (ins.ok) {
  // Clean up the probe row
  const row = JSON.parse(text)[0];
  await fetch(`${URL}/rest/v1/notifications?id=eq.${row.id}`, {
    method: "DELETE",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  console.log("✓ chat_reply enum value exists and notifications insert works.");
} else if (/invalid input value for enum/i.test(text)) {
  console.error("✗ chat_reply enum value NOT added — run the migration SQL.");
  process.exit(1);
} else if (/violates foreign key|not present in table/i.test(text)) {
  // The user_id FK didn't match — that's fine, it means the type itself was accepted
  console.log("✓ chat_reply enum value exists (FK error on probe user is expected).");
} else {
  console.error("? Unexpected response (HTTP", ins.status + "):", text);
  process.exit(1);
}
