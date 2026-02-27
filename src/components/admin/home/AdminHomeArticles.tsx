import { useEffect, useState } from "react";
import type { HomeArticle } from "./types-home-articles";
import { homeArticlesApi } from "./homeArticlesApi";

function toIsoOrNull(v: string) {
  const s = v.trim();
  if (!s) return null;

  // allow YYYY-MM-DD HH:mm
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (m) {
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), 0, 0);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }

  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("lv-LV");
}

export default function AdminHomeArticles() {
  const [rows, setRows] = useState<HomeArticle[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HomeArticle | null>(null);

  async function load() {
    const res = await homeArticlesApi.list();
    setRows(res.rows ?? []);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Dzēst šo rakstu?")) return;
    await homeArticlesApi.delete(id);
    await load();
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-cocoa">Jaunumi / raksti</h1>
          <p className="mt-2 text-sm text-cocoa/70">CRUD tabulai <b>home_articles</b>.</p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black"
        >
          + Jauns raksts
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-6 space-y-4">
        {rows.map((a) => (
          <div key={a.id} className="rounded-2xl border border-black/10 p-5 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-cocoa">{a.title}</div>
                <div className="mt-1 text-xs text-cocoa/60">
                  Publicēts: {fmt(a.published_at)} • Sort: {a.sort_order ?? "—"} • {a.active ? "Aktīvs" : "Neaktīvs"}
                </div>
                {a.excerpt && <div className="mt-2 text-sm text-cocoa/80">{a.excerpt}</div>}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(a);
                    setOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-neutral-200 text-sm font-semibold"
                >
                  Rediģēt
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="px-3 py-1.5 rounded-xl bg-red-200 text-sm font-semibold"
                >
                  Dzēst
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr]">
              <div>
                <div className="text-xs text-cocoa/60 mb-2">Attēls</div>
                {a.image_url ? (
                  <img src={a.image_url} alt="" className="w-full rounded-xl border border-black/10 object-cover" />
                ) : (
                  <div className="rounded-xl border border-dashed border-black/20 p-6 text-sm text-cocoa/60">
                    Nav image_url
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs text-cocoa/60 mb-2">Saturs (renderēts)</div>
                <div
                  className="prose prose-sm max-w-none text-neutral-700"
                  dangerouslySetInnerHTML={{ __html: a.content ?? "" }}
                />
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-sm text-cocoa/70">Nav ierakstu.</div>
        )}
      </div>

      {open && (
        <ArticleModal
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

function ArticleModal({
  initial,
  onClose,
  onSaved,
  setErr,
}: {
  initial: HomeArticle | null;
  onClose: () => void;
  onSaved: () => void;
  setErr: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<HomeArticle>(
    initial ?? {
      id: "",
      title: "",
      excerpt: "",
      content: "",
      published_at: null,
      image_url: "",
      href: "",
      active: true,
      sort_order: 0,
      created_at: null,
      updated_at: null,
    }
  );

  async function save() {
    setBusy(true);
    setErr(null);

    try {
      if (!form.title.trim()) throw new Error("Title ir obligāts.");

      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt?.trim() ? form.excerpt.trim() : null,
        content: form.content ?? null,
        published_at: toIsoOrNull(String(form.published_at ?? "")),
        image_url: form.image_url?.trim() ? form.image_url.trim() : null,
        href: form.href?.trim() ? form.href.trim() : null,
        active: !!form.active,
        sort_order: form.sort_order ?? 0,
      };

      if (initial?.id) {
        await homeArticlesApi.update({ id: initial.id, ...payload });
      } else {
        await homeArticlesApi.create(payload);
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
      <div className="w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-3xl border border-black/10 bg-white p-8">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-semibold text-cocoa">
            {initial ? "Rediģēt rakstu" : "Jauns raksts"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-xl bg-neutral-200 px-4 py-2 font-semibold"
            disabled={busy}
          >
            Aizvērt
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Virsraksts" span2>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>

          <Field label="Excerpt" span2>
            <textarea
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              rows={3}
              value={form.excerpt ?? ""}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </Field>

          <Field label="Published at (ISO vai YYYY-MM-DD HH:mm)">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.published_at ?? ""}
              onChange={(e) => setForm({ ...form, published_at: e.target.value as any })}
              placeholder="2025-05-05 10:03"
            />
          </Field>

          <Field label="Sort order">
            <input
              type="number"
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.sort_order ?? 0}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </Field>

          <Field label="Image URL" span2>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.image_url ?? ""}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </Field>

          <Field label="Href (optional)" span2>
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.href ?? ""}
              onChange={(e) => setForm({ ...form, href: e.target.value })}
            />
          </Field>

          <Field label="Aktīvs">
            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input
                type="checkbox"
                checked={!!form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Rādīt publiski
            </label>
          </Field>

          <Field label="Content (HTML)" span2>
            <textarea
              className="w-full rounded-xl border border-black/10 px-3 py-2 font-mono text-sm min-h-[320px]"
              value={form.content ?? ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="<p>...</p>"
            />
            <div className="mt-2 text-xs text-cocoa/60">
              Edit mode rāda tagus kā tekstu. Listē saturs tiek renderēts.
            </div>
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