# Creator Growth OS

> "How To Become A Successful Social Media Influencer"
> A personalized creator growth platform — daily missions, posting plans, programs, performance tracking and monetization path.

Built per **Project Brief V3 — Ultimate Scope**.

---

## 🚀 Run it

```bash
cd web
npm install   # already done
npm run dev   # http://localhost:3000
```

You'll be redirected to `/sign-in`. Sign up → onboarding stub → dashboard.

---

## 🗃️ One-time Supabase setup

The schema is checked in at `supabase/migrations/0001_init.sql` (~350 lines). It's idempotent — safe to re-run.

1. Open https://app.supabase.com/project/mierwogzdiplwpksaoka/sql/new
2. Paste the entire contents of `supabase/migrations/0001_init.sql`
3. Click **Run** (takes ~5 seconds)
4. (Optional, dev only) **Authentication → Providers → Email**: toggle off "Confirm email" to skip the confirmation step while you're testing

The trigger `on_auth_user_created` automatically creates a `profiles` row and a `subscriptions` row whenever a new auth user signs up.

To grant yourself admin access:
```sql
insert into public.admin_users (user_id) values ('YOUR_USER_UUID');
```
(Find your UUID under Supabase **Authentication → Users**.)

---

## 🧱 What's built

### Phase 0 — Foundation ✅
- Next.js 16 + React 19 + TypeScript + Tailwind v4
- Supabase auth (email/password) with SSR cookies
- Brand theme (cream + dusty rose) matching the 8 design comps
- Fonts: Cormorant Garamond (display), DM Sans (body), Caveat (script)
- Design tokens (CSS vars) + reusable Button/Input/Card primitives
- Crown-M brand mark from the design comps

### Phase 1 — Auth & Account ✅
- `/sign-in`, `/sign-up`, `/forgot-password` with premium two-column auth layout
- Server-action auth (`signInWithPassword`, `signUpWithPassword`, `requestPasswordReset`, `signOut`)
- Proxy/middleware protecting all `(app)` routes; redirects authed users away from auth routes
- Email confirmation callback at `/auth/callback`

### Phase 2 — App shell + Dashboard ✅ (matches design comps 1:1)
- Left sidebar: logo lockup + nav (Dashboard / Programs / Tutorials / Posting Plans / Tasks (badge 6) / Performance / Community / Profile / Billing / Settings) + Upgrade-to-Pro card
- Top bar: search, notifications bell with red dot, mail, calendar, profile chip
- Right rail (336 px): profile chip, profile card with social stats, profile completion progress, coach message, category card, plan card
- Dashboard hero ("Let's turn your influence into impact and income.") with coach avatar + handwritten "Your Coach, Sophie ♥"
- 5 KPI cards: Program Progress (donut), Daily Streak (flame), Videos Watched, Weekly Progress (▲18%), Tasks Completed
- Your Programs row (4 cards with status pills + progress + Pro lock)
- Continue Learning + Today's Plan (interactive checkbox toggle) + Upcoming Content (day strip)
- Performance Overview: 4 metric tiles with sparklines + platform-mix donut

### Phase 3 — Other nav pages (stubs) ✅
Routes exist and navigate cleanly, with "Coming up next" placeholders describing the build scope from V3 brief:
`/programs`, `/tutorials`, `/posting`, `/missions`, `/performance`, `/community`, `/monetization`, `/profile`, `/billing`, `/settings`

`/onboarding` has a "Continue to Dashboard" CTA so you can preview the dashboard immediately.

---

## 🛣️ Phased roadmap (next sessions)

### Phase 4 — Onboarding quiz
8-step quiz wired to `profiles` columns (primary_platform, follower_base, niche, main_goal, bottleneck, time_per_week, content_frequency, monetization_status, confidence_score). Auto-assigns category from rules in `lib/brand.ts`.

### Phase 5 — Content surfaces
Programs library, Tutorial library + detail page, Missions list, Posting Plan calendar — all reading from Supabase tables (already seeded with 4 programs + 6 mission templates).

