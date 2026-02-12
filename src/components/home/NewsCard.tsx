import type { Article } from "../../types/home";

function formatDate(iso: string) {
  const d = new Date(iso);
  // LV-like yyyy-mm-dd (simple + stable)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewsCard({ item }: { item: Article }) {
  const Wrapper: any = item.href ? "a" : "div";
  const wrapperProps = item.href
    ? {
        href: item.href,
        target: item.href.startsWith("http") ? "_blank" : undefined,
        rel: item.href.startsWith("http") ? "noreferrer" : undefined,
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={[
        "group block w-full",
        "rounded-2xl bg-white/95 backdrop-blur",
        "border border-white/20 shadow-lg",
        "transition",
        "hover:-translate-y-0.5 hover:shadow-2xl",
      ].join(" ")}
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch">
        {/* Image */}
        <div className="shrink-0">
          <div className="h-24 w-full overflow-hidden rounded-xl bg-neutral-200 sm:h-24 sm:w-36">
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
                loading="lazy"
                draggable={false}
              />
            ) : null}
          </div>
        </div>

        {/* Text */}
        <div className="min-w-0">
          <div className="text-xs text-neutral-600">{formatDate(item.published_at)}</div>

          <h3 className="mt-1 line-clamp-2 text-sm font-semibold uppercase tracking-wide text-[#c0392b]">
            {item.title}
          </h3>

          {item.excerpt ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-neutral-700">
              {item.excerpt}
            </p>
          ) : null}
        </div>
      </div>
    </Wrapper>
  );
}
