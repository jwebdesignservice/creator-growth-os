#!/usr/bin/env node
// One-shot pusher: parses docs/supabase-email-templates.md and PATCHes the
// Supabase Auth config for project `mierwogzdiplwpksaoka`.
// Requires SUPABASE_PAT env var. No token written to disk.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'mierwogzdiplwpksaoka';
const PAT = process.env.SUPABASE_PAT;
if (!PAT) { console.error('Missing SUPABASE_PAT'); process.exit(1); }

const md = fs.readFileSync(path.join(__dirname, '..', 'docs', 'supabase-email-templates.md'), 'utf8');

// Map markdown section heading → Supabase config key suffix
const SECTIONS = [
  { heading: '1. Confirm signup',          key: 'confirmation' },
  { heading: '2. Magic Link',              key: 'magic_link' },
  { heading: '3. Reset Password',          key: 'recovery' },
  { heading: '4. Change Email Address',    key: 'email_change' },
  { heading: '5. Invite User',             key: 'invite' },
  { heading: '6. Reauthentication',        key: 'reauthentication' },
];

const body = {};
for (const { heading, key } of SECTIONS) {
  const startMarker = `## ${heading}`;
  const start = md.indexOf(startMarker);
  if (start === -1) throw new Error(`Section not found: ${heading}`);
  const next = md.indexOf('\n## ', start + 1);
  const block = md.slice(start, next === -1 ? undefined : next);

  const subjectMatch = block.match(/\*\*Subject:\*\*\s*`([^`]+)`/);
  if (!subjectMatch) throw new Error(`Subject not found in: ${heading}`);

  const htmlMatch = block.match(/```html\n([\s\S]*?)\n```/);
  if (!htmlMatch) throw new Error(`HTML block not found in: ${heading}`);

  body[`mailer_subjects_${key}`] = subjectMatch[1];
  body[`mailer_templates_${key}_content`] = htmlMatch[1];
}

console.log(`Pushing ${SECTIONS.length} templates + subjects to project ${PROJECT_REF}…`);
console.log('Keys:', Object.keys(body).join(', '));

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${PAT}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) {
  console.error(`FAILED (${res.status}):`, text);
  process.exit(2);
}
console.log(`OK (${res.status}). Response excerpt:`, text.slice(0, 400));
