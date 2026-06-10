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

  // ── Dashboard ─────────────────────────────────────────────────────────
  "morning": "morgen",
  "afternoon": "ettermiddag",
  "evening": "kveld",
  "Welcome back, {name}.": "Velkommen tilbake, {name}.",
  "Nice work, {name}.": "Bra jobba, {name}.",
  "Welcome, {name}.": "Velkommen, {name}.",
  "Pick up where you left off — or explore somewhere new.":
    "Fortsett der du slapp — eller utforsk noe nytt.",
  "Ready for your next program? {title} is up.":
    "Klar for neste program? {title} står for tur.",
  "You've completed every program — keep sharpening with tutorials.":
    "Du har fullført alle programmene — hold deg skarp med tutorials.",
  "Start your first program — we'll guide you step by step.":
    "Start ditt første program — vi guider deg steg for steg.",
  "Continue program": "Fortsett program",
  "Start next program": "Start neste program",
  "Explore tutorials": "Utforsk tutorials",
  "Browse programs": "Bla i programmer",
  "{time} left": "{time} igjen",
  "Your plan": "Ditt abonnement",
  "Upgrade": "Oppgrader",
  "Up next": "Neste",
  "Open": "Åpne",
  "Today": "I dag",
  "Tomorrow": "I morgen",
  "Programs": "Programmer",
  "Structured courses to grow your audience":
    "Strukturerte kurs for å vokse publikummet ditt",
  "program": "program",
  "programs": "programmer",
  "in progress": "pågår",
  "Short, focused how-to videos": "Korte, fokuserte instruksjonsvideoer",
  "Posting Plans": "Innleggsplaner",
  "Plan & schedule your content": "Planlegg og tidfest innholdet ditt",
  "scheduled this week": "planlagt denne uka",
  "Plan your week": "Planlegg uka di",
  "Tasks": "Oppgaver",
  "Your missions & daily to-dos": "Oppdrag og daglige gjøremål",
  "due today": "forfaller i dag",
  "done": "ferdig",
  "All caught up": "Alt à jour",
  "Plan this week's content": "Planlegg ukas innhold",
  "Film your next short": "Film din neste short",
  "Reply to comments": "Svar på kommentarer",
  "Performance": "Ytelse",
  "Track followers & engagement": "Følg følgere og engasjement",
  "followers": "følgere",
  "Connect accounts": "Koble til kontoer",
  "Followers": "Følgere",
  "now": "nå",
  "Community": "Fellesskap",
  "Connect with other creators": "Koble deg til andre skapere",
  "members": "medlemmer",
  "Join the community": "Bli med i fellesskapet",
  "Creators online now": "Skapere på nett nå",
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
