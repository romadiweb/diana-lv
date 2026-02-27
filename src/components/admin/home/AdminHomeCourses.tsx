import { useEffect, useState } from "react";
import type { Course } from "./types-home-course-cards";
import { homeCourseCardsApi } from "./homeCourseCardsApi";

export default function Kursukartītes() {
  const [rows, setRows] = useState<Course[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  async function load() {
    setErr(null);
    const res = await homeCourseCardsApi.list();
    setRows(res.rows ?? []);
  }

  useEffect(() => {
    load().catch((e) => setErr(e.message));
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Dzēst šo kursu kartīti?")) return;
    setBusy(true);
    setErr(null);
    try {
      await homeCourseCardsApi.delete(id);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Neizdevās dzēst.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-cocoa">Kursu kartītes</h1>
          <p className="mt-2 text-sm text-cocoa/70">
            CRUD pārvaldība tabulai <b>home_course_cards</b> (pievienot / rediģēt / dzēst, active, sort_order).
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
          className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black hover:opacity-95 hover:cursor-pointer disabled:opacity-60"
          disabled={busy}
        >
          + Jauna kartīte
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((c) => (
          <div key={c.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="text-lg font-semibold text-cocoa">{c.title}</div>
              <span
                className={[
                  "rounded-full px-3 py-1 text-xs font-semibold border",
                  c.active ? "bg-green-50 border-green-200 text-green-800" : "bg-neutral-50 border-black/10 text-neutral-700",
                ].join(" ")}
              >
                {c.active ? "Aktīvs" : "Neaktīvs"}
              </span>
            </div>

            <div className="mt-2 text-sm text-cocoa/70">{c.description ?? "—"}</div>

            <div className="mt-3 text-sm text-cocoa">
              Cena: <b>{c.price_amount ?? "—"} {c.price_currency ?? ""}</b>
            </div>

            <div className="mt-1 text-xs text-cocoa/60">Sort: {c.sort_order ?? "—"}</div>
            <div className="mt-1 text-xs text-cocoa/60">Slug: {c.slug ?? "—"}</div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setEditing(c);
                  setOpen(true);
                }}
                className="rounded-xl border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-cocoa hover:bg-white"
                disabled={busy}
              >
                Rediģēt
              </button>
              <button
                onClick={() => onDelete(c.id)}
                className="rounded-xl border border-red-500/20 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                disabled={busy}
              >
                Dzēst
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-sm text-cocoa/70">Nav ierakstu.</div>
        )}
      </div>

      {open && (
        <HomeCourseCardModal
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

/** -------- modal (iekšā vienā failā, lai tev nav imports jākārto) -------- */
function HomeCourseCardModal({
  initial,
  onClose,
  onSaved,
  setErr,
}: {
  initial: Course | null;
  onClose: () => void;
  onSaved: () => void;
  setErr: (v: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState<Course>(
    initial ?? {
      id: "",
      title: "",
      description: "",
      content: "",
      icon: "",
      href: "",
      slug: "",
      active: true,
      sort_order: 0,
      price_amount: null,
      price_currency: "€",
      created_at: null,
      updated_at: null,
    }
  );

  async function save() {
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        content: form.content,
        icon: form.icon,
        href: form.href,
        slug: form.slug,
        active: form.active,
        sort_order: form.sort_order,
        price_amount: form.price_amount,
        price_currency: form.price_currency,
      };

      if (initial?.id) {
        await homeCourseCardsApi.update({ id: initial.id, ...payload });
      } else {
        await homeCourseCardsApi.create(payload);
      }

      await onSaved();
    } catch (e: any) {
      setErr(e?.message || "Neizdevās saglabāt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-black/10 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="text-lg font-semibold text-cocoa">{initial ? "Rediģēt kartīti" : "Jauna kartīte"}</div>
          <button
            onClick={onClose}
            className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-cocoa hover:bg-black/5"
          >
            Aizvērt
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Field label="Virsraksts">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>

          <Field label="Slug">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.slug ?? ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </Field>

          <Field label="Apraksts" span2>
            <textarea
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              rows={3}
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <Field label="Saturs (content)" span2>
            <textarea
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              rows={4}
              value={form.content ?? ""}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </Field>

          <Field label="Icon URL">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.icon ?? ""}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </Field>

          <Field label="Href">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.href ?? ""}
              onChange={(e) => setForm({ ...form, href: e.target.value })}
            />
          </Field>

          <Field label="Cena">
            <input
              type="number"
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.price_amount ?? ""}
              onChange={(e) =>
                setForm({ ...form, price_amount: e.target.value === "" ? null : Number(e.target.value) })
              }
            />
          </Field>

          <Field label="Valūta">
            <input
              className="w-full rounded-xl border border-black/10 px-3 py-2"
              value={form.price_currency ?? "€"}
              onChange={(e) => setForm({ ...form, price_currency: e.target.value })}
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
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-cocoa hover:bg-black/5"
            disabled={busy}
          >
            Atcelt
          </button>
          <button
            onClick={save}
            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black hover:opacity-95 disabled:opacity-60"
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
      <label className="text-sm font-medium text-cocoa">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}