import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import SiteFooter from "../components/SiteFooter";
import QuizSetupModal from "../quiz/QuizSetupModal";
import QuestionCard, { type QuizQuestion } from "../quiz/QuestionCard";
import QuizProgress from "../quiz/QuizProgress";
import ResultsPanel, { type QuizResult } from "../quiz/ResultsPanel";
import { shuffleArray } from "../quiz/shuffle";
import LoadingSpinner from "../components/LoadingSpinner";

type TopicRow = {
  id: string;
  slug: string;
  title: string;
};

type ChoiceRow = {
  id: string;
  text: string;
  is_correct: boolean;
  sort_order: number | null;
};

type QuestionRow = {
  id: string;
  text: string;
  multiple: boolean | null;
  image_url: string | null;
  image_alt: string | null;
  explanation: string | null;
  sort_order: number | null;
  choices: ChoiceRow[];
};

// If you don’t use react-router yet, you can pass topicSlug prop manually.
export default function TestPage({ topicSlug }: { topicSlug?: string }) {
  const params = useParams();
  const slug = topicSlug ?? (params.topicSlug as string | undefined);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [topic, setTopic] = useState<TopicRow | null>(null);
  const [rawQuestions, setRawQuestions] = useState<QuestionRow[]>([]);

  // setup gate when > 50 questions
  const [showSetup, setShowSetup] = useState(false);
  const [limitMode, setLimitMode] = useState<"50" | "all">("50");

  // quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQid, setAnswersByQid] = useState<Record<string, string[]>>({});
  const [finished, setFinished] = useState(false);

  const totalCount = rawQuestions.length;

  // Load topic + questions
  useEffect(() => {
    if (!slug) {
      setError("Missing topic slug. Route should be /tests/:topicSlug");
      setLoading(false);
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);

      // 1) topic
      const { data: topicData, error: topicErr } = await supabase
        .from("topics")
        .select("id, slug, title")
        .eq("slug", slug)
        .single();

      if (topicErr || !topicData) {
        setError(`Topic not found for slug: ${slug}`);
        setLoading(false);
        return;
      }
      setTopic(topicData);

      // 2) questions + choices
      const { data: qData, error: qErr } = await supabase
        .from("questions")
        .select(
          `
          id,
          text,
          multiple,
          image_url,
          image_alt,
          explanation,
          sort_order,
          choices (
            id,
            text,
            is_correct,
            sort_order
          )
        `
        )
        .eq("topic_id", topicData.id)
        .order("sort_order", { ascending: true });

      if (qErr) {
        setError(qErr.message);
        setLoading(false);
        return;
      }

      const normalized = (qData ?? []).map((q: any) => ({
        ...q,
        choices: (q.choices ?? []).slice().sort((a: ChoiceRow, b: ChoiceRow) => {
          const ao = a.sort_order ?? 0;
          const bo = b.sort_order ?? 0;
          return ao - bo;
        }),
      })) as QuestionRow[];

      setRawQuestions(normalized);
      setLoading(false);

      // gate if > 50
      if (normalized.length > 50) {
        setShowSetup(true);
      } else {
        // auto start with all if <=50
        startQuiz(normalized, "all");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const startQuiz = (source: QuestionRow[], mode: "50" | "all") => {
    const picked =
      mode === "50" ? shuffleArray(source).slice(0, 50) : shuffleArray(source);

    const prepared: QuizQuestion[] = picked.map((q) => ({
      id: q.id,
      text: q.text,
      multiple: !!q.multiple,
      imageUrl: q.image_url ?? undefined,
      imageAlt: q.image_alt ?? undefined,
      explanation: q.explanation ?? undefined,
      choices: shuffleArray(q.choices).map((c) => ({
        id: c.id,
        text: c.text,
        isCorrect: c.is_correct,
      })),
    }));

    setQuizQuestions(prepared);
    setCurrentIndex(0);
    setAnswersByQid({});
    setFinished(false);
    setShowSetup(false);
  };

  const current = quizQuestions[currentIndex];

  const onSelect = (questionId: string, choiceId: string, isMulti: boolean) => {
    setAnswersByQid((prev) => {
      const existing = prev[questionId] ?? [];

      if (!isMulti) {
        return { ...prev, [questionId]: [choiceId] };
      }

      // toggle for multi
      const next = existing.includes(choiceId)
        ? existing.filter((x) => x !== choiceId)
        : [...existing, choiceId];

      return { ...prev, [questionId]: next };
    });
  };

  const answeredCount = useMemo(() => {
    return Object.values(answersByQid).filter((arr) => (arr?.length ?? 0) > 0).length;
  }, [answersByQid]);

  const canGoNext = useMemo(() => {
    if (!current) return false;
    const picked = answersByQid[current.id] ?? [];
    return picked.length > 0;
  }, [answersByQid, current]);

  const goNext = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  };

  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));

  // Stop early -> show results for answered questions only
  const stopAndShowResults = () => {
    setFinished(true);
  };

  // Results calculated ONLY for answered questions
  const result: QuizResult | null = useMemo(() => {
    if (!finished) return null;

    const answeredIds = Object.entries(answersByQid)
      .filter(([, ids]) => ids && ids.length > 0)
      .map(([qid]) => qid);

    const answeredSet = new Set(answeredIds);
    const answeredQuestions = quizQuestions.filter((q) => answeredSet.has(q.id));

    let correct = 0;
    const total = answeredQuestions.length;

    const details = answeredQuestions.map((q) => {
      const selected = new Set(answersByQid[q.id] ?? []);
      const correctIds = new Set(q.choices.filter((c) => c.isCorrect).map((c) => c.id));

      const isCorrect =
        selected.size === correctIds.size &&
        [...selected].every((id) => correctIds.has(id));

      if (isCorrect) correct += 1;

      return {
        questionId: q.id,
        text: q.text,
        selectedIds: [...selected],
        correctIds: [...correctIds],
        isCorrect,
        explanation: q.explanation,
        choices: q.choices.map((c: { id: any; text: any }) => ({ id: c.id, text: c.text })),
      };
    });

    return { correct, total, details };
  }, [finished, quizQuestions, answersByQid]);

  // =========================
  // LAYOUT WRAPPER (sticky footer)
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F7F7]">
        <main className="flex-1 grid place-items-center px-4">
          <LoadingSpinner label="Ielādē testu…" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F7F7F7]">

        <main className="flex-1">
          <div className="mx-auto max-w-3xl px-4 py-10 text-cocoa">
            <div className="text-lg font-semibold">Kļūda</div>
            <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-fog/70 bg-white p-4 text-sm text-red-700">
              {error}
            </pre>
          </div>
        </main>

        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7]">

      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl border border-fog/70 bg-white p-5 shadow-sm">
            {/* Stop button top-right */}
            {!finished && (
              <button
                type="button"
                onClick={stopAndShowResults}
                className="
                  absolute right-5 top-5
                  inline-flex items-center gap-2
                  rounded-2xl
                  bg-red-500 px-4 py-2
                  text-sm font-semibold text-white
                  shadow-md
                  transition
                  hover:bg-red-600 hover:scale-[1.01] hover:cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-red-300
                "
                aria-label="Pārtraukt un skatīt rezultātus"
                title="Pārtraukt un skatīt rezultātus"
              >
                <XCircle className="h-5 w-5" />
                <span className="hidden md:inline">Pārtraukt un skatīt rezultātus</span>
              </button>
            )}

            {/* Header left */}
            <div className="pr-16 md:pr-72">
              <div className="text-xs text-cocoa/60">Tēma</div>
              <h1 className="mt-1 text-lg font-semibold text-cocoa">{topic?.title}</h1>

              <div className="mt-1 text-sm text-cocoa/70">
                Jautājumi šajā tēmā: <b>{totalCount}</b>
                <span className="mx-2">•</span>
                Atbildēti: <b>{answeredCount}</b>
                {quizQuestions.length ? (
                  <>
                    {" "}
                    / <b>{quizQuestions.length}</b>
                  </>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="mt-3 inline-flex text-sm font-semibold text-red-400 underline underline-offset-4 
                hover:cursor-pointer hover:opacity-80"
              >
                Atpakaļ uz sākumu
              </button>
            </div>

            {finished && result ? (
              <ResultsPanel
                result={result}
                onRestart={() => startQuiz(rawQuestions, limitMode)}
                onTry50={() => startQuiz(rawQuestions, "50")}
                onTryAll={() => startQuiz(rawQuestions, "all")}
              />
            ) : (
              <>
                <QuizProgress
                  index={currentIndex}
                  total={quizQuestions.length}
                  answeredCount={answeredCount}
                />

                {current ? (
                  <QuestionCard
                    question={current}
                    selectedIds={answersByQid[current.id] ?? []}
                    onSelect={(choiceId: string) =>
                      onSelect(current.id, choiceId, current.multiple)
                    }
                  />
                ) : (
                  <div className="mt-6 text-sm text-cocoa/70">Nav jautājumu šai tēmai.</div>
                )}

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    className="rounded-2xl border border-fog px-5 py-3 text-sm font-semibold text-cocoa disabled:opacity-40 disabled:hover:cursor-not-allowed hover:cursor-pointer"
                  >
                    Atpakaļ
                  </button>

                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext}
                    className="rounded-2xl bg-[#3F2021] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40 disabled:hover:cursor-not-allowed hover:cursor-pointer"
                  >
                    {currentIndex === quizQuestions.length - 1 ? "Pabeigt" : "Tālāk"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Setup modal if topic has > 50 */}
          <QuizSetupModal
            open={showSetup}
            totalQuestions={totalCount}
            onClose={() => setShowSetup(false)}
            onPick={(mode) => {
              setLimitMode(mode);
              startQuiz(rawQuestions, mode);
            }}
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
