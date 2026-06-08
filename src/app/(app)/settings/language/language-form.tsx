"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Info, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";

// Interface languages we offer in the picker. The app ships English today;
// the saved choice is applied to <html lang> and remembered per device.
const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "nb", label: "Norsk (Bokmål)" },
  { value: "nn", label: "Norsk (Nynorsk)" },
  { value: "sv", label: "Svenska" },
  { value: "da", label: "Dansk" },
  { value: "de", label: "Deutsch" },
  { value: "nl", label: "Nederlands" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "pt", label: "Português" },
];

const REGION_OPTIONS = [
  { value: "auto", label: "Automatic — match my device" },
  { value: "eu", label: "Europe — 31.12.2025, 24-hour" },
  { value: "us", label: "United States — 12/31/2025, 12-hour" },
  { value: "iso", label: "ISO — 2025-12-31, 24-hour" },
];

const LANG_KEY = "cgos:language";
const REGION_KEY = "cgos:region";

export function LanguageForm() {
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("auto");
  const [saved, setSaved] = useState(false);

  // Hydrate from the device's saved preference. Read in an effect (not lazy
  // useState init) so the server-rendered <select> doesn't mismatch the client.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY);
    const savedRegion = localStorage.getItem(REGION_KEY);
    if (savedLang) {
      setLanguage(savedLang);
      document.documentElement.lang = savedLang;
    }
    if (savedRegion) setRegion(savedRegion);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleSave() {
    localStorage.setItem(LANG_KEY, language);
    localStorage.setItem(REGION_KEY, region);
    document.documentElement.lang = language;
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section className="card p-5 sm:p-6">
      <header className="flex items-start gap-3 mb-5">
        <span className="size-10 rounded-[12px] bg-rose-100 text-rose-600 inline-flex items-center justify-center shrink-0">
          <Languages className="size-[18px]" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <h2 className="text-h4 text-ink-900 leading-tight">Language & region</h2>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            Choose the language and regional format for your workspace.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Select
            label="Interface language"
            name="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            options={LANGUAGE_OPTIONS}
          />
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
            <Info className="size-3 shrink-0" strokeWidth={2} />
            Saved to this device.
          </p>
        </div>

        <div>
          <Select
            label="Region & date format"
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={REGION_OPTIONS}
          />
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
            <Globe className="size-3 shrink-0" strokeWidth={2} />
            Controls how dates and numbers appear.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-5 pt-5 border-t border-ink-100">
        <Button
          size="sm"
          onClick={handleSave}
          className={cn(
            "h-9 transition-all",
            saved && "bg-emerald-600 hover:bg-emerald-600",
          )}
        >
          {saved ? (
            <>
              <Check className="size-3.5" strokeWidth={2.5} /> Saved
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </section>
  );
}
