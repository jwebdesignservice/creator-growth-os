/**
 * Shared values for the Create-New wizard.
 *
 * Lives in its own (non-"use client") file so that the server page
 * (`page.tsx`) can read `WIZARD_TYPES` directly. Exporting plain
 * constants from a "use client" module turns them into client-only
 * references on the server, which is why `WIZARD_TYPES.includes(...)`
 * blew up when imported from `wizard.tsx`.
 */
export const WIZARD_TYPES = ["program", "video", "task", "posting-plan"] as const;
export type WizardType = (typeof WIZARD_TYPES)[number];
