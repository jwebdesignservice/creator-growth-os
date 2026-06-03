"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Info,
  LifeBuoy,
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
import { saveCreatorInfo, saveProfileSettings } from "./actions";

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
  free:  { label: "Free plan",  cls: "bg-cream-200 text-ink-600 border border-ink-200" },
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
      <div className="max-w-[var(--container-content)] space-y-5 sm:space-y-6">
        <header>
          <h1 className="text-page-title text-ink-900">Profile settings</h1>
          <p className="text-[14px] text-ink-500 mt-1">
            Manage your personal details, creator brand, and account security.
          </p>
        </header>

        <ProfileCard profile={profile} />
        <CreatorBrandCard profile={profile} initialPillars={pillars} />
        <SecurityCard profile={profile} emailVerified={emailVerified} />
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Personal details
// ─────────────────────────────────────────────────────────────────────────────

function ProfileCard({ profile }: { profile: ProfileRow }) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [followerBase, setFollowerBase] = useState(profile?.follower_base ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handle = profile?.display_name ?? "";
  const handleUrl =
    profile?.primary_platform && handle
      ? socialProfileUrl(profile.primary_platform, handle)
      : null;

  const planMeta = PLAN_META[profile?.plan ?? "free"];

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

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-h4 text-ink-900 mb-5">Personal details</h2>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Identity */}
        <div className="flex flex-col items-center text-center shrink-0 w-full sm:w-[140px]">
          <div className="size-[96px] rounded-full overflow-hidden border-[3px] border-white shadow-md">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={fullName || "Profile photo"}
                className="size-full object-cover"
              />
            ) : (
              <Avatar name={fullName || "U"} size={96} />
            )}
          </div>
          <div className="mt-3 text-[14px] font-semibold text-ink-900 leading-tight break-words max-w-full">
            {fullName || "Your name"}
          </div>
          <span
            className={cn(
              "mt-2 inline-flex items-center h-[22px] px-2.5 rounded-full text-[11px] font-semibold",
              planMeta.cls,
            )}
          >
            {planMeta.label}
          </span>
        </div>

        {/* Form */}
        <div className="flex-1 min-w-0">
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
        </div>
      </div>
    </section>
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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const pillarInputRef = useRef<HTMLInputElement>(null);

  const BIO_LIMIT = 250;
  const PILLAR_LIMIT = 6;
  const pillarsFull = pillars.length >= PILLAR_LIMIT;

  function addPillar() {
    const trimmed = newPillar.trim();
    if (trimmed && !pillars.includes(trimmed) && !pillarsFull) {
      setPillars([...pillars, trimmed]);
      setNewPillar("");
      pillarInputRef.current?.focus();
    }
  }

  function removePillar(label: string) {
    setPillars(pillars.filter((p) => p !== label));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveCreatorInfo({
        bio,
        niche,
        primary_platform: platform,
        pillars,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.error ?? "Save failed.");
      }
    });
  }

  return (
    <section className="card p-5 sm:p-6">
      <h2 className="text-h4 text-ink-900 mb-5">Creator brand</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 gap-y-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Content pillars */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[13px] font-semibold text-ink-700">
                Content pillars
              </label>
              <span className="text-[11.5px] text-ink-400 tabular-nums">
                {pillars.length}/{PILLAR_LIMIT}
              </span>
            </div>
            {pillars.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
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
              <input
                ref={pillarInputRef}
                type="text"
                placeholder={pillarsFull ? "Pillar limit reached" : "Add a pillar…"}
                value={newPillar}
                disabled={pillarsFull}
                onChange={(e) => setNewPillar(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addPillar();
                  }
                }}
                className="h-9 flex-1 px-3 text-[12.5px] rounded-[10px] bg-cream-50 border border-ink-100 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 placeholder:text-ink-300 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={addPillar}
                disabled={!newPillar.trim() || pillarsFull}
                className="inline-flex items-center gap-1 h-9 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="size-3.5" strokeWidth={2.5} />
                Add
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-2">
              Bio / creator description
            </label>
            <div className="relative">
              <textarea
                rows={4}
                maxLength={BIO_LIMIT}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell your audience who you are and what you create…"
                className="w-full px-3.5 py-3 text-[13px] text-ink-900 rounded-[12px] border border-ink-100 bg-white resize-none focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 placeholder:text-ink-300 leading-relaxed"
              />
              <span className="absolute bottom-2.5 right-3 text-[11px] text-ink-400 tabular-nums">
                {bio.length}/{BIO_LIMIT}
              </span>
            </div>
          </div>
        </div>

        {/* Right column */}
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
      </div>

      {/* Save */}
      <div className="flex items-center justify-between gap-3 mt-5 pt-5 border-t border-ink-100 flex-wrap sm:flex-nowrap">
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
            "Save creator info"
          )}
        </Button>
      </div>
    </section>
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
    <section className="card p-5 sm:p-6">
      <h2 className="text-h4 text-ink-900 mb-1">Security</h2>
      <p className="text-[13px] text-ink-500 mb-4">
        Keep your account secure and review account access.
      </p>

      <div className="divide-y divide-ink-100">
        {/* Password */}
        <div className="py-4 first:pt-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <RowIcon>
                <Lock className="size-4 text-ink-500" strokeWidth={1.8} />
              </RowIcon>
              <div className="min-w-0">
                <div className="text-[13.5px] font-medium text-ink-800">
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
                <div className="text-[13.5px] font-medium text-ink-800">
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
              <div className="text-[13.5px] font-medium text-ink-800">
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
    </section>
  );
}

function RowIcon({ children }: { children: ReactNode }) {
  return (
    <div className="size-8 rounded-[10px] bg-cream-100 flex items-center justify-center shrink-0">
      {children}
    </div>
  );
}
