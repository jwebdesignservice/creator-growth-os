/**
 * Community event types — shared by the admin create form (the <select>) and
 * the members' Events cards (the type badge) so the two never drift. Plain
 * module, no server imports — safe for client + server.
 */
export const EVENT_KINDS = [
  { value: "live", label: "Live Session" },
  { value: "qa", label: "Q&A" },
  { value: "workshop", label: "Workshop" },
  { value: "call", label: "Group Call" },
  { value: "other", label: "Event" },
] as const;

export type EventKind = (typeof EVENT_KINDS)[number]["value"];

export const EVENT_KIND_VALUES: string[] = EVENT_KINDS.map((k) => k.value);

export function eventKindLabel(value: string | null | undefined): string {
  return EVENT_KINDS.find((k) => k.value === value)?.label ?? "Event";
}
