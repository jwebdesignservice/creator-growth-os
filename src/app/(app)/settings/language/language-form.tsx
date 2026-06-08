"use client";

import { useEffect, useState } from "react";
import { Check, Globe, Info, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import { LanguagePicker } from "./language-picker";
import { useLang, useT } from "@/lib/i18n/client";
import { LANG_COOKIE } from "@/lib/i18n/dictionary";

const REGION_KEY = "cgos:region";

export function LanguageForm() {
  const currentLang = useLang();
  const t = useT();

  // Draft language — applied to the whole app (cookie + reload) on save.
  const [draft, setDraft] = useState(currentLang);
  const [region, setRegion] = useState("auto");
  const [saved, setSaved] = useState(false);

  const regionOptions = [
    { value: "auto", label: t("Automatic — match my device") },
    { value: "eu", label: t("Europe — 31.12.2025, 24-hour") },
    { value: "us", label: t("United States — 12/31/2025, 12-hour") },
    { value: "iso", label: t("ISO — 2025-12-31, 24-hour") },
  ];

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const savedRegion = localStorage.getItem(REGION_KEY);
    if (savedRegion) setRegion(savedRegion);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleSave() {
    localStorage.setItem(REGION_KEY, region);

    // A language change is stored in a cookie (so the server can render in it)
    // and applied across the whole app with a reload.
    if (draft !== currentLang) {
      document.cookie = `${LANG_COOKIE}=${encodeURIComponent(draft)}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = draft;
      window.location.reload();
      return;
    }

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
          <h2 className="text-h4 text-ink-900 leading-tight">
            {t("Language & region")}
          </h2>
          <p className="text-[12.5px] text-ink-500 mt-0.5">
            {t("Choose the language and regional format for your workspace.")}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <LanguagePicker value={draft} onChange={setDraft} />
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
            <Info className="size-3 shrink-0" strokeWidth={2} />
            {t("Saved to this device.")}
          </p>
        </div>

        <div>
          <Select
            label={t("Region & date format")}
            name="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            options={regionOptions}
          />
          <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
            <Globe className="size-3 shrink-0" strokeWidth={2} />
            {t("Controls how dates and numbers appear.")}
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
              <Check className="size-3.5" strokeWidth={2.5} /> {t("Saved")}
            </>
          ) : (
            t("Save changes")
          )}
        </Button>
      </div>
    </section>
  );
}
