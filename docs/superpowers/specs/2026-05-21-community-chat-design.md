# Community Chat — Design Spec

**Status:** Approved, ready for implementation plan
**Date:** 2026-05-21
**Author:** Claude (with Jack)

## Goal

Add a real-time chat room to the existing Community area so signed-in users can talk to peers and ask admins questions. Auth-gated: anonymous visitors cannot read or write.

## Non-goals (deferred to v1.1+)

- File uploads, message editing, emoji reactions, reply threads.
- Direct messages between users.
- Typing indicators.
- Per-space chat channels (one global room only).
- Inline highlighted rendering of `@mentions` in the message body (v1 fires notifications only).
- Server-side rate limiting / spam detection.
- Virtualized infinite scroll (v1 uses "Load older messages" pagination).

## Decisions

| Question | Decision | Rationale |
|---|---|---|
| Topology | One global chat room | Low DAU initially; cross-pollination across categories is desirable; simplest schema and UI. |
| Realtime transport | Supabase Realtime (Postgres CDC) | Already enabled via migration `0022_realtime_notifications.sql`. No new infra. |
| Placement | Dedicated sub-page `/community/chat` | Lets the chat occupy the full viewport without competing with the existing /community page sections. |
| Delete semantics | Soft delete (`deleted_at` timestamp) | Realtime broadcasts UPDATE events; hard delete would skip the broadcast and orphan clients with stale rows. |
| Mention v1 surface | Fires a row in `notifications`; no inline render pass | Ships the value (admins / peers get pinged) without the autocomplete + highlighting polish. |
| Admin determination | Reuse existing `public.is_admin()` function | Same model the existing community forum RLS uses. |

## User stories

1. As a signed-in user, I open `/community/chat`, see the last 100 messages, see the pinned announcement banner at top, and can post a message that appears live for everyone in <1s.
2. As a signed-in user, I can delete my own messages via the action menu.
3. As an admin, I can delete any user's message and pin/unpin messages to the announcement banner.
4. As a signed-in user, I type `@jane` and Jane gets a notification in her bell dropdown.
5. As an anonymous visitor, I cannot reach `/community/chat` — I'm redirected to `/sign-in`. The Postgres RLS policies also reject any unauthenticated read or write at the DB level.

## Data model — new migration `0023_community_chat.sql`

```sql
create table public.community_chat_messages (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  body             text not null check (length(body) between 1 and 2000),
  pinned           boolean not null default false,
  deleted_at       timestamptz,
  deleted_by       uuid references auth.users(id),
  mention_user_ids uuid[] not null default '{}',
  created_at       timestamptz not null default now()
);

create index idx_chat_created
  on public.community_chat_messages (created_at desc)
  where deleted_at is null;

create index idx_chat_pinned
  on public.community_chat_messages (pinned)
  where pinned and deleted_at is null;

-- Add table to the supabase_realtime publication so INSERT/UPDATE broadcast.
alter publication supabase_realtime add table public.community_chat_messages;
```

## Row Level Security

```sql
alter table public.community_chat_messages enable row level security;

-- Read: any signed-in user. Deleted rows still visible at the DB level —
-- the client hides them. This keeps realtime UPDATE events coherent.
create policy "chat_select" on public.community_chat_messages
  for select using (auth.role() = 'authenticated');

-- Insert: signed-in users post as themselves; cannot pre-pin or pre-delete.
create policy "chat_insert" on public.community_chat_messages
  for insert with check (
    auth.uid() = user_id
    and pinned = false
    and deleted_at is null
  );

-- Update: two distinct paths.
-- (a) Soft delete: owner or admin may set deleted_at.
-- (b) Pin/unpin: admins only may toggle pinned.
-- Postgres RLS doesn't gate per-column, so we enforce these invariants in
-- the server action layer and use a single permissive update policy for
-- (owner OR admin). The action layer is the only mutation surface.
create policy "chat_update" on public.community_chat_messages
  for update using (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());

-- No hard delete policy: deletion is soft only.
```

**Note on the update policy:** Postgres RLS cannot gate updates per-column. The action layer enforces that non-admins can only set `deleted_at`; pin/unpin actions reject non-admin callers before issuing the UPDATE. This is the same pattern used by the existing `community_posts` table.

## File layout

