import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getProductImageUrl } from "../lib/storageImages";

import Container from "../components/global/Container";
import PageHeader from "../layout/PageHeader";

type Product = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price_eur: number | null;
};

type Img = {
  id: string;
  storage_path: string;
  alt: string | null;
  is_primary: boolean;
  sort_order: number;
};

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<Img[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImgId, setActiveImgId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!slug) return;

      setLoading(true);
      setProduct(null);
      setImages([]);
      setActiveImgId(null);

      const { data: p, error: pErr } = await supabase
        .from("products")
        .select("id,title,slug,short_description,description,price_eur,active")
        .eq("slug", slug)
        .eq("active", true)
        .single();

      if (pErr || !p) {
        setLoading(false);
        setProduct(null);
        return;
      }

      const { data: i } = await supabase
        .from("product_images")
        .select("id,storage_path,alt,is_primary,sort_order")
        .eq("product_id", p.id)
        .order("is_primary", { ascending: false })
        .order("sort_order", { ascending: true });

      const imgs = (i || []) as any as Img[];

      setProduct(p as any);
      setImages(imgs);
      setActiveImgId(imgs[0]?.id ?? null);
      setLoading(false);
    })();
  }, [slug]);

  const activeImg = useMemo(() => {
    if (!images.length) return null;
    const found = images.find((x) => x.id === activeImgId);
    return found ?? images[0];
  }, [images, activeImgId]);

  const heroSrc = activeImg?.storage_path
    ? getProductImageUrl(activeImg.storage_path, { width: 1400, quality: 85 })
    : null;

  return (
    <div className="bg-[#FBF8F5]">
      <PageHeader
        title={loading ? "Ielādē..." : product?.title ?? "Produkts nav atrasts"}
        subtitle={
          loading
            ? "Lūdzu uzgaidi."
            : product
            ? "Apskati produkta informāciju. Šeit nav pirkšanas sistēmas — tikai katalogs."
            : "Šāds produkts nav pieejams vai ir paslēpts."
        }
        crumbs={[
          { label: "Sākums", href: "/" },
          { label: "Veikals", href: "/veikals" },
          { label: product?.title ?? "Produkts" },
        ]}
        rightBadgeText={product?.price_eur != null ? `€${product.price_eur.toFixed(2)}` : undefined}
      />

      <Container>
        <div className="mt-6">
          {/* ✅ pareizā atpakaļ poga uz /veikals */}
          <Link
            to="/veikals"
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[#2C1516] hover:bg-black/5"
          >
            ← Atpakaļ uz veikalu
          </Link>
        </div>

        <div className="mt-6 pb-12">
          {loading ? (
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
                <div className="aspect-[4/3] w-full animate-pulse bg-black/5" />
              </div>
              <div className="rounded-2xl border border-black/5 bg-white p-6">
                <div className="h-6 w-2/3 animate-pulse rounded bg-black/10" />
                <div className="mt-4 h-4 w-full animate-pulse rounded bg-black/5" />
                <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-black/5" />
                <div className="mt-2 h-4 w-4/6 animate-pulse rounded bg-black/5" />
              </div>
            </div>
          ) : !product ? (
            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold text-[#2C1516]">Produkts nav atrasts</div>
              <p className="mt-2 text-sm opacity-70">
                Iespējams, produkts ir izdzēsts vai nav aktīvs.
              </p>
              <Link
                to="/veikals"
                className="mt-4 inline-flex rounded-xl border border-black/10 px-4 py-2 text-sm hover:bg-black/5"
              >
                Doties uz veikalu
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Attēls + mini galerija */}
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                  <div className="relative aspect-[4/3] w-full bg-black/5">
                    {heroSrc ? (
                      <img
                        src={heroSrc}
                        alt={activeImg?.alt || product.title}
                        className="h-full w-full object-cover"
                        loading="eager"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm opacity-60">
                        Nav attēla
                      </div>
                    )}
                  </div>
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {images.map((img) => {
                      const thumb = img.storage_path
                        ? getProductImageUrl(img.storage_path, { width: 220, quality: 75 })
                        : null;

                      const active = img.id === activeImg?.id;

                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => setActiveImgId(img.id)}
                          className={[
                            "h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl border",
                            active ? "border-[#BA8448]" : "border-black/10",
                          ].join(" ")}
                          title={img.alt || product.title}
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={img.alt || product.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs opacity-60">
                              —
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Saturs */}
              <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <h1 className="text-2xl md:text-3xl font-semibold text-[#2C1516]">
                  {product.title}
                </h1>

                {product.short_description && (
                  <p className="mt-3 text-sm md:text-base opacity-80">
                    {product.short_description}
                  </p>
                )}

                {product.description && (
                  <div className="mt-6 whitespace-pre-wrap leading-relaxed opacity-90">
                    {product.description}
                  </div>
                )}

                {/* Info bloks */}
                <div className="mt-8 rounded-2xl border border-black/5 bg-[#FBF8F5] p-4">
                  <div className="text-sm font-semibold text-[#2C1516]">Svarīgi</div>
                  <p className="mt-1 text-sm opacity-75">
                    Šī ir kataloga lapa — pirkšanas funkcionalitāte nav integrēta.
                    Ja vēlies preci iegādāties, sazinies ar mums.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to="/kontakti"
                      className="rounded-xl bg-[#2C1516] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                      Sazināties
                    </Link>
                    <Link
                      to="/veikals"
                      className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5"
                    >
                      Atpakaļ uz veikalu
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}