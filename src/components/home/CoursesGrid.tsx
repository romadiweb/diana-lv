import { useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { CourseCard } from "../../types/home";
import Container from "../../layout/Container";
import CourseInfoModal from "../home/CourseInfoModal";

type Props = {
  items: CourseCard[];
  /**
   * When true, the grid will reserve space and show skeleton cards to prevent
   * layout shifting (e.g. when navigating back with the browser).
   */
  loading?: boolean;
  /**
   * How many skeleton cards to show while loading (defaults to 4).
   */
  skeletonCount?: number;
};

function formatPrice(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) return null;
  const cur = currency ?? "€";
  const isInt = Number.isInteger(amount);
  const shown = isInt ? String(amount) : amount.toFixed(2);
  return `${shown} ${cur}`;
}

function SkeletonCard() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7">
      <div className="absolute inset-x-0 top-0 h-1 bg-[#BA8448]" />
      <div className="mt-2 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF8F5] ring-1 ring-[#3F2021]/10">
          <div className="h-10 w-10 rounded-xl bg-neutral-200" />
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        <div className="h-[28px] w-24 rounded bg-neutral-200" />
      </div>

      <div className="mt-2 flex justify-center">
        <div className="h-6 w-56 rounded bg-neutral-200" />
      </div>

      <div className="mt-3 space-y-2">
        <div className="mx-auto h-4 w-[92%] rounded bg-neutral-200" />
        <div className="mx-auto h-4 w-[86%] rounded bg-neutral-200" />
        <div className="mx-auto h-4 w-[78%] rounded bg-neutral-200" />
      </div>

      <div className="mt-auto pt-8 flex flex-col items-center">
        <div className="h-9 w-28 rounded-full bg-neutral-200" />
        <div className="mt-3 h-5 w-28 rounded bg-neutral-200" />
      </div>
    </div>
  );
}

export default function CoursesGrid({ items, loading = false, skeletonCount = 4 }: Props) {
  const navigate = useNavigate();

  const active = useMemo(
    () => [...items].filter((i) => i.active).sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  const showSkeletons = loading && active.length === 0;

  // track icon load failures so we can show fallback per-card
  const [brokenIcons, setBrokenIcons] = useState<Record<string, boolean>>({});

  // modal state
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoCourseId, setInfoCourseId] = useState<string | null>(null);

  function openInfo(courseId: string) {
    setInfoCourseId(courseId);
    setInfoOpen(true);
  }

  function closeInfo() {
    setInfoOpen(false);
    setInfoCourseId(null);
  }

  return (
    <section className="bg-white py-16 min-h-[520px]">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-neutral-900">Mednieku kursi</h2>
        </div>

        {/* CHANGED: md:grid-cols-3 -> md:grid-cols-2 */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {showSkeletons
            ? Array.from({ length: skeletonCount }).map((_, idx) => (
                <div key={`sk-${idx}`} className="animate-pulse">
                  <SkeletonCard />
                </div>
              ))
            : active.map((c) => {
                const price = formatPrice(c.price_amount, c.price_currency);
                const iconUrl = c.icon ?? null;
                const iconBroken = brokenIcons[c.id] === true;

                return (
                  <div
                    key={c.id}
                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-7 transition hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    {/* Top accent line */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#BA8448]" />

                    {/* Icon */}
                    {iconUrl ? (
                      <div className="mt-2 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF8F5] ring-1 ring-[#3F2021]/10 transition group-hover:scale-[1.02]">
                          {!iconBroken ? (
                            <img
                              src={iconUrl}
                              alt={`${c.title} ikona`}
                              className="h-10 w-10 object-contain"
                              loading="lazy"
                              draggable={false}
                              onError={() => {
                                console.warn("Icon failed to load:", iconUrl);
                                setBrokenIcons((prev) => ({ ...prev, [c.id]: true }));
                              }}
                            />
                          ) : (
                            <ImageIcon className="h-7 w-7 text-neutral-500" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2 flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FBF8F5] ring-1 ring-[#3F2021]/10">
                          <ImageIcon className="h-7 w-7 text-neutral-500" />
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    {price ? (
                      <div className="mt-3 text-center text-lg font-semibold text-green-700">
                        {price}
                      </div>
                    ) : (
                      <div className="mt-3 h-[28px]" />
                    )}

                    {/* Title */}
                    <div className="mt-2 text-center text-lg font-semibold text-neutral-900">
                      {c.title}
                    </div>

                    {/* Description (short preview) */}
                    <div className="mt-3 text-center text-sm leading-relaxed text-neutral-600">
                      {c.description}
                    </div>

                    {/* Push buttons to bottom */}
                    <div className="mt-auto pt-8 flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/pieteikties/${encodeURIComponent(c.slug)}`)}
                        className="inline-flex rounded-full border border-[#3F2021] px-6 py-2 text-sm font-semibold text-[#3F2021] transition hover:cursor-pointer group-hover:bg-[#BA8448] group-hover:border-[#BA8448] group-hover:text-white"
                      >
                        Pieteikties
                      </button>

                      <button
                        type="button"
                        onClick={() => openInfo(c.id)}
                        className="mt-3 text-sm font-semibold text-[#3F2021] underline-offset-4 hover:underline hover:cursor-pointer"
                      >
                        Uzzināt vairāk
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </Container>

      <CourseInfoModal open={infoOpen} courseId={infoCourseId} onClose={closeInfo} />
    </section>
  );
}
