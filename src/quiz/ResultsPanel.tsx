export type QuizResult = {
  correct: number;
  total: number;
  details: {
    questionId: string;
    text: string;
    selectedIds: string[];
    correctIds: string[];
    isCorrect: boolean;
    explanation?: string;
    choices: { id: string; text: string }[];
  }[];
};

export default function ResultsPanel({
  result,
  onRestart,
  onTry50,
  onTryAll,
}: {
  result: QuizResult;
  onRestart: () => void;
  onTry50: () => void;
  onTryAll: () => void;
}) {
  const pct = result.total === 0 ? 0 : Math.round((result.correct / result.total) * 100);

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-fog/70 bg-[#FBF8F5] p-4">
        <div className="text-lg font-semibold text-cocoa">Rezultāts</div>
        <div className="mt-1 text-sm text-cocoa/80">
          Pareizi: <b>{result.correct}</b> / {result.total} ({pct}%)
        </div>

        <div className="mt-4 grid gap-2 md:grid-cols-3">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-2xl bg-[#3F2021] px-5 py-3 text-sm font-semibold text-white"
          >
            Mēģināt vēlreiz
          </button>

          <button
            type="button"
            onClick={onTry50}
            className="rounded-2xl border border-fog px-5 py-3 text-sm font-semibold text-cocoa"
          >
            Jauni 50
          </button>

          <button
            type="button"
            onClick={onTryAll}
            className="rounded-2xl border border-fog px-5 py-3 text-sm font-semibold text-cocoa"
          >
            Visi jautājumi
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {result.details.map((d, i) => (
          <div
            key={d.questionId}
            className="rounded-2xl border border-fog/70 bg-white p-4"
          >
            <div className="text-xs text-cocoa/60">#{i + 1}</div>
            <div className="mt-1 text-sm font-semibold text-cocoa">{d.text}</div>

            <div className="mt-3 grid gap-2">
              {d.choices.map((c) => {
                const isSelected = d.selectedIds.includes(c.id);
                const isCorrect = d.correctIds.includes(c.id);

                return (
                  <div
                    key={c.id}
                    className={[
                      "rounded-xl border px-3 py-2 text-sm",
                      isCorrect ? "border-green-300 bg-green-50" : "border-fog/70 bg-white",
                      isSelected && !isCorrect ? "border-red-300 bg-red-50" : "",
                    ].join(" ")}
                  >
                    <span className="text-cocoa">{c.text}</span>
                    <span className="ml-2 text-xs text-cocoa/60">
                      {isCorrect ? "(pareizi)" : isSelected ? "(tava atbilde)" : ""}
                    </span>
                  </div>
                );
              })}
            </div>

            {d.explanation ? (
              <div className="mt-3 rounded-xl border border-fog/70 bg-[#FBF8F5] p-3 text-sm text-cocoa/80">
                <div className="text-xs font-semibold text-cocoa">Skaidrojums</div>
                <div className="mt-1">{d.explanation}</div>
              </div>
            ) : null}

            <div className="mt-3 text-sm font-semibold">
              {d.isCorrect ? (
                <span className="text-green-700">Pareizi ✅</span>
              ) : (
                <span className="text-red-700">Nepareizi ❌</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
