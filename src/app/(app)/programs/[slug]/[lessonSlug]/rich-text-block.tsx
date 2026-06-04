/* ─────────────────────────────────────────────────────────────────────────
   Rich-text block — PREVIEW with realistic sample content.

   A representative lesson body (headings, paragraphs with bold, a tip
   blockquote, and ordered + unordered lists) styled to match the app, so we
   can see how a real rich-text lesson would read in this spot.

   Placeholder content only — it is NOT wired to any field/data yet.
   ───────────────────────────────────────────────────────────────────────── */

export function RichTextBlock() {
  return (
    <div className="max-w-2xl text-[15px] leading-relaxed text-ink-700 space-y-4">
      <p>
        Every creator who grows on purpose starts with the same thing: a clear
        system. In this lesson you&apos;ll see how the pieces fit together — your
        goal, your weekly plan, and the small daily actions that compound into
        real momentum.
      </p>

      <h2 className="text-h2 text-ink-900">Why a system beats motivation</h2>
      <p>
        Motivation is unreliable — it shows up some days and vanishes on others.
        A simple system removes that guesswork. Instead of asking{" "}
        <em>&ldquo;what should I post today?&rdquo;</em> you follow a plan you
        already trust, so the work still gets done on the days you don&apos;t
        feel like it.
      </p>

      <h3 className="text-h3 text-ink-900">The three habits that move the needle</h3>
      <p>
        Growth rarely comes from one viral moment. It comes from{" "}
        <strong className="font-semibold text-ink-900">showing up consistently</strong>,{" "}
        <strong className="font-semibold text-ink-900">studying what works</strong>, and{" "}
        <strong className="font-semibold text-ink-900">improving one thing at a time</strong>
        . Master these and the algorithm starts working for you instead of
        against you.
      </p>

      <div>
        <p className="font-semibold text-ink-900 mb-2">By the end of this lesson you&apos;ll be able to:</p>
        <ul className="list-disc pl-5 space-y-1.5 marker:text-rose-400">
          <li>Set a single, specific goal for the month ahead</li>
          <li>Turn that goal into a repeatable weekly content plan</li>
          <li>Track what&apos;s working so you can do more of it</li>
        </ul>
      </div>

      <blockquote className="border-l-[3px] border-rose-300 pl-4 py-1 italic text-ink-700">
        Consistency isn&apos;t about doing more — it&apos;s about doing the right
        things often enough that they start to compound.
      </blockquote>

      <div>
        <p className="font-semibold text-ink-900 mb-2">Your quick-start checklist:</p>
        <ol className="list-decimal pl-5 space-y-1.5 marker:text-ink-400">
          <li>Pick the one platform you&apos;ll focus on first</li>
          <li>Block 30 minutes this week to plan your content</li>
          <li>Publish your first post and review the results together</li>
        </ol>
      </div>

      <h4 className="text-h4 text-ink-900">Before you continue</h4>
      <p>
        Take a moment to think about where you are right now. There are no wrong
        answers here — this is simply your starting line, and every
        creator&apos;s looks a little different. When you&apos;re ready, mark the
        lesson complete and we&apos;ll build on it in the next one.
      </p>
    </div>
  );
}
