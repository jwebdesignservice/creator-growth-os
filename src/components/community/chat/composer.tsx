"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { Send, Loader2, X, CornerUpLeft, Paperclip, Image as ImageIcon } from "lucide-react";
import { MentionPopover } from "./mention-popover";
import { sendMessage, searchHandles } from "@/lib/community/chat/actions";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/cn";
import type { ChatMessage, MentionCandidate } from "@/lib/community/chat/types";

type Props = {
  channelId: string;
  onSent: () => void;
  onError: (msg: string) => void;
  isConnected: boolean;
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
  currentUserId: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const MAX_CHARS = 2000;
const WARN_CHARS = 1900;

export function Composer({ channelId, onSent, onError, isConnected, replyTo, onCancelReply, currentUserId }: Props) {
  const [body, setBody] = useState("");
  const [sending, startSending] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ url: string; name: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadImage(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onError("Only PNG, JPEG, WebP, or GIF images are allowed.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      onError("Image must be under 5MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createBrowserClient();
      const ext = file.name.split(".").pop() ?? "png";
      const path = `${currentUserId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("chat-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) {
        onError(error.message);
        return;
      }
      const { data } = supabase.storage.from("chat-images").getPublicUrl(path);
      setPendingImage({ url: data.publicUrl, name: file.name });
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = ""; // allow re-selecting the same file later
  }

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          uploadImage(file);
          return;
        }
      }
    }
  }

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
    if ((!trimmed && !pendingImage) || sending) return;
    const replyId = replyTo?.id;
    const imageUrl = pendingImage?.url;
    startSending(async () => {
      const result = await sendMessage(channelId, trimmed, replyId, imageUrl);
      if (!result.ok) {
        onError(result.error);
      } else {
        setBody("");
        setPendingImage(null);
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

      {/* Pending image preview */}
      {pendingImage && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-[12px] bg-cream-100 border border-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pendingImage.url} alt="" className="size-12 rounded-[8px] object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-medium text-ink-700 truncate">{pendingImage.name}</div>
            <div className="text-[11px] text-ink-400">Ready to send</div>
          </div>
          <button
            type="button"
            onClick={() => setPendingImage(null)}
            className="shrink-0 size-7 rounded-full flex items-center justify-center text-ink-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            aria-label="Remove image"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="relative flex items-end gap-2">
        {/* Mention popover anchored to the textarea */}
        {candidates.length > 0 && (
          <MentionPopover
            candidates={candidates}
            selectedIndex={selectedIndex}
            onSelect={insertMention}
          />
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || uploading || !isConnected}
          className="shrink-0 size-[44px] rounded-[14px] flex items-center justify-center text-ink-500 hover:bg-cream-100 hover:text-rose-600 disabled:opacity-40 transition-colors"
          aria-label="Attach image"
          title="Attach image"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={2} />
          ) : (
            <Paperclip className="size-4" strokeWidth={2} />
          )}
        </button>

        <textarea
          ref={textareaRef}
          value={body}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={pendingImage ? "Add a caption… (optional)" : "Message the community… (Enter to send, Shift+Enter for new line)"}
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
          disabled={(!body.trim() && !pendingImage) || sending || !isConnected}
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
