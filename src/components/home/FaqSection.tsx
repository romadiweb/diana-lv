import { useMemo, useState } from "react";
import type { FaqItem } from "../../types/home";
import Container from "../../layout/Container";
import SectionTitle from "./SectionTitle";
import FaqModal from "./FaqModal";

type Props = {
  items: FaqItem[];
};

export default function FaqSection({ items }: Props) {
  const [selected, setSelected] = useState<FaqItem | null>(null);

  const active = useMemo(
    () => [...items].filter((i) => i.active).sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  if (active.length === 0) return null;

  return (
    <section className="bg-[#F7F7F7] py-16">
      <Container>
        <SectionTitle title="Svarīgākie jautājumi" />

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {active.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelected(f)}
              className={[
                "w-full rounded-2xl bg-white",
                "border border-neutral-200 shadow-sm",
                "px-6 py-7",
                "text-center text-base font-semibold text-neutral-900",
                "transition",
                "hover:-translate-y-0.5 hover:shadow-lg hover:cursor-pointer",
                "active:translate-y-0 active:scale-[0.99]",
                "focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/40",
              ].join(" ")}
            >
              {f.question}
            </button>
          ))}
        </div>
      </Container>

      <FaqModal
        open={!!selected}
        title={selected?.question ?? ""}
        content={selected?.answer ?? ""}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
