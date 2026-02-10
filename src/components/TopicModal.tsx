import { useEffect } from "react";
import { X } from "lucide-react";
import TopicCard, { type Topic } from "./TopicCard";

export default function TopicModal({
  open,
  topics,
  onClose,
  onPickTopic,
}: {
  open: boolean;
  topics: Topic[];
  onClose: () => void;
  onPickTopic: (topic: Topic) => void;
}) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[100]
        bg-black/50
        flex justify-center
        items-start md:items-center
        overflow-y-auto
      "
      // IMPORTANT: padding so it sits higher + safe area
      style={{
        paddingTop: "max(16px, env(safe-area-inset-top))",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
      }}
      onClick={onClose}
    >
      <div
        className="
          w-[min(92vw,520px)]
          bg-[#3F2021]
          border border-fog/70
          shadow-2xl
          flex flex-col overflow-hidden

          rounded-3xl
          mt-16 md:mt-0
          max-h-[82vh]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#3F2021] px-5 pt-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-white">Izvēlies tēmu</p>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/80">
                  {topics.length}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/70">
                Pirms sākam testu, izvēlies tēmu.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Aizvērt"
              title="Aizvērt"
              className="
                inline-flex h-10 w-10 items-center justify-center
                rounded-xl text-white/80
                hover:bg-white/10 hover:text-white
                transition hover:cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-white/30
              "
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 no-scrollbar">
          <div className="mt-4 grid gap-3">
            {topics.map((t) => (
              <TopicCard
                key={t.id}
                topic={t}
                onPick={(topic) => {
                  onPickTopic(topic);
                  onClose();
                }}
              />
            ))}
          </div>
        </div>

        {/* bottom fade hint */}
        <div className="pointer-events-none h-6 bg-gradient-to-t from-[#3F2021] to-transparent" />
      </div>
    </div>
  );
}
