// ─────────────────────────────────────────────────────────────────────────────
// Community chat content moderation
//
// Curated blocklist of slurs, strong profanity, and self-harm / abuse phrases.
// Matches with word boundaries against a normalized form (lowercased + common
// leet-speak substitutions reversed) so trivial bypasses ("sh1t", "F.U.C.K")
// don't slip through.
//
// This is not a substitute for human moderation — it catches the obvious cases
// and is intentionally conservative. False positives (e.g. "Scunthorpe") are
// not worth defending against here; the chat is for adults having real
// conversations, and any blocked message can be rephrased.
// ─────────────────────────────────────────────────────────────────────────────

// Tiered lists let us surface different messages and audit easily.
// Words are stored lowercased. Word-boundary matching is applied at check time.

const PROFANITY = [
  "fuck",
  "fucker",
  "fucking",
  "motherfucker",
  "shit",
  "shitty",
  "bullshit",
  "asshole",
  "bitch",
  "bastard",
  "cock",
  "cocksucker",
  "cunt",
  "dick",
  "dickhead",
  "douche",
  "douchebag",
  "hoe",
  "piss",
  "prick",
  "pussy",
  "slut",
  "twat",
  "wanker",
  "whore",
];

// Slurs — kept short for legibility; expand as needed via admin review.
// Includes common racial and homophobic slurs and their typical variants.
// (Listed here as plain strings so the moderation file can be code-reviewed;
// the file is server-only and never shipped to the browser bundle.)
const SLURS = [
  "nigger",
  "nigga",
  "n1gger",
  "n1gga",
  "faggot",
  "fag",
  "tranny",
  "retard",
  "retarded",
  "spic",
  "chink",
  "kike",
  "gook",
  "wetback",
  "paki",
  "coon",
];

const SELF_HARM = [
  "kys",
  "kill yourself",
  "kill urself",
  "go kill yourself",
  "go die",
  "neck yourself",
];

const ABUSE = [
  "die in a fire",
  "i hope you die",
  "you should die",
];

// Combined list with category tags so error messages can be tailored if needed.
type Category = "profanity" | "slur" | "self_harm" | "abuse";
type Entry = { term: string; category: Category };

const BLOCKLIST: Entry[] = [
  ...PROFANITY.map((t) => ({ term: t, category: "profanity" as Category })),
  ...SLURS.map((t) => ({ term: t, category: "slur" as Category })),
  ...SELF_HARM.map((t) => ({ term: t, category: "self_harm" as Category })),
  ...ABUSE.map((t) => ({ term: t, category: "abuse" as Category })),
];

/**
 * Normalize text for moderation: lowercase, strip diacritics, reverse common
 * leet-speak substitutions, collapse repeated punctuation/spacing.
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    // Strip diacritics
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    // Leet → letters
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    // Collapse repeated chars to break "fuuuuuck" → "fuck"
    .replace(/(.)\1{2,}/g, "$1")
    // Collapse separator characters between letters: "f.u.c.k" → "fuck"
    .replace(/(?<=[a-z])[^a-z]+(?=[a-z])/g, " ")
    // Whitespace cleanup
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Test if `body` contains any blocked term (case-insensitive, word-bounded).
 * Returns the first matching entry, or null if clean.
 */
export function findBlockedTerm(body: string): Entry | null {
  const normalized = normalize(body);
  // Also compare against a tokens-only form (strip ALL non-letters between
  // characters) so "f u c k" still trips. This is the more aggressive form.
  const stripped = normalized.replace(/[^a-z]/g, "");

  for (const entry of BLOCKLIST) {
    const term = entry.term;

    // Multi-word phrases: do a simple substring check on normalized form
    if (term.includes(" ")) {
      if (normalized.includes(term)) return entry;
      continue;
    }

    // Single word: word-bounded match against the normalized form
    const re = new RegExp(`\\b${escapeRegex(term)}\\b`, "i");
    if (re.test(normalized)) return entry;

    // Aggressive fallback: contiguous letter-only form (catches "f u c k")
    if (stripped.includes(term)) return entry;
  }
  return null;
}

/** Convenience boolean wrapper. */
export function isClean(body: string): boolean {
  return findBlockedTerm(body) === null;
}

/**
 * Generic, non-revealing rejection message. Never echo back which word was
 * blocked — that would help bad actors iterate around the filter.
 */
export const MODERATION_REJECTION =
  "Your message contains language that isn't allowed in chat. Please rephrase.";

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
