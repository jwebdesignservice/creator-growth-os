import { cookies } from "next/headers";
import { translate, isReady, LANG_COOKIE, type TFn } from "./dictionary";

// Server-side language access. Reads the language cookie so Server Components
// render in the chosen language. Only import this from Server Components — it
// pulls in `next/headers`. Client components use `useT()` from `./client`.

export async function getLang(): Promise<string> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return value && isReady(value) ? value : "en-US";
}

export async function getT(): Promise<TFn> {
  const lang = await getLang();
  return (text, params) => translate(lang, text, params);
}
