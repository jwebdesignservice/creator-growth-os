"use client";

import { Fragment, useState, useTransition } from "react";
import { MoreHorizontal, Trash2, Pin, PinOff, CornerUpLeft, Reply, Pencil, X, Check } from "lucide-react";
import { Avatar } from "@/components/app-shell/avatar";
import { cn } from "@/lib/cn";
import type { ReactionGroup } from "@/lib/community/chat/types";
import type { ChatApi, RoomMessage } from "@/lib/community/shared";
import { MessageReactions, AddReactionButton } from "./message-reactions";

type Props = {
  message: RoomMessage;
  currentUserId: string;
  isAdmin: boolean;
  reactions: ReactionGroup[];
  api: ChatApi;
  onDeleted: (id: string) => void;
  onPinChanged?: (id: string, pinned: boolean) => void;
  onError: (msg: string) => void;
  onReply: (message: RoomMessage) => void;
};

/**
 * Render message body with @handle tokens highlighted as rose chips.
 * Regex matches the same shape we extract on the server side.
 */
function renderBody(body: string) {
  const parts: Array<{ text: string; isMention: boolean }> = [];
  const re = /(^|\s)@([a-z0-9_]+)/gi;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const matchStart = m.index + m[1].length; // skip leading whitespace
    if (matchStart > lastIndex) {
      parts.push({ text: body.slice(lastIndex, matchStart), isMention: false });
    }
    parts.push({ text: `@${m[2]}`, isMention: true });
    lastIndex = matchStart + m[2].length + 1; // +1 for '@'
  }
  if (lastIndex < body.length) {
    parts.push({ text: body.slice(lastIndex), isMention: false });
  }
  return parts.map((p, i) =>
    p.isMention ? (
      <span
        key={i}
        className="inline-flex items-center px-1 rounded-[4px] bg-rose-200/70 text-rose-800 font-medium"
      >
        {p.text}
      </span>
    ) : (
      <Fragment key={i}>{p.text}</Fragment>
    ),
  );
}

