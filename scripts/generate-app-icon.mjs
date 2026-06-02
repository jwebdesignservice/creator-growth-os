#!/usr/bin/env node
/*
 * Generate a 1024×1024 PNG of the Profluencer crown logo for app-store
 * submissions (TikTok, Meta, Google). Renders the same crown vector that
 * BrandMark.tsx draws, on a cream-100 (#FAF6F2) square background with
 * comfortable padding.
 *
 *   node scripts/generate-app-icon.mjs
 *
 * Output: profluencer-app-icon.png in the project root.
 */

import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, "..", "profluencer-app-icon.png");

const SIZE = 1024;
const BG = "#FAF6F2";   // cream-100, matches the app
const FG = "#B9485C";   // rose-600, matches the brand mark

// Crown rendered at SIZE × SIZE. Original viewBox is 48×48, so we just
// scale that up. Centered with 17.5% padding so the icon reads from a
// distance without feeling cramped.
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 48 48">
  <rect width="48" height="48" fill="${BG}" rx="9" ry="9"/>
  <g transform="translate(24 24) scale(0.6) translate(-24 -24)" fill="${FG}">
    <path d="M6 40 L6 18 L14 26 L24 12 L34 26 L42 18 L42 40 L34 40 L34 26 L29 32 L24 26 L19 32 L14 26 L14 40 Z"/>
    <circle cx="14" cy="12" r="2.2"/>
    <circle cx="34" cy="12" r="2.2"/>
  </g>
</svg>
`.trim();

await sharp(Buffer.from(svg))
  .resize(SIZE, SIZE)
  .png()
  .toFile(out);

console.log(`✓ Wrote ${out} (${SIZE}×${SIZE} PNG)`);
