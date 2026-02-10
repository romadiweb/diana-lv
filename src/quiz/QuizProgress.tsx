export default function QuizProgress({
  index,
  total,
  answeredCount,
}: {
  index: number;
  total: number;
  answeredCount: number;
}) {
  const pct = total === 0 ? 0 : Math.round(((index + 1) / total) * 100);

  return (
    <div className="mt-5">
      <div className="flex items-center justify-between text-xs text-cocoa/70">
        <div>
          Jautājums <b>{index + 1}</b> / {total}
        </div>
        <div>
          Atbildēti: <b>{answeredCount}</b>
        </div>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/10">
        <div className="h-full bg-[#3F2021]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