### Phase 6 — Performance tracker
Weekly entry form + manual metrics dashboard + best-post / lesson-learned journal.

### Phase 7 — Plans, gating & Stripe
- Real subscription rows + plan-gated routes
- Stripe checkout for Basic (999 NOK/month) and Pro (1499 NOK/month)
- Upgrade page with benefit-led copy

### Phase 8 — Admin
`/admin/*` routes for user management, category assignment, mission templates, posting-plan templates, broadcast messages, content review queue.

### Phase 9 — QA + polish
Responsive pass, accessibility audit, real images for hero/programs, coach photo upload, branded email templates.

---

## 🎨 Design system reference

| Token | Value |
|---|---|
| Primary action | `rose-600` `#B9485C` |
| Primary action hover | `rose-700` `#97384A` |
| Soft pink panel | `rose-100` `#F7E1DC` |
| Cream page bg | `cream-100` `#FAF6F2` |
| Hero card bg | `cream-200` `#F4ECE3` |
| Ink (text) | `ink-900` `#1A1816` |
| Ink muted | `ink-500` `#756E66` |
| Success | `#3DA862` |
| Card radius | 16 px |
| Card shadow | `0 1px 2px / 0 6px 16px` soft |

Display headings: Cormorant Garamond 500 (`font-display` class).
Body: DM Sans 400/500/600.
Coach signature: Caveat (`font-script` class).

---

## 📂 Project layout

```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # /sign-in, /sign-up, /forgot-password
│   │   │   ├── layout.tsx       # 2-column auth shell
│   │   │   └── actions.ts       # server actions
│   │   ├── (app)/               # all authenticated pages
│   │   │   ├── layout.tsx       # sidebar + topbar + right-rail shell
│   │   │   ├── dashboard/       # ⭐ pixel-matched dashboard
│   │   │   └── …                # programs/tutorials/posting/etc stubs
│   │   ├── auth/callback/       # email confirmation OAuth callback
│   │   ├── globals.css          # design tokens + base styles
│   │   └── layout.tsx           # root, fonts
│   ├── components/
│   │   ├── app-shell/           # sidebar / topbar / right-rail
│   │   ├── dashboard/           # hero / kpi / programs-row / etc
│   │   ├── ui/                  # button, input
│   │   ├── brand-mark.tsx
│   │   ├── brand-icons.tsx      # Instagram/TikTok/YouTube inline SVGs
│   │   └── page-stub.tsx
│   ├── lib/
│   │   ├── supabase/            # client / server / middleware (proxy)
│   │   ├── brand.ts             # BRAND_NAME, PLAN_PRICES, CATEGORIES
│   │   └── cn.ts
│   └── proxy.ts                 # Next 16 proxy (replaces middleware)
└── supabase/
    └── migrations/
        └── 0001_init.sql        # one-time schema setup
```

---

## ⚠️ Notes & judgment calls I made

1. **Supabase MCP wasn't connected to this project**, so the schema is a SQL file you paste once. Future migrations should also live under `supabase/migrations/` (e.g. `0002_*.sql`) and be pasted into the SQL Editor.
2. **Coach photo** in the dashboard hero is a placeholder avatar. Plug in a real upload via admin in a later phase.
3. **Email confirmation** is on by default in Supabase — toggle off in dev or check inbox to confirm.
4. **lucide-react v1.16** removed brand icons (Instagram/TikTok/YouTube). I shipped inline SVGs at `components/brand-icons.tsx`.
5. **Brief §31 says "dark, premium, modern interface"** but your 8 design comps are light cream + rose. You said "1:1 with the images", so I followed the images. All colors are CSS variables — flipping themes later is a one-file change in `globals.css`.
6. **Stack: Next.js 16 (App Router) + Supabase + Tailwind v4 + Stripe (later).** Per V3 §35, this is the standard winning combo for a membership platform with payments + RLS + admin needs.

Build artifact stats: 18 routes, all typecheck clean, build clean, no console errors on initial render.
