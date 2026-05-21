# Community Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real-time global chat room at `/community/chat` for all signed-in users, with admin badges, pinned messages, soft delete, and @mention notifications.

**Architecture:** New `community_chat_messages` table with denormalized author fields (avoids cross-user RLS profile reads). Supabase Realtime broadcasts INSERT/UPDATE events to all connected `ChatRoom` clients. Server actions handle all writes; the browser client subscribes to realtime only.

**Tech Stack:** Next.js 15 App Router (server components + server actions), `@supabase/ssr` server client, `@supabase/supabase-js` browser client (realtime), TypeScript, Tailwind CSS v4, Lucide React icons.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `supabase/migrations/0023_community_chat.sql` | Create | Table, RLS, realtime publication, enum extension |
| `src/lib/community/chat/types.ts` | Create | `ChatMessage` + `MentionCandidate` types |
| `src/lib/community/chat/queries.ts` | Create | `listRecentMessages`, `listPinned` server queries |
| `src/lib/community/chat/actions.ts` | Create | `sendMessage`, `softDeleteMessage`, `pinMessage`, `unpinMessage`, `searchHandles` server actions |
| `src/lib/notifications/types.ts` | Modify | Add `"chat_mention"` to `NotificationType` union |
| `src/lib/notifications/service.ts` | Modify | Add `notifyChatMention` helper |
| `src/app/(app)/community/chat/page.tsx` | Create | Server component — prefetch + auth gate |
| `src/components/community/chat/chat-room.tsx` | Create | Client root: state, realtime subscription, inline toast |
| `src/components/community/chat/message-list.tsx` | Create | Scrollable message list, "load older" pagination |
| `src/components/community/chat/message-bubble.tsx` | Create | Single message row: avatar, admin badge, body, action menu |
| `src/components/community/chat/pinned-banner.tsx` | Create | Sticky banner showing up to 3 pinned messages |
| `src/components/community/chat/composer.tsx` | Create | Textarea + send + @mention trigger |
| `src/components/community/chat/mention-popover.tsx` | Create | Autocomplete dropdown for @mentions |
| `src/app/(app)/community/page.tsx` | Modify | Add "Join live chat →" card near Recent discussions |

---

## Task 1: Database migration

**Files:**
- Create: `supabase/migrations/0023_community_chat.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- =====================================================================
-- 0023_community_chat.sql
-- Global community chat: messages table, RLS, realtime publication.
-- =====================================================================

-- Extend notification_type enum with chat_mention
alter type public.notification_type add value if not exists 'chat_mention';

-- MESSAGES TABLE -------------------------------------------------------
create table public.community_chat_messages (
  id               uuid      primary key default gen_random_uuid(),
  user_id          uuid      not null references auth.users(id) on delete cascade,
  body             text      not null check (length(body) between 1 and 2000),
  pinned           boolean   not null default false,
  deleted_at       timestamptz,
  deleted_by       uuid      references auth.users(id),
  mention_user_ids uuid[]    not null default '{}',
  -- Denormalized author fields so realtime INSERT events carry display data
  -- without requiring a cross-user profile JOIN (profiles RLS restricts
  -- reading other users' rows to admins only).
  author_name      text      not null default 'Creator',
  author_avatar    text,
  author_is_admin  boolean   not null default false,
  created_at       timestamptz not null default now()
);

create index idx_chat_created
  on public.community_chat_messages (created_at desc)
  where deleted_at is null;

create index idx_chat_pinned
  on public.community_chat_messages (pinned)
  where pinned = true and deleted_at is null;

-- REALTIME -------------------------------------------------------------
alter publication supabase_realtime add table public.community_chat_messages;

-- RLS ------------------------------------------------------------------
alter table public.community_chat_messages enable row level security;

-- Any signed-in user can read (including soft-deleted rows — client hides them)
drop policy if exists "chat_select" on public.community_chat_messages;
create policy "chat_select" on public.community_chat_messages
  for select using (auth.role() = 'authenticated');

-- Users INSERT as themselves; cannot pre-pin or pre-delete on insert
drop policy if exists "chat_insert" on public.community_chat_messages;
create policy "chat_insert" on public.community_chat_messages
  for insert with check (
    auth.uid() = user_id
    and pinned = false
    and deleted_at is null
  );

-- Owners can soft-delete their own rows; admins can update anything
-- (including pin/unpin). Per-column enforcement is in the action layer.
drop policy if exists "chat_update" on public.community_chat_messages;
create policy "chat_update" on public.community_chat_messages
  for update using  (auth.uid() = user_id or public.is_admin())
            with check (auth.uid() = user_id or public.is_admin());
```

- [ ] **Step 2: Apply migration in Supabase SQL editor**

Open https://supabase.com/dashboard/project/mierwogzdiplwpksaoka/sql/new, paste the SQL above, and run it. Verify output shows no errors.

- [ ] **Step 3: Verify table exists**

