import { XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CourseModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Toast + anti-spam
  const [copied, setCopied] = useState(false);
  const hideToastTimer = useRef<number | null>(null);
  const lastCopyAt = useRef(0);

  const COPY_THROTTLE_MS = 350; // anti-spam, prevents rapid glitching
  const TOAST_HIDE_MS = 1200;

  const showCopiedToast = () => {
    setCopied(true);

    // clear + restart timer so it never stacks
    if (hideToastTimer.current) {
      window.clearTimeout(hideToastTimer.current);
    }
    hideToastTimer.current = window.setTimeout(() => {
      setCopied(false);
      hideToastTimer.current = null;
    }, TOAST_HIDE_MS);
  };

  const copyToClipboard = async (text: string) => {
    const now = Date.now();
    if (now - lastCopyAt.current < COPY_THROTTLE_MS) return;
    lastCopyAt.current = now;

    try {
      await navigator.clipboard.writeText(text);
      showCopiedToast();
    } catch {
      // Fallback for older browsers / restricted clipboard permissions
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        textarea.style.top = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showCopiedToast();
      } catch {
        // If everything fails, silently ignore (or you could show an error toast)
      }
    }
  };

  // ESC aizvēršana
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // cleanup toast timer when unmounting / closing
  useEffect(() => {
    return () => {
      if (hideToastTimer.current) {
        window.clearTimeout(hideToastTimer.current);
        hideToastTimer.current = null;
      }
    };
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* GREEN "COPIED" TOAST */}
      {copied && (
        <div
          className="fixed left-1/2 top-6 z-[10000] -translate-x-1/2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg"
          role="status"
          aria-live="polite"
        >
          Nokopēts 
        </div>
      )}

      {/* BACKDROP – klikšķis ārpus modāļa aizver */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* MODAL WRAPPER */}
      <div className="relative z-10 flex min-h-full items-end justify-center p-4 md:items-center">
        {/* MODAL BOX – klikšķis IEKŠĀ neaizver */}
        <div
          className="relative w-full max-w-lg rounded-3xl bg-[#3F2021] p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close X */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Aizvērt"
            className="absolute right-3 top-3 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:text-[#846B5A] hover:cursor-pointer hover:scale-105"
          >
            <XCircle className="h-5 w-5" />
          </button>

          {/* Title */}
          <h3 className="text-center text-lg font-semibold text-white">
            Pieteikšanās kursiem
          </h3>

          {/* Content */}
          <div className="mt-4 text-center">
            <p className="text-sm text-white/80">
              Teorētiskās nodarbības Avotu ielā 4, Liepājā.
            </p>

            <p className="mt-2 text-sm text-white/80">
              Par papildus informāciju saistībā ar norisi un pieteikšanos zvanīt:
              <br />
              <button
                type="button"
                onClick={() => copyToClipboard("26766112")}
                className="cursor-copy font-semibold text-cocoa underline underline-offset-4 hover:text-[#846B5A]"
                title="Klikšķini, lai nokopētu"
              >
                26766112
              </button>
              {", "}
              <button
                type="button"
                onClick={() => copyToClipboard("29173515")}
                className="cursor-copy font-semibold text-cocoa underline underline-offset-4 hover:text-[#846B5A]"
                title="Klikšķini, lai nokopētu"
              >
                29173515
              </button>
            </p>
          </div>

          {/* Bottom button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-fog bg-[#3F2021] px-6 py-3 text-sm font-semibold text-white transition hover:text-[#846B5A] hover:cursor-pointer hover:scale-105"
            >
              Sapratu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
