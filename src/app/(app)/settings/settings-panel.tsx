"use client";

import { useState, useTransition, useRef } from "react";
import Link from "next/link";
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
import { saveProfileSettings, saveCreatorInfo } from "./actions";
import { saveNotificationPreferences } from "@/app/(app)/notifications/actions";
import type { NotificationPreferences } from "@/lib/notifications/types";
import {
  Pencil,
  Plus,
  X,
  Check,
  CheckCircle2,
  Circle,
  Lock,
  Shield,
  Mail,
  Smartphone,
  Crown,
  ArrowRight,
  ExternalLink,
  Info,
  LifeBuoy,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ProfileRow = {
  full_name:        string | null;
  display_name:     string | null;
  email:            string;
  phone:            string | null;
  avatar_url:       string | null;
  category:         string;
  plan:             "free" | "basic" | "pro";
  follower_base:    string | null;
  niche:            string | null;
  main_goal:        string | null;
  primary_platform: string | null;
} | null;

type SocialAccount = {
  platform:      string;
  handle:        string | null;
  follower_count: number;
  is_primary:    boolean;
};

interface Props {
  profile:        ProfileRow;
  socialAccounts: SocialAccount[];
  pillars:        string[];
  preferences:    NotificationPreferences;
  firstName?:     string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Root export
// ─────────────────────────────────────────────────────────────────────────────

export function SettingsPageClient({
  profile,
  socialAccounts,
  pillars: initialPillars,
  preferences,
  firstName,
}: Props) {
  const instagram = socialAccounts.find((a) => a.platform === "instagram");
  const tiktok    = socialAccounts.find((a) => a.platform === "tiktok");
  const youtube   = socialAccounts.find((a) => a.platform === "youtube");

  const completion = computeCompletion(profile, initialPillars, socialAccounts);

  return (
    <PageShell
      rail={
        <SettingsRail
          profile={profile}
          instagram={instagram}
          tiktok={tiktok}
          youtube={youtube}
          completion={completion}
        />
      }
    >
      <div className="max-w-[var(--container-content)] space-y-5 sm:space-y-6">
        {/* Page header */}
        <div>
          {firstName && (
            <div className="text-rose-600 font-medium text-[13.5px] flex items-center gap-2 mb-2">
              Welcome back, {firstName}! <span aria-hidden>👋</span>
            </div>
          )}
          <h1 className="text-page-title text-ink-900">
            User Settings
          </h1>
          <p className="text-[14px] text-ink-500 mt-1">
            Manage your profile, account, and preferences.
          </p>
        </div>

        {/* Inline profile completion — rail shows this on xl+, so only render here below xl. */}
        <div className="xl:hidden">
          <CompletionCard completion={completion} />
        </div>

        <ProfileSettingsCard profile={profile} />
        <CreatorInfoCard
          profile={profile}
          initialPillars={initialPillars}
          socialAccounts={socialAccounts}
        />

        {/* Security + Notifications side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SecurityCard profile={profile} />
          <NotificationPrefsCard preferences={preferences} />
        </div>
      </div>
    </PageShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Profile Settings
// ─────────────────────────────────────────────────────────────────────────────

function ProfileSettingsCard({ profile }: { profile: ProfileRow }) {
  const [fullName,     setFullName]     = useState(profile?.full_name     ?? "");
  const [phone,        setPhone]        = useState(profile?.phone         ?? "");
  const [followerBase, setFollowerBase] = useState(profile?.follower_base ?? "");
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [, startTransition]            = useTransition();

  const handle    = profile?.display_name ?? "";
  const primarySocial = profile?.primary_platform;
  const handleLink = primarySocial && handle
    ? `${primarySocial}.com/${handle.replace("@", "")}`
    : null;

  const categoryLabel =
    profile?.category === "growth"       ? "Growth Creator"        :
    profile?.category === "monetization" ? "Monetization Creator"  :
    profile?.category === "scale"        ? "Scale Creator"         :
    "Starter Creator";

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await saveProfileSettings({ full_name: fullName, phone, follower_base: followerBase });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(result.error ?? "Save failed.");
      }
    });
  }

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display text-[18px] text-ink-900 mb-5">
        Profile Settings
      </h2>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center shrink-0 w-full sm:w-[130px]">
          <div className="relative">
            <div className="size-[100px] rounded-full overflow-hidden border-[3px] border-white shadow-md">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={fullName}
                  className="size-full object-cover"
                />
              ) : (
                <Avatar name={fullName || "U"} size={100} />
              )}
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              aria-label="Edit photo — coming soon"
              title="Photo upload is coming soon."
              className="absolute bottom-0 right-0 size-7 rounded-full bg-rose-300 border-2 border-white flex items-center justify-center shadow-sm cursor-not-allowed"
            >
              <Pencil className="size-3 text-white" strokeWidth={2.5} aria-hidden />
            </button>
          </div>
          <span
            aria-disabled="true"
            title="Photo upload is coming soon."
            className="mt-2.5 text-[12.5px] font-medium text-ink-400 cursor-not-allowed select-none"
          >
            Edit photo
          </span>
          <span className="inline-flex items-center px-1.5 h-[18px] mt-1 rounded-full text-[10px] font-semibold bg-cream-200 text-ink-500 border border-ink-200 uppercase tracking-wider">
            Coming soon
          </span>
          <span className="text-[11px] text-ink-400 text-center mt-1 leading-snug">
            JPG, PNG or WebP. Max 5MB.
          </span>
        </div>

        {/* Form */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="full_name"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              defaultValue={profile?.email ?? ""}
              disabled
            />
            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+47 000 00 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Select
              label="Follower Base"
              name="follower_base"
              value={followerBase}
              onChange={(e) => setFollowerBase(e.target.value)}
              options={[
                { value: "",           label: "Select range…"    },
                { value: "0-1k",       label: "0 – 1K"           },
                { value: "1k-10k",     label: "1K – 10K"         },
                { value: "10k-25k",    label: "10K – 25K"        },
                { value: "25k-100k",   label: "25K – 100K"       },
                { value: "100k-500k",  label: "100K – 500K"      },
                { value: "500k+",      label: "500K+"            },
              ]}
            />
          </div>

          {/* Creator Category + Username row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <Select
                label="Creator Category"
                name="category"
                defaultValue={profile?.category ?? "starter"}
                disabled
                options={[
                  { value: "starter",       label: "Starter Creator"       },
                  { value: "growth",        label: "Growth Creator"        },
                  { value: "monetization",  label: "Monetization Creator"  },
                  { value: "scale",         label: "Scale Creator"         },
                ]}
              />
              <div className="mt-1.5 flex items-center gap-1 text-[11.5px] text-ink-400">
                <Info className="size-3 shrink-0" strokeWidth={2} />
                Categories are managed by our team.
              </div>
            </div>

            <div>
              <Input
                label="Username / Handle"
                name="handle"
                placeholder="@yourhandle"
                defaultValue={handle}
                disabled
                hint=""
              />
              {handleLink && (
                <a
                  href={`https://${handleLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 max-w-full text-[11.5px] text-rose-600 hover:text-rose-700 transition-colors"
                >
                  <span className="truncate">{handleLink}</span>
                  <ExternalLink className="size-3 shrink-0" strokeWidth={2} />
                </a>
              )}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-between gap-3 mt-5 flex-wrap sm:flex-nowrap">
            <div className="text-[12.5px] text-rose-700 flex-1 min-w-0">
              {error ?? ""}
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              className={cn("w-full sm:w-auto h-11 sm:h-9 transition-all", saved && "bg-emerald-600 hover:bg-emerald-600")}
            >
              {saved ? (
                <><Check className="size-3.5" strokeWidth={2.5} /> Saved</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Personal Brand / Creator Info
// ─────────────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { key: "instagram", label: "Instagram", Icon: InstagramIcon, color: "text-rose-600",  bg: "bg-rose-100"  },
  { key: "tiktok",    label: "TikTok",    Icon: TiktokIcon,    color: "text-ink-900",   bg: "bg-ink-100"   },
  { key: "youtube",   label: "YouTube",   Icon: YoutubeIcon,   color: "text-rose-600",  bg: "bg-rose-100"  },
] as const;

function CreatorInfoCard({
  profile,
  initialPillars,
  socialAccounts,
}: {
  profile:        ProfileRow;
  initialPillars: string[];
  socialAccounts: SocialAccount[];
}) {
  const [pillars,   setPillars]   = useState<string[]>(initialPillars);
  const [newPillar, setNewPillar] = useState("");
  const [bio,       setBio]       = useState(profile?.main_goal ?? "");
  const [niche,     setNiche]     = useState(profile?.niche     ?? "");
  const [activePlats, setActivePlats] = useState<string[]>(() => {
    const connected = socialAccounts.map((a) => a.platform);
    return profile?.primary_platform
      ? Array.from(new Set([profile.primary_platform, ...connected]))
      : connected;
  });
  const [saved,        setSaved]       = useState(false);
  const [, startTransition]            = useTransition();
  const pillarInputRef = useRef<HTMLInputElement>(null);

  const BIO_LIMIT = 250;

  function addPillar() {
    const trimmed = newPillar.trim();
    if (trimmed && !pillars.includes(trimmed) && pillars.length < 6) {
      setPillars([...pillars, trimmed]);
      setNewPillar("");
      pillarInputRef.current?.focus();
    }
  }

  function removePillar(label: string) {
    setPillars(pillars.filter((p) => p !== label));
  }

  function togglePlatform(key: string) {
    setActivePlats((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveCreatorInfo({
        bio,
        niche,
        primary_platform: activePlats[0] ?? null,
        pillars,
      });
      if (result.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="font-display text-[18px] text-ink-900 mb-5">
        Personal Brand / Creator Info
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 gap-y-5">
        {/* Left column */}
        <div className="space-y-5">
          {/* Content Pillars */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-2">
              Content Pillars
            </label>
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
            <div className="flex items-center gap-2">
              <input
                ref={pillarInputRef}
                type="text"
                placeholder="Add pillar…"
                value={newPillar}
                onChange={(e) => setNewPillar(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPillar(); } }}
                className="h-8 flex-1 px-3 text-[12.5px] rounded-[10px] bg-cream-50 border border-ink-100 focus:outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-100 placeholder:text-ink-300"
              />
              <button
                type="button"
                onClick={addPillar}
                disabled={!newPillar.trim()}
                className="inline-flex items-center gap-1 h-8 px-3 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors disabled:opacity-40"
              >
                <Plus className="size-3.5" strokeWidth={2.5} />
                Add Pillar
              </button>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-2">
              Bio / Creator Description
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
          {/* Preferred Platforms */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-2">
              Preferred Platforms
            </label>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {PLATFORMS.map(({ key, label, Icon, color, bg }) => {
                const active = activePlats.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => togglePlatform(key)}
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
          </div>

          {/* Niche */}
          <div>
            <label className="block text-[13px] font-semibold text-ink-700 mb-2">
              Niche / Audience Focus
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
      <div className="flex mt-5 pt-5 border-t border-ink-100 sm:justify-end">
        <Button
          size="sm"
          onClick={handleSave}
          className={cn("w-full sm:w-auto h-11 sm:h-9 transition-all", saved && "bg-emerald-600 hover:bg-emerald-600")}
        >
          {saved ? (
            <><Check className="size-3.5" strokeWidth={2.5} /> Saved</>
          ) : (
            "Save Creator Info"
          )}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Security
// ─────────────────────────────────────────────────────────────────────────────

function SecurityCard({ profile }: { profile: ProfileRow }) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwPending, startPwTransition] = useTransition();

  function handleChangePassword() {
    setPwError("");
    setPwSuccess(false);
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match.");
      return;
    }
    startPwTransition(async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwError(error.message);
      } else {
        setPwSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => { setChangingPassword(false); setPwSuccess(false); }, 2000);
      }
    });
  }

  const rows = [
    {
      icon: <Lock className="size-4 text-ink-500" strokeWidth={1.8} />,
      label: "Password",
      action: (
        <span
          onClick={() => { setChangingPassword((o) => !o); setPwError(""); setPwSuccess(false); }}
          className="text-[13px] font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
        >
          {changingPassword ? "Cancel" : "Change Password"}
        </span>
      ),
    },
    {
      icon: <Shield className="size-4 text-ink-500" strokeWidth={1.8} />,
      label: "Two-Factor Authentication",
      action: (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
          Enabled <CheckCircle2 className="size-4" strokeWidth={2} />
        </span>
      ),
    },
    {
      icon: <Mail className="size-4 text-ink-500" strokeWidth={1.8} />,
      label: "Email Verification",
      action: (
        <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
          Verified <CheckCircle2 className="size-4" strokeWidth={2} />
        </span>
      ),
    },
    {
      icon: <Smartphone className="size-4 text-ink-500" strokeWidth={1.8} />,
      label: "Login Sessions",
      action: (
        <span className="text-[13px] font-medium text-ink-500">
          3 active sessions
        </span>
      ),
    },
    // ── My Support Tickets ────────────────────────────────────────────
    // The only row in this card that's an actual navigation today — the
    // others are visual placeholders waiting on a real backend. We still
    // render it inside Security because the user-facing mental model is
    // "things tied to my account" and tickets live there.
    {
      icon: <LifeBuoy className="size-4 text-ink-500" strokeWidth={1.8} />,
      label: "My Support Tickets",
      href:  "/support/tickets",
      action: (
        <span className="text-[13px] font-semibold text-rose-600 group-hover:text-rose-700 transition-colors">
          View tickets
        </span>
      ),
    },
  ];

  return (
    <div className="card p-5">
      <h2 className="font-display text-[17px] text-ink-900 mb-4">Security</h2>
      <div className="divide-y divide-ink-100">
        {rows.map(({ icon, label, action, href }) => {
          // Inner content is identical for both the static and navigable
          // variants — we just swap the outer wrapper so rows with an href
          // are real <Link>s (keyboard-focusable, right-clickable, etc.)
          // while the placeholder rows stay as plain divs.
          const inner = (
            <>
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-[10px] bg-cream-100 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <span className="text-[13.5px] font-medium text-ink-800">{label}</span>
              </div>
              <div className="flex items-center gap-2">
                {action}
                <ArrowRight className="size-4 text-ink-300 group-hover:text-ink-500 transition-colors" strokeWidth={2} />
              </div>
            </>
          );

          const baseClasses =
            "flex items-center justify-between py-3.5 cursor-pointer group";

          return href ? (
            <Link
              key={label}
              href={href}
              className={cn(
                baseClasses,
                "rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-200",
              )}
            >
              {inner}
            </Link>
          ) : (
            <div key={label}>
              <div className={baseClasses}>
                {inner}
              </div>
              {label === "Password" && changingPassword && (
                <div className="pb-4 space-y-3">
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-10 px-3 rounded-[10px] border border-ink-200 bg-white text-[13.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                  {pwError && (
                    <p className="text-[12px] text-rose-600">{pwError}</p>
                  )}
                  {pwSuccess && (
                    <p className="text-[12px] text-emerald-600 font-medium">Password updated!</p>
                  )}
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={pwPending}
                    className="h-9 px-4 rounded-[10px] bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white text-[13px] font-medium transition-colors"
                  >
                    {pwPending ? "Saving…" : "Update Password"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Notification Preferences
// ─────────────────────────────────────────────────────────────────────────────

const NOTIF_ROWS = [
  {
    key:   "email_digest"          as keyof NotificationPreferences,
    label: "Email updates & newsletters",
    desc:  "Receive important updates and news.",
  },
  {
    key:   "inapp_tasks"           as keyof NotificationPreferences,
    label: "Task reminders",
    desc:  "Get reminded about your tasks and goals.",
  },
  {
    key:   "inapp_events"          as keyof NotificationPreferences,
    label: "Posting plan alerts",
    desc:  "Alerts for scheduled posts and plan changes.",
  },
  {
    key:   "inapp_community"       as keyof NotificationPreferences,
    label: "Coach messages",
    desc:  "Get notified when your coach replies.",
  },
  {
    key:   "email_product_updates" as keyof NotificationPreferences,
    label: "Product announcements",
    desc:  "New programs, features, and offers.",
  },
];

function NotificationPrefsCard({ preferences }: { preferences: NotificationPreferences }) {
  const [prefs, setPrefs]       = useState(preferences);
  const [, startTransition]     = useTransition();

  function toggle(key: keyof NotificationPreferences) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated as NotificationPreferences);
    startTransition(async () => {
      await saveNotificationPreferences({ [key]: updated[key as keyof typeof updated] });
    });
  }

  return (
    <div className="card p-5">
      <h2 className="font-display text-[17px] text-ink-900 mb-4">
        Notification Preferences
      </h2>
      <div className="space-y-0">
        {NOTIF_ROWS.map(({ key, label, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4 py-3.5 border-b border-ink-50 last:border-0">
            <div className="flex items-start gap-3 min-w-0">
              <div className="size-8 rounded-[10px] bg-cream-100 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="size-4 text-ink-400" strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-ink-800 leading-snug">{label}</div>
                <div className="text-[12px] text-ink-400 leading-snug mt-0.5">{desc}</div>
              </div>
            </div>
            <Toggle
              checked={!!prefs[key]}
              onChange={() => toggle(key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toggle switch
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2",
        checked ? "bg-rose-500" : "bg-ink-200",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Completion (shared by rail + inline mobile/tablet)
// ─────────────────────────────────────────────────────────────────────────────

function CompletionCard({
  completion,
}: {
  completion: { percent: number; items: { label: string; done: boolean }[] };
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[13px] font-semibold text-ink-900">Profile Completion</h3>
        <span className="text-[13px] font-bold text-rose-600">{completion.percent}%</span>
      </div>
      <div className="h-2 rounded-full bg-cream-200 overflow-hidden mb-2">
        <div
          className="h-full rounded-full bg-rose-500 transition-all duration-500"
          style={{ width: `${completion.percent}%` }}
        />
      </div>
      <p className="text-[12px] text-ink-500 mb-3">
        {completion.percent >= 80 ? "Great progress! Keep it up." : "Complete your profile to get better results."}
      </p>
      <div className="space-y-2">
        {completion.items.map(({ label, done }) => (
          <div key={label} className="flex items-center gap-2">
            {done ? (
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" strokeWidth={2} />
            ) : (
              <Circle className="size-4 text-ink-300 shrink-0" strokeWidth={1.5} />
            )}
            <span className={cn("text-[12.5px]", done ? "text-ink-700" : "text-ink-400")}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Right rail
// ─────────────────────────────────────────────────────────────────────────────

function SettingsRail({
  profile,
  instagram,
  tiktok,
  youtube,
  completion,
}: {
  profile:    ProfileRow;
  instagram?: SocialAccount;
  tiktok?:    SocialAccount;
  youtube?:   SocialAccount;
  completion: { percent: number; items: { label: string; done: boolean }[] };
}) {
  const plan = (profile?.plan ?? "free") as "free" | "basic" | "pro";
  const categoryLabel =
    profile?.category === "growth"       ? "Growth Creator"        :
    profile?.category === "monetization" ? "Monetization Creator"  :
    profile?.category === "scale"        ? "Scale Creator"         :
    "Starter Creator";

  return (
    <aside className="hidden xl:flex flex-col w-[300px] shrink-0 h-screen sticky top-0 border-l border-ink-100 bg-cream-100 overflow-y-auto">
      <div className="p-5 space-y-4">
        {/* Profile Summary */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-ink-900 mb-4">Profile Summary</h3>
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              name={profile?.full_name ?? profile?.display_name ?? "U"}
              src={profile?.avatar_url ?? undefined}
              size={48}
            />
            <div className="min-w-0">
              <div className="text-[14px] font-semibold text-ink-900 truncate">
                {profile?.full_name ?? profile?.display_name ?? "Your Name"}
              </div>
              <div className="text-[12px] text-ink-500 truncate">{profile?.email}</div>
              {profile?.phone && (
                <div className="text-[12px] text-ink-500">{profile.phone}</div>
              )}
            </div>
          </div>
          <Link
            href="/profile"
            className="w-full h-9 rounded-[10px] bg-white border border-ink-200 text-[12.5px] font-medium text-ink-700 hover:bg-cream-100 transition-colors flex items-center justify-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2"
          >
            View Public Profile
            <ExternalLink className="size-3.5" strokeWidth={2} aria-hidden />
          </Link>
        </div>

        {/* Social & Audience Snapshot */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-ink-900 mb-4">
            Social &amp; Audience Snapshot
          </h3>
          <div className="space-y-3">
            <SocialRow
              icon={<InstagramIcon size={16} className="text-rose-600" />}
              iconBg="bg-rose-100"
              platform="Instagram"
              count={instagram?.follower_count}
              unit="Followers"
            />
            <SocialRow
              icon={<TiktokIcon size={16} className="text-ink-900" />}
              iconBg="bg-ink-100"
              platform="TikTok"
              count={tiktok?.follower_count}
              unit="Followers"
            />
            <SocialRow
              icon={<YoutubeIcon size={16} className="text-rose-600" />}
              iconBg="bg-rose-100"
              platform="YouTube"
              count={youtube?.follower_count}
              unit="Subscribers"
            />
          </div>
          <Link
            href="/performance"
            className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            View full analytics <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>

        {/* Profile Completion */}
        <CompletionCard completion={completion} />

        {/* Current Category */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-[10px] bg-amber-50 flex items-center justify-center shrink-0">
              <Crown className="size-4 text-gold-500" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold text-ink-900">Current Category</span>
                <Info className="size-3.5 text-ink-400" strokeWidth={2} />
              </div>
              <span className="text-[12.5px] text-rose-600 font-semibold">{categoryLabel}</span>
              <div className="text-[11.5px] text-ink-400 mt-0.5">Managed by our team</div>
            </div>
          </div>
        </div>

        {/* Your Plan */}
        <div className="card p-5">
          <h3 className="text-[13px] font-semibold text-ink-900 mb-1">Your Plan</h3>
          <div className="flex items-baseline justify-between mb-1">
            <span className="font-display text-[22px] text-ink-900 capitalize">{plan}</span>
            <span className="text-[13px] text-ink-500">
              {plan === "pro" ? "1 499 kr/month" : plan === "basic" ? "999 kr/month" : "Free"}
            </span>
          </div>
          <p className="text-[12px] text-ink-500 leading-snug mb-4">
            {plan === "pro"
              ? "Full access to every program, coaching, and Pro tools."
              : plan === "basic"
              ? "Grow your brand with core tools and community access."
              : "Get started with free programs and basic missions."}
          </p>
          {plan !== "pro" && (
            <Link href="/billing?upgrade=pro">
              <Button size="sm" className="w-full mb-3">
                Upgrade to Pro
              </Button>
            </Link>
          )}
          <Link
            href="/billing"
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Compare all features <ArrowRight className="size-3.5" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </aside>
  );
}

function SocialRow({
  icon,
  iconBg,
  platform,
  count,
  unit,
}: {
  icon:     React.ReactNode;
  iconBg:   string;
  platform: string;
  count?:   number;
  unit:     string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("size-8 rounded-[10px] flex items-center justify-center shrink-0", iconBg)}>
        {icon}
      </div>
      <span className="flex-1 text-[13px] font-medium text-ink-800">{platform}</span>
      <span className="text-[13px] font-semibold text-ink-900 tabular-nums">
        {count ? formatCompact(count) : "—"}
      </span>
      <span className="text-[12px] text-ink-400">{unit}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function computeCompletion(
  profile:        ProfileRow,
  pillars:        string[],
  socialAccounts: SocialAccount[],
) {
  const items = [
    { label: "Profile information",       done: !!(profile?.full_name && profile?.phone) },
    { label: "Bio & content pillars",     done: pillars.length > 0 },
    { label: "Preferred platforms",       done: !!(profile?.primary_platform || socialAccounts.length > 0) },
    { label: "Connect more social accounts", done: socialAccounts.length >= 2 },
  ];
  const done    = items.filter((i) => i.done).length;
  const percent = Math.round((done / items.length) * 100);
  return { percent, items };
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1).replace(/\.0$/, "")     + "K";
  return n.toString();
}
