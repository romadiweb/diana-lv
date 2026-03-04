import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getProductImageUrl } from "../lib/storageImages";

import Container from "../components/global/Container";
import PageHeader from "../layout/PageHeader";

type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

type Product = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  short_description: string | null;
  price_eur: number | null;
  active: boolean;
  sort_order: number;
  created_at?: string;
};

type ImageRow = {
  product_id: string;
  storage_path: string;
  is_primary: boolean;
  sort_order: number;
  alt: string | null;
};

export default function ShopCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const catSlug = (searchParams.get("cat") || "").trim();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ImageRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [{ data: cats }, { data: p }, { data: i }] = await Promise.all([
        supabase
          .from("categories")
          .select("id,name,slug,sort_order")
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),

        supabase
          .from("products")
          .select("id,category_id,title,slug,short_description,price_eur,active,sort_order,created_at")
          .eq("active", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: false }),

        supabase
          .from("product_images")
          .select("product_id,storage_path,is_primary,sort_order,alt")
          .order("is_primary", { ascending: false })
          .order("sort_order", { ascending: true }),
      ]);

      setCategories((cats || []) as any);
      setProducts((p || []) as any);
      setImages((i || []) as any);

      setLoading(false);
    })();
  }, []);

  const selectedCategory = useMemo(() => {
    if (!catSlug) return null;
    return categories.find((c) => c.slug === catSlug) || null;
  }, [categories, catSlug]);

  const primaryByProduct = useMemo(() => {
    const map = new Map<string, ImageRow>();
    for (const img of images) {
      if (!map.has(img.product_id)) map.set(img.product_id, img);
    }
    return map;
  }, [images]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    let list = products;

    // filtrs pēc kategorijas
    if (selectedCategory) {
      list = list.filter((p) => p.category_id === selectedCategory.id);
    }

    // filtrs pēc meklēšanas
    if (s) {
      list = list.filter((p) => p.title.toLowerCase().includes(s));
    }

    return list;
  }, [products, q, selectedCategory]);

  function setCategorySlug(nextSlug: string | null) {
    const sp = new URLSearchParams(searchParams);
    if (!nextSlug) sp.delete("cat");
    else sp.set("cat", nextSlug);
    setSearchParams(sp);
  }

  return (
    <div className="bg-[#FBF8F5]">
      <PageHeader
        title="Veikals"
        subtitle="Apskati mūsu preču katalogu. Šeit nav pirkšanas sistēmas — tikai ērta pārlūkošana un produktu informācija."
        crumbs={[{ label: "Sākums", href: "/" }, { label: "Veikals" }]}
        rightBadgeText={`Preces: ${loading ? "..." : filtered.length}`}
      />

      <Container>
        {/* Kategorijas */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategorySlug(null)}
            className={[
              "rounded-full border px-4 py-2 text-sm font-semibold transition",
              !selectedCategory
                ? "bg-[#2C1516] text-white border-transparent"
                : "border-black/10 hover:bg-black/5",
            ].join(" ")}
          >
            Visas
          </button>

          {categories.map((c) => {
            const active = selectedCategory?.id === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategorySlug(c.slug)}
                className={[
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-[#2C1516] text-white border-transparent"
                    : "border-black/10 hover:bg-black/5",
                ].join(" ")}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Meklēšana */}
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-[#2C1516]">Meklēšana</div>
            <div className="text-xs opacity-70">
              Ieraksti nosaukumu, lai ātri atrastu preci.
            </div>
          </div>

          <div className="flex w-full max-w-md items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 outline-none focus:border-[#BA8448]"
              placeholder="Es gribu nopirkt..."
            />
            {(q.trim() || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCategorySlug(null);
                }}
                className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                title="Notīrīt filtrus"
              >
                Notīrīt
              </button>
            )}
          </div>
        </div>

        {/* Saturs */}
        <div className="mt-8 pb-12">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                  <div className="aspect-[4/3] w-full animate-pulse bg-black/5" />
                  <div className="p-4">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-black/10" />
                    <div className="mt-2 h-3 w-full animate-pulse rounded bg-black/5" />
                    <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-black/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-[#2C1516]">Nekas netika atrasts</div>
              <p className="mt-2 text-sm opacity-70">
                Pamēģini citu atslēgvārdu, izvēlies citu kategoriju vai notīri filtrus.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setCategorySlug(null);
                }}
                className="mt-4 rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5"
              >
                Notīrīt filtrus
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const img = primaryByProduct.get(p.id);
                const src = img?.storage_path
                  ? getProductImageUrl(img.storage_path, { width: 900, quality: 80 })
                  : null;

                return (
                  <Link
                    key={p.id}
                    to={`/veikals/${p.slug}`}
                    className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] w-full bg-black/5">
                      {src ? (
                        <img
                          src={src}
                          alt={img?.alt || p.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
                          Nav attēla
                        </div>
                      )}

                      {typeof p.price_eur === "number" && (
                        <div className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-sm font-semibold text-[#2C1516] shadow">
                          €{p.price_eur.toFixed(2)}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="text-lg font-semibold text-[#2C1516] group-hover:underline underline-offset-4">
                        {p.title}
                      </div>

                      {p.short_description ? (
                        <div className="mt-1 text-sm opacity-70 line-clamp-2">
                          {p.short_description}
                        </div>
                      ) : (
                        <div className="mt-1 text-sm opacity-40">—</div>
                      )}

                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#BA8448]">
                        Skatīt produktu{" "}
                        <span className="transition group-hover:translate-x-0.5">→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}