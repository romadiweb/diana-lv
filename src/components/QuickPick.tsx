import { ArrowDownCircle } from "lucide-react";
import TopicCard, { type Topic } from "./TopicCard";

export default function QuickPick({
  topics,
  onPickTopic,
  onOpenAllTopics,
}: {
  topics: Topic[];
  onPickTopic: (topic: Topic) => void;
  onOpenAllTopics: () => void;
}) {
  return (
    <div className="rounded-sm border border-fog/70 bg-[#3F2021] p-6 shadow-sm">
      <p className="text-sm font-semibold text-white">Ātrā izvēle</p>
      <p className="mt-1 text-sm text-white/70">
        Izvēlies tēmu un sāc testu uzreiz.
      </p>

      <div className="mt-5 grid gap-3">
        {topics.slice(0, 3).map((t) => (
          <TopicCard key={t.id} topic={t} onPick={onPickTopic} />
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenAllTopics}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-white px-4 py-3 text-sm font-semibold text-white hover:bg-white/15 transition hover:cursor-pointer no-scrollbar"
        title="Atvērt visas tēmas"
      >
        <ArrowDownCircle className="h-5 w-5" />
        Skatīt visas tēmas
      </button>
    </div>
  );
}
