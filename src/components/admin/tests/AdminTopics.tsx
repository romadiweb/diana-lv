import { useEffect, useState } from "react";
import type { TopicRow } from "./types-topics";
import { topicsApi } from "./topicsApi";

export default function AdminTopics() {
  const [rows, setRows] = useState<TopicRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TopicRow | null>(null);

  async function load() {
    setErr(null);
    setBusy(true);
    try {
      const res = await topicsApi.list();
      setRows(res.rows ?? []);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās ielādēt tēmas.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Dzēst šo tēmu?")) return;
    setBusy(true);
    setErr(null);
    try {
      await topicsApi.delete(id);
      await load();
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
          <h1 className="text-2xl font-semibold text-cocoa">Tēmas (Topics)</h1>
          <p className="mt-2 text-sm text-cocoa/70">
            Tabula: <b>topics</b> (add/edit/delete, sort_order).
          </p>
        </div>

        <button
          className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          disabled={busy}
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          + Pievienot tēmu
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {rows.map((t) => (
          <div key={t.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-cocoa/60 font-mono break-all">{t.id}</div>
                <div className="mt-1 text-lg font-semibold text-cocoa">{t.title}</div>
                <div className="mt-1 text-sm text-cocoa/70">
                  slug: <span className="font-mono">{t.slug}</span> • sort: {t.sort_order ?? "—"}
                </div>
                {t.description ? (
                  <div className="mt-2 text-sm text-cocoa/80 whitespace-pre-wrap">{t.description}</div>
                ) : (
                  <div className="mt-2 text-sm text-cocoa/50">—</div>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  className="rounded-xl bg-neutral-200 px-3 py-1.5 text-sm font-semibold"
                  disabled={busy}
                  onClick={() => {
                    setEditing(t);
                    setOpen(true);
                  }}
                >
                  Rediģēt
                </button>

                <button
                  className="rounded-xl bg-red-200 px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
                  disabled={busy}
                  onClick={() => onDelete(t.id)}
                >
                  Dzēst
                </button>
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 && <div className="text-sm text-cocoa/70">Nav tēmu.</div>}
      </div>

      {open && (
        <TopicModal
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

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function TopicModal({
  initial,
  onClose,
  onSaved,
  setErr,
}: {
  initial: TopicRow | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  setErr: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<TopicRow>(
    initial ?? {
      id: "",
      slug: "",
      title: "",
      description: null,
      sort_order: 0,
      created_at: null,
    }
  );

  async function save() {
    setBusy(true);
    setErr(null);

    try {
      if (!form.title.trim()) throw new Error("Title ir obligāts.");

      const slug = (form.slug?.trim() ? form.slug.trim() : slugify(form.title)).toLowerCase();

      const payload = {
        title: form.title.trim(),
        slug,
        description: form.description?.trim() ? form.description.trim() : null,
        sort_order: form.sort_order ?? 0,
      };

      if (initial?.id) {
        await topicsApi.update({ id: initial.id, ...payload });
      } else {
        await topicsApi.create(payload);
      }

      await onSaved();
    } catch (e: any) {
      setErr(e?.message || "Neizdevās saglabāt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-cocoa">{initial ? "Rediģēt tēmu" : "Jauna tēma"}</h2>
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-semibold"
            disabled={busy}
          >
            Aizvērt
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Nosaukums (title)" span2>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="piem. Drošības prasības medībās"
            />
          </Field>

          <Field label="Slug (auto, ja tukšs)" span2>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2 font-mono text-sm"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="piem. drosibas-prasibas-medibas"
            />
            <div className="mt-1 text-xs text-cocoa/60">
              Ja atstāj tukšu, slug tiks ģenerēts no title.
            </div>
          </Field>

          <Field label="sort_order">
            <input
              type="number"
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.sort_order ?? 0}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </Field>

          <Field label="Apraksts (description)" span2>
            <textarea
              className="w-full rounded-xl border border-black/10 px-3 py-2 min-h-[160px]"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional..."
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-semibold"
            disabled={busy}
          >
            Atcelt
          </button>
          <button
            onClick={save}
            className="rounded-xl bg-gray-200 px-5 py-2 font-semibold text-black disabled:opacity-60"
            disabled={busy}
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