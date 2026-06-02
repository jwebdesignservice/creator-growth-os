/* Email Designs ─────────────────────────────────────────────────────────
   Schematic templates for the transactional + campaign emails the product
   sends (welcome, weekly digest, receipt, notification, password reset,
   announcement). Rendered as narrow email-client previews in the app's own
   tokens. Exported as a gallery category and re-spread via
   PAGE_DESIGN_CATEGORIES, so the gallery needs no extra wiring.
   ───────────────────────────────────────────────────────────────────── */

import type { ReactNode } from "react";
import { Mail, type LucideIcon } from "lucide-react";

/* ── Email shell primitives ───────────────────────────────────────────── */

function EmailFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[420px] rounded-[14px] bg-cream-100 border border-ink-100 p-4">
      <div className="rounded-[10px] bg-white border border-ink-100 overflow-hidden shadow-sm">
        {children}
      </div>
    </div>
  );
}

function EmailHeader() {
  return (
    <div className="flex items-center justify-center py-3 border-b border-ink-100 bg-cream-50">
      <div className="size-6 rounded-[6px] bg-rose-400" />
    </div>
  );
}

function EmailFooter() {
  return (
    <div className="px-4 py-2.5 border-t border-ink-100 bg-cream-50 flex flex-col items-center gap-1">
      <div className="h-1.5 w-24 rounded bg-ink-100" />
      <div className="h-1.5 w-16 rounded bg-ink-100" />
    </div>
  );
}

/* ── Templates ────────────────────────────────────────────────────────── */

function WelcomeEmail() {
  return (
    <EmailFrame>
      <EmailHeader />
      <div className="p-4 space-y-2">
        <div className="h-3 w-2/3 rounded bg-ink-300" />
        <div className="h-2 rounded bg-ink-100" />
        <div className="h-2 rounded bg-ink-100" />
        <div className="h-2 w-3/4 rounded bg-ink-100" />
        <div className="h-8 w-28 rounded-lg bg-rose-400 mt-1.5" />
      </div>
      <EmailFooter />
    </EmailFrame>
  );
}

function DigestEmail() {
  return (
    <EmailFrame>
      <EmailHeader />
      <div className="p-4 space-y-2.5">
        <div className="h-3 w-1/2 rounded bg-ink-300" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-cream-100 border border-ink-100" />
          ))}
        </div>
        <div className="h-2 rounded bg-ink-100" />
        <div className="h-2 w-2/3 rounded bg-ink-100" />
        <div className="h-8 w-32 rounded-lg bg-rose-400 mt-1" />
      </div>
      <EmailFooter />
    </EmailFrame>
  );
}

function ReceiptEmail() {
  return (
    <EmailFrame>
      <EmailHeader />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/3 rounded bg-ink-300" />
        <div className="space-y-1.5 pt-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-2 w-1/2 rounded bg-ink-100" />
              <div className="h-2 w-10 rounded bg-ink-100" />
            </div>
          ))}
        </div>
        <div className="border-t border-ink-100 pt-1.5 flex justify-between">
          <div className="h-2.5 w-12 rounded bg-ink-300" />
          <div className="h-2.5 w-12 rounded bg-rose-300" />
        </div>
      </div>
      <EmailFooter />
    </EmailFrame>
  );
}

function NotificationEmail() {
  return (
    <EmailFrame>
      <EmailHeader />
      <div className="p-4 flex flex-col items-center text-center gap-2">
        <div className="size-9 rounded-full bg-rose-100" />
        <div className="h-2.5 w-2/3 rounded bg-ink-300" />
        <div className="h-2 w-3/4 rounded bg-ink-100" />
        <div className="h-8 w-28 rounded-lg bg-rose-400 mt-1.5" />
      </div>
      <EmailFooter />
    </EmailFrame>
  );
}

function PasswordResetEmail() {
  return (
    <EmailFrame>
      <EmailHeader />
      <div className="p-4 space-y-2">
        <div className="h-3 w-1/2 rounded bg-ink-300" />
        <div className="h-2 rounded bg-ink-100" />
        <div className="h-2 w-2/3 rounded bg-ink-100" />
        <div className="h-9 rounded-lg bg-rose-400 mt-1.5" />
        <div className="h-1.5 w-3/4 rounded bg-ink-100 mt-1.5" />
      </div>
      <EmailFooter />
    </EmailFrame>
  );
}

function AnnouncementEmail() {
  return (
    <EmailFrame>
      <div className="h-20 bg-gradient-to-br from-rose-300 via-rose-200 to-cream-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-3/4 rounded bg-ink-300" />
        <div className="h-2 rounded bg-ink-100" />
        <div className="h-2 w-2/3 rounded bg-ink-100" />
        <div className="h-8 w-32 rounded-lg bg-rose-400 mt-1.5" />
      </div>
      <EmailFooter />
    </EmailFrame>
  );
}

/* ── Gallery category export ──────────────────────────────────────────── */

type EmailCategory = {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  items: { label: string; code: string; node: ReactNode }[];
};

export const EMAIL_DESIGN_CATEGORIES: EmailCategory[] = [
  {
    id: "email-designs",
    label: "Email Designs",
    icon: Mail,
    blurb: "Transactional & campaign email templates.",
    items: [
      { label: "Welcome", code: "WelcomeEmail", node: <WelcomeEmail /> },
      { label: "Weekly digest", code: "DigestEmail", node: <DigestEmail /> },
      { label: "Receipt / invoice", code: "ReceiptEmail", node: <ReceiptEmail /> },
      { label: "Notification", code: "NotificationEmail", node: <NotificationEmail /> },
      { label: "Password reset", code: "PasswordResetEmail", node: <PasswordResetEmail /> },
      { label: "Announcement", code: "AnnouncementEmail", node: <AnnouncementEmail /> },
    ],
  },
];
