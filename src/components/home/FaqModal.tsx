import { useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  content: string; // plain text OR HTML string
  onClose: () => void;
};

function looksLikeHtml(input: string) {
  return /<\/?[a-z][\s\S]*>/i.test(input);
}

export default function FaqModal({ open, title, content, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    // lock background scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const isHtml = useMemo(() => looksLikeHtml(content), [content]);

  const sanitizedHtml = useMemo(() => {
    if (!isHtml) return "";
    return DOMPurify.sanitize(content, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ["target", "rel"],
    });
  }, [content, isHtml]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Modal shell */}
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
        {/* Header (always visible) */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-neutral-200 bg-white p-5">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Aizvērt"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 hover:cursor-pointer hover:text-neutral-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">
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
              {content}
            </p>
          )}
        </div>

        {/* Footer (optional, always visible) */}
        <div className="sticky bottom-0 border-t border-neutral-200 bg-white p-5">
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2 text-sm font-semibold border border-neutral-200 text-neutral-800 transition hover:cursor-pointer hover:bg-neutral-50 active:scale-95"
            >
              Aizvērt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}