"use client";

import {
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ExternalLink,
  Hash,
  Info,
  LifeBuoy,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
  Plus,
  X,
} from "lucide-react";
import { PageShell } from "@/components/app-shell/page-shell";
import { Avatar } from "@/components/app-shell/topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  InstagramIcon,
  TiktokIcon,
  YoutubeIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/cn";
import {
  saveAvatarUrl,
  saveBannerUrl,
  saveCreatorInfo,
  saveProfileSettings,
} from "./actions";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Plan = "free" | "basic" | "pro";

type ProfileRow = {
  full_name: string | null;
  display_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  category: string;
  plan: Plan;
  follower_base: string | null;
  niche: string | null;
  bio: string | null;
  main_goal: string | null;
  primary_platform: string | null;
} | null;

interface Props {
  profile: ProfileRow;
  pillars: string[];
  emailVerified: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared constants / helpers
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon, color: "text-rose-600", bg: "bg-rose-100" },
  { key: "tiktok",    label: "TikTok",    Icon: TiktokIcon,    color: "text-ink-900",  bg: "bg-ink-100"  },
  { key: "youtube",   label: "YouTube",   Icon: YoutubeIcon,   color: "text-rose-600", bg: "bg-rose-100" },
] as const;

const PLAN_META: Record<Plan, { label: string; cls: string }> = {
  free:  { label: "Free plan",  cls: "bg-cream-200 text-ink-500 border border-ink-200" },
  basic: { label: "Basic plan", cls: "bg-rose-100 text-rose-700" },
  pro:   { label: "Pro plan",   cls: "bg-amber-100 text-amber-800" },
};

const FOLLOWER_OPTIONS = [
  { value: "",          label: "Select range…" },
  { value: "0-1k",      label: "0 – 1K"        },
  { value: "1k-10k",    label: "1K – 10K"      },
  { value: "10k-25k",   label: "10K – 25K"     },
  { value: "25k-100k",  label: "25K – 100K"    },
  { value: "100k-500k", label: "100K – 500K"   },
  { value: "500k+",     label: "500K+"         },
];

const CATEGORY_OPTIONS = [
  { value: "starter",      label: "Starter Creator"      },
  { value: "growth",       label: "Growth Creator"       },
  { value: "monetization", label: "Monetization Creator" },
  { value: "scale",        label: "Scale Creator"        },
];

// Quick-add chips offered under the content-pillar input.
const SUGGESTED_PILLARS = [
  "lifestyle",
  "fitness",
  "style",
  "skincare",
  "travel",
  "motivation",
];

// Inline writing guidance toggled by the bio "Tips" button.
const BIO_TIPS = [
  "Be clear and authentic",
  "Highlight your value",
  "Include keywords",
  "Keep it concise",
];

