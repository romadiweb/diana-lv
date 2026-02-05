export type QuizChoice = {
  id: string;
  text: string;
  isCorrect: boolean; // kept for scoring, not shown until results
};

export type QuizQuestion = {
  id: string;
  text: string;
  multiple: boolean;
  imageUrl?: string;
  imageAlt?: string;
  explanation?: string;
  choices: QuizChoice[];
};

export default function QuestionCard({
  question,
  selectedIds,
  onSelect,
}: {
  question: QuizQuestion;
  selectedIds: string[];
  onSelect: (choiceId: string) => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-fog/70 bg-[#FBF8F5] p-4">
      <div className="text-sm font-semibold text-cocoa">{question.text}</div>

      {question.imageUrl ? (
        <img
          src={question.imageUrl}
          alt={question.imageAlt ?? "Jautājuma attēls"}
          className="mt-3 max-h-72 w-full rounded-2xl border border-fog/70 bg-white object-contain"
          loading="lazy"
        />
      ) : null}

      <div className="mt-4 grid gap-2">
        {question.choices.map((c) => {
          const active = selectedIds.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={[
                "w-full rounded-2xl border px-4 py-3 text-left text-sm transition",
                active
                  ? "border-[#3F2021] bg-white"
                  : "border-fog/70 bg-white hover:bg-fog/20",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "mt-[2px] h-4 w-4 rounded-full border",
                    active ? "border-[#3F2021] bg-[#3F2021]" : "border-cocoa/30",
                    question.multiple ? "rounded-md" : "rounded-full",
                  ].join(" ")}
                />
                <div className="text-cocoa">{c.text}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-cocoa/60">
        {question.multiple ? "Var būt vairākas pareizas atbildes." : "Viena pareiza atbilde."}
      </div>
    </div>
  );
}
