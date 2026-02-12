import { useEffect, useMemo, useState } from "react";
import { Calendar } from "lucide-react";
import PageHeader from "../layout/PageHeader";
import { supabase } from "../lib/supabase";
import type { Article } from "../types/home";
import LoadingSpinner from "../components/LoadingSpinner";

function formatDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function slugFallback(a: Article) {
  return (
    a.slug ??
    a.title
      .toLowerCase()
      .trim()
      .replace(/[\s]+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .slice(0, 70)
  );
}

export default function Jaunumi() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);

      const res = await supabase
        .from("home_articles")
        .select("*")
        .eq("active", true);

      if (!mounted) return;

      if (!res.error && res.data) setArticles(res.data as Article[]);
      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const list = useMemo(() => {
    return [...articles].sort((a, b) => {
      const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
      if (so !== 0) return so;
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });
  }, [articles]);

  return (
    <main>
      <PageHeader
        title="Jaunumi"
        subtitle="Aktuālā informācija, jaunākie ieraksti un noderīgi raksti medniekiem."
        backgroundImageUrl="/jaunumi.jpg"
        rightBadgeText="Raksti • DIANA"
        crumbs={[
          { label: "Sākums", href: "/" },
          { label: "Jaunumi" },
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-22 sm:px-6 lg:px-8">
          {loading ? (
            <div className="mb-8 py-26 flex items-center justify-center gap-3 text-neutral-600">
            <LoadingSpinner/>
            </div>
          ) : null}

          {!loading && list.length === 0 ? (
            <div className="text-center text-neutral-600">Pagaidām nav pieejamu jaunumu.</div>
          ) : null}

          <div className="mx-auto grid max-w-4xl gap-6">
            {list.map((a) => {
              const slug = slugFallback(a);

              return (
                <a
                  key={a.id}
                  href={`/jaunumi/${encodeURIComponent(slug)}`}
                  className={[
                    "group block w-full",
                    "rounded-2xl border border-neutral-200 bg-white shadow-sm",
                    "transition hover:-translate-y-0.5 hover:shadow-lg",
                    "overflow-hidden",
                  ].join(" ")}
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row">
                    {/* Image */}
                    <div className="shrink-0">
                      <div className="h-28 w-full overflow-hidden rounded-xl bg-neutral-200 sm:h-28 sm:w-44">
                        {a.image_url ? (
                          <img
                            src={a.image_url}
                            alt={a.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                            draggable={false}
                          />
                        ) : null}
                      </div>
                    </div>

                    {/* Text */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600">
                        <span className="inline-flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(a.published_at)}
                        </span>

                        {/* “#” label (visual only) */}
                        <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                          #{slug}
                        </span>
                      </div>

                      <h3 className="mt-2 line-clamp-2 text-sm font-semibold uppercase tracking-wide text-[#c0392b]">
                        {a.title}
                      </h3>

                      {a.excerpt ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-700">
                          {a.excerpt}
                        </p>
                      ) : null}

                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#BA8448] group-hover:underline underline-offset-4">
                        Lasīt vairāk
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