/** Builds a correct public profile URL per platform (handles the `@` quirks). */
function socialProfileUrl(platform: string, handle: string): string | null {
  const h = handle.replace(/^@/, "").trim();
  if (!h) return null;
  switch (platform) {
    case "instagram": return `https://instagram.com/${h}`;
    case "tiktok":    return `https://tiktok.com/@${h}`;
    case "youtube":   return `https://youtube.com/@${h}`;
    case "facebook":  return `https://facebook.com/${h}`;
    case "linkedin":  return `https://linkedin.com/in/${h}`;
    case "snapchat":  return `https://snapchat.com/add/${h}`;
    case "twitter":
    case "x":         return `https://x.com/${h}`;
    default:          return `https://${platform}.com/${h}`;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export function SettingsPageClient({ profile, pillars, emailVerified }: Props) {
  return (
    <PageShell>
      <div className="w-full">
        <ProfileCard profile={profile} />
        <CreatorBrandCard profile={profile} initialPillars={pillars} />
        <SecurityCard profile={profile} emailVerified={emailVerified} />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Flat, full-width section row — label + description on the left, controls on
// the right, divided from the previous section by a hairline. (Mirrors the
// Untitled-UI settings layout, in our rose / ink / cream language.)
// ─────────────────────────────────────────────────────────────────────────────

function SettingRow({
  title,
  description,
  meta,
  children,
}: {
  title: string;
  description?: string;
  meta?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-4 border-t border-ink-100 py-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:py-8">
      <div className="lg:max-w-[260px]">
        <h2 className="text-[15px] font-semibold leading-tight text-ink-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[13px] leading-relaxed text-ink-500">
            {description}
          </p>
        )}
        {meta}
      </div>
      <div className="lg:max-w-[680px]">{children}</div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Personal details
// ─────────────────────────────────────────────────────────────────────────────

// Upload an image to the signed-in user's own folder in the public
// `community-media` bucket and return its public URL. Shared by the avatar and
// the cover banner; `prefix` keeps the two sets of files apart.
async function uploadUserImage(
  file: File,
  prefix: "avatar" | "banner",
): Promise<{ url: string } | { error: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "Please choose an image file." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "Image must be under 5MB." };
  }
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You're not signed in." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${user.id}/${prefix}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from("community-media")
    .upload(path, file, { cacheControl: "3600", upsert: true });
  if (upErr) {
    return {
      error: /bucket not found/i.test(upErr.message)
        ? "The 'community-media' storage bucket is missing."
        : upErr.message,
    };
  }
  const { data } = supabase.storage.from("community-media").getPublicUrl(path);
  return { url: data.publicUrl };
}

function ProfileCard({ profile }: { profile: ProfileRow }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [followerBase, setFollowerBase] = useState(profile?.follower_base ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url ?? null,
  );
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(
    profile?.banner_url ?? null,
  );
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerErr, setBannerErr] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handle = profile?.display_name ?? "";
  const handleUrl =
    profile?.primary_platform && handle
      ? socialProfileUrl(profile.primary_platform, handle)
      : null;

  const planMeta = PLAN_META[profile?.plan ?? "free"];
  const categoryLabel =
    CATEGORY_OPTIONS.find((o) => o.value === (profile?.category ?? "starter"))
      ?.label ?? "Creator";
  const followerLabel =
    FOLLOWER_OPTIONS.find((o) => o.value === followerBase && o.value)?.label ??
    null;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveProfileSettings({
        full_name: fullName,
        phone,
        follower_base: followerBase,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.error ?? "Save failed.");
      }
    });
  }

  // Profile photo + cover banner uploads. Both push to community-media via the
  // shared helper, then persist the resulting URL to its matching column.
  async function onAvatarSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadErr(null);
    setUploading(true);
    try {
      const res = await uploadUserImage(file, "avatar");
      if ("error" in res) {
        setUploadErr(res.error);
        return;
      }
      const saved = await saveAvatarUrl(res.url);
      if (!saved.ok) {
        setUploadErr(saved.error ?? "Couldn't save your photo.");
        return;
      }
      setAvatarUrl(res.url);
    } finally {
      setUploading(false);
    }
  }

  async function onBannerSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBannerErr(null);
    setBannerUploading(true);
    try {
      const res = await uploadUserImage(file, "banner");
      if ("error" in res) {
        setBannerErr(res.error);
        return;
      }
      const saved = await saveBannerUrl(res.url);
      if (!saved.ok) {
        setBannerErr(saved.error ?? "Couldn't save your banner.");
        return;
      }
      setBannerUrl(res.url);
    } finally {
      setBannerUploading(false);
    }
  }

  return (
    <>
    {/* ── Profile header — cover banner + overlapping avatar (flat) ── */}
    <section>
      {/* Cover banner — full-bleed: negate the PageShell page padding so it
          spans edge-to-edge and pulls flush to the top, under the topbar. */}
      <div className="relative h-40 overflow-hidden bg-gradient-to-br from-rose-200 via-rose-100 to-cream-200 [margin-inline:calc(var(--mobile-content-x)_*_-1)] [margin-top:calc(var(--mobile-content-y)_*_-1)] sm:h-48 lg:[margin-inline:calc(var(--space-page-x)_*_-1)] lg:[margin-top:calc(var(--space-page-y)_*_-1)]">
        {bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bannerUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <>
            <span aria-hidden className="pointer-events-none absolute -right-8 -top-12 size-44 rounded-full bg-white/25 blur-2xl" />
            <span aria-hidden className="pointer-events-none absolute left-1/3 top-8 size-28 rounded-full bg-rose-300/25 blur-2xl" />
          </>
        )}
        <button
          type="button"
          onClick={() => bannerInputRef.current?.click()}
          disabled={bannerUploading}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 h-9 px-3 rounded-[10px] bg-white/85 hover:bg-white text-ink-700 text-[12.5px] font-semibold shadow-sm backdrop-blur-sm transition-colors disabled:opacity-70"
        >
          {bannerUploading ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          ) : (
            <Camera className="size-4" strokeWidth={2} />
          )}
          {bannerUploading ? "Uploading…" : "Change cover"}
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={onBannerSelect}
          className="hidden"
        />
        {bannerErr && (
          <span className="absolute left-3 bottom-3 z-10 rounded-md bg-white/90 px-2 py-1 text-[11.5px] text-rose-600 shadow-sm">
            {bannerErr}
          </span>
        )}
      </div>

      {/* Profile header — large avatar overlapping the banner */}
      <div className="pb-6">
        <div className="-mt-14 mb-3 w-fit relative z-10">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile photo"
            className="group relative block size-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-cream-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={fullName || "Profile photo"}
                className="size-full object-cover"
              />
            ) : (
              <Avatar name={fullName || "U"} size={112} />
            )}
            <span
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-ink-900/45 text-white transition-opacity",
                uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100",
              )}
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin" strokeWidth={2} />
              ) : (
                <Camera className="size-6" strokeWidth={2} />
              )}
            </span>
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={onAvatarSelect}
            className="hidden"
          />
          {uploadErr && (
            <p className="mt-2 text-[12px] text-rose-600 max-w-[180px] leading-snug">
              {uploadErr}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-h3 sm:text-[26px] text-ink-900 leading-tight">
            {fullName || "Your name"}
          </h2>
          <span
            className={cn(
              "inline-flex items-center h-[22px] px-2.5 rounded-full text-[11px] font-semibold",
              planMeta.cls,
            )}
          >
            {planMeta.label}
          </span>
        </div>

        <p className="text-[14px] text-ink-700 mt-1">{categoryLabel}</p>

        <div className="mt-1.5 flex items-center gap-x-3 gap-y-1 flex-wrap text-[12.5px] text-ink-500">
          {followerLabel && <span>{followerLabel} followers</span>}
          {followerLabel && handleUrl && (
            <span aria-hidden className="text-ink-300">·</span>
          )}
          {handleUrl && (
            <a
              href={handleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 max-w-full text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              <span className="truncate">{handleUrl.replace(/^https:\/\//, "")}</span>
              <ExternalLink className="size-3 shrink-0" strokeWidth={2} />
            </a>
          )}
        </div>
      </div>
    </section>

    {/* ── Personal details ──────────────────────────────────────── */}
    <SettingRow
      title="Personal details"
      description="Your name, contact and audience size."
    >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              name="full_name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              defaultValue={profile?.email ?? ""}
              disabled
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              placeholder="+47 000 00 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Select
              label="Follower base"
              name="follower_base"
              value={followerBase}
              onChange={(e) => setFollowerBase(e.target.value)}
              options={FOLLOWER_OPTIONS}
            />
          </div>

          {/* Read-only account facts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Select
                label="Creator category"
                name="category"
                defaultValue={profile?.category ?? "starter"}
                disabled
                options={CATEGORY_OPTIONS}
              />
              <p className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
                <Info className="size-3 shrink-0" strokeWidth={2} />
                Categories are managed by our team.
              </p>
            </div>

            <div>
              <Input
                label="Username / handle"
                name="handle"
                placeholder="@yourhandle"
                defaultValue={handle}
                disabled
              />
              {handleUrl && (
                <a
                  href={handleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 max-w-full text-[11.5px] text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <span className="truncate">
                    {handleUrl.replace(/^https:\/\//, "")}
                  </span>
                  <ExternalLink className="size-3 shrink-0" strokeWidth={2} />
                </a>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between gap-3 mt-5 flex-wrap sm:flex-nowrap">
            <p
              className="text-[12.5px] text-rose-700 flex-1 min-w-0"
              role={error ? "alert" : undefined}
            >
              {error ?? ""}
            </p>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                "w-full sm:w-auto h-11 sm:h-9 transition-all",
                saved && "bg-emerald-600 hover:bg-emerald-600",
              )}
            >
              {saved ? (
                <>
                  <Check className="size-3.5" strokeWidth={2.5} /> Saved
                </>
              ) : isPending ? (
                "Saving…"
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
    </SettingRow>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Creator brand
// ─────────────────────────────────────────────────────────────────────────────

function CreatorBrandCard({
  profile,
  initialPillars,
}: {
  profile: ProfileRow;
  initialPillars: string[];
}) {
  const [pillars, setPillars] = useState<string[]>(initialPillars);
  const [newPillar, setNewPillar] = useState("");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [niche, setNiche] = useState(profile?.niche ?? "");
  const [platform, setPlatform] = useState<string | null>(
    profile?.primary_platform ?? null,
  );
  // Both sections save the same creator-info payload; tracking which section
  // triggered the save lets only that button animate (saving / saved / error).
  const [savedSection, setSavedSection] = useState<"brand" | "platform" | null>(null);
  const [pendingSection, setPendingSection] = useState<"brand" | "platform" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorSection, setErrorSection] = useState<"brand" | "platform" | null>(null);
  const [isPending, startTransition] = useTransition();
  const pillarInputRef = useRef<HTMLInputElement>(null);
  const [showTips, setShowTips] = useState(true);

  const BIO_LIMIT = 250;
  const PILLAR_LIMIT = 6;
  const pillarsFull = pillars.length >= PILLAR_LIMIT;
  const suggestions = SUGGESTED_PILLARS.filter((s) => !pillars.includes(s));

  function addPillar() {
    const trimmed = newPillar.trim();
    if (trimmed && !pillars.includes(trimmed) && !pillarsFull) {
      setPillars([...pillars, trimmed]);
      setNewPillar("");
      pillarInputRef.current?.focus();
    }
  }

  function addSuggested(label: string) {
    if (!pillars.includes(label) && !pillarsFull) {
      setPillars([...pillars, label]);
    }
  }

  function removePillar(label: string) {
    setPillars(pillars.filter((p) => p !== label));
  }

  function handleSave(section: "brand" | "platform") {
    setError(null);
    setErrorSection(null);
    setPendingSection(section);
    startTransition(async () => {
      const result = await saveCreatorInfo({
        bio,
        niche,
        primary_platform: platform,
        pillars,
      });
      setPendingSection(null);
      if (result.ok) {
        setSavedSection(section);
        setTimeout(() => setSavedSection(null), 2500);
      } else {
        setError(result.error ?? "Save failed.");
        setErrorSection(section);
      }
    });
  }

  return (
    <>
    <SettingRow
      title="Creator brand"
      description="Your content pillars and creator bio."
      meta={
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center px-2 h-6 rounded-full bg-rose-50 text-rose-700 text-[11.5px] font-semibold">
            {pillars.length}/{PILLAR_LIMIT} pillars
          </span>
        </div>
      }
    >
      <div className="space-y-5">
          {/* Content pillars */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-semibold text-ink-700">
                Content pillars
              </label>
              <span className="text-[11.5px] text-ink-400 tabular-nums">
                {pillars.length}/{PILLAR_LIMIT}
              </span>
            </div>
            <p className="mb-2.5 text-[12px] leading-relaxed text-ink-500">
              The core topics and themes you consistently create around.
            </p>
            {pillars.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {pillars.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 h-7 pl-3 pr-2 rounded-full bg-rose-100 text-[12.5px] font-medium text-rose-700"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removePillar(p)}
                      className="size-4 rounded-full hover:bg-rose-200 flex items-center justify-center transition-colors"
                      aria-label={`Remove ${p}`}
                    >
                      <X className="size-2.5" strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Hash
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-300"
                  strokeWidth={2}
                />
                <input
                  ref={pillarInputRef}
                  type="text"
                  placeholder={pillarsFull ? "Pillar limit reached" : "Add a content pillar…"}
                  value={newPillar}
                  disabled={pillarsFull}
                  onChange={(e) => setNewPillar(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPillar();
                    }
                  }}
                  className="h-11 w-full pl-9 pr-3 text-[13px] rounded-[10px] bg-cream-50 border border-ink-100 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 placeholder:text-ink-300 disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                onClick={addPillar}
                disabled={!newPillar.trim() || pillarsFull}
                className="inline-flex items-center gap-1 h-11 px-3.5 rounded-[10px] bg-white border border-ink-200 text-[13px] font-medium text-ink-700 hover:bg-cream-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="size-3.5" strokeWidth={2.5} />
                Add
              </button>
            </div>

            {/* Suggested pillars — click to add (hidden once added or full) */}
            {!pillarsFull && suggestions.length > 0 && (
              <div className="mt-3">
                <div className="mb-2 flex items-center gap-1.5">
                  <span className="text-[12.5px] font-semibold text-ink-700">
                    Suggested pillars
                  </span>
                  <Info className="size-3.5 text-ink-300" strokeWidth={2} />
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSuggested(s)}
                      className="inline-flex items-center h-8 px-3 rounded-full bg-cream-100 border border-ink-100 text-[12.5px] font-medium text-ink-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <label className="block text-[13px] font-semibold text-ink-700">
                Bio / creator description
              </label>
              <button
                type="button"
                onClick={() => setShowTips((v) => !v)}
                aria-pressed={showTips}
                className={cn(
                  "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-[8px] border text-[12px] font-medium transition-colors",
                  showTips
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-white border-ink-200 text-ink-600 hover:bg-cream-100",
                )}
              >
                <Lightbulb className="size-3.5" strokeWidth={2} />
                Tips
              </button>
            </div>
            <p className="mb-2.5 text-[12px] leading-relaxed text-ink-500">
              Tell your audience who you are, what you create, and what to expect.
            </p>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={BIO_LIMIT}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a short, catchy bio that describes you and your content…"
                className="w-full px-3.5 py-3 text-[13px] text-ink-900 rounded-[12px] border border-ink-100 bg-white resize-none focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 placeholder:text-ink-300 leading-relaxed"
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] text-ink-400 tabular-nums">
                {bio.length}/{BIO_LIMIT}
              </span>
            </div>
            {showTips && (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px]">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink-700">
                  <CheckCircle2 className="size-3.5 text-rose-500" strokeWidth={2} />
                  Best practices
                </span>
                {BIO_TIPS.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 text-ink-500"
                  >
                    <Check className="size-3.5 text-emerald-500" strokeWidth={2.5} />
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between gap-3 mt-5 flex-wrap sm:flex-nowrap">
        <p
          className="text-[12.5px] text-rose-700 flex-1 min-w-0"
          role={errorSection === "brand" ? "alert" : undefined}
        >
          {errorSection === "brand" ? error : ""}
        </p>
        <Button
          size="sm"
          onClick={() => handleSave("brand")}
          disabled={isPending}
          className={cn(
            "w-full sm:w-auto h-11 sm:h-9 transition-all",
            savedSection === "brand" && "bg-emerald-600 hover:bg-emerald-600",
          )}
        >
          {savedSection === "brand" ? (
            <>
              <Check className="size-3.5" strokeWidth={2.5} /> Saved
            </>
          ) : pendingSection === "brand" ? (
            "Saving…"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </SettingRow>

    <SettingRow
      title="Platform & audience"
      description="Your primary platform and niche focus."
      meta={
        platform || niche.trim() ? (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {platform && (
              <span className="inline-flex items-center px-2 h-6 rounded-full bg-cream-100 text-ink-500 text-[11.5px] font-medium capitalize">
                {PLATFORMS.find((p) => p.key === platform)?.label ?? platform}
              </span>
            )}
            {niche.trim() && (
              <span className="inline-flex items-center px-2 h-6 rounded-full bg-cream-100 text-ink-500 text-[11.5px] font-medium truncate max-w-[180px]">
                {niche.trim()}
              </span>
            )}
          </div>
        ) : undefined
      }
    >
      <div className="space-y-5">
          {/* Primary platform */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-2">
              Primary platform
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {PLATFORMS.map(({ key, label, Icon, color, bg }) => {
                const active = platform === key;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPlatform(active ? null : key)}
                    className={cn(
                      "inline-flex items-center gap-2 h-9 px-3.5 rounded-[10px] border text-[13px] font-medium transition-all",
                      active
                        ? `${bg} ${color} border-transparent shadow-sm`
                        : "bg-white text-ink-500 border-ink-100 hover:bg-cream-100",
                    )}
                  >
                    <Icon size={15} className={active ? color : "text-ink-400"} />
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11.5px] text-ink-400">
              Where most of your audience lives — used across your dashboard.
            </p>
          </div>

          {/* Niche */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-2">
              Niche / audience focus
              <span className="text-ink-400 font-normal ml-1">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Who do you create for?"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full h-11 px-3.5 text-[13px] text-ink-900 rounded-[12px] border border-ink-100 bg-white focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 placeholder:text-ink-300"
            />
          </div>
        </div>

      {/* Save */}
      <div className="flex items-center justify-between gap-3 mt-5 flex-wrap sm:flex-nowrap">
        <p
          className="text-[12.5px] text-rose-700 flex-1 min-w-0"
          role={errorSection === "platform" ? "alert" : undefined}
        >
          {errorSection === "platform" ? error : ""}
        </p>
        <Button
          size="sm"
          onClick={() => handleSave("platform")}
          disabled={isPending}
          className={cn(
            "w-full sm:w-auto h-11 sm:h-9 transition-all",
            savedSection === "platform" && "bg-emerald-600 hover:bg-emerald-600",
          )}
        >
          {savedSection === "platform" ? (
            <>
              <Check className="size-3.5" strokeWidth={2.5} /> Saved
            </>
          ) : pendingSection === "platform" ? (
            "Saving…"
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </SettingRow>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Security
// ─────────────────────────────────────────────────────────────────────────────

function SecurityCard({
  profile,
  emailVerified,
}: {
  profile: ProfileRow;
  emailVerified: boolean;
}) {
  const email = profile?.email ?? "";

  const [changing, setChanging] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwPending, startPwTransition] = useTransition();

  const [resend, setResend] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  function handleChangePassword() {
    setPwError("");
    setPwSuccess(false);
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    startPwTransition(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        setPwError(error.message);
      } else {
        setPwSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setChanging(false);
          setPwSuccess(false);
        }, 2000);
      }
    });
  }

  async function handleResend() {
    if (!email || resend === "sending") return;
    setResend("sending");
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.resend({ type: "signup", email });
      setResend(error ? "error" : "sent");
    } catch {
      setResend("error");
    }
  }

  return (
    <SettingRow
      title="Security"
      description="Keep your account secure and review account access."
      meta={
        <div className="mt-3">
          {emailVerified ? (
            <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-emerald-50 text-emerald-700 text-[11.5px] font-semibold">
              <CheckCircle2 className="size-3.5" strokeWidth={2.4} />
              Email verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 h-6 rounded-full bg-amber-50 text-amber-700 text-[11.5px] font-semibold">
              <Mail className="size-3.5" strokeWidth={2.2} />
              Email not verified
            </span>
          )}
        </div>
      }
    >
      <div className="divide-y divide-ink-100">
        {/* Password */}
        <div className="py-4 first:pt-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <RowIcon>
                <Lock className="size-4 text-ink-500" strokeWidth={1.8} />
              </RowIcon>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium text-ink-900">
                  Password
                </div>
                <div className="text-[12px] text-ink-500">
                  Use at least 8 characters.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setChanging((o) => !o);
                setPwError("");
                setPwSuccess(false);
              }}
              className="shrink-0 text-[13px] font-semibold text-rose-600 hover:text-rose-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 rounded"
            >
              {changing ? "Cancel" : "Change password"}
            </button>
          </div>

          {changing && (
            <div className="mt-3.5 space-y-3 sm:pl-11">
              <input
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
              {pwError && (
                <p className="text-[12px] text-rose-600" role="alert">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-[12px] text-emerald-600 font-medium">
                  Password updated.
                </p>
              )}
              <Button size="sm" onClick={handleChangePassword} disabled={pwPending}>
                {pwPending ? "Saving…" : "Update password"}
              </Button>
            </div>
          )}
        </div>

        {/* Email verification */}
        <div className="py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <RowIcon>
                <Mail className="size-4 text-ink-500" strokeWidth={1.8} />
              </RowIcon>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium text-ink-900">
                  Email verification
                </div>
                <div className="text-[12px] text-ink-500 truncate">
                  {email || "—"}
                </div>
              </div>
            </div>

            {emailVerified ? (
              <span className="shrink-0 inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
                Verified
                <CheckCircle2 className="size-4" strokeWidth={2} />
              </span>
            ) : resend === "sent" ? (
              <span className="shrink-0 text-[13px] font-medium text-emerald-600">
                Verification sent
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resend === "sending"}
                className="shrink-0 text-[13px] font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 rounded"
              >
                {resend === "sending" ? "Sending…" : "Resend email"}
              </button>
            )}
          </div>
          {resend === "error" && (
            <p className="mt-2 text-[12px] text-rose-600 sm:pl-11" role="alert">
              Could not send the email. Please try again shortly.
            </p>
          )}
        </div>

        {/* Support tickets — the one navigable row (real route). */}
        <Link
          href="/support/tickets"
          className="group flex items-center justify-between gap-3 py-4 last:pb-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200"
        >
          <div className="flex items-center gap-3 min-w-0">
            <RowIcon>
              <LifeBuoy className="size-4 text-ink-500" strokeWidth={1.8} />
            </RowIcon>
            <div className="min-w-0">
              <div className="text-[13.5px] font-medium text-ink-900">
                Support tickets
              </div>
              <div className="text-[12px] text-ink-500">
                View and manage your help requests.
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-[13px] font-semibold text-rose-600 group-hover:text-rose-700 transition-colors">
              View
            </span>
            <ArrowRight
              className="size-4 text-ink-300 group-hover:text-ink-500 transition-colors"
              strokeWidth={2}
            />
          </div>
        </Link>
      </div>
    </SettingRow>
  );
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <div className="size-8 rounded-[10px] bg-cream-100 flex items-center justify-center shrink-0">
      {children}
    </div>
  );
}
