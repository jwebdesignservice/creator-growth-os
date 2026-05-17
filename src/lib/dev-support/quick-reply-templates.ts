/* ─────────────────────────────────────────────────────────────────────────
   Canned reply / internal-note templates for the dev support composer.

   These are intentionally generic — they read as a starting point that
   the agent will tailor before sending, not as a one-click "Send" macro.

   Tokens like `{client}` are NOT interpolated yet — the composer just
   inserts the raw body into the textarea so the agent sees and edits
   them. A later pass can introduce a templating step server-side.

   When you want to extend / re-order: keep `key` stable so a future
   "favourites" feature can persist per-user preferences.
   ───────────────────────────────────────────────────────────────────────── */

export type ReplyTemplateKind = "reply" | "note";

export type ReplyTemplate = {
  key:        string;        // stable identifier for analytics / favourites
  label:      string;        // short label shown in the dropdown
  blurb?:     string;        // optional preview line under the label
  kind:       ReplyTemplateKind; // "reply" → client-facing · "note" → internal
  body:       string;        // text inserted into the composer
};

/* Group templates by "what stage of the conversation am I at?" so the
 * dropdown structure mirrors how support agents think. */
export type ReplyTemplateGroup = {
  groupKey:   string;
  groupLabel: string;
  templates:  ReplyTemplate[];
};

export const REPLY_TEMPLATE_GROUPS: ReplyTemplateGroup[] = [
  {
    groupKey:   "acknowledge",
    groupLabel: "Acknowledgement",
    templates: [
      {
        key:   "ack-thanks",
        label: "Thanks — taking a look",
        blurb: "Confirm receipt and set expectations.",
        kind:  "reply",
        body:
          "Hi {client},\n\n" +
          "Thanks for reaching out — we've got your request and a team member " +
          "is taking a look right now. We'll follow up as soon as we have " +
          "something concrete to share.\n\n" +
          "Best,\nSupport",
      },
      {
        key:   "ack-investigating",
        label: "Investigating, will update shortly",
        kind:  "reply",
        body:
          "Hi {client},\n\n" +
          "Quick note — we're investigating the issue you reported. I expect " +
          "to have an update for you within the next few hours.\n\n" +
          "Best,\nSupport",
      },
    ],
  },
  {
    groupKey:   "need-info",
    groupLabel: "Need more info",
    templates: [
      {
        key:   "info-steps",
        label: "Ask for reproduction steps",
        kind:  "reply",
        body:
          "Hi {client},\n\n" +
          "To dig into this faster, could you walk us through the exact steps " +
          "you took? Specifically:\n\n" +
          "1. What page were you on?\n" +
          "2. What did you click?\n" +
          "3. What error / behaviour did you see?\n\n" +
          "A screenshot of the network tab (browser dev tools) helps too.\n\n" +
          "Best,\nSupport",
      },
      {
        key:   "info-env",
        label: "Ask for browser + device",
        kind:  "reply",
        body:
          "Hi {client},\n\n" +
          "Can you let us know which browser and operating system you're using, " +
          "and whether the issue happens in a private / incognito window?\n\n" +
          "Best,\nSupport",
      },
    ],
  },
  {
    groupKey:   "resolution",
    groupLabel: "Resolution",
    templates: [
      {
        key:   "res-fixed",
        label: "Fixed — please verify",
        kind:  "reply",
        body:
          "Hi {client},\n\n" +
          "We've pushed a fix for the issue. Could you give it another try " +
          "and let us know if you're still seeing the problem? A hard refresh " +
          "(Cmd/Ctrl+Shift+R) may help.\n\n" +
          "Best,\nSupport",
      },
      {
        key:   "res-workaround",
        label: "Workaround available",
        kind:  "reply",
        body:
          "Hi {client},\n\n" +
          "While we finalise the fix, here's a workaround you can use in the " +
          "meantime:\n\n" +
          "•  [step 1]\n" +
          "•  [step 2]\n\n" +
          "We'll close the loop once the permanent fix ships.\n\n" +
          "Best,\nSupport",
      },
      {
        key:   "res-closing",
        label: "Closing the ticket",
        kind:  "reply",
        body:
          "Hi {client},\n\n" +
          "Glad we could get that sorted. I'll mark this ticket as resolved — " +
          "feel free to reply on the same thread if anything else comes up.\n\n" +
          "Best,\nSupport",
      },
    ],
  },
  {
    groupKey:   "internal",
    groupLabel: "Internal notes",
    templates: [
      {
        key:   "note-handover",
        label: "Hand over to another team",
        kind:  "note",
        body:
          "Handing over to @[team] — the client is hitting [issue]. Repro " +
          "steps and relevant logs are above. Priority: [low/med/high]. " +
          "Please confirm receipt and ETA.",
      },
      {
        key:   "note-rootcause",
        label: "Root cause draft",
        kind:  "note",
        body:
          "Suspected root cause: [hypothesis]\n" +
          "Affected service: [service]\n" +
          "Confirmed via: [log query / repro]\n" +
          "Fix owner: @[name]\n" +
          "Next step: [action]",
      },
      {
        key:   "note-followup",
        label: "Schedule a follow-up",
        kind:  "note",
        body:
          "Following up in 24h if the client doesn't respond. Auto-resolve " +
          "after 5 business days of inactivity per the SLA policy.",
      },
    ],
  },
];

/** Flat list of every template — useful for fuzzy-search-style pickers. */
export const REPLY_TEMPLATES_FLAT: ReplyTemplate[] =
  REPLY_TEMPLATE_GROUPS.flatMap((g) => g.templates);
