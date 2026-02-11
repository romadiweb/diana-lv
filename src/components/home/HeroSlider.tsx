import { useEffect, useMemo, useRef, useState } from "react";
import type { HeroSlide as HeroSlideType } from "../../types/home";
import HeroSlide from "./HeroSlide";
import Dots from "./Dots";

type Props = {
  slides: HeroSlideType[];
  intervalMs?: number;
};

export default function HeroSlider({ slides, intervalMs = 9000 }: Props) {
  const activeSlides = useMemo(
    () => [...slides].filter(s => s.active).sort((a, b) => a.sort_order - b.sort_order),
    [slides]
  );

  const [index, setIndex] = useState(0);
  const userInteractedRef = useRef(false);

  useEffect(() => {
    if (activeSlides.length <= 1) return;

    const t = window.setInterval(() => {
      if (userInteractedRef.current) return;
      setIndex((prev) => (prev + 1) % activeSlides.length);
    }, intervalMs);

    return () => window.clearInterval(t);
  }, [activeSlides.length, intervalMs]);

  useEffect(() => {
    // keep index valid if slides change
    if (index >= activeSlides.length) setIndex(0);
  }, [activeSlides.length, index]);

  const onSelect = (i: number) => {
    userInteractedRef.current = true;
    setIndex(i);
    // allow auto again after a bit
    window.setTimeout(() => (userInteractedRef.current = false), 12000);
  };

  if (activeSlides.length === 0) {
    return (
      <div className="h-[520px] w-full bg-neutral-200 sm:h-[620px]">
        <div className="mx-auto flex h-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <p className="text-neutral-700">No hero slides found.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full overflow-hidden">
      {/* Slide */}
      <HeroSlide slide={activeSlides[index]} />

      {/* Dots */}
      {activeSlides.length > 1 ? (
        <div className="absolute bottom-10 left-0 right-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center px-4 sm:px-6 lg:px-8">
            <Dots count={activeSlides.length} activeIndex={index} onSelect={onSelect} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
