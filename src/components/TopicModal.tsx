import { useEffect } from "react";
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 md:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] rounded-t-3xl md:rounded-3xl border border-fog/70 bg-[#3F2021] shadow-xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-3">
          <div className="h-1 w-12 rounded-full bg-white/25" />
        </div>

        <div className="sticky top-0 z-10 bg-[#3F2021] px-5 pt-4 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-white">
                Izvēlies tēmu{" "}
                <span className="text-white/60 font-semibold">
                  ({topics.length})
                </span>
              </p>
              <p className="mt-1 text-sm text-white/70">
                Pirms sākam testu, izvēlies tēmu.
              </p>
            </div>

            <button
              type="button"
              className="rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10"
              onClick={onClose}
            >
              Aizvērt
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-5">
          <div className="mt-4 grid gap-3">
            {topics.map((t) => (
              <TopicCard
                key={t.id}
                topic={t}
                onPick={(topic) => {
                  onPickTopic(topic); // HomePage navigates
                  onClose();
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