export function MessageBubble({
  message,
  currentUserId,
  isAdmin,
  reactions,
  api,
  onDeleted,
  onPinChanged,
  onError,
  onReply,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(message.body);

  const isOwn = message.user_id === currentUserId;
  const canDelete = isOwn || isAdmin;
  const canPin = isAdmin && !!api.pin && !!api.unpin;
  const canEdit = isOwn;

  function handleEditSave() {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === message.body) {
      setEditing(false);
      setEditValue(message.body);
      return;
    }
    startTransition(async () => {
      const result = await api.edit(message.id, trimmed);
      if (!result.ok) onError(result.error);
      else setEditing(false);
    });
  }

  // Pin locale + hour12 so the server (often en-US 12-hour) and the client
  // (whatever the user's browser locale is) render the same string.
  const time = new Date(message.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  function handleDelete() {
    setMenuOpen(false);
    startTransition(async () => {
      const result = await api.remove(message.id);
      if (!result.ok) onError(result.error);
      else onDeleted(message.id);
    });
  }

  function handlePin() {
    setMenuOpen(false);
    if (!api.pin || !api.unpin) return;
    startTransition(async () => {
      const result = message.pinned
        ? await api.unpin!(message.id)
        : await api.pin!(message.id);
      if (!result.ok) onError(result.error);
      else onPinChanged?.(message.id, !message.pinned);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-end gap-2.5 px-1",
        isOwn && "flex-row-reverse",
        pending && "opacity-50",
      )}
    >
      {/* Avatar — incoming messages only */}
      {!isOwn && (
        <div className="shrink-0">
          <Avatar
            name={message.author_name}
            src={message.author_avatar ?? undefined}
            size={34}
          />
        </div>
      )}

      {/* Bubble column */}
      <div
        className={cn(
          "flex flex-col min-w-0 max-w-[80%] sm:max-w-[72%]",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {/* Name + badges — incoming only */}
        {!isOwn && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <span className="text-[12.5px] font-semibold text-ink-900 leading-none">
              {message.author_name}
            </span>
            {message.author_is_admin && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold bg-rose-100 text-rose-700 leading-none">
                Admin
              </span>
            )}
            {message.pinned && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-600">
                <Pin className="size-2.5" strokeWidth={2.5} />
                Pinned
              </span>
            )}
          </div>
        )}

        {editing ? (
          <div className="w-full flex flex-col gap-1.5">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value.slice(0, 2000))}
              autoFocus
              rows={2}
              className="w-full px-3 py-2 rounded-[10px] border border-rose-200 bg-white text-[13.5px] text-ink-900 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleEditSave();
                }
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditValue(message.body);
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleEditSave}
                disabled={pending}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white text-[12px] font-semibold"
              >
                <Check className="size-3" strokeWidth={2.5} />
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditValue(message.body);
                }}
                className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[8px] border border-ink-200 text-ink-600 hover:bg-cream-100 text-[12px] font-medium"
              >
                <X className="size-3" strokeWidth={2.5} />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* The bubble */}
            <div
              className={cn(
                "rounded-[16px] px-3.5 py-2 break-words max-w-full",
                isOwn
                  ? "bg-rose-100 text-ink-900 rounded-br-[5px]"
                  : "bg-white border border-ink-100 text-ink-800 rounded-bl-[5px]",
              )}
            >
              {/* Reply quote */}
              {message.reply_to_preview && (
                <div className="mb-1 flex items-start gap-1.5 pl-2 border-l-2 border-rose-300 text-[12px] text-ink-500">
                  <CornerUpLeft className="size-3 text-rose-400 mt-0.5 shrink-0" strokeWidth={2} />
                  <div className="min-w-0">
                    <span className="font-semibold text-ink-700">
                      {message.reply_to_preview.author_name}
                    </span>
                    <span className="ml-1.5 truncate inline-block max-w-full align-bottom">
                      {message.reply_to_preview.body}
                    </span>
                  </div>
                </div>
              )}

              {/* Body text */}
              {message.body && (
                <p className="text-[13.5px] leading-relaxed">
                  {renderBody(message.body)}
                  {message.edited_at && (
                    <span className="ml-1.5 text-[10.5px] text-ink-400">(edited)</span>
                  )}
                </p>
              )}

              {/* Image attachment */}
              {message.image_url && (
                <a
                  href={message.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1.5 max-w-[320px] rounded-[12px] overflow-hidden border border-ink-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={message.image_url}
                    alt=""
                    className="block w-full h-auto max-h-[360px] object-cover"
                  />
                </a>
              )}

              {/* Link preview card */}
              {message.link_preview && (
                <a
                  href={message.link_preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1.5 max-w-[400px] rounded-[12px] border border-ink-100 hover:border-ink-200 bg-cream-50 overflow-hidden transition-colors"
                >
                  {message.link_preview.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={message.link_preview.image}
                      alt=""
                      className="block w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-2.5">
                    {message.link_preview.site_name && (
                      <div className="text-[10.5px] uppercase tracking-wider font-semibold text-ink-400">
                        {message.link_preview.site_name}
                      </div>
                    )}
                    {message.link_preview.title && (
                      <div className="text-[12.5px] font-semibold text-ink-900 line-clamp-2 mt-0.5">
                        {message.link_preview.title}
                      </div>
                    )}
                    {message.link_preview.description && (
                      <div className="text-[11.5px] text-ink-500 line-clamp-2 mt-0.5">
                        {message.link_preview.description}
                      </div>
                    )}
                  </div>
                </a>
              )}
            </div>

            {/* Time + reactions, under the bubble on the message's side */}
            <div
              className={cn(
                "flex items-center gap-2 mt-1 px-1",
                isOwn && "flex-row-reverse",
              )}
            >
              <span className="text-[10.5px] text-ink-400">{time}</span>
              <MessageReactions
                messageId={message.id}
                currentUserId={currentUserId}
                reactions={reactions}
                onError={onError}
                addReaction={api.addReaction}
                removeReaction={api.removeReaction}
              />
            </div>
          </>
        )}
      </div>

      {/* Hover action bar: react, reply, more menu */}
      <div className="shrink-0 self-center flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <AddReactionButton
          messageId={message.id}
          reactions={reactions}
          currentUserId={currentUserId}
          onError={onError}
          addReaction={api.addReaction}
          removeReaction={api.removeReaction}
        />
        <button
          type="button"
          onClick={() => onReply(message)}
          className="size-7 rounded-[8px] flex items-center justify-center text-ink-400 hover:bg-cream-200 hover:text-rose-600 transition-colors"
          aria-label="Reply"
          title="Reply"
        >
          <Reply className="size-4" strokeWidth={2} />
        </button>
        {(canDelete || canPin || canEdit) && (
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
                  {canEdit && message.body && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setEditing(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-ink-700 hover:bg-cream-100 transition-colors"
                    >
                      <Pencil className="size-3.5 text-ink-400" strokeWidth={2} />
                      Edit
                    </button>
                  )}
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
        )}
      </div>
    </div>
  );
}
