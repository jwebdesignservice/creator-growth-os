import { notFound } from "next/navigation";
import { getAllPreviewTemplates } from "./templates";
import { SendForm } from "./send-form";

export const metadata = {
  title: "Email preview",
  robots: { index: false, follow: false },
};

export default async function EmailPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const templates = await getAllPreviewTemplates();
  const defaultEmail =
    process.env.EMAIL_PREVIEW_DEFAULT_TO ?? "jwebdesign.service@gmail.com";

  return (
    <div className="min-h-screen bg-cream-100 text-ink-900">
      <header className="sticky top-0 z-10 bg-cream-100/95 backdrop-blur border-b border-ink-100">
        <div className="max-w-[1100px] mx-auto px-6 py-5">
          <div className="flex items-baseline justify-between gap-6 flex-wrap">
            <div>
              <h1 className="font-display text-2xl font-semibold">Email preview</h1>
              <p className="text-sm text-ink-500 mt-1">
                {templates.length} templates · sample data injected · dev-only route
              </p>
            </div>
            <nav className="flex flex-wrap gap-2 text-[12px]">
              {templates.map((t) => (
                <a
                  key={t.slug}
                  href={`#${t.slug}`}
                  className="px-2.5 py-1 rounded-full bg-white border border-ink-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors"
                >
                  {t.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
        <SendForm defaultEmail={defaultEmail} />

        {templates.map((t) => (
          <section
            key={t.slug}
            id={t.slug}
            className="scroll-mt-32 bg-white rounded-2xl border border-ink-100 overflow-hidden shadow-sm"
          >
            <div className="px-6 py-5 border-b border-ink-100 bg-cream-50">
              <div className="text-[11px] uppercase tracking-wide text-rose-600 font-semibold">
                {t.slug === "welcome" ? "Resend (post-onboarding)" : "Supabase Auth"}
              </div>
              <h2 className="font-display text-xl font-semibold mt-1">{t.name}</h2>
              <p className="text-[13px] text-ink-500 mt-1">
                <span className="font-medium text-ink-700">Subject:</span> {t.subject}
              </p>
            </div>
            <div className="p-6 bg-ink-50/30">
              <iframe
                srcDoc={t.html}
                title={`Email preview: ${t.name}`}
                sandbox=""
                className="block w-full h-[760px] bg-white rounded-lg border border-ink-100"
              />
            </div>
          </section>
        ))}

        <p className="text-center text-[12px] text-ink-400 pb-12">
          Source: <code className="text-ink-600">src/lib/email/welcome-template.ts</code> and{" "}
          <code className="text-ink-600">docs/supabase-email-templates.md</code>
        </p>
      </main>
    </div>
  );
}
