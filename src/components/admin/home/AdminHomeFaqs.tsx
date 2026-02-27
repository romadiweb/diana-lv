import { useEffect, useState } from "react";
import type { HomeFaq } from "./types-home-faqs";
import { homeFaqsApi } from "./homeFaqsApi";

export default function AdminHomeFaqs() {
  const [rows, setRows] = useState<HomeFaq[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HomeFaq | null>(null);

  async function load() {
    const res = await homeFaqsApi.list();
    setRows(res.rows ?? []);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Dzēst šo BUJ?")) return;
    await homeFaqsApi.delete(id);
    await load();
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <h1 className="text-2xl font-semibold text-cocoa">BUJ pārvaldība</h1>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <button
        onClick={() => {
          setEditing(null);
          setOpen(true);
        }}
        className="mt-4 rounded-xl bg-gray-200 px-4 py-2 text-black"
      >
        + Jauns Jautājums
      </button>

      <div className="mt-6 space-y-4">
        {rows.map((faq) => (
          <div key={faq.id} className="rounded-2xl border border-black/10 p-5 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-cocoa">{faq.question}</div>
                <div className="mt-1 text-xs text-cocoa/60">
                  Sort: {faq.sort_order ?? "—"} • {faq.active ? "Aktīvs" : "Neaktīvs"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(faq);
                    setOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-200 text-sm font-semibold"
                >
                  Rediģēt
                </button>
                <button
                  onClick={() => onDelete(faq.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-200 text-sm font-semibold"
                >
                  Dzēst
                </button>
              </div>
            </div>

            {/* ✅ render HTML nicely */}
            <div
              className="prose prose-sm max-w-none mt-4 text-neutral-700"
              dangerouslySetInnerHTML={{ __html: faq.answer ?? "" }}
            />
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-sm text-cocoa/70">Nav BUJ ierakstu.</div>
        )}
      </div>

      {open && (
        <FaqModal
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

function FaqModal({
  initial,
  onClose,
  onSaved,
  setErr,
}: {
  initial: HomeFaq | null;
  onClose: () => void;
  onSaved: () => void;
  setErr: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<any>(
    initial ?? {
      question: "",
      answer: "",
      active: true,
      sort_order: 0,
    }
  );

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      if (!form.question?.trim()) throw new Error("Jautājums ir obligāts.");

      if (initial) {
        await homeFaqsApi.update({ id: initial.id, ...form });
      } else {
        await homeFaqsApi.create(form);
      }
      await onSaved();
    } catch (e: any) {
      setErr(e?.message || "Neizdevās saglabāt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      {/* ✅ bigger modal */}
      <div className="bg-white p-8 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-y-auto border border-black/10">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-cocoa">
            {initial ? "Rediģēt BUJ" : "Jauns BUJ"}
          </h2>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-200 font-semibold"
            disabled={busy}
          >
            Aizvērt
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-sm font-semibold text-cocoa">Jautājums</label>
            <input
              placeholder="Jautājums"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              className="mt-1 border border-black/10 p-3 rounded-xl w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-cocoa">Atbilde (HTML atļauts)</label>
            {/* ✅ show tags in edit mode (raw) */}
            <textarea
              placeholder="Atbilde (vari lietot <h2>, <p>, <ul> ...)"
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              className="mt-1 border border-black/10 p-3 rounded-xl w-full min-h-[320px] font-mono text-sm"
            />
            <div className="mt-2 text-xs text-cocoa/60">
              Šeit redzi HTML tagus kā tekstu (edit mode). Saglabājot, tie tiks renderēti listē.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input
                type="checkbox"
                checked={!!form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Aktīvs
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-cocoa">Sort order</label>
              <input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="border border-black/10 p-2 rounded-xl w-28"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 rounded-xl font-semibold"
            disabled={busy}
          >
            Atcelt
          </button>
          <button
            onClick={save}
            className="px-5 py-2 bg-gray-200 text-black rounded-xl font-semibold disabled:opacity-60"
            disabled={busy}
          >
            Saglabāt
          </button>
        </div>
      </div>
    </div>
  );
}