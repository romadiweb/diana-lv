import { useEffect, useMemo, useRef, useState } from "react";
import type { Article } from "../../types/home";
import Container from "../../layout/Container";
import NewsCard from "./NewsCard";

type Props = {
  items: Article[];
  title?: string;
  subtitle?: string;
  backgroundImageUrl: string; // the forest background
};

export default function NewsSection({
  items,
  title = "Jaunumi",
  subtitle = "Par jauno un aktuālo medniekam",
  backgroundImageUrl,
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState(0);

  const active = useMemo(
    () => [...items].filter((i) => i.active).sort((a, b) => a.sort_order - b.sort_order),
    [items]
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;

      // Progress from when section enters viewport bottom -> when it leaves top.
      // rect.top: starts at vh (not visible) -> ends at -rect.height (fully passed)
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const p = Math.min(1, Math.max(0, passed / total));
      setProgress(p);
    };

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Map progress -> background transform.
  // start: a bit zoomed out + lower; middle: zoom in; end: slightly higher
  const scale = 1.05 + progress * 0.18; // “fills more” as you scroll
  const translateY = 14 - progress * 28; // subtle parallax move
  const overlayOpacity = 0.55 + progress * 0.12; // readability increases slightly

  if (active.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-16 sm:py-20">
      {/* Background image (scroll-reactive) */}
      <div
        className="absolute inset-0"
        style={{
          transform: `translateY(${translateY}px) scale(${scale})`,
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
        <img
          src={backgroundImageUrl}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Overlay for contrast */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.40) 35%, rgba(0,0,0,0.45) 100%)",
          opacity: overlayOpacity,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Container>
          <div className="text-center text-white">
            <h2 className="text-3xl font-semibold tracking-wide sm:text-4xl">{title}</h2>
            <p className="mt-2 text-sm text-white/90">{subtitle}</p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl space-y-6">
            {active.map((a) => (
              <NewsCard key={a.id} item={a} />
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
