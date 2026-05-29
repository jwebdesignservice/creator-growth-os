"use client";

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Check,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import {
  isSafeNoteUrl,
  looksLikeNoteHtml,
  noteIsEmpty,
  stripUnsafeNoteHtml,
} from "@/lib/notes/sanitize";

/* ════════════════════════════════════════════════════════════════════════
   Rich-note editor + renderer.

   The editor is a `contentEditable` surface driven by `document.execCommand`,
   which means the browser's own engine handles bold/italic/underline toggling
   and — crucially — list creation/numbering. That's why this fixes the old
   "1. 1. 1." stacking bug: lists are real <ul>/<ol>, not hand-inserted markdown.

   It's uncontrolled by design: the initial HTML is seeded once via a ref
   callback and React never re-writes innerHTML, so the caret never jumps.
   Pasting is forced to plain text, so the only HTML that ever enters is what
   the toolbar produces — a safe subset.
   ════════════════════════════════════════════════════════════════════════ */

export type RichNoteEditorHandle = {
  /** Insert a labelled scaffold (Quick add) at the caret. */
  insertSnippet: (text: string) => void;
  focus: () => void;
};

// Tailwind arbitrary-variant styling shared by the editor surface and the
// read-only renderer, so a note looks identical while writing and after saving.
const RICH_TEXT_CLS = cn(
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-1 [&_ul]:space-y-0.5",
  "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-1 [&_ol]:space-y-0.5",
  "[&_li]:pl-0.5",
  "[&_a]:text-rose-600 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium [&_a]:break-words",
  "[&_b]:font-semibold [&_strong]:font-semibold",
  "[&_i]:italic [&_em]:italic",
  "[&_u]:underline",
  "[&_p]:my-1 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
);

type EditorProps = {
  /** Seed value (HTML). Read once on mount — must be stable for the editor's life. */
  initialHtml?: string;
  onChange?: (html: string) => void;
  /** Cmd/Ctrl + Enter. */
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  minHeight?: number;
  disabled?: boolean;
};