In the Supabase SQL editor run:
```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'community_chat_messages'
order by ordinal_position;
```
Expected: rows for `id`, `user_id`, `body`, `pinned`, `deleted_at`, `deleted_by`, `mention_user_ids`, `author_name`, `author_avatar`, `author_is_admin`, `created_at`.

- [ ] **Step 4: Verify realtime publication**

```sql
select tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and tablename = 'community_chat_messages';
```
Expected: one row `community_chat_messages`.

- [ ] **Step 5: Commit the migration file**

```bash
git add supabase/migrations/0023_community_chat.sql
git commit -m "feat(db): community_chat_messages table + RLS + realtime"
```

---

## Task 2: Types and notification update

**Files:**
- Create: `src/lib/community/chat/types.ts`
- Modify: `src/lib/notifications/types.ts` (line 8–22, the `NotificationType` union)

- [ ] **Step 1: Create `src/lib/community/chat/types.ts`**

```typescript
// Types for the community chat feature.
// ChatMessage mirrors the community_chat_messages DB row.

export type ChatMessage = {
  id: string;
  user_id: string;
  body: string;
  pinned: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  mention_user_ids: string[];
  author_name: string;
  author_avatar: string | null;
  author_is_admin: boolean;
  created_at: string;
};

export type MentionCandidate = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  handle: string | null;
  avatar_url: string | null;
};

export type ChatActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };
```

- [ ] **Step 2: Add `"chat_mention"` to `NotificationType` in `src/lib/notifications/types.ts`**

Find the `NotificationType` union (lines 8–22) and add `"chat_mention"` to it:

```typescript
export type NotificationType =
  | "task_assigned"
  | "task_due"
  | "task_completed"
  | "milestone_reached"
  | "posting_plan_updated"
  | "post_reminder"
  | "tutorial_unlocked"
  | "program_available"
  | "community_reply"
  | "chat_mention"
  | "coach_message"
  | "live_event"
  | "upgrade_recommendation"
  | "billing_update"
  | "announcement";
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd "C:/Users/Jack/Desktop/AI Website/htdocs/Websites/Influencer Platform/web"
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors related to the new types.

- [ ] **Step 4: Commit**

```bash
git add src/lib/community/chat/types.ts src/lib/notifications/types.ts
git commit -m "feat(types): ChatMessage type + chat_mention notification type"
```

---

## Task 3: Server queries

**Files:**
- Create: `src/lib/community/chat/queries.ts`

- [ ] **Step 1: Create `src/lib/community/chat/queries.ts`**

```typescript
import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage } from "./types";

const CHAT_COLS =
  "id, user_id, body, pinned, deleted_at, deleted_by, mention_user_ids, author_name, author_avatar, author_is_admin, created_at";

/**
 * Fetch the most recent messages (excluding soft-deleted).
 * Returns them in chronological order (oldest first).
 * Pass `before` (ISO timestamp) to paginate backwards.
 */
export async function listRecentMessages(
  limit = 100,
  before?: string,
): Promise<ChatMessage[]> {
  const supabase = await createClient();
  let q = supabase
    .from("community_chat_messages")
    .select(CHAT_COLS)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    q = q.lt("created_at", before);
  }

  const { data } = await q;
  // Reverse so the list displays oldest → newest top-to-bottom
  return ((data ?? []) as ChatMessage[]).reverse();
}

/**
 * Fetch up to 3 pinned non-deleted messages, newest-pin-first,
 * for the pinned banner at the top of the chat.
 */
