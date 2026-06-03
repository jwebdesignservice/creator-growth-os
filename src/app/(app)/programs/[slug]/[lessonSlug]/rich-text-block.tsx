/* ─────────────────────────────────────────────────────────────────────────
   Rich-text block — PREVIEW with dummy content.

   Renders the full set of rich-text elements (H1–H6, a paragraph with bold,
   a blockquote, and ordered + unordered lists) styled to match the app, so
   we can see how a normal rich-text lesson body would look in this spot.

   This is placeholder text only — it is NOT wired to any field/data yet.
   ───────────────────────────────────────────────────────────────────────── */

export function RichTextBlock() {
  return (
    <div className="max-w-2xl text-[15px] leading-relaxed text-ink-700 space-y-4">
      <h1 className="text-h1 text-ink-900">Heading 1</h1>
      <h2 className="text-h2 text-ink-900">Heading 2</h2>
      <h3 className="text-h3 text-ink-900">Heading 3</h3>
      <h4 className="text-h4 text-ink-900">Heading 4</h4>
      <h5 className="text-[15.5px] font-bold text-ink-900">Heading 5</h5>
      <h6 className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-ink-500">
        Heading 6
      </h6>

      <p>
        Lorem ipsum dolor sit amet,{" "}
        <strong className="font-semibold text-ink-900">
          consectetur adipiscing elit
        </strong>
        , sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
        enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
        aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
        in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>

      <blockquote className="border-l-[3px] border-rose-300 pl-4 py-1 italic text-ink-700">
        Block quote — a short, highlighted passage that stands apart from the
        surrounding text to draw the reader&apos;s eye.
      </blockquote>

      <div>
        <p className="font-semibold text-ink-900 mb-2">Ordered list</p>
        <ol className="list-decimal pl-5 space-y-1.5 marker:text-ink-400">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ol>
      </div>

      <div>
        <p className="font-semibold text-ink-900 mb-2">Unordered list</p>
        <ul className="list-disc pl-5 space-y-1.5 marker:text-rose-400">
          <li>Item A</li>
          <li>Item B</li>
          <li>Item C</li>
        </ul>
      </div>
    </div>
  );
}
