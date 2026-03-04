import { useEffect, useMemo, useState } from "react";
import {
  adminCreateProduct,
  adminDeleteProduct,
  adminListProducts,
  adminUpdateProduct,
  adminCreateCategory,
  adminListCategories,
  adminDeleteCategory,
  type AdminProductPayload,
} from "../../../lib/adminApi";
import { fileToWebpDataUrl } from "../../../lib/imageToWebp";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB input limit
const WEBP_MAX_WIDTH = 1400;
const WEBP_QUALITY = 0.8;
const WARN_WEBP_BYTES = 900 * 1024;

function estimateDataUrlBytes(dataUrl: string) {
  const comma = dataUrl.indexOf(",");
  if (comma === -1) return 0;
  const b64 = dataUrl.slice(comma + 1);
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((b64.length * 3) / 4) - padding);
}

function formatKB(bytes: number) {
  return `${Math.round(bytes / 1024)} KB`;
}

type ProductRow = any;
type CategoryRow = { id: string; name: string; slug: string; sort_order?: number };

export default function AdminProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [form, setForm] = useState<AdminProductPayload>({
    title: "",
    active: true,
    sort_order: 0,
    category_id: null,
  });

  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");

  async function reload() {
    setErr(null);
    const [prods, cats] = await Promise.all([adminListProducts(true), adminListCategories()]);
    setRows(prods);
    setCategories(cats);
  }

  useEffect(() => {
    reload().catch((e) => setErr(e.message));
  }, []);

  const isEdit = !!editing?.id;

  const categoriesById = useMemo(() => {
    const m = new Map<string, CategoryRow>();
    for (const c of categories) m.set(c.id, c);
    return m;
  }, [categories]);

  function startCreate() {
    setEditing(null);
    setForm({ title: "", active: true, sort_order: 0, category_id: null });
  }

  function startEdit(r: ProductRow) {
    setEditing(r);
    setForm({
      id: r.id,
      title: r.title,
      slug: r.slug,
      category_id: r.category_id ?? null,
      short_description: r.short_description ?? "",
      description: r.description ?? "",
      price_eur: r.price_eur ?? null,
      sku: r.sku ?? "",
      active: r.active,
      sort_order: r.sort_order ?? 0,
    });
  }

  async function onPickImage(file?: File | null) {
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setErr(
        `Attēls ir pārāk liels (${formatKB(file.size)}). Maksimālais izmērs: ${formatKB(
          MAX_UPLOAD_BYTES
        )}.`
      );
      return;
    }

    try {
      setErr(null);
      setBusy(true);

      const dataUrl = await fileToWebpDataUrl(file, {
        maxWidth: WEBP_MAX_WIDTH,
        quality: WEBP_QUALITY,
      });

      const outBytes = estimateDataUrlBytes(dataUrl);
      if (outBytes > WARN_WEBP_BYTES) {
        setErr(
          `Brīdinājums: pēc kompresijas attēls vēl ir salīdzinoši liels (~${formatKB(
            outBytes
          )}).`
        );
      }

      setForm((f) => ({ ...f, imageDataUrl: dataUrl, imageAlt: f.title || "Produkta attēls" }));
    } catch (e: any) {
      setErr(e?.message || "Neizdevās apstrādāt attēlu");
    } finally {
      setBusy(false);
    }
  }

  async function createCategoryQuick() {
    const name = newCatName.trim();
    if (!name) {
      setErr("Ievadi kategorijas nosaukumu.");
      return;
    }

    setBusy(true);
    setErr(null);
    try {
      const created = await adminCreateCategory({
        name,
        slug: newCatSlug.trim() || undefined,
        sort_order: 0,
      });

      const cats = await adminListCategories();
      setCategories(cats);

      // auto-select in product form
      setForm((f) => ({ ...f, category_id: created.id }));

      setNewCatName("");
      setNewCatSlug("");
    } catch (e: any) {
      setErr(e?.message || "Neizdevās izveidot kategoriju");
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(id: string) {
    const cat = categories.find((c) => c.id === id);
    const name = cat?.name || "šo kategoriju";

    // best-effort: show affected products count (based on loaded list)
    const affected = rows.filter((p) => p.category_id === id).length;

    const ok = confirm(
      affected > 0
        ? `Dzēst kategoriju "${name}"?\n\nUZMANĪBU: ${affected} produktiem kategorija tiks noņemta (paliks “Bez kategorijas”).`
        : `Dzēst kategoriju "${name}"?`
    );
    if (!ok) return;

    setBusy(true);
    setErr(null);
    try {
      await adminDeleteCategory(id);

      // refresh UI
      await reload();

      // if the form had this category selected, clear it
      setForm((f) => (f.category_id === id ? { ...f, category_id: null } : f));
    } catch (e: any) {
      setErr(e?.message || "Neizdevās dzēst kategoriju");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    setErr(null);
    setBusy(true);
    try {
      if (isEdit && editing?.id) {
        await adminUpdateProduct({ ...(form as any), id: editing.id });
      } else {
        await adminCreateProduct(form);
      }
      await reload();
      startCreate();
    } catch (e: any) {
      setErr(e.message || "Neizdevās saglabāt");
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(id: string) {
    if (!confirm("Dzēst šo produktu?")) return;
    setErr(null);
    setBusy(true);
    try {
      await adminDeleteProduct(id);
      await reload();
      if (editing?.id === id) startCreate();
    } catch (e: any) {
      setErr(e.message || "Neizdevās dzēst");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Product list */}
      <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Produkti</h2>
          <button onClick={startCreate} className="rounded-xl border px-3 py-2 text-sm">
            + Jauns
          </button>
        </div>

        {err && <div className="mt-4 text-sm text-red-600">{err}</div>}

        <div className="mt-4 space-y-2">
          {rows.map((r) => {
            const cat = r.category_id ? categoriesById.get(r.category_id) : null;
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border bg-white p-3"
              >
                <div>
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-xs opacity-60">
                    {r.active ? "Aktīvs" : "Paslēpts"} • slug: {r.slug}
                    {cat?.name ? ` • kategorija: ${cat.name}` : ""}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="rounded-xl border px-3 py-2 text-sm text-black"
                    onClick={() => startEdit(r)}
                  >
                    Rediģēt
                  </button>
                  <button
                    className="rounded-xl border px-3 py-2 text-sm "
                    onClick={() => removeProduct(r.id)}
                  >
                    Dzēst
                  </button>
                </div>
              </div>
            );
          })}
          {!rows.length && <div className="text-sm opacity-60">Vēl nav nevienas preces.</div>}
        </div>
      </div>

      {/* Form */}
      <div className="rounded-2xl border bg-white/70 p-5 shadow-sm">
        <h2 className="text-xl font-semibold">{isEdit ? "Rediģēt produktu" : "Izveidot produktu"}</h2>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="text-sm font-medium">Nosaukums</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Categories block */}
          <div className="rounded-xl border p-3">
            <div className="text-sm font-medium">Kategorija</div>

            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-xs opacity-70">Izvēlēties no saraksta</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={form.category_id ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value || null }))}
                >
                  <option value="">— Bez kategorijas —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs opacity-60">
                  Ja nav vajadzīgās kategorijas — izveido jaunu labajā pusē.
                </div>
              </div>

              <div className="rounded-xl border bg-white p-3">
                <div className="text-xs font-semibold opacity-70">Ātri izveidot jaunu</div>

                <input
                  className="mt-2 w-full rounded-xl border px-3 py-2"
                  placeholder="Kategorijas nosaukums (piem. Aksesuāri)"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />

                <input
                  className="mt-2 w-full rounded-xl border px-3 py-2"
                  placeholder="Slug (nav obligāts)"
                  value={newCatSlug}
                  onChange={(e) => setNewCatSlug(e.target.value)}
                />

                <button
                  type="button"
                  disabled={busy || !newCatName.trim()}
                  onClick={createCategoryQuick}
                  className="mt-2 w-full rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Izveidot kategoriju
                </button>
              </div>
            </div>

            {/* Existing categories list + delete */}
            <div className="mt-4 rounded-xl border bg-white p-3">
              <div className="text-sm font-medium">Esošās kategorijas</div>

              <div className="mt-2 space-y-2">
                {categories.length === 0 ? (
                  <div className="text-sm opacity-60">Nav nevienas kategorijas.</div>
                ) : (
                  categories.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border p-2">
                      <div>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className="text-xs opacity-60">slug: {c.slug}</div>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => removeCategory(c.id)}
                        className="rounded-xl border px-3 py-2 text-sm bg-[#FB2C36] text-white hover:bg-red-600 disabled:opacity-50"
                        title="Dzēst kategoriju"
                      >
                        Dzēst
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-2 text-xs opacity-60">
                Dzēšot kategoriju, produkti netiek dzēsti — tiem vienkārši tiks noņemta kategorija.
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Slug (nav obligāts)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.slug ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">SKU (nav obligāts)</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.sku ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Cena EUR (nav obligāts)</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.price_eur ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    price_eur: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Kārtošanas secība</label>
              <input
                type="number"
                className="mt-1 w-full rounded-xl border px-3 py-2"
                value={form.sort_order ?? 0}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Īss apraksts</label>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2"
              rows={2}
              value={form.short_description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Apraksts</label>
            <textarea
              className="mt-1 w-full rounded-xl border px-3 py-2"
              rows={6}
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="active"
              type="checkbox"
              checked={!!form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            <label htmlFor="active" className="text-sm font-medium">
              Aktīvs (redzams katalogā)
            </label>
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-sm font-medium">Galvenais attēls</div>
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onPickImage(e.target.files?.[0])}
              />
            </div>
            <div className="mt-2 text-xs opacity-70">
              Attēls tiek saspiests uz WebP (klienta pusē), lai tas ielādētos ātri un neaizņemtu daudz vietas.
              Maksimālais oriģināla izmērs: {formatKB(MAX_UPLOAD_BYTES)}.
            </div>
          </div>

          <button
            disabled={busy || !form.title.trim()}
            onClick={save}
            className="mt-2 rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {busy ? "Saglabā..." : "Saglabāt"}
          </button>
        </div>
      </div>
    </div>
  );
}