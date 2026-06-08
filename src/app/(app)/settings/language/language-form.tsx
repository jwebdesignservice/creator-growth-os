"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Info, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { LanguagePicker } from "./language-picker";
import { getStrings, isReady } from "./i18n";

const LANG_KEY = "cgos:language";
const REGION_KEY = "cgos:region";

export function LanguageForm() {
  const [language, setLanguage] = useState("en-US");
  const [region, setRegion] = useState("auto");
  const [saved, setSaved] = useState(false);

  const s = getStrings(language);
  const regionOptions = [
    { value: "auto", label: s.region.auto },
    { value: "eu", label: s.region.eu },
    { value: "us", label: s.region.us },
    { value: "iso", label: s.region.iso },
  ];

  // Hydrate from the device's saved preference. Read in an effect (not lazy
  // useState init) so the server-rendered controls don't mismatch the client.
  // Only apply a saved language that's actually shipped (US / UK / NO).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedLang = localStorage.getItem(LANG_KEY);
    const savedRegion = localStorage.getItem(REGION_KEY);
    if (savedLang && isReady(savedLang)) {
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
          <h2 className="text-h4 text-ink-900 leading-tight">{s.title}</h2>
          <p className="text-[12.5px] text-ink-500 mt-0.5">{s.subtitle}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <LanguagePicker value={language} onChange={setLanguage} />
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
            <Info className="size-3 shrink-0" strokeWidth={2} />
            {s.languageHint}
          </p>
        </div>

        <div>
          <Select
            label={s.regionLabel}
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={regionOptions}
          />
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
            <Globe className="size-3 shrink-0" strokeWidth={2} />
            {s.regionHint}
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
              <Check className="size-3.5" strokeWidth={2.5} /> {s.saved}
            </>
          ) : (
            s.save
          )}
        </Button>
      </div>
    </section>
  );
}
