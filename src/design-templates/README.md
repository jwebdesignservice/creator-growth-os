# Design Templates

A staging area for new design ideas — buttons, cards, icon treatments, KPI
tiles, anything else — that you want to iterate on **without affecting the
live app**.

## Workflow

1. **Add or edit a template** in a file under this folder (e.g.
   `buttons.tsx`, `cards.tsx`, or create a new file).
   - Each template is just an exported React component.
   - Use Tailwind classes, the project's design tokens (`bg-rose-600`,
     `text-ink-900`, `text-h1`, etc.), and lucide icons like the rest of
     the app.
   - Keep templates **pure presentational** — no data fetching, no
     server actions. State is fine for interactive demos (hover, active).

2. **Register it in the gallery** — open `src/app/design/page.tsx` and
   add an entry to the `TEMPLATES` array. The gallery renders every
   entry side-by-side under a heading so you can compare variants
   quickly.

3. **Preview at** [`/design`](http://localhost:8080/design) (admin-only,
   not linked from the sidebar). The page hot-reloads on every save.

4. **Graduate a template** into the real app when it's ready:
   - Move/copy the component into a proper component path
     (`src/components/<area>/<name>.tsx`).
   - Import it from the live page that should use it.
   - Optionally delete the template here if it was a one-shot.
   - The template files here remain — they're not connected to
     anything live, so leaving experiments around is fine.

## Conventions

- **One file per category** is the default (`buttons.tsx`, `cards.tsx`),
  but feel free to split into per-variant files
  (`buttons/primary.tsx`, `buttons/danger.tsx`) once a category grows.
- **Export multiple variants per file** — e.g. `PrimaryButton`,
  `SecondaryButton`, `GhostButton` from `buttons.tsx`.
- **Add a `displayName` or comment** at the top of each component so
  the gallery can label it.
- **No `"use server"`** in this folder. These are visual templates.

## Why this exists

The live app has a lot of components in different visual states. New
design ideas should be sketched and iterated in isolation before being
applied broadly — otherwise every redesign requires touching dozens of
live pages at once and risks regressions. This folder is the sketchpad.
