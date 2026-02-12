import { useEffect, useState } from "react";
import { Calendar, ArrowLeft } from "lucide-react";
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

function getSlugFromPath() {
  // Works if your route is /jaunumi/:slug even without react-router hooks
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[1] ? decodeURIComponent(parts[1]) : null; // ["jaunumi", "slug"]
}

export default function JaunumsDetail() {
  const slug = getSlugFromPath();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);

      const res = await supabase
        .from("home_articles")
        .select("*")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();

      if (!mounted) return;

      if (res.error || !res.data) {
        setNotFound(true);
        setArticle(null);
      } else {
        setArticle(res.data as Article);
        setNotFound(false);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  return (
    <main>
      <PageHeader
        title={loading ? "Ielādē…" : notFound ? "Raksts nav atrasts" : article?.title ?? "Jaunums"}
        subtitle={
          notFound
            ? "Pārbaudi saiti vai atgriezies uz jaunumu sarakstu."
            : article?.excerpt ?? " "
        }
        backgroundImageUrl={article?.image_url ?? "/jaunumi.jpg"}
        rightBadgeText="Jaunumi"
        crumbs={[
          { label: "Sākums", href: "/" },
          { label: "Jaunumi", href: "/jaunumi" },
          { label: article?.title ?? "Raksts" },
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <a
            href="/jaunumi"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.99]"
          >
            <ArrowLeft className="h-4 w-4" />
            Atpakaļ uz sarakstu
          </a>

          {loading ? (
            <div className="mt-8 text-neutral-600">Ielādē rakstu…</div>
          ) : null}

          {!loading && notFound ? (
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-neutral-700">
              Raksts netika atrasts.
            </div>
          ) : null}

          {!loading && article ? (
            <article className="mt-8">
              <div className="flex items-center gap-3 text-sm text-neutral-600">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDate(article.published_at)}
                </span>
                {article.slug ? (
                  <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 font-semibold text-neutral-700">
                    #{article.slug}
                  </span>
                ) : null}
              </div>

              {article.image_url ? (
                <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-[320px] w-full object-cover"
                    draggable={false}
                  />
                </div>
              ) : null}

              {/* Content */}
              <div className="prose prose-neutral mt-8 max-w-none">
                {/* If your content is plain text */}
                <div className="whitespace-pre-line text-neutral-800 leading-relaxed">
                  {article.content ?? article.excerpt ?? ""}
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
