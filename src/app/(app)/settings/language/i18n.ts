// Tiny, self-contained i18n for the Language settings surface.
//
// US + UK + Norway are fully translated and selectable; the remaining locales
// are flagged `ready: false` and shown as "Under development" in the picker.
// This is intentionally scoped to this page — it's the working foundation a
// full app-wide rollout would build on, not a global translation layer yet.

export type Locale = {
  value: string;
  country: string;
  cc: string;
  code: string;
  ready: boolean;
};

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

export type Strings = {
  title: string;
  subtitle: string;
  languageLabel: string;
  languageHint: string;
  regionLabel: string;
  regionHint: string;
  searchPlaceholder: string;
  noMatches: string;
  save: string;
  saved: string;
  underDevelopment: string;
  region: { auto: string; eu: string; us: string; iso: string };
};

const EN: Strings = {
  title: "Language & region",
  subtitle: "Choose the language and regional format for your workspace.",
  languageLabel: "Language",
  languageHint: "Saved to this device.",
  regionLabel: "Region & date format",
  regionHint: "Controls how dates and numbers appear.",
  searchPlaceholder: "Search countries…",
  noMatches: "No matches.",
  save: "Save changes",
  saved: "Saved",
  underDevelopment: "Under development",
  region: {
    auto: "Automatic — match my device",
    eu: "Europe — 31.12.2025, 24-hour",
    us: "United States — 12/31/2025, 12-hour",
    iso: "ISO — 2025-12-31, 24-hour",
  },
};

const NO: Strings = {
  title: "Språk og region",
  subtitle: "Velg språk og regionalt format for arbeidsområdet ditt.",
  languageLabel: "Språk",
  languageHint: "Lagret på denne enheten.",
  regionLabel: "Region og datoformat",
  regionHint: "Styrer hvordan datoer og tall vises.",
  searchPlaceholder: "Søk etter land…",
  noMatches: "Ingen treff.",
  save: "Lagre endringer",
  saved: "Lagret",
  underDevelopment: "Under utvikling",
  region: {
    auto: "Automatisk — følg enheten",
    eu: "Europa — 31.12.2025, 24-timers",
    us: "USA — 12/31/2025, 12-timers",
    iso: "ISO — 2025-12-31, 24-timers",
  },
};

// US + UK share English; Norway gets Norwegian. Anything else falls back to EN.
export function getStrings(value: string): Strings {
  return value.startsWith("nb") || value.startsWith("no") ? NO : EN;
}
