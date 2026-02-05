import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type TopicRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  sort_order: number | null;
};

type ChoiceRow = {
  id: string;
  text: string;
  is_correct: boolean;
  sort_order: number | null;
};

type QuestionRow = {
  id: string;
  topic_id: string;
  text: string;
  image_url: string | null;
  image_alt: string | null;
  multiple: boolean | null;
  explanation: string | null;
  sort_order: number | null;
  choices?: ChoiceRow[];
};

export default function TestPage() {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);

  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // For quick debug info
  const envInfo = useMemo(() => {
    const url = (import.meta as any).env?.VITE_SUPABASE_URL;
    const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
    return {
      hasUrl: !!url,
      hasKey: !!key,
      urlPreview: typeof url === "string" ? `${url.slice(0, 35)}...` : "missing",
      keyPreview: typeof key === "string" ? `${key.slice(0, 18)}...` : "missing",
    };
  }, []);

  // Load topics on first mount
  useEffect(() => {
    const run = async () => {
      setError(null);
      setLoadingTopics(true);

      const { data, error } = await supabase
        .from("topics")
        .select("id, slug, title, description, sort_order")
        .order("sort_order", { ascending: true });

      setLoadingTopics(false);

      if (error) {
        setError(
          `Failed to load topics: ${error.message}\n\nTip: If you enabled RLS but didn't add the SELECT policy, you will get a permission error.`
        );
        return;
      }

      setTopics(data ?? []);
      // Auto-select first topic if exists
      if (data && data.length > 0) setSelectedTopicId(data[0].id);
    };

    run();
  }, []);

  // Load questions whenever selectedTopicId changes
  useEffect(() => {
    if (!selectedTopicId) {
      setQuestions([]);
      return;
    }

    const run = async () => {
      setError(null);
      setLoadingQuestions(true);

      const { data, error } = await supabase
        .from("questions")
        .select(
          `
          id,
          topic_id,
          text,
          image_url,
          image_alt,
          multiple,
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
        .eq("topic_id", selectedTopicId)
        .order("sort_order", { ascending: true });

      setLoadingQuestions(false);

      if (error) {
        setError(
          `Failed to load questions: ${error.message}\n\nTip: You need SELECT policies on questions and choices when RLS is enabled.`
        );
        return;
      }

      // Sort choices by sort_order (Supabase doesn't always order nested arrays)
      const normalized =
        (data ?? []).map((q: any) => ({
          ...q,
          choices: (q.choices ?? []).slice().sort((a: ChoiceRow, b: ChoiceRow) => {
            const ao = a.sort_order ?? 0;
            const bo = b.sort_order ?? 0;
            return ao - bo;
          }),
        })) ?? [];

      setQuestions(normalized);
    };

    run();
  }, [selectedTopicId]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <h1 className="text-2xl font-semibold text-cocoa">Supabase Test Page</h1>
      <p className="mt-2 text-sm text-cocoa/70">
        This page is only for checking that your Supabase connection + tables work.
      </p>

      {/* ENV debug */}
      <div className="mt-4 rounded-2xl border border-fog/70 bg-white p-4">
        <div className="text-sm font-semibold text-cocoa">Env check</div>
        <div className="mt-2 text-sm text-cocoa/80">
          <div>VITE_SUPABASE_URL present: {String(envInfo.hasUrl)}</div>
          <div>VITE_SUPABASE_ANON_KEY present: {String(envInfo.hasKey)}</div>
          <div>URL preview: {envInfo.urlPreview}</div>
          <div>KEY preview: {envInfo.keyPreview}</div>
        </div>
        <div className="mt-2 text-xs text-cocoa/60">
          If these are missing, restart <code>npm run dev</code> after editing .env.
        </div>
      </div>

      {/* Error box */}
      {error && (
        <div className="mt-4 whitespace-pre-wrap rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Topics panel */}
        <div className="rounded-3xl border border-fog/70 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-cocoa">Topics</h2>
            {loadingTopics && (
              <span className="text-xs font-semibold text-cocoa/60">Loading…</span>
            )}
          </div>

          {topics.length === 0 && !loadingTopics ? (
            <p className="mt-3 text-sm text-cocoa/70">
              No topics found. Insert at least one row into <b>topics</b> table.
            </p>
          ) : (
            <div className="mt-4 space-y-2">
              {topics.map((t) => {
                const active = t.id === selectedTopicId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTopicId(t.id)}
                    className={[
                      "w-full rounded-2xl border px-4 py-3 text-left transition",
                      active
                        ? "border-fog bg-[#FBF8F5]"
                        : "border-fog/70 bg-white hover:bg-fog/20",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-cocoa">{t.title}</div>
                        <div className="mt-1 text-xs text-cocoa/60">slug: {t.slug}</div>
                      </div>
                      <div className="text-xs text-cocoa/60">
                        {typeof t.sort_order === "number" ? `#${t.sort_order}` : ""}
                      </div>
                    </div>

                    {t.description ? (
                      <div className="mt-2 text-xs text-cocoa/70">{t.description}</div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Questions panel */}
        <div className="lg:col-span-2 rounded-3xl border border-fog/70 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-cocoa">Questions</h2>
            {loadingQuestions && (
              <span className="text-xs font-semibold text-cocoa/60">Loading…</span>
            )}
          </div>

          {!selectedTopicId ? (
            <p className="mt-3 text-sm text-cocoa/70">Select a topic to load questions.</p>
          ) : questions.length === 0 && !loadingQuestions ? (
            <p className="mt-3 text-sm text-cocoa/70">
              No questions found for this topic. Insert rows into <b>questions</b> and
              connect via <b>topic_id</b>.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="rounded-2xl border border-fog/70 bg-[#FBF8F5] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-cocoa/60">Question {idx + 1}</div>
                      <div className="mt-1 text-sm font-semibold text-cocoa">{q.text}</div>
                      <div className="mt-2 text-xs text-cocoa/60">
                        multiple: {String(!!q.multiple)} · sort_order:{" "}
                        {typeof q.sort_order === "number" ? q.sort_order : "—"}
                      </div>
                    </div>
                    <div className="text-[11px] text-cocoa/60">id: {q.id.slice(0, 8)}…</div>
                  </div>

                  {/* Optional image */}
                  {q.image_url ? (
                    <div className="mt-3">
                      <img
                        src={q.image_url}
                        alt={q.image_alt ?? "Question image"}
                        className="max-h-56 w-full rounded-2xl border border-fog/70 object-contain bg-white"
                        loading="lazy"
                      />
                      <div className="mt-1 text-xs text-cocoa/60">
                        image_alt: {q.image_alt ?? "—"}
                      </div>
                    </div>
                  ) : null}

                  {/* Choices */}
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-cocoa">Choices</div>
                    {(!q.choices || q.choices.length === 0) ? (
                      <div className="mt-2 text-sm text-cocoa/70">
                        No choices found. Add rows to <b>choices</b> with this question_id.
                      </div>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {q.choices.map((c, cIdx) => (
                          <li
                            key={c.id}
                            className="flex items-start justify-between gap-3 rounded-xl border border-fog/70 bg-white px-3 py-2"
                          >
                            <div className="text-sm text-cocoa">
                              <span className="mr-2 text-xs text-cocoa/60">{cIdx + 1}.</span>
                              {c.text}
                            </div>
                            <div
                              className={[
                                "text-xs font-semibold",
                                c.is_correct ? "text-green-700" : "text-cocoa/60",
                              ].join(" ")}
                              title="Debug: correct answer flag"
                            >
                              {c.is_correct ? "correct" : "—"}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Explanation */}
                  {q.explanation ? (
                    <div className="mt-3 rounded-xl border border-fog/70 bg-white p-3 text-sm text-cocoa/80">
                      <div className="text-xs font-semibold text-cocoa">Explanation</div>
                      <div className="mt-1">{q.explanation}</div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}

          {/* Helpful hints */}
          <div className="mt-6 rounded-2xl border border-fog/70 bg-white p-4 text-xs text-cocoa/70">
            <div className="font-semibold text-cocoa">Common errors</div>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                If you see <b>permission denied</b>, you enabled RLS but didn’t create SELECT
                policies.
              </li>
              <li>
                If topics load but choices are empty, make sure choices rows use the same{" "}
                <b>question_id</b>.
              </li>
              <li>
                If env vars show missing, restart dev server after editing <code>.env</code>.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
