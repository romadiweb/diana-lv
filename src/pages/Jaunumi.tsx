import { Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../components/global/LoadingSpinner";
import PageHeader from "../layout/PageHeader";
import { supabase } from "../lib/supabase";
import type { Article } from "../types/home";

function formatDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function routeParamForArticle(a: Article) {
  // Use REAL slug if present; otherwise fallback to id.
  // This ensures JaunumsDetail can fetch it.
  const slug = (a as any).slug;
  if (typeof slug === "string" && slug.trim().length > 0) return slug.trim();
  const id = (a as any).id;
  return String(id ?? "");
}

/**
 * Cache the list so navigating back/forward feels instant and doesn't reflow the page.
 * sessionStorage is per-tab (good default), and we still refresh in the background.
 */
const CACHE_KEY = "jaunumi_cache_v1";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

type CacheShape = {
  items: Article[];
  savedAt: number;
};

function readCache(): CacheShape | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.items)) return null;
    if (typeof parsed.savedAt !== "number") return null;

    const fresh = Date.now() - parsed.savedAt <= CACHE_TTL_MS;
    return fresh ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(items: Article[]) {
  try {
    const payload: CacheShape = { items, savedAt: Date.now() };
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore (e.g. storage disabled)
  }
}

export default function Jaunumi() {
  const cached = useMemo(() => readCache(), []);

  const [articles, setArticles] = useState<Article[]>(() => cached?.items ?? []);
  const [loading, setLoading] = useState(() => !cached);

  useEffect(() => {
    let mounted = true;

    async function load() {
      // If we already have cached data, keep UI stable while refreshing in the background.
      if (articles.length === 0) setLoading(true);

      const res = await supabase.from("home_articles").select("*").eq("active", true);

      if (!mounted) return;

      if (!res.error && res.data) {
        const next = res.data as Article[];
        setArticles(next);
        writeCache(next);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        crumbs={[{ label: "Sākums", href: "/" }, { label: "Jaunumi" }]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-22 sm:px-6 lg:px-8">
          {loading && list.length === 0 ? (
            <div className="mb-8 py-26 flex items-center justify-center gap-3 text-neutral-600">
              <LoadingSpinner />
            </div>
          ) : null}

          {!loading && list.length === 0 ? (
            <div className="text-center text-neutral-600">Pagaidām nav pieejamu jaunumu.</div>
          ) : null}

          <div className="mx-auto grid max-w-4xl gap-6">
            {list.map((a) => {
              const param = routeParamForArticle(a);

              return (
                <Link
                  key={(a as any).id}
                  to={`/jaunumi/${encodeURIComponent(param)}`}
                  className={[
                    "group block w-full",
                    "rounded-2xl border border-neutral-200 bg-white shadow-sm",
                    "transition hover:-translate-y-0.5 hover:shadow-lg",
                    "overflow-hidden",
                  ].join(" ")}
                  aria-label={a.title}
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
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
