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
  | "program_name"
  | "cta_link"
  | "platform_name";

export type EmailVariable = {
  key: EmailVariableKey;
  label: string;
  code: string;     // exactly what gets inserted into the text
  example: string;  // used for preview rendering
};

export const EMAIL_VARIABLES: EmailVariable[] = [
  { key: "first_name",    label: "First name",    code: "{{ first_name }}",    example: "Emma" },
  { key: "full_name",     label: "Full name",     code: "{{ full_name }}",     example: "Emma Larsen" },
  { key: "program_name",  label: "Program name",  code: "{{ program_name }}",  example: "Starter Creator" },
  { key: "cta_link",      label: "CTA link",      code: "{{ cta_link }}",      example: "https://creatorgrowth.app/dashboard" },
  { key: "platform_name", label: "Platform name", code: "{{ platform_name }}", example: "Creator Growth OS" },
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
