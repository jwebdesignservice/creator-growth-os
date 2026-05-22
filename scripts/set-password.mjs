// One-shot password setter using the Supabase Admin API.
// Run: node scripts/set-password.mjs <email> <new-password>
// Reads SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL from .env.local.

import { readFileSync } from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const [, , email, newPassword] = process.argv;
if (!email || !newPassword) {
  console.error("Usage: node scripts/set-password.mjs <email> <new-password>");
  process.exit(1);
}

// 1. Look up the user by email
const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
  headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
});
if (!listRes.ok) {
  console.error("List users failed:", listRes.status, await listRes.text());
  process.exit(1);
}
const listJson = await listRes.json();
const user = (listJson.users ?? []).find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error("No user found with email:", email);
  process.exit(1);
}

// 2. Update password via admin endpoint
const updateRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
  method: "PUT",
  headers: {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ password: newPassword, email_confirm: true }),
});
if (!updateRes.ok) {
  console.error("Update failed:", updateRes.status, await updateRes.text());
  process.exit(1);
}

console.log(`✓ Password updated for ${email} (user id: ${user.id})`);
