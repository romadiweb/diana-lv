import { useEffect, useMemo, useRef, useState } from "react";
import type { HeroSlide as HeroSlideType } from "../../types/home";
import HeroSlide from "./HeroSlide";
import Dots from "./Dots";

type Props = {
  slides: HeroSlideType[];
  intervalMs?: number;
};

/**
 * Image preloading notes:
 * - Browsers will cache images automatically *if* the URL stays stable.
 * - If your hero images are served via short-lived signed URLs, they'll refetch because the URL changes.
 *   In that case, prefer public bucket URLs or long-lived signed URLs + proper Cache-Control headers.
 */
export default function HeroSlider({ slides, intervalMs = 9000 }: Props) {
  const activeSlides = useMemo(
    () => [...slides].filter((s) => s.active).sort((a, b) => a.sort_order - b.sort_order),
    [slides]
  );

  const [index, setIndex] = useState(0);
  const userInteractedRef = useRef(false);

  // Track which image URLs we've already tried to preload (avoid repeated work across re-renders)
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (activeSlides.length === 0) return;

    const urls = activeSlides
      .map((s) => s.image_url)
      .filter((u): u is string => typeof u === "string" && u.length > 0);

    const preloadOne = (url: string) => {
      if (preloadedRef.current.has(url)) return;
      preloadedRef.current.add(url);

      const img = new Image();
      // NOTE: fetchPriority is not supported on Image() in all browsers, but harmless.
      img.fetchPriority = "high";
      img.decoding = "async";
      img.src = url;
    };

    const currentUrl = activeSlides[index]?.image_url;
    const nextUrl = activeSlides[(index + 1) % activeSlides.length]?.image_url;
    const next2Url = activeSlides[(index + 2) % activeSlides.length]?.image_url;

    if (currentUrl) preloadOne(currentUrl);
    if (nextUrl) preloadOne(nextUrl);
    if (next2Url) preloadOne(next2Url);

    // Preload remaining images when idle (won't block first paint)
    const remaining = urls.filter((u) => u !== currentUrl && u !== nextUrl && u !== next2Url);

    const idleCb: any =
      (window as any).requestIdleCallback ??
      ((fn: () => void) => window.setTimeout(fn, 250));

    const cancelIdle: any =
      (window as any).cancelIdleCallback ?? ((id: number) => window.clearTimeout(id));

    const idleId = idleCb(() => {
      // limit burst work: only preload up to 6 remaining images in one go
      remaining.slice(0, 6).forEach(preloadOne);
    });

    return () => cancelIdle(idleId);
  }, [activeSlides, index]);

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
