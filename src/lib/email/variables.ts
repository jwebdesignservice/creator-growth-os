/**
 * Variables admins can drop into the subject / body of a campaign email.
 *
 * `code` is the literal token an admin inserts (also what the message
 * persists as). `substituteVariables` walks every `{{ key }}` in a string
 * and swaps in the matching context value, or "" when the key is missing.
 * Lives in the shared lib so the client (preview, inserter) and the
 * server (send action) work off the exact same list.
 */
export type EmailVariableKey =
  | "first_name"
  | "full_name"
  | "email"
  | "plan_name"
  | "program_name"
  | "cta_link"
  | "platform_name"
  | "sender_name"
  | "current_date"
  | "custom_field";

export type EmailVariable = {
  key: EmailVariableKey;
  label: string;
  code: string;     // exactly what gets inserted into the text
  example: string;  // used for preview rendering
  /** Short freeform note shown in the variables modal — explains intent
   *  when the label alone isn't enough (e.g. compliance, custom slot). */
  description?: string;
};

export const EMAIL_VARIABLES: EmailVariable[] = [
  /* — Recipient identity ————————————————————————————————————————————— */
  { key: "first_name",    label: "First name",    code: "{{ first_name }}",    example: "Emma" },
  { key: "full_name",     label: "Full name",     code: "{{ full_name }}",     example: "Emma Larsen" },
  { key: "email",         label: "Email",         code: "{{ email }}",         example: "emma.larsen@example.com",
    description: "The recipient's email address." },
  { key: "plan_name",     label: "Plan",          code: "{{ plan_name }}",     example: "Pro",
    description: "Free, Basic, or Pro — useful for tier-targeted copy." },

  /* — Context ——————————————————————————————————————————————————————— */
  { key: "program_name",  label: "Program name",  code: "{{ program_name }}",  example: "Starter Creator" },
  { key: "cta_link",      label: "CTA link",      code: "{{ cta_link }}",      example: "https://creatorgrowth.app/dashboard" },
  { key: "platform_name", label: "Platform name", code: "{{ platform_name }}", example: "Profluencer" },

  /* — Sender + send-time —————————————————————————————————————————————— */
  { key: "sender_name",   label: "Sender name",   code: "{{ sender_name }}",   example: "Deividas Burkauskas",
    description: "Name of the admin sending this campaign — great for signatures." },
  { key: "current_date",  label: "Today's date",  code: "{{ current_date }}",  example: "May 27, 2026",
    description: "Filled with the date the email is sent." },

  /* — Custom slot ——————————————————————————————————————————————————— */
  { key: "custom_field",  label: "Custom field",  code: "{{ custom_field }}",  example: "Your custom value",
    description: "A free-form token you can swap in per campaign before sending." },
];

export type VariableContext = Partial<Record<EmailVariableKey, string>>;

/** Replace every `{{ key }}` token with its context value, or "" when absent. */
export function substituteVariables(input: string, ctx: VariableContext): string {
  return input.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, name: string) => {
    const v = ctx[name as EmailVariableKey];
    return v ?? "";
  });
}

/** Build a preview context that fills every known variable with its example value. */
export function previewContext(): VariableContext {
  const ctx: VariableContext = {};
  for (const v of EMAIL_VARIABLES) ctx[v.key] = v.example;
  return ctx;
}
