import type { HeroSlide as HeroSlideType } from "../../types/home";
import { useEffect, useState } from "react";

type Props = {
  slide: HeroSlideType;
};

export default function HeroSlide({ slide }: Props) {
  const [loaded, setLoaded] = useState(false);

  // Preload the image as early as possible to reduce the "gray flash" on first paint.
  useEffect(() => {
    if (!slide?.image_url) return;
    setLoaded(false);
    const img = new Image();
    img.src = slide.image_url;
    img.decoding = "async";
    img.onload = () => setLoaded(true);
  }, [slide?.image_url]);

  return (
    <div className="relative h-[520px] w-full bg-black sm:h-[620px]">
      {/* Background image */}
      <img
        src={slide.image_url}
        alt={slide.title}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={[
          "absolute inset-0 h-full w-full object-cover",
          "transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
        draggable={false}
      />

      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/10" />

      {/* Content */}
      <div className="relative z-10 h-full">
        <div className="mx-auto flex h-full w-full max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl sm:leading-tight">
              {slide.title}
            </h1>

            {slide.subtitle ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
                {slide.subtitle}
              </p>
            ) : null}

            {slide.cta_text && slide.cta_href ? (
              <a
                href={slide.cta_href}
                className="mt-8 inline-flex items-center rounded-full bg-[#BA8448] px-7 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                {slide.cta_text}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