```
src/app/(app)/community/chat/
  page.tsx                  Server component — fetches initial state.
src/components/community/chat/
  chat-room.tsx             Client root — holds list state + realtime sub.
  message-list.tsx          Scrollable list with auto-scroll-to-bottom on new.
  message-bubble.tsx        Avatar, name, admin badge, body, timestamp, menu.
  pinned-banner.tsx         Sticky banner showing pinned messages.
  composer.tsx              Textarea, send button, mention trigger.
  mention-popover.tsx       Autocomplete dropdown anchored to caret.
src/lib/community/chat/
  actions.ts                Server actions (see below).
  queries.ts                Server queries (listRecentMessages, listPinned).
  types.ts                  ChatMessage type + helpers.
```

Plus a small addition to the existing `/community` page: a card linking to `/community/chat` placed near the existing "Recent discussions" section.

## Server actions (`src/lib/community/chat/actions.ts`)

| Action | Signature | Authorization |
|---|---|---|
| `sendMessage` | `(body: string) → { ok, id?, error? }` | signed-in |
| `softDeleteMessage` | `(id: uuid) → { ok, error? }` | owner OR admin (RLS enforces) |
| `pinMessage` | `(id: uuid) → { ok, error? }` | admin only (checked in action) |
| `unpinMessage` | `(id: uuid) → { ok, error? }` | admin only (checked in action) |
| `searchHandles` | `(q: string) → { results: { id, display_name, handle, avatar_url }[] }` | signed-in |

`sendMessage` flow:
1. Authn check; reject if no session.
2. Trim body. Reject if empty or >2000 chars.
3. Extract `@handle` tokens via `/(^|\s)@([a-z0-9_]+)/gi`.
4. Look up each handle in `profiles.handle`; collect resolved `user_id`s into `mention_user_ids` (dedup, exclude self).
5. INSERT row with `mention_user_ids`.
6. For each mention, INSERT into `notifications` (`kind = 'chat_mention'`, `actor_id`, `target_user_id`, `payload = { message_id, body_preview }`).
7. Return `{ ok: true, id }`.

## Realtime channel

Client opens a Realtime channel `chat:global` subscribed to:
- `postgres_changes` filter: `schema=public, table=community_chat_messages, event=*`

On each event:
- `INSERT`: append to local list, auto-scroll to bottom if user is already at bottom (do NOT yank scroll if they're reading history).
- `UPDATE`: if `deleted_at` flipped from null → set, hide the message; if `pinned` flipped, refresh the pinned banner.

Connection state UI:
- Shows a tiny "Reconnecting…" pill in the composer footer when `channel.state !== 'joined'` for >3s.

## Error handling

| Failure | Handling |
|---|---|
| Send action returns error | Toast `"Couldn't send — try again"`, body stays in composer. |
| Realtime disconnect | Auto-reconnect via `supabase-js` retry. Show reconnect pill after 3s. On reconnect, refetch last 30 messages to catch any missed during outage. |
| Unauthorized delete/pin (raced state change) | Toast `"You don't have permission"`. |
| Empty body | Send button disabled; keyboard Enter no-ops. |
| >2000 chars | Composer caps input; counter turns rose at 1900. |

## Testing plan

Manual end-to-end:
1. Open 2 browser windows, sign in as 2 different users → both see messages live within ~500ms.
2. User A deletes own message → disappears in both windows.
3. Admin user (3rd window) deletes user A's message → disappears in all windows.
4. Admin pins a message → banner shows in all windows. Admin unpins → banner clears.
5. User B types `@usera` → User A sees a notification in their bell dropdown.
6. Visit `/community/chat` while signed out → redirected to `/sign-in`.

DB-level RLS verification (Supabase SQL editor):
- As authenticated non-admin, attempt `INSERT INTO community_chat_messages (user_id, body) VALUES ('<another-user-uuid>', 'spoof')` → must reject (WITH CHECK fails on user_id).
- As authenticated non-admin, attempt `UPDATE community_chat_messages SET pinned = true WHERE id = '<someone-elses-msg>'` → must reject (USING fails).
- Run the Supabase advisor lints — confirm no new high-severity issues introduced by the new table.

## Open questions / known limitations

- The pin model allows multiple pinned messages simultaneously. Frontend shows up to 3 most recent pinned in the banner with a "View all pinned" affordance only if >3 exist. This is intentional — admin doesn't have to unpin Tuesday's announcement before pinning Wednesday's.
- No abuse / rate limiting at the server. Acceptable for closed beta; revisit before public launch.
- Mention extraction is naive (regex). Handles with hyphens or unicode won't be detected. Acceptable for v1 because the `profiles.handle` column is already constrained to `[a-z0-9_]+`-ish values via signup UI.

## Out of scope

Anything listed in "Non-goals" at the top of this document.
