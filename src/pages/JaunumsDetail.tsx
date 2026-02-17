import DOMPurify from "dompurify";
import { ArrowLeft, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

function getParamFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts[1] ? decodeURIComponent(parts[1]) : null; // ["jaunumi", ":param"]
}

function looksLikeHtml(s: string) {
  return /<\s*\w+[^>]*>/.test(s);
}

function toSafeHtml(raw: string) {
  // Safe default sanitization for rich text stored in DB.
  // Allows normal formatting tags, links, etc.
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "rel"],
  });
}

export default function JaunumsDetail() {
  const param = getParamFromPath();

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!param) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Try slug first
      const bySlug = await supabase
        .from("home_articles")
        .select("*")
        .eq("slug", param)
        .eq("active", true)
        .maybeSingle();

      if (!mounted) return;

      if (!bySlug.error && bySlug.data) {
        setArticle(bySlug.data as Article);
        setNotFound(false);
        setLoading(false);
        return;
      }

      // If not found by slug, try id
      const byId = await supabase
        .from("home_articles")
        .select("*")
        .eq("id", param as any)
        .eq("active", true)
        .maybeSingle();

      if (!mounted) return;

      if (!byId.error && byId.data) {
        setArticle(byId.data as Article);
        setNotFound(false);
      } else {
        setNotFound(true);
        setArticle(null);
      }

      setLoading(false);
    }

    load();
    return () => {
      mounted = false;
    };
  }, [param]);

  return (
    <main>
      <PageHeader
        title={loading ? "Ielādē…" : notFound ? "Raksts nav atrasts" : article?.title ?? "Jaunums"}
        subtitle={notFound ? "Pārbaudi saiti vai atgriezies uz jaunumu sarakstu." : article?.excerpt ?? " "}
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
          <Link
            to="/jaunumi"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 active:scale-[0.99]"
          >
            <ArrowLeft className="h-4 w-4" />
            Atpakaļ uz sarakstu
          </Link>

          {loading ? <div className="mt-8 text-neutral-600">Ielādē rakstu…</div> : null}

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
                    className="h-auto w-full  max-h-[650px] object-cover"
                    draggable={false}
                  />
                </div>
              ) : null}

              <div className="prose prose-neutral mt-8 max-w-none">
                {(() => {
                  const raw = (article.content ?? article.excerpt ?? "").trim();
                  if (!raw) return null;

                  // If DB content includes HTML (<b>, <i>, <ul>, <a>...), render as HTML.
                  // Otherwise preserve newlines as plain text.
                  if (looksLikeHtml(raw)) {
                    const safe = toSafeHtml(raw);
                    return (
                      <div
                        className="article-content text-neutral-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: safe }}
                      />
                    );
                  }

                  return (
                    <div className="whitespace-pre-line text-neutral-800 leading-relaxed">
                      {raw}
                    </div>
                  );
                })()}
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
