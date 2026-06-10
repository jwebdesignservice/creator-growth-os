"use client";

import { createContext, useContext, type ReactNode } from "react";
import { translate, type TFn } from "./dictionary";

// The current language is read server-side (from the cookie) and handed to this
// provider, so client components translate against the exact same value the
// server rendered with — no hydration mismatch, no flash.
const LangContext = createContext<string>("en-US");

export function LanguageProvider({
  lang,
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): string {
  return useContext(LangContext);
}

export function useT(): TFn {
  const lang = useContext(LangContext);
  return (text, params) => translate(lang, text, params);
}
