import { useMemo, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import type { CourseCard } from "../../types/home";
import Container from "../../layout/Container";

type Props = {
  items: CourseCard[];
};

function formatPrice(amount?: number | null, currency?: string | null) {
  if (amount === null || amount === undefined) return null;
  const cur = currency ?? "€";
  const isInt = Number.isInteger(amount);
  const shown = isInt ? String(amount) : amount.toFixed(2);
  return `${shown} ${cur}`;
}

export default function CoursesGrid({ items }: Props) {
  const active = useMemo(
    () => [...items].filter((i) => i.active).sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  // track icon load failures so we can show fallback per-card
  const [brokenIcons, setBrokenIcons] = useState<Record<string, boolean>>({});

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-neutral-900">Mednieku kursi</h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {active.map((c) => {
            const price = formatPrice(c.price_amount, c.price_currency);
            const iconUrl = c.icon ?? null;
            const iconBroken = brokenIcons[c.id] === true;

            return (
              <a
                key={c.id}
                href={c.href ?? "#"}
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

                {/* Description */}
                <div className="mt-3 text-center text-sm leading-relaxed text-neutral-600">
                  {c.description}
                </div>

                {/* Push buttons to bottom */}
                <div className="mt-auto pt-8 flex flex-col items-center">
                  <span className="inline-flex rounded-full border border-[#3F2021] px-6 py-2 text-sm font-semibold text-[#3F2021] transition group-hover:bg-[#BA8448] group-hover:border-[#BA8448] group-hover:text-white">
                    Pieteikties
                  </span>

                  <div className="mt-3 text-sm font-semibold text-[#3F2021] underline-offset-4 group-hover:underline">
                    Uzzināt vairāk
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
