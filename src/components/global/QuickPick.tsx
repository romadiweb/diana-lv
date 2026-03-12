import { ArrowDownCircle } from "lucide-react";
import TopicCard, { type Topic } from "./TopicCard";

type QuickPickProps = {
  topics: Topic[];
  onPickTopic: (topic: Topic) => void;
  onOpenAllTopics: () => void;
  isLoading?: boolean;
};

function QuickPickSkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-4 animate-pulse">
      <div className="h-4 w-32 rounded bg-white/20" />
      <div className="mt-3 h-3 w-24 rounded bg-white/10" />
    </div>
  );
}

export default function QuickPick({
  topics,
  onPickTopic,
  onOpenAllTopics,
  isLoading = false,
}: QuickPickProps) {
  const visibleTopics = topics.slice(0, 3);

  return (
    <div className="rounded-sm border border-fog/70 bg-[#3F2021] p-6 shadow-sm min-h-[360px]">
      <p className="text-sm font-semibold text-white">Ātrā izvēle</p>
      <p className="mt-1 text-sm text-white/70">
        Izvēlies tēmu un sāc testu uzreiz.
      </p>

      <div className="mt-5 grid gap-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <QuickPickSkeletonCard key={i} />)
          : visibleTopics.map((t) => (
              <TopicCard key={t.id} topic={t} onPick={onPickTopic} />
            ))}
      </div>

      <button
        type="button"
        onClick={onOpenAllTopics}
        disabled={isLoading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-white px-4 py-3 text-sm font-semibold text-white transition hover:cursor-pointer hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:hover:cursor-default"
        title="Atvērt visas tēmas"
      >
        <ArrowDownCircle className="h-5 w-5" />
        Skatīt visas tēmas
      </button>
    </div>
  );
}