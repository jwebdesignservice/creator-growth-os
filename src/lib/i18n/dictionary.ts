// Global i18n dictionary + translate core. Shared by both the server
// (`server.ts`, reads the cookie) and the client (`client.tsx`, context).
//
// Keys are the English source string. Missing keys fall back to English, so a
// page that hasn't been translated yet simply renders in English — never breaks.
// `{name}`-style placeholders are interpolated via the optional params arg.

export type TFn = (text: string, params?: Record<string, string | number>) => string;

export const LANG_COOKIE = "cgos_lang";

export type Locale = {
  value: string;
  country: string;
  cc: string;
  code: string;
  ready: boolean;
};

// US + UK + Norway are shipped; the rest are flagged in-development.
export const LOCALES: Locale[] = [
  { value: "en-US", country: "United States",  cc: "us", code: "US", ready: true },
  { value: "en-GB", country: "United Kingdom", cc: "gb", code: "UK", ready: true },
  { value: "nb-NO", country: "Norway",         cc: "no", code: "NO", ready: true },
  { value: "de-DE", country: "Germany",        cc: "de", code: "DE", ready: false },
  { value: "sv-SE", country: "Sweden",         cc: "se", code: "SE", ready: false },
  { value: "da-DK", country: "Denmark",        cc: "dk", code: "DK", ready: false },
];

export function isReady(value: string): boolean {
  return LOCALES.find((l) => l.value === value)?.ready ?? false;
}

function isNorwegian(lang: string): boolean {
  return lang.startsWith("nb") || lang.startsWith("no");
}

// English → Norwegian (Bokmål). Add a page's strings here as it's translated.
const NB: Record<string, string> = {
  // ── Settings · Language page ──────────────────────────────────────────
  "Language & region": "Språk og region",
  "Choose the language and regional format for your workspace.":
    "Velg språk og regionalt format for arbeidsområdet ditt.",
  "Language": "Språk",
  "Saved to this device.": "Lagret på denne enheten.",
  "Region & date format": "Region og datoformat",
  "Controls how dates and numbers appear.": "Styrer hvordan datoer og tall vises.",
  "Search countries…": "Søk etter land…",
  "No matches.": "Ingen treff.",
  "Save changes": "Lagre endringer",
  "Saved": "Lagret",
  "Under development": "Under utvikling",
  "Automatic — match my device": "Automatisk — følg enheten",
  "Europe — 31.12.2025, 24-hour": "Europa — 31.12.2025, 24-timers",
  "United States — 12/31/2025, 12-hour": "USA — 12/31/2025, 12-timers",
  "ISO — 2025-12-31, 24-hour": "ISO — 2025-12-31, 24-timers",

  // ── Settings nav (sidebar) ────────────────────────────────────────────
  "Account settings": "Kontoinnstillinger",
  "Edit profile": "Rediger profil",
  "Invites": "Invitasjoner",
  "Connected accounts": "Tilkoblede kontoer",
  "Notifications": "Varsler",
  "Payment methods": "Betalingsmåter",

  // ── App shell · topbar ────────────────────────────────────────────────
  "Search programs, tutorials, pages…": "Søk i programmer, tutorials, sider…",
  "Open search": "Åpne søk",
  "Support": "Støtte",
  "Calendar": "Kalender",
  "Admin Console": "Admin-konsoll",
};

export function translate(
  lang: string,
  text: string,
  params?: Record<string, string | number>,
): string {
  let out = isNorwegian(lang) ? NB[text] ?? text : text;
  if (params) {
    for (const key of Object.keys(params)) {
      out = out.split(`{${key}}`).join(String(params[key]));
    }
  }
  return out;
}