export async function listPinned(): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_chat_messages")
    .select(CHAT_COLS)
    .eq("pinned", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(3);
  return (data ?? []) as ChatMessage[];
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/community/chat/queries.ts
git commit -m "feat(chat): listRecentMessages + listPinned server queries"
```

---

## Task 4: Server actions + notification helper

**Files:**
- Create: `src/lib/community/chat/actions.ts`
- Modify: `src/lib/notifications/service.ts` (append `notifyChatMention` at end of file)

- [ ] **Step 1: Create `src/lib/community/chat/actions.ts`**

```typescript
"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyChatMention } from "@/lib/notifications/service";
import type { ChatActionResult, MentionCandidate } from "./types";

// ── sendMessage ────────────────────────────────────────────────────────

export async function sendMessage(body: string): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Message cannot be empty." };
  if (trimmed.length > 2000) return { ok: false, error: "Message too long." };

  // Own profile — safe: RLS allows reading your own row
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const authorName =
    profile?.display_name ?? profile?.full_name ?? "Creator";
  const authorAvatar = profile?.avatar_url ?? null;

  // Admin check (is_admin() reads admin_users for the current user)
  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  const authorIsAdmin = isAdminRaw === true;

  // Extract @handle tokens (handles are [a-z0-9_] per signup UI)
  const handleMatches = [
    ...trimmed.matchAll(/(^|\s)@([a-z0-9_]+)/gi),
  ];
  const handles = [
    ...new Set(handleMatches.map((m) => m[2].toLowerCase())),
  ];

  let mentionUserIds: string[] = [];
  if (handles.length > 0) {
    // Service client bypasses RLS — needed to look up other users' handles
    const svc = createServiceClient();
    const { data: mentioned } = await svc
      .from("profiles")
      .select("id")
      .in("handle", handles)
      .neq("id", user.id);
    mentionUserIds = (mentioned ?? []).map((p: { id: string }) => p.id);
  }

  const { data: msg, error } = await supabase
    .from("community_chat_messages")
    .insert({
      user_id: user.id,
      body: trimmed,
      mention_user_ids: mentionUserIds,
      author_name: authorName,
      author_avatar: authorAvatar,
      author_is_admin: authorIsAdmin,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // Fire mention notifications via service client (bypasses RLS)
  const bodyPreview = trimmed.slice(0, 100);
  for (const mentionedId of mentionUserIds) {
    await notifyChatMention(mentionedId, authorName, msg.id, bodyPreview);
  }

  return { ok: true, id: msg.id };
}

// ── softDeleteMessage ─────────────────────────────────────────────────

export async function softDeleteMessage(
  id: string,
): Promise<ChatActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase
    .from("community_chat_messages")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", id);
  // RLS enforces owner-or-admin; a non-owner non-admin gets an RLS error here

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── pinMessage ────────────────────────────────────────────────────────

export async function pinMessage(id: string): Promise<ChatActionResult> {
  const supabase = await createClient();
  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  if (!isAdminRaw) return { ok: false, error: "Only admins can pin messages." };

  const { error } = await supabase
    .from("community_chat_messages")
    .update({ pinned: true })
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── unpinMessage ──────────────────────────────────────────────────────

export async function unpinMessage(id: string): Promise<ChatActionResult> {
  const supabase = await createClient();
  const { data: isAdminRaw } = await supabase.rpc("is_admin");
  if (!isAdminRaw) return { ok: false, error: "Only admins can unpin messages." };

  const { error } = await supabase
    .from("community_chat_messages")
    .update({ pinned: false })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── searchHandles ─────────────────────────────────────────────────────

export async function searchHandles(
  q: string,
): Promise<MentionCandidate[]> {
  if (!q || q.length < 1) return [];
  // Service client needed: profiles RLS only allows reading your own row
  const svc = createServiceClient();
  const { data } = await svc
    .from("profiles")
    .select("id, display_name, full_name, handle, avatar_url")
    .ilike("handle", `${q}%`)
    .limit(10);
  return (data ?? []) as MentionCandidate[];
}
```

- [ ] **Step 2: Add `notifyChatMention` to `src/lib/notifications/service.ts`**

Append to the bottom of the file (after `notifyAnnouncement`):

```typescript
export async function notifyChatMention(
  userId: string,
  authorName: string,
  messageId: string,
  bodyPreview: string,
): Promise<void> {
  await createNotification(userId, {
    title: `${authorName} mentioned you in Community Chat`,
    body: bodyPreview,
    type: "chat_mention",
    category: "community",
    priority: 3,
    action_label: "View Chat",
    action_url: "/community/chat",
    metadata: { message_id: messageId, author_name: authorName },
  });
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/community/chat/actions.ts src/lib/notifications/service.ts
git commit -m "feat(chat): server actions + notifyChatMention helper"
```

---

## Task 5: Chat page (server component)

**Files:**
- Create: `src/app/(app)/community/chat/page.tsx`

- [ ] **Step 1: Create `src/app/(app)/community/chat/page.tsx`**

```typescript
import { redirect } from "next/navigation";
import { getShellContext } from "@/lib/app-shell/get-shell-context";
import { listRecentMessages, listPinned } from "@/lib/community/chat/queries";
import { ChatRoom } from "@/components/community/chat/chat-room";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Community Chat · Creator Growth OS" };

export default async function CommunityChatPage() {
  const ctx = await getShellContext();
  if (!ctx) redirect("/sign-in");

  const supabase = await createClient();
  const { data: isAdminRaw } = await supabase.rpc("is_admin");

  const [messages, pinned] = await Promise.all([
    listRecentMessages(100),
    listPinned(),
  ]);

  return (
    <div className="flex flex-col flex-1 min-h-0 px-[var(--mobile-content-x)] lg:px-[var(--space-page-x)] py-4">
      <ChatRoom
        initialMessages={messages}
        initialPinned={pinned}
        currentUserId={ctx.user.id}
        currentUserName={ctx.name}
        currentUserAvatar={ctx.profile?.avatar_url ?? null}
        isAdmin={isAdminRaw === true}
      />
    </div>
  );
}
```

Note: This bypasses `PageShell` to get full-height flex layout needed for the message list. The padding classes replicate PageShell's horizontal padding.

- [ ] **Step 2: Verify the route is accessible**

Run `npm run dev` and navigate to `http://localhost:3000/community/chat`. You should see a blank page with no errors (ChatRoom not implemented yet but it should import cleanly once the file exists).

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/community/chat/page.tsx"
git commit -m "feat(chat): /community/chat server component scaffold"
```

---

## Task 6: MessageBubble component

**Files:**
- Create: `src/components/community/chat/message-bubble.tsx`

- [ ] **Step 1: Create `src/components/community/chat/message-bubble.tsx`**

```typescript
"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal, Trash2, Pin, PinOff } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { softDeleteMessage, pinMessage, unpinMessage } from "@/lib/community/chat/actions";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/lib/community/chat/types";

type Props = {
  message: ChatMessage;
  currentUserId: string;
  isAdmin: boolean;
  onDeleted: (id: string) => void;
  onPinChanged: (id: string, pinned: boolean) => void;
  onError: (msg: string) => void;
};

export function MessageBubble({
  message,
  currentUserId,
  isAdmin,
  onDeleted,
  onPinChanged,
  onError,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isOwn = message.user_id === currentUserId;
  const canDelete = isOwn || isAdmin;
  const canPin = isAdmin;

  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  function handleDelete() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await softDeleteMessage(message.id);
      if (!result.ok) onError(result.error);
      else onDeleted(message.id);
    });
  }

  function handlePin() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = message.pinned
        ? await unpinMessage(message.id)
        : await pinMessage(message.id);
      if (!result.ok) onError(result.error);
      else onPinChanged(message.id, !message.pinned);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 px-2 py-1.5 rounded-[12px] hover:bg-cream-100/60 transition-colors",
        pending && "opacity-50",
      )}
    >
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <Avatar
          name={message.author_name}
          src={message.author_avatar ?? undefined}
          size={36}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13.5px] font-semibold text-ink-900 leading-none">
            {message.author_name}
          </span>
          {message.author_is_admin && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 leading-none">
              Admin
            </span>
          )}
          {message.pinned && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
              <Pin className="size-2.5" strokeWidth={2.5} />
              Pinned
            </span>
          )}
          <span className="text-[11px] text-ink-400 ml-auto">{time}</span>
        </div>

        {/* Body */}
        <p className="mt-0.5 text-[13.5px] text-ink-800 leading-relaxed break-words">
          {message.body}
        </p>
      </div>

      {/* Action menu (visible on hover or when open) */}
      {(canDelete || canPin) && (
        <div
          className={cn(
            "shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity",
            menuOpen && "opacity-100",
          )}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="size-7 rounded-[8px] flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-ink-700 transition-colors"
              aria-label="Message actions"
            >
              <MoreHorizontal className="size-4" strokeWidth={2} />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-40 bg-white border border-ink-100 rounded-[12px] shadow-md py-1 text-[13px]">
                  {canPin && (
                    <button
                      type="button"
                      onClick={handlePin}
                      className="w-full flex items-center gap-2 px-3 py-2 text-ink-700 hover:bg-cream-100 transition-colors"
                    >
                      {message.pinned ? (
                        <>
                          <PinOff className="size-3.5 text-ink-400" strokeWidth={2} />
                          Unpin
                        </>
                      ) : (
                        <>
                          <Pin className="size-3.5 text-ink-400" strokeWidth={2} />
                          Pin message
                        </>
                      )}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="size-3.5" strokeWidth={2} />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/community/chat/message-bubble.tsx
git commit -m "feat(chat): MessageBubble — avatar, admin badge, action menu"
```

---

## Task 7: PinnedBanner and MessageList components

**Files:**
- Create: `src/components/community/chat/pinned-banner.tsx`
- Create: `src/components/community/chat/message-list.tsx`

- [ ] **Step 1: Create `src/components/community/chat/pinned-banner.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Pin, ChevronDown, ChevronUp } from "lucide-react";
import type { ChatMessage } from "@/lib/community/chat/types";

type Props = {
  pinned: ChatMessage[];
};

export function PinnedBanner({ pinned }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (pinned.length === 0) return null;

  const visible = expanded ? pinned : pinned.slice(0, 1);

  return (
    <div className="border-b border-amber-100 bg-amber-50/60 px-4 py-2.5">
      <div className="flex items-start gap-2">
        <Pin
          className="size-3.5 text-amber-500 shrink-0 mt-0.5"
          strokeWidth={2.5}
        />
        <div className="flex-1 min-w-0 space-y-1">
          {visible.map((msg) => (
            <div key={msg.id} className="text-[12.5px] text-ink-700 leading-snug truncate">
              <span className="font-semibold text-ink-900">{msg.author_name}:</span>{" "}
              {msg.body}
            </div>
          ))}
        </div>
        {pinned.length > 1 && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="shrink-0 text-[11px] text-amber-600 hover:text-amber-700 flex items-center gap-0.5 font-medium"
          >
            {expanded ? (
              <>
                <ChevronUp className="size-3" strokeWidth={2.5} />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="size-3" strokeWidth={2.5} />
                {pinned.length - 1} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/community/chat/message-list.tsx`**

```typescript
"use client";

import { useEffect, useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { listRecentMessages } from "@/lib/community/chat/queries";
import type { ChatMessage } from "@/lib/community/chat/types";

type Props = {
  messages: ChatMessage[];
  currentUserId: string;
  isAdmin: boolean;
  onDeleted: (id: string) => void;
  onPinChanged: (id: string, pinned: boolean) => void;
  onError: (msg: string) => void;
  onOlderLoaded: (older: ChatMessage[]) => void;
};

export function MessageList({
  messages,
  currentUserId,
  isAdmin,
  onDeleted,
  onPinChanged,
  onError,
  onOlderLoaded,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [loadingOlder, startLoadingOlder] = useTransition();

  // Auto-scroll to bottom when new messages arrive — but only if the user
  // is already at (or near) the bottom so we don't yank their scroll position.
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  // Scroll to bottom on initial mount
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  function loadOlder() {
    const oldest = messages[0];
    if (!oldest) return;
    startLoadingOlder(async () => {
      const older = await listRecentMessages(50, oldest.created_at);
      onOlderLoaded(older);
    });
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-0.5"
    >
      {/* Load older button */}
      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={loadOlder}
          disabled={loadingOlder}
          className="text-[12px] text-ink-500 hover:text-ink-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink-100 hover:border-ink-200 bg-white transition-colors disabled:opacity-50"
        >
          {loadingOlder ? (
            <Loader2 className="size-3 animate-spin" strokeWidth={2} />
          ) : null}
          Load older messages
        </button>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <p className="text-[13px] text-ink-400">
            No messages yet — say hello! 👋
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDeleted={onDeleted}
          onPinChanged={onPinChanged}
          onError={onError}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
```

Note: `listRecentMessages` is imported into a client component here. This is intentional — Next.js 15 allows importing server functions from client components when called via `useTransition`/`startTransition`. The "load older" action runs on the server.

Wait — actually `listRecentMessages` uses `import "server-only"`. That will throw an error if imported in a client component. I need a different approach for "load older":

Use a server action wrapper instead:

Add to `src/lib/community/chat/actions.ts`:

```typescript
// ── loadOlderMessages (used by MessageList pagination) ─────────────────

export async function loadOlderMessages(
  before: string,
  limit = 50,
): Promise<ChatMessage[]> {
  // Wrap the query as a server action so client components can call it
  const { listRecentMessages } = await import("./queries");
  return listRecentMessages(limit, before);
}
```

Then in `message-list.tsx` replace the import:
```typescript
import { loadOlderMessages } from "@/lib/community/chat/actions";
// ... and in loadOlder():
const older = await loadOlderMessages(oldest.created_at, 50);
```

- [ ] **Step 3: Add `loadOlderMessages` to actions.ts**

Append to the bottom of `src/lib/community/chat/actions.ts`:

```typescript
// ── loadOlderMessages ─────────────────────────────────────────────────

import type { ChatMessage } from "./types";

export async function loadOlderMessages(
  before: string,
  limit = 50,
): Promise<ChatMessage[]> {
  const { listRecentMessages } = await import("./queries");
  return listRecentMessages(limit, before);
}
```

And update `message-list.tsx` to use `loadOlderMessages` from actions (not `listRecentMessages` from queries directly).

Final `message-list.tsx` with corrected import:

```typescript
"use client";

import { useEffect, useRef, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { MessageBubble } from "./message-bubble";
import { loadOlderMessages } from "@/lib/community/chat/actions";
import type { ChatMessage } from "@/lib/community/chat/types";

type Props = {
  messages: ChatMessage[];
  currentUserId: string;
  isAdmin: boolean;
  onDeleted: (id: string) => void;
  onPinChanged: (id: string, pinned: boolean) => void;
  onError: (msg: string) => void;
  onOlderLoaded: (older: ChatMessage[]) => void;
};

export function MessageList({
  messages,
  currentUserId,
  isAdmin,
  onDeleted,
  onPinChanged,
  onError,
  onOlderLoaded,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [loadingOlder, startLoadingOlder] = useTransition();

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distFromBottom < 120) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  function loadOlder() {
    const oldest = messages[0];
    if (!oldest) return;
    startLoadingOlder(async () => {
      const older = await loadOlderMessages(oldest.created_at, 50);
      onOlderLoaded(older);
    });
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto min-h-0 px-2 py-2 space-y-0.5"
    >
      <div className="flex justify-center py-2">
        <button
          type="button"
          onClick={loadOlder}
          disabled={loadingOlder}
          className="text-[12px] text-ink-500 hover:text-ink-700 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-ink-100 hover:border-ink-200 bg-white transition-colors disabled:opacity-50"
        >
          {loadingOlder ? (
            <Loader2 className="size-3 animate-spin" strokeWidth={2} />
          ) : null}
          Load older messages
        </button>
      </div>

      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <p className="text-[13px] text-ink-400">
            No messages yet — say hello! 👋
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onDeleted={onDeleted}
          onPinChanged={onPinChanged}
          onError={onError}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/community/chat/pinned-banner.tsx src/components/community/chat/message-list.tsx src/lib/community/chat/actions.ts
git commit -m "feat(chat): PinnedBanner + MessageList + loadOlderMessages action"
```

---

## Task 8: Composer and MentionPopover

**Files:**
- Create: `src/components/community/chat/mention-popover.tsx`
- Create: `src/components/community/chat/composer.tsx`

- [ ] **Step 1: Create `src/components/community/chat/mention-popover.tsx`**

```typescript
"use client";

import { useEffect, useRef } from "react";
import { Avatar } from "@/components/app-shell/avatar";
import type { MentionCandidate } from "@/lib/community/chat/types";

type Props = {
  candidates: MentionCandidate[];
  selectedIndex: number;
  onSelect: (candidate: MentionCandidate) => void;
};

export function MentionPopover({ candidates, selectedIndex, onSelect }: Props) {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (candidates.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-ink-100 rounded-[14px] shadow-lg overflow-hidden z-30">
      <div className="px-3 py-1.5 text-[10.5px] font-semibold text-ink-400 uppercase tracking-wider border-b border-ink-50">
        Mention a creator
      </div>
      <ul className="max-h-48 overflow-y-auto py-1">
        {candidates.map((c, i) => {
          const name = c.display_name ?? c.full_name ?? c.handle ?? "Creator";
          const isActive = i === selectedIndex;
          return (
            <li key={c.id}>
              <button
                ref={isActive ? activeRef : undefined}
                type="button"
                onClick={() => onSelect(c)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "bg-rose-50 text-rose-700"
                    : "hover:bg-cream-100 text-ink-700"
                }`}
              >
                <Avatar name={name} src={c.avatar_url ?? undefined} size={28} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{name}</div>
                  {c.handle && (
                    <div className="text-[11px] text-ink-400 truncate">
                      @{c.handle}
                    </div>
                  )}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/community/chat/composer.tsx`**

```typescript
"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { Send, Loader2 } from "lucide-react";
import { MentionPopover } from "./mention-popover";
import { sendMessage, searchHandles } from "@/lib/community/chat/actions";
import { cn } from "@/lib/cn";
import type { MentionCandidate } from "@/lib/community/chat/types";

type Props = {
  onSent: () => void;
  onError: (msg: string) => void;
  isConnected: boolean;
};

const MAX_CHARS = 2000;
const WARN_CHARS = 1900;

export function Composer({ onSent, onError, isConnected }: Props) {
  const [body, setBody] = useState("");
  const [sending, startSending] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Mention autocomplete state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<MentionCandidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [body]);

  // Fetch mention candidates when query changes
  useEffect(() => {
    if (mentionQuery === null) {
      setCandidates([]);
      return;
    }
    searchHandles(mentionQuery).then(setCandidates);
  }, [mentionQuery]);

  function detectMentionQuery(value: string, cursor: number): string | null {
    // Look for @word immediately before the cursor with no space between @ and cursor
    const textBeforeCursor = value.slice(0, cursor);
    const match = textBeforeCursor.match(/(^|\s)@([a-z0-9_]*)$/i);
    return match ? match[2] : null;
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value.slice(0, MAX_CHARS);
    setBody(val);
    const q = detectMentionQuery(val, e.target.selectionStart ?? val.length);
    setMentionQuery(q);
    setSelectedIndex(0);
  }

  function insertMention(candidate: MentionCandidate) {
    const handle = candidate.handle ?? candidate.display_name ?? "user";
    const cursor = textareaRef.current?.selectionStart ?? body.length;
    const before = body.slice(0, cursor);
    const after = body.slice(cursor);
    // Replace the @query prefix with @handle
    const replaced = before.replace(/(^|\s)@([a-z0-9_]*)$/i, `$1@${handle} `);
    setBody(replaced + after);
    setMentionQuery(null);
    setCandidates([]);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (candidates.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, candidates.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (candidates[selectedIndex]) insertMention(candidates[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setMentionQuery(null);
        setCandidates([]);
        return;
      }
    }

    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    startSending(async () => {
      const result = await sendMessage(trimmed);
      if (!result.ok) {
        onError(result.error);
      } else {
        setBody("");
        setMentionQuery(null);
        setCandidates([]);
        onSent();
      }
    });
  }

  const charCount = body.length;
  const overWarning = charCount >= WARN_CHARS;

  return (
    <div className="border-t border-ink-100 bg-white px-4 py-3">
      {/* Reconnecting indicator */}
      {!isConnected && (
        <div className="text-[11.5px] text-amber-600 flex items-center gap-1.5 mb-2">
          <Loader2 className="size-3 animate-spin" strokeWidth={2} />
          Reconnecting…
        </div>
      )}

      <div className="relative flex items-end gap-2">
        {/* Mention popover anchored to the textarea */}
        {candidates.length > 0 && (
          <MentionPopover
            candidates={candidates}
            selectedIndex={selectedIndex}
            onSelect={insertMention}
          />
        )}

        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Message the community… (Enter to send, Shift+Enter for new line)"
          rows={1}
          maxLength={MAX_CHARS}
          disabled={sending || !isConnected}
          className={cn(
            "flex-1 resize-none rounded-[14px] border px-4 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 transition-all",
            "bg-cream-50 border-ink-200 focus:border-rose-300 focus:ring-rose-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
          style={{ minHeight: "44px", maxHeight: "140px" }}
        />

        <button
          type="button"
          onClick={submit}
          disabled={!body.trim() || sending || !isConnected}
          className="shrink-0 size-[44px] rounded-[14px] flex items-center justify-center bg-rose-600 text-white hover:bg-rose-700 disabled:bg-ink-200 disabled:text-ink-400 transition-colors"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2.5} />
          ) : (
            <Send className="size-4" strokeWidth={2.5} />
          )}
        </button>
      </div>

      {/* Character counter (only shown near limit) */}
      {overWarning && (
        <div
          className={cn(
            "text-right text-[11px] mt-1 tabular-nums",
            charCount >= MAX_CHARS ? "text-rose-600 font-semibold" : "text-amber-500",
          )}
        >
          {charCount} / {MAX_CHARS}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/community/chat/mention-popover.tsx src/components/community/chat/composer.tsx
git commit -m "feat(chat): Composer with @mention autocomplete + MentionPopover"
```

---

## Task 9: ChatRoom (client root with realtime)

**Files:**
- Create: `src/components/community/chat/chat-room.tsx`

- [ ] **Step 1: Create `src/components/community/chat/chat-room.tsx`**

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageList } from "./message-list";
import { PinnedBanner } from "./pinned-banner";
import { Composer } from "./composer";
import { MessageSquare } from "lucide-react";
import type { ChatMessage } from "@/lib/community/chat/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

type Props = {
  initialMessages: ChatMessage[];
  initialPinned: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar: string | null;
  isAdmin: boolean;
};

type Toast = { id: number; kind: "error" | "success"; message: string };

export function ChatRoom({
  initialMessages,
  initialPinned,
  currentUserId,
  isAdmin,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [pinned, setPinned] = useState<ChatMessage[]>(initialPinned);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showError = useCallback((message: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, kind: "error", message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  // ── Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("chat:global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_chat_messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as ChatMessage;
            setMessages((prev) => {
              // Deduplicate (optimistic update may have already added it)
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }

          if (payload.eventType === "UPDATE") {
            const updated = payload.new as ChatMessage;

            // Soft delete — remove from visible list
            if (updated.deleted_at) {
              setMessages((prev) => prev.filter((m) => m.id !== updated.id));
              setPinned((prev) => prev.filter((m) => m.id !== updated.id));
              return;
            }

            // Pin/unpin change
            setMessages((prev) =>
              prev.map((m) => (m.id === updated.id ? updated : m)),
            );
            if (updated.pinned) {
              setPinned((prev) => {
                if (prev.some((m) => m.id === updated.id)) return prev;
                return [updated, ...prev].slice(0, 3);
              });
            } else {
              setPinned((prev) => prev.filter((m) => m.id !== updated.id));
            }
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsConnected(true);
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
          }
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          reconnectTimer.current = setTimeout(
            () => setIsConnected(false),
            3000,
          );
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  // ── Handlers forwarded to child components ─────────────────────────

  function handleDeleted(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setPinned((prev) => prev.filter((m) => m.id !== id));
  }

  function handlePinChanged(id: string, isPinned: boolean) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, pinned: isPinned } : m)),
    );
    if (isPinned) {
      const msg = messages.find((m) => m.id === id);
      if (msg) setPinned((prev) => [{ ...msg, pinned: true }, ...prev].slice(0, 3));
    } else {
      setPinned((prev) => prev.filter((m) => m.id !== id));
    }
  }

  function handleOlderLoaded(older: ChatMessage[]) {
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const newOnes = older.filter((m) => !existingIds.has(m.id));
      return [...newOnes, ...prev];
    });
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white rounded-[20px] border border-ink-100 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2.5 px-5 py-3.5 border-b border-ink-100 bg-white">
        <MessageSquare className="size-4 text-rose-500" strokeWidth={2} />
        <h1 className="font-semibold text-[15px] text-ink-900">Community Chat</h1>
        <div className="ml-auto flex items-center gap-1.5">
          <span
            className={`size-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
          />
          <span className="text-[11.5px] text-ink-400">
            {isConnected ? "Live" : "Connecting…"}
          </span>
        </div>
      </div>

      {/* Pinned banner */}
      <PinnedBanner pinned={pinned} />

      {/* Message list */}
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onDeleted={handleDeleted}
        onPinChanged={handlePinChanged}
        onError={showError}
        onOlderLoaded={handleOlderLoaded}
      />

      {/* Composer */}
      <Composer
        onSent={() => {/* scroll handled by MessageList useEffect */}}
        onError={showError}
        isConnected={isConnected}
      />

      {/* Inline toasts */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2.5 rounded-[12px] text-[13px] font-medium shadow-md pointer-events-none ${
              t.kind === "error"
                ? "bg-rose-600 text-white"
                : "bg-emerald-600 text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit 2>&1 | head -30
```
Expected: no errors.

- [ ] **Step 3: Spin up dev server and navigate to /community/chat**

```bash
npm run dev
```

Open `http://localhost:3000/community/chat`. Expected:
- Page renders the `ChatRoom` with header "Community Chat" and the Live indicator
- PinnedBanner is hidden (no pinned messages yet)
- MessageList shows "No messages yet — say hello! 👋"
- Composer textarea and send button are visible

- [ ] **Step 4: Commit**

```bash
git add src/components/community/chat/chat-room.tsx
git commit -m "feat(chat): ChatRoom — realtime subscription + state management"
```

---

## Task 10: Wire /community page + final integration

**Files:**
- Modify: `src/app/(app)/community/page.tsx`

- [ ] **Step 1: Add chat card to `/community` page**

In `src/app/(app)/community/page.tsx`, add a `Link` import (already imported) and insert a chat card. Find the `<section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">` block (around line 77) and add the chat teaser card just above it:

```typescript
{/* Live chat teaser — insert between the spaces grid and the discussions grid */}
<section>
  <Link
    href="/community/chat"
    className="flex items-center justify-between gap-4 p-5 rounded-[20px] bg-gradient-to-r from-rose-50 to-cream-100 border border-rose-100 hover:border-rose-200 transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="size-10 rounded-[12px] bg-rose-100 flex items-center justify-center shrink-0">
        <MessageSquare className="size-5 text-rose-600" strokeWidth={2} />
      </div>
      <div>
        <div className="text-[14.5px] font-semibold text-ink-900 group-hover:text-rose-700 transition-colors">
          Community Chat
        </div>
        <div className="text-[12.5px] text-ink-500 mt-0.5">
          Join the live conversation with your peers and coaches
        </div>
      </div>
    </div>
    <ArrowRight className="size-5 text-ink-400 group-hover:text-rose-600 transition-colors shrink-0" />
  </Link>
</section>
```

Add `MessageSquare` and `ArrowRight` to the existing lucide import at the top of the file:
```typescript
import { Sparkles, CalendarDays, Star, MessageSquare, ArrowRight } from "lucide-react";
```

- [ ] **Step 2: Verify /community page renders**

Navigate to `http://localhost:3000/community`. Expect the new chat card between the spaces grid and the discussions grid.

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/community/page.tsx"
git commit -m "feat(community): add live chat teaser card linking to /community/chat"
```

---

## Task 11: End-to-end manual testing

- [ ] **Test 1: Basic message send and realtime**

Open two browser windows at `http://localhost:3000/community/chat` signed in as two different users.
Send a message in Window A.
Expected: message appears in Window B within ~1 second without refresh.

- [ ] **Test 2: Delete own message**

In Window A (the sender), click the `···` button on your own message and select Delete.
Expected: message disappears from both Window A and Window B.

- [ ] **Test 3: Admin delete (requires admin account)**

Sign in to a third browser window as an admin user (a user whose `user_id` is in `admin_users`). Navigate to `/community/chat`.
Expected: `···` menu appears on OTHER users' messages with Delete option.
Click Delete on a non-own message.
Expected: message disappears in all windows.

- [ ] **Test 4: Admin badge visible**

Send a message from the admin window.
Expected: a red "Admin" badge appears next to the admin user's name on their messages in all windows.

- [ ] **Test 5: Pin a message (admin)**

In the admin window, click `···` → "Pin message".
Expected: a yellow PinnedBanner appears at the top of the chat in all windows showing the message text.
Click `···` → "Unpin" on the same message.
Expected: PinnedBanner disappears.

- [ ] **Test 6: @mention fires notification**

User A types `@<handleofuserB>` in a message and sends.
Sign in as User B (or refresh their notification bell).
Expected: a notification with title "User A mentioned you in Community Chat" appears in User B's bell dropdown.

- [ ] **Test 7: Auth gate**

Open a private/incognito window and navigate to `http://localhost:3000/community/chat` without signing in.
Expected: redirected to `/sign-in`.

- [ ] **Test 8: RLS verification (Supabase SQL editor)**

```sql
-- As authenticated non-admin (run with a real JWT via Supabase's SQL editor
-- or test via supabase-js client):
INSERT INTO community_chat_messages (user_id, body)
VALUES ('<another-user-uuid>', 'spoof attempt');
-- Expected: ERROR: new row violates row-level security policy (WITH CHECK fails)
```

- [ ] **Step 9: Final commit + push + PR**

```bash
git push origin back-end
gh pr create --base main --head back-end \
  --title "feat: community chat — realtime global chat room" \
  --body "Adds /community/chat with realtime messaging, admin badges, pin/unpin, soft delete, @mention notifications. Spec: docs/superpowers/specs/2026-05-21-community-chat-design.md"
```
