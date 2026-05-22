// Create the chat-images Supabase Storage bucket via the admin API.
// Idempotent — safe to run multiple times.
// Run: node scripts/setup-chat-storage.mjs

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

const BUCKET = "chat-images";

// 1. Check if bucket exists
const listRes = await fetch(`${URL}/storage/v1/bucket`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const buckets = await listRes.json();
const exists = Array.isArray(buckets) && buckets.some((b) => b.name === BUCKET);

if (exists) {
  console.log(`✓ Bucket "${BUCKET}" already exists`);
} else {
  // 2. Create it — public read, 5MB cap, allowed MIME types
  const createRes = await fetch(`${URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 5 * 1024 * 1024,
      allowed_mime_types: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    }),
  });
  if (!createRes.ok) {
    console.error("✗ Bucket create failed:", createRes.status, await createRes.text());
    process.exit(1);
  }
  console.log(`✓ Created bucket "${BUCKET}" (public, 5MB cap, images only)`);
}

console.log("\nNext: ensure RLS policies on storage.objects allow authenticated users");
console.log("to upload to chat-images/<their-user-id>/<filename>. Add via SQL editor:");
console.log(`
drop policy if exists "chat_images_upload" on storage.objects;
create policy "chat_images_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "chat_images_read" on storage.objects;
create policy "chat_images_read" on storage.objects
  for select to public
  using (bucket_id = 'chat-images');
`);
