export type BeltLogo = {
  id: string;
  name: string;
  href: string;
  src: string; // /public path or full URL
};

type Props = {
  items: BeltLogo[];
  heightPx?: number; // logo height
  className?: string;
};

export default function LogoBelt({ items, heightPx = 44, className = "" }: Props) {
  if (!items?.length) return null;

  return (
    <section className={`w-full bg-[#F7F7F7] ${className}`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl px-4 py-6">
          {/* Soft fade edges (helps show it’s scrollable on mobile) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 md:hidden" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 md:hidden" />

          {/* 
            Mobile: swipe belt (no wrap, horizontal scroll, snap)
            Desktop: wrap + centered
          */}
          <div
            className={[
              // Mobile swipe belt
              "flex md:hidden",
              "items-center gap-6",
              "overflow-x-auto overscroll-x-contain",
              "snap-x snap-mandatory",
              "px-2",
            ].join(" ")}
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none", // Firefox
            }}
          >
            {/* hide scrollbar for WebKit */}
            <style>{`
              .logo-belt-scroll::-webkit-scrollbar { display: none; }
            `}</style>

            <div className="logo-belt-scroll flex items-center gap-6">
              {items.map((logo, idx) => (
                <a
                  key={logo.id}
                  href={logo.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={logo.name}
                  title={logo.name}
                  className={[
                    "group relative inline-flex items-center justify-center",
                    "snap-start",
                    "rounded-xl px-3 py-2",
                    "transition",
                    "hover:-translate-y-1 hover:scale-[1.03]",
                    "hover:bg-neutral-50",
                    "focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/40",
                  ].join(" ")}
                  style={{
                    animationDelay: `${idx * 0.12}s`,
                    flex: "0 0 auto",
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 blur-xl transition group-hover:opacity-100 group-hover:bg-[#ff7a18]/10" />

                  <img
                    src={logo.src}
                    alt={logo.name}
                    className={[
                      "relative z-10 w-auto object-contain",
                      "opacity-90 grayscale transition",
                      "group-hover:opacity-100 group-hover:grayscale-0",
                    ].join(" ")}
                    style={{
                      height: `${heightPx}px`,
                      animation: "logoFloat 3.2s ease-in-out infinite",
                      animationDelay: `${idx * 0.12}s`,
                      display: "block",
                    }}
                    loading="lazy"
                    draggable={false}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Desktop layout (wrap + center) */}
          <div className="hidden md:flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {items.map((logo, idx) => (
              <a
                key={logo.id}
                href={logo.href}
                target="_blank"
                rel="noreferrer"
                aria-label={logo.name}
                title={logo.name}
                className={[
                  "group relative inline-flex items-center justify-center",
                  "rounded-xl px-3 py-2",
                  "transition",
                  "hover:-translate-y-1 hover:scale-[1.03]",
                  "hover:bg-neutral-50",
                  "focus:outline-none focus:ring-2 focus:ring-[#ff7a18]/40",
                ].join(" ")}
                style={{
                  animationDelay: `${idx * 0.12}s`,
                }}
              >
                <span className="pointer-events-none absolute inset-0 rounded-xl opacity-0 blur-xl transition group-hover:opacity-100 group-hover:bg-[#ff7a18]/10" />

                <img
                  src={logo.src}
                  alt={logo.name}
                  className={[
                    "relative z-10 w-auto object-contain",
                    "opacity-90 grayscale transition",
                    "group-hover:opacity-100 group-hover:grayscale-0",
                  ].join(" ")}
                  style={{
                    height: `${heightPx}px`,
                    animation: "logoFloat 3.2s ease-in-out infinite",
                    animationDelay: `${idx * 0.12}s`,
                    display: "block",
                  }}
                  loading="lazy"
                  draggable={false}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* local keyframes (no need to edit global css) */}
      <style>{`
        @keyframes logoFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </section>
  );
}
