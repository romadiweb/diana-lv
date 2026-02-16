import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type Props = {
  open: boolean;
  courseId: string | null;
  onClose: () => void;
};

type CourseDetails = {
  id: string;
  title: string;
  slug: string | null;
  content: string | null; // NEW: modal content field
  price_amount: number | null;
  price_currency: string | null;
};

function looksLikeHtml(input: string) {
  return /<\/?[a-z][\s\S]*>/i.test(input);
}

function formatPrice(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) return null;
  const cur = currency ?? "€";
  const isInt = Number.isInteger(amount);
  const shown = isInt ? String(amount) : amount.toFixed(2);
  return `${shown} ${cur}`;
}

export default function CourseInfoModal({ open, courseId, onClose }: Props) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<CourseDetails | null>(null);

  // Esc + lock scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Fetch modal content from Supabase
  useEffect(() => {
    if (!open || !courseId) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      setErr(null);
      setData(null);

      // IMPORTANT: fetch `content` + `slug` now
      const { data, error } = await supabase
        .from("home_course_cards")
        .select("id,title,slug,content,price_amount,price_currency")
        .eq("id", courseId)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        setErr(error.message);
      } else {
        setData((data as CourseDetails) ?? null);
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [open, courseId]);

  const bodyText = data?.content ?? "";
  const isHtml = useMemo(() => looksLikeHtml(bodyText), [bodyText]);

  const sanitizedHtml = useMemo(() => {
    if (!isHtml) return "";
    return DOMPurify.sanitize(bodyText, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel"],
    });
  }, [bodyText, isHtml]);

  const price = formatPrice(data?.price_amount, data?.price_currency);

  function handleApply() {
    const slug = data?.slug;
    if (!slug) return; // if slug missing, do nothing (or you can fallback to id)
    onClose();
    navigate(`/pieteikties/${encodeURIComponent(slug)}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Kursa informācija"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div
        className="
          relative z-10 w-full max-w-2xl
          rounded-2xl bg-white shadow-2xl border border-neutral-200
          overflow-hidden
          max-h-[calc(100vh-2rem)]
          flex flex-col
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-neutral-200 bg-white p-5">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">
              {loading ? "Ielādē..." : data?.title ?? "Informācija"}
            </h3>
            {price && !loading && (
              <div className="mt-1 text-sm font-semibold text-green-700">{price}</div>
            )}
          </div>

          {/* X still closes */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Aizvērt"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
          {err && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Neizdevās ielādēt: {err}
            </div>
          )}

          {!err && loading && (
            <div className="space-y-3">
              <div className="h-4 w-2/3 rounded bg-neutral-100" />
              <div className="h-4 w-full rounded bg-neutral-100" />
              <div className="h-4 w-5/6 rounded bg-neutral-100" />
              <div className="h-4 w-3/4 rounded bg-neutral-100" />
            </div>
          )}

          {!err && !loading && (
            <>
              {isHtml ? (
                <div
                  className={[
                    "text-sm leading-relaxed text-neutral-700",
                    "[&_p]:mb-3 [&_p:last-child]:mb-0",
                    "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3",
                    "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3",
                    "[&_li]:mb-1",
                    "[&_a]:underline [&_a]:underline-offset-2",
                    "[&_strong]:font-semibold",
                    "[&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mb-2",
                    "[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2",
                    "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2",
                    "[&_code]:rounded [&_code]:bg-neutral-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.95em]",
                  ].join(" ")}
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              ) : (
                <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                  {bodyText || "Nav pievienots saturs."}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer: changed to Pieteikties */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleApply}
              disabled={loading || !!err || !data?.slug}
              className="
                rounded-full px-6 py-2 text-sm font-semibold
                bg-neutral-900 text-white
                transition hover:opacity-90 active:scale-[0.99]
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              Pieteikties
            </button>
          </div>
          {!loading && !err && !data?.slug && (
            <p className="mt-2 text-xs text-neutral-500">
              Slug nav atrasts šim pakalpojumam — pievieno <code>slug</code> kolonnu/vertību, lai pieteikšanās poga strādātu.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
