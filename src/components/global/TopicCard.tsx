type Topic = {
  id: string;
  title: string;
  description: string;
  questionCount?: number;
};

export default function TopicCard({
  topic,
  onPick,
}: {
  topic: Topic;
  onPick: (topic: Topic) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(topic)}
      className="group w-full rounded-sm border border-fog/70 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-blush/30 hover:cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-cocoa">{topic.title}</p>
          <p className="mt-1 text-sm text-cocoa/70">{topic.description}</p>
        </div>
      </div>

      <div className="mt-4 text-xs font-semibold text-cocoa/80 opacity-80 group-hover:opacity-100">
        Izvēlēties →
      </div>
    </button>
  );
}
export type { Topic };