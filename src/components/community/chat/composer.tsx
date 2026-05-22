"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { Send, Loader2, X, CornerUpLeft } from "lucide-react";
import { MentionPopover } from "./mention-popover";
import { sendMessage, searchHandles } from "@/lib/community/chat/actions";
import { cn } from "@/lib/cn";
import type { ChatMessage, MentionCandidate } from "@/lib/community/chat/types";

type Props = {
  onSent: () => void;
  onError: (msg: string) => void;
  isConnected: boolean;
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
};

const MAX_CHARS = 2000;
const WARN_CHARS = 1900;

export function Composer({ onSent, onError, isConnected, replyTo, onCancelReply }: Props) {
  const [body, setBody] = useState("");
  const [sending, startSending] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when replyTo changes (clicking Reply on a message focuses composer)
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

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

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    const replyId = replyTo?.id;
    startSending(async () => {
      const result = await sendMessage(trimmed, replyId);
      if (!result.ok) {
        onError(result.error);
      } else {
        setBody("");
        setMentionQuery(null);
        setCandidates([]);
        onCancelReply();
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

      {/* Reply context pill */}
      {replyTo && (
        <div className="mb-2 flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-rose-50 border border-rose-100 text-[12px]">
          <CornerUpLeft className="size-3 text-rose-500 shrink-0" strokeWidth={2.5} />
          <div className="flex-1 min-w-0 truncate">
            <span className="text-ink-500">Replying to </span>
            <span className="font-semibold text-rose-700">{replyTo.author_name}</span>
            <span className="text-ink-400 ml-1.5 truncate">{replyTo.body}</span>
          </div>
          <button
            type="button"
            onClick={onCancelReply}
            className="shrink-0 size-5 rounded-full flex items-center justify-center text-ink-400 hover:bg-rose-100 hover:text-rose-600 transition-colors"
            aria-label="Cancel reply"
          >
            <X className="size-3" strokeWidth={2.5} />
          </button>
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
