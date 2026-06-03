/* Avatar upload ───────────────────────────────────────────────────────────────
   Profile-photo editing — the uploader row (change / remove) and a circular
   crop view with a zoom control. Distinct from `avatars` (which is display).
   For Settings → Edit profile. Presentational.
   ───────────────────────────────────────────────────────────────────────── */

import { Camera, Upload, Trash2, ZoomIn, Check } from "lucide-react";

/* 1 · Uploader row — current photo + change / remove. */
export function AvatarUploader() {
  return (
    <div className="w-[400px] max-w-full rounded-[16px] border border-ink-100 bg-white p-5 flex items-center gap-4 shadow-card">
      <div className="relative shrink-0">
        <span className="size-16 rounded-full bg-rose-100 text-rose-700 inline-flex items-center justify-center text-[20px] font-bold">DB</span>
        <span className="absolute -bottom-0.5 -right-0.5 size-6 rounded-full bg-ink-900 text-cream-50 inline-flex items-center justify-center border-2 border-white">
          <Camera className="size-3" strokeWidth={2.2} />
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] font-semibold text-ink-900">Profile photo</div>
        <div className="text-[11.5px] text-ink-500 mt-0.5">JPG or PNG, at least 200×200px.</div>
        <div className="flex items-center gap-2 mt-2.5">
          <button type="button" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[9px] bg-rose-600 text-white text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
            <Upload className="size-3.5" strokeWidth={2} /> Change
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[9px] border border-ink-200 text-ink-500 text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2">
            <Trash2 className="size-3.5" strokeWidth={2} /> Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* 2 · Cropper — circular crop overlay + zoom + save. */
export function AvatarCropper() {
  return (
    <div className="w-[300px] max-w-full rounded-[16px] border border-ink-100 bg-white p-4 shadow-card">
      <div className="relative h-44 rounded-[12px] overflow-hidden bg-gradient-to-br from-rose-200 via-amber-100 to-cream-200">
        {/* Dark mask with circular cut-out */}
        <div className="absolute inset-0 bg-ink-900/45" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-28 rounded-full ring-2 ring-white shadow-[0_0_0_1000px_rgba(26,24,22,0.45)]" />
      </div>
      <div className="flex items-center gap-2.5 mt-3.5">
        <ZoomIn className="size-4 text-ink-400 shrink-0" strokeWidth={2} />
        <div className="flex-1 h-1.5 rounded-full bg-cream-200 relative">
          <div className="absolute left-0 top-0 h-full w-1/2 rounded-full bg-rose-500" />
          <span className="absolute top-1/2 -translate-y-1/2 size-4 rounded-full bg-white border border-ink-200 shadow" style={{ left: "calc(50% - 8px)" }} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-4">
        <button type="button" className="h-9 px-3.5 rounded-[10px] border border-ink-200 text-ink-700 text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-cream-100 active:bg-cream-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:ring-offset-2">Cancel</button>
        <button type="button" className="inline-flex items-center gap-1.5 h-9 px-4 rounded-[10px] bg-rose-600 text-white text-[12.5px] font-semibold transition-colors cursor-pointer hover:bg-rose-700 active:bg-rose-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2">
          <Check className="size-3.5" strokeWidth={2.5} /> Save photo
        </button>
      </div>
    </div>
  );
}