export const RichNoteEditor = forwardRef<RichNoteEditorHandle, EditorProps>(
  function RichNoteEditor(
    {
      initialHtml = "",
      onChange,
      onSubmit,
      placeholder = "Write your note…",
      autoFocus = false,
      minHeight = 150,
      disabled = false,
    },
    ref,
  ) {
    const elRef = useRef<HTMLDivElement | null>(null);
    const seeded = useRef(false);
    const savedRange = useRef<Range | null>(null);
    const [empty, setEmpty] = useState(() => noteIsEmpty(initialHtml));
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    function emit() {
      const el = elRef.current;
      if (!el) return;
      setEmpty(noteIsEmpty(el.innerHTML));
      onChange?.(el.innerHTML);
    }

    function exec(command: string, value?: string) {
      elRef.current?.focus();
      document.execCommand(command, false, value);
      emit();
    }

    function rememberSelection() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount && elRef.current?.contains(sel.anchorNode)) {
        savedRange.current = sel.getRangeAt(0).cloneRange();
      }
    }

    function restoreSelection() {
      const el = elRef.current;
      if (!el) return;
      el.focus();
      const sel = window.getSelection();
      if (savedRange.current && sel) {
        sel.removeAllRanges();
        sel.addRange(savedRange.current);
      }
    }

    function openLink() {
      rememberSelection();
      setLinkUrl("");
      setLinkOpen(true);
    }

    function applyLink() {
      let url = linkUrl.trim();
      if (!url) {
        setLinkOpen(false);
        return;
      }
      // Bare domains → assume https.
      if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = `https://${url}`;
      if (!isSafeNoteUrl(url)) {
        setLinkOpen(false);
        return;
      }
      restoreSelection();
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed) {
        document.execCommand("createLink", false, url);
      } else {
        // No selection → drop the URL itself in as a link.
        const safe = url.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
        document.execCommand("insertHTML", false, `<a href="${safe}">${safe}</a>`);
      }
      setLinkOpen(false);
      emit();
    }

    useImperativeHandle(ref, () => ({
      insertSnippet(text: string) {
        const el = elRef.current;
        if (!el) return;
        el.focus();
        // Make sure the caret is actually inside the editor.
        const sel = window.getSelection();
        if (!sel || !el.contains(sel.anchorNode)) {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
        if (!noteIsEmpty(el.innerHTML)) document.execCommand("insertHTML", false, "<br>");
        document.execCommand("insertText", false, text);
        emit();
      },
      focus() {
        elRef.current?.focus();
      },
    }));

    const editorStyle: CSSProperties = { minHeight };

    return (
      <div
        className={cn(
          "rounded-[14px] border border-ink-200 bg-white overflow-hidden transition",
          "focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-ink-100 bg-cream-50/60">
          <TBtn icon={Bold} label="Bold" onClick={() => exec("bold")} />
          <TBtn icon={Italic} label="Italic" onClick={() => exec("italic")} />
          <TBtn icon={Underline} label="Underline" onClick={() => exec("underline")} />
          <span aria-hidden className="mx-1 h-5 w-px bg-ink-200" />
          <TBtn icon={List} label="Bulleted list" onClick={() => exec("insertUnorderedList")} />
          <TBtn
            icon={ListOrdered}
            label="Numbered list"
            onClick={() => exec("insertOrderedList")}
          />
          <span aria-hidden className="mx-1 h-5 w-px bg-ink-200" />
          <TBtn icon={Link2} label="Insert link" active={linkOpen} onClick={openLink} />
        </div>

        {/* Inline link entry */}
        {linkOpen && (
          <div className="flex items-center gap-2 px-2.5 py-2 border-b border-ink-100 bg-cream-50/40">
            <input
              autoFocus
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  setLinkOpen(false);
                }
              }}
              placeholder="Paste or type a URL, then press Enter"
              className="flex-1 h-8 px-2.5 rounded-[8px] border border-ink-200 bg-white text-[12.5px] text-ink-900 placeholder:text-ink-400 outline-none focus:border-rose-300"
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applyLink}
              className="size-8 inline-flex items-center justify-center rounded-[8px] bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              aria-label="Add link"
              title="Add link"
            >
              <Check className="size-3.5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setLinkOpen(false)}
              className="size-8 inline-flex items-center justify-center rounded-[8px] border border-ink-200 text-ink-500 hover:bg-cream-100 cursor-pointer"
              aria-label="Cancel link"
              title="Cancel"
            >
              <X className="size-3.5" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* Editable surface (+ placeholder overlay) */}
        <div className="relative">
          {empty && (
            <div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 px-3.5 py-3 text-[14px] leading-relaxed text-ink-400"
            >
              {placeholder}
            </div>
          )}
          <div
            ref={(node) => {
              elRef.current = node;
              if (node && !seeded.current) {
                seeded.current = true;
                node.innerHTML = initialHtml;
                if (autoFocus) {
                  // Defer focus until after seed so the caret lands at the end.
                  requestAnimationFrame(() => {
                    node.focus();
                    const sel = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  });
                }
              }
            }}
            role="textbox"
            aria-multiline="true"
            aria-label={placeholder}
            contentEditable={!disabled}
            suppressContentEditableWarning
            spellCheck
            onInput={emit}
            onBlur={rememberSelection}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
              emit();
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                onSubmit?.();
              }
            }}
            style={editorStyle}
            className={cn(
              "w-full resize-y overflow-auto px-3.5 py-3 text-[14px] leading-relaxed text-ink-900 outline-none break-words",
              RICH_TEXT_CLS,
            )}
          />
        </div>
      </div>
    );
  },
);

function TBtn({
  icon: Icon,
  label,
  onClick,
  active,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // Keep the editor's selection — don't let the button steal focus.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "size-8 inline-flex items-center justify-center rounded-[8px] transition-colors cursor-pointer",
        active
          ? "bg-rose-100 text-rose-700"
          : "text-ink-600 hover:bg-cream-200 hover:text-ink-900",
      )}
    >
      <Icon className="size-3.5" strokeWidth={2} />
    </button>
  );
}

/* ── Read-only renderer ──────────────────────────────────────────────────
   Renders a saved note. New notes are the safe HTML subset (rendered as
   markup); legacy notes are plain text (rendered with preserved whitespace).
   The strip pass is deterministic, so SSR and client output match. */
export function NoteContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!looksLikeNoteHtml(html)) {
    return (
      <div className={cn("whitespace-pre-wrap break-words", className)}>{html}</div>
    );
  }
  return (
    <div
      className={cn("break-words", RICH_TEXT_CLS, className)}
      dangerouslySetInnerHTML={{ __html: stripUnsafeNoteHtml(html) }}
    />
  );
}
