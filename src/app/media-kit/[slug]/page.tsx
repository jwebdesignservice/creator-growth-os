import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";

export const metadata = { title: "Media Kit · Creator Growth OS" };

type MediaKitPublic = {
  user_id: string;
  headline: string | null;
  bio: string | null;
  niche: string | null;
  audience_stats: Record<string, string | number> | null;
  rates: Record<string, string | number> | null;
  links: Array<{ label: string; url: string }> | null;
};

export default async function MediaKitPublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createServiceClient();

  const { data: kit } = await supabase
    .from("media_kits")
    .select(
      "user_id, headline, bio, niche, audience_stats, rates, links",
    )
    .eq("share_slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!kit) notFound();
  const typedKit = kit as MediaKitPublic;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, full_name, avatar_url")
    .eq("id", typedKit.user_id)
    .maybeSingle();

  const name =
    profile?.display_name ?? profile?.full_name ?? "Creator";
  const stats = Object.entries(typedKit.audience_stats ?? {});
  const rates = Object.entries(typedKit.rates ?? {});

  return (
    <main className="min-h-screen bg-cream-100 px-4 py-10 lg:py-14">
      <div className="max-w-3xl mx-auto bg-white rounded-[28px] border border-ink-100 shadow-card overflow-hidden">
        <div className="bg-gradient-to-br from-rose-100 via-cream-100 to-cream-200 p-8 lg:p-10 text-center">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={name}
              className="size-20 rounded-full mx-auto mb-4 border-4 border-white shadow"
            />
          ) : (
            <div className="size-20 rounded-full bg-rose-200 text-rose-700 mx-auto mb-4 font-bold text-[28px] flex items-center justify-center border-4 border-white shadow">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="font-display text-[32px] text-ink-900 leading-tight">
            {name}
          </h1>
          {typedKit.niche && (
            <div className="text-rose-600 font-medium text-[13px] uppercase tracking-wide mt-2">
              {typedKit.niche}
            </div>
          )}
          {typedKit.headline && (
            <p className="text-[15px] text-ink-700 mt-3 max-w-xl mx-auto">
              {typedKit.headline}
            </p>
          )}
        </div>

        <div className="p-8 lg:p-10 space-y-8">
          {typedKit.bio && (
            <section>
              <h2 className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-2">
                About
              </h2>
              <p className="text-[14.5px] text-ink-800 leading-relaxed whitespace-pre-line">
                {typedKit.bio}
              </p>
            </section>
          )}

          {stats.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-3">
                Audience
              </h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {stats.map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-cream-50 border border-ink-100 rounded-[12px] p-4 text-center"
                  >
                    <dt className="text-[11.5px] text-ink-500 capitalize">
                      {k.replace(/_/g, " ")}
                    </dt>
                    <dd className="font-display text-[20px] text-ink-900 tabular-nums mt-1">
                      {Number(v).toLocaleString()}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {rates.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-3">
                Rates
              </h2>
              <ul className="divide-y divide-ink-50">
                {rates.map(([k, v]) => (
                  <li
                    key={k}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <span className="text-[14px] text-ink-800 capitalize">
                      {k.replace(/_/g, " ")}
                    </span>
                    <span className="font-display text-[16px] text-ink-900 tabular-nums">
                      {Number(v).toLocaleString()} kr
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {typedKit.links && typedKit.links.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide mb-3">
                Links
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {typedKit.links.map((l, i) => (
                  <li key={i}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-[12px] border border-ink-100 hover:border-rose-300 hover:bg-cream-50 p-3.5 transition-colors"
                    >
                      <div className="text-[13px] font-semibold text-ink-900">
                        {l.label}
                      </div>
                      <div className="text-[11.5px] text-ink-500 truncate">
                        {l.url}
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      <div className="text-center mt-6 text-[11.5px] text-ink-500">
        Built with Creator Growth OS
      </div>
    </main>
  );
}
