import { Link } from "react-router-dom";
import type { Article } from "../../types/home";

function formatDate(iso: string) {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function NewsCard({ item }: { item: Article }) {
  // If API doesn’t provide href yet, fallback to an internal route.
  const internalFallback = (item as any).slug
    ? `/jaunumi/${(item as any).slug}`
    : item?.id != null
      ? `/jaunumi/${item.id}`
      : "";

  const href = (item as any).href || internalFallback;
  const external = typeof href === "string" && href.length > 0 && isExternalHref(href);

  const cardClassName = [
    "group block w-full no-underline",
    "rounded-2xl bg-white/95 backdrop-blur",
    "border border-white/20 shadow-lg",
    "transition will-change-transform",
    "hover:-translate-y-0.5 hover:shadow-2xl",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20",
    href ? "cursor-pointer" : "cursor-default",
  ].join(" ");

  const CardInner = (
    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-stretch">
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
  );

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cardClassName} aria-label={item.title}>
        {CardInner}
      </a>
    );
  }

  if (href) {
    return (
      <Link to={href} className={cardClassName} aria-label={item.title}>
        {CardInner}
      </Link>
    );
  }

  return <div className={cardClassName}>{CardInner}</div>;
}
