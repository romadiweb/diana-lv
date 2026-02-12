import { useEffect } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  title: string;
  content: string;
  onClose: () => void;
};

export default function FaqModal({ open, title, content, onClose }: Props) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={onClose} // click outside closes
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-neutral-200"
        onMouseDown={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-200 p-5">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Aizvērt"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
            {content}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-sm font-semibold border border-neutral-200 text-neutral-800 transition hover:bg-neutral-50 active:scale-95"
          >
            Aizvērt
          </button>
        </div>
      </div>
    </div>
  );
}
