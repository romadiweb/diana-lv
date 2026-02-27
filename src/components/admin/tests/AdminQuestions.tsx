import { useEffect, useMemo, useState } from "react";
import type { QuestionRow } from "./types-questions";
import type { ChoiceRow } from "./types-choices";
import { questionsApi } from "./questionsApi";
import { choicesApi } from "./choicesApi";

type PagedResp = {
  rows: QuestionRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export default function AdminQuestions() {
  const [rows, setRows] = useState<QuestionRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [topicId, setTopicId] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionRow | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  async function load(next?: Partial<{ page: number; pageSize: number; search: string; topicId: string }>) {
    setErr(null);
    setBusy(true);
    try {
      const p = next?.page ?? page;
      const ps = next?.pageSize ?? pageSize;
      const s = next?.search ?? search;
      const t = next?.topicId ?? topicId;

      const res: PagedResp = await questionsApi.list({
        page: p,
        pageSize: ps,
        search: s || undefined,
        topic_id: t || undefined,
      });

      setRows(res.rows ?? []);
      setTotal(res.total ?? 0);
      setPage(res.page ?? p);
      setPageSize(res.pageSize ?? ps);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās ielādēt jautājumus.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Dzēst šo jautājumu?")) return;
    setBusy(true);
    setErr(null);
    try {
      await questionsApi.delete(id);
      const nextPage = rows.length === 1 && page > 1 ? page - 1 : page;
      await load({ page: nextPage });
    } catch (e: any) {
      setErr(e?.message || "Neizdevās dzēst.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-cocoa">Testa jautājumi</h1>
          <p className="mt-2 text-sm text-cocoa/70">
            Tabula: <b>questions</b> (paging + add/edit/delete + atbilžu varianti).
          </p>
        </div>

        <button
          className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black hover:opacity-95 disabled:opacity-60"
          disabled={busy}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Pievienot jautājumu
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Filters */}
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div>
          <label className="text-sm font-semibold text-cocoa">Meklēt pēc teksta</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="piem. pēdas, medības..."
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-cocoa">Topic ID (optional)</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 font-mono text-xs"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            placeholder="uuid..."
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            className="rounded-xl bg-cocoa px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={busy}
            onClick={() => load({ page: 1 })}
          >
            Filtrēt
          </button>

          <button
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-cocoa disabled:opacity-60"
            disabled={busy}
            onClick={() => {
              setSearch("");
              setTopicId("");
              load({ page: 1, search: "", topicId: "" });
            }}
          >
            Notīrīt
          </button>
        </div>
      </div>

      {/* Paging */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-cocoa/70">
        <div>
          Kopā: <b className="text-cocoa">{total}</b> • Lapa <b className="text-cocoa">{page}</b> /{" "}
          <b className="text-cocoa">{totalPages}</b>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-cocoa">Page size</label>
          <select
            className="rounded-xl border border-black/10 px-3 py-2"
            value={pageSize}
            onChange={(e) => load({ page: 1, pageSize: Number(e.target.value) })}
            disabled={busy}
          >
            {[10, 20, 30, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            className="rounded-xl border border-black/10 bg-white px-3 py-2 font-semibold text-cocoa disabled:opacity-60"
            disabled={busy || page <= 1}
            onClick={() => load({ page: page - 1 })}
          >
            ←
          </button>
          <button
            className="rounded-xl border border-black/10 bg-white px-3 py-2 font-semibold text-cocoa disabled:opacity-60"
            disabled={busy || page >= totalPages}
            onClick={() => load({ page: page + 1 })}
          >
            →
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-5 space-y-4">
        {rows.map((q) => (
          <div key={q.id} className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-cocoa/60 font-mono break-all">{q.id}</div>
                <div className="mt-1 text-lg font-semibold text-cocoa break-words">{q.text}</div>

                <div className="mt-2 text-xs text-cocoa/60">
                  topic_id: <span className="font-mono break-all">{q.topic_id}</span> • sort: {q.sort_order ?? "—"} •{" "}
                  {q.multiple ? "multiple" : "single"}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  className="rounded-xl bg-neutral-200 px-3 py-1.5 text-sm font-semibold"
                  onClick={() => {
                    setEditing(q);
                    setOpen(true);
                  }}
                  disabled={busy}
                >
                  Rediģēt
                </button>

                <button
                  className="rounded-xl bg-red-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
                  onClick={() => onDelete(q.id)}
                  disabled={busy}
                >
                  Dzēst
                </button>
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 && <div className="text-sm text-cocoa/70">Nav jautājumu šajā filtrā.</div>}
      </div>

      {open && (
        <QuestionModal
          initial={editing}
          onClose={() => setOpen(false)}
          onSaved={async () => {
            setOpen(false);
            await load();
          }}
          setErr={setErr}
        />
      )}
    </div>
  );
}

function QuestionModal({
  initial,
  onClose,
  onSaved,
  setErr,
}: {
  initial: QuestionRow | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  setErr: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<QuestionRow>(
    initial ?? {
      id: "",
      topic_id: "",
      text: "",
      image_url: null,
      image_alt: null,
      multiple: false,
      explanation: null,
      sort_order: 0,
      created_at: null,
      updated_at: null,
    }
  );

  // ---- choices state
  const [choices, setChoices] = useState<ChoiceRow[]>([]);
  const [choicesBusy, setChoicesBusy] = useState(false);
  const [newChoiceText, setNewChoiceText] = useState("");
  const [newChoiceIsCorrect, setNewChoiceIsCorrect] = useState(false);

  async function loadChoices(questionId: string) {
    setChoicesBusy(true);
    try {
      const res = await choicesApi.listByQuestion(questionId);
      setChoices(res.rows ?? []);
    } finally {
      setChoicesBusy(false);
    }
  }

  useEffect(() => {
    if (initial?.id) {
      loadChoices(initial.id).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  async function saveQuestion(): Promise<string> {
    setBusy(true);
    setErr(null);

    try {
      if (!form.topic_id.trim()) throw new Error("topic_id ir obligāts.");
      if (!form.text.trim()) throw new Error("Jautājuma teksts ir obligāts.");

      const payload = {
        topic_id: form.topic_id.trim(),
        text: form.text.trim(),
        image_url: form.image_url?.trim() ? form.image_url.trim() : null,
        image_alt: form.image_alt?.trim() ? form.image_alt.trim() : null,
        multiple: !!form.multiple,
        explanation: form.explanation?.trim() ? form.explanation.trim() : null,
        sort_order: form.sort_order ?? 0,
      };

      if (initial?.id) {
        await questionsApi.update({ id: initial.id, ...payload });
        return initial.id;
      } else {
        const res = await questionsApi.create(payload);
        const createdId = res?.row?.id as string | undefined;
        if (!createdId) throw new Error("Neizdevās izveidot jautājumu (nav id).");
        // after create: update local form id so we can manage answers
        setForm((f) => ({ ...f, id: createdId }));
        return createdId;
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveAndClose() {
    try {
      const qid = await saveQuestion();
      // reload answers after save if editing
      if (qid) await loadChoices(qid);
      await onSaved();
    } catch (e: any) {
      setErr(e?.message || "Neizdevās saglabāt.");
    }
  }

  async function addChoice() {
    const qid = initial?.id || form.id;
    if (!qid) {
      setErr("Vispirms saglabā jautājumu, tad var pievienot atbildes.");
      return;
    }

    if (!newChoiceText.trim()) return;

    setChoicesBusy(true);
    setErr(null);
    try {
      // if single-choice: if setting correct=true, unset others in UI (and update DB)
      if (!form.multiple && newChoiceIsCorrect) {
        // unset existing correct
        const correctOnes = choices.filter((c) => c.is_correct);
        for (const c of correctOnes) {
          await choicesApi.update({ id: c.id, is_correct: false });
        }
      }

      const nextSort =
        Math.max(0, ...choices.map((c) => (c.sort_order ?? 0))) + 1;

      await choicesApi.create({
        question_id: qid,
        text: newChoiceText.trim(),
        is_correct: !!newChoiceIsCorrect,
        sort_order: nextSort,
      });

      setNewChoiceText("");
      setNewChoiceIsCorrect(false);
      await loadChoices(qid);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās pievienot atbildi.");
    } finally {
      setChoicesBusy(false);
    }
  }

  async function updateChoice(id: string, patch: Partial<ChoiceRow>) {
    setChoicesBusy(true);
    setErr(null);
    try {
      // if single-choice and setting is_correct true -> unset others first
      if (!form.multiple && patch.is_correct === true) {
        const others = choices.filter((c) => c.id !== id && c.is_correct);
        for (const c of others) {
          await choicesApi.update({ id: c.id, is_correct: false });
        }
      }

      await choicesApi.update({ id, ...patch });
      const qid = initial?.id || form.id;
      if (qid) await loadChoices(qid);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās saglabāt izmaiņas.");
    } finally {
      setChoicesBusy(false);
    }
  }

  async function deleteChoice(id: string) {
    if (!confirm("Dzēst šo atbildi?")) return;
    setChoicesBusy(true);
    setErr(null);
    try {
      await choicesApi.delete(id);
      const qid = initial?.id || form.id;
      if (qid) await loadChoices(qid);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās dzēst atbildi.");
    } finally {
      setChoicesBusy(false);
    }
  }

  const canManageChoices = !!(initial?.id || form.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-cocoa">
            {initial ? "Rediģēt jautājumu" : "Jauns jautājums"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-semibold"
            disabled={busy || choicesBusy}
          >
            Aizvērt
          </button>
        </div>

        {/* Question form */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="topic_id (UUID)">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2 font-mono text-xs"
              value={form.topic_id}
              onChange={(e) => setForm({ ...form, topic_id: e.target.value })}
              placeholder="uuid..."
            />
          </Field>

          <Field label="sort_order">
            <input
              type="number"
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.sort_order ?? 0}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </Field>

          <Field label="Jautājuma teksts" span2>
            <textarea
              className="w-full rounded-xl border border-black/10 px-3 py-2 min-h-[140px]"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="Ievadi jautājumu..."
            />
          </Field>

          <Field label="image_url (optional)" span2>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://..."
            />
          </Field>

          <Field label="image_alt (optional)" span2>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.image_alt ?? ""}
              onChange={(e) => setForm({ ...form, image_alt: e.target.value })}
              placeholder="Alt teksts..."
            />
          </Field>

          <Field label="multiple">
            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input
                type="checkbox"
                checked={!!form.multiple}
                onChange={(e) => setForm({ ...form, multiple: e.target.checked })}
              />
              Atļaut vairākas pareizās atbildes
            </label>
          </Field>

          <Field label="explanation (optional)" span2>
            <textarea
              className="w-full rounded-xl border border-black/10 px-3 py-2 min-h-[140px]"
              value={form.explanation ?? ""}
              onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              placeholder="Paskaidrojums..."
            />
          </Field>
        </div>

        {/* Choices section */}
        <div className="mt-8 rounded-3xl border border-black/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-cocoa">Atbilžu varianti</div>
              <div className="text-sm text-cocoa/70">
                Tabula: <b>choices</b> (question_id → variants).
              </div>
            </div>

            {!canManageChoices && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-500/20 rounded-2xl px-4 py-2">
                Vispirms nospied <b>Save</b> jautājumam, lai var pievienot atbildes.
              </div>
            )}
          </div>

          {/* Add new choice */}
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_140px_120px]">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={newChoiceText}
              onChange={(e) => setNewChoiceText(e.target.value)}
              placeholder="Atbildes teksts..."
              disabled={!canManageChoices || choicesBusy}
            />
            <label className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm text-cocoa">
              <input
                type="checkbox"
                checked={newChoiceIsCorrect}
                onChange={(e) => setNewChoiceIsCorrect(e.target.checked)}
                disabled={!canManageChoices || choicesBusy}
              />
              Pareiza
            </label>
            <button
              className="rounded-xl bg-cocoa px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              onClick={addChoice}
              disabled={!canManageChoices || choicesBusy || !newChoiceText.trim()}
            >
              + Pievienot
            </button>
          </div>

          {/* Choices list */}
          <div className="mt-5 space-y-3">
            {choicesBusy && <div className="text-sm text-cocoa/60">Ielādē...</div>}

            {choices.map((c) => (
              <div key={c.id} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="grid gap-3 md:grid-cols-[1fr_120px_120px_120px] items-center">
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2"
                    value={c.text}
                    onChange={(e) => {
                      const v = e.target.value;
                      setChoices((prev) => prev.map((x) => (x.id === c.id ? { ...x, text: v } : x)));
                    }}
                    onBlur={() => updateChoice(c.id, { text: c.text })}
                    disabled={choicesBusy}
                  />

                  <label className="flex items-center gap-2 text-sm text-cocoa">
                    <input
                      type="checkbox"
                      checked={!!c.is_correct}
                      onChange={(e) => updateChoice(c.id, { is_correct: e.target.checked })}
                      disabled={choicesBusy}
                    />
                    Pareiza
                  </label>

                  <input
                    type="number"
                    className="w-full rounded-xl border border-black/10 px-3 py-2"
                    value={c.sort_order ?? 0}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setChoices((prev) => prev.map((x) => (x.id === c.id ? { ...x, sort_order: v } : x)));
                    }}
                    onBlur={() => updateChoice(c.id, { sort_order: c.sort_order ?? 0 })}
                    disabled={choicesBusy}
                  />

                  <button
                    className="rounded-xl bg-red-200 px-3 py-2 text-sm font-semibold disabled:opacity-60"
                    onClick={() => deleteChoice(c.id)}
                    disabled={choicesBusy}
                  >
                    Dzēst
                  </button>
                </div>

                <div className="mt-2 text-xs text-cocoa/60 font-mono break-all">id: {c.id}</div>
              </div>
            ))}

            {canManageChoices && !choicesBusy && choices.length === 0 && (
              <div className="text-sm text-cocoa/60">Nav pievienotu atbilžu variantu.</div>
            )}
          </div>

          {!form.multiple && (
            <div className="mt-4 text-xs text-cocoa/60">
              * Šim jautājumam ir <b>single</b> režīms — ja atzīmēsi vienu pareizu, pārējie automātiski kļūs nepareizi.
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-semibold"
            disabled={busy || choicesBusy}
          >
            Atcelt
          </button>
          <button
            onClick={saveAndClose}
            className="rounded-xl bg-gray-200 px-5 py-2 font-semibold text-black disabled:opacity-60"
            disabled={busy || choicesBusy}
          >
            Saglabāt
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? "md:col-span-2" : ""}>
      <label className="text-sm font-semibold text-cocoa">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}