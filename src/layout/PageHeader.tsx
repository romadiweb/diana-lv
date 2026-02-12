import React from "react";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

type Props = {
  title: string;
  subtitle?: string;
  backgroundImageUrl?: string; // optional
  crumbs?: Crumb[]; // optional breadcrumb
  rightBadgeText?: string; // optional small badge on the right side
};

export default function PageHeader({
  title,
  subtitle,
  backgroundImageUrl,
  crumbs = [{ label: "Sākums", href: "/" }, { label: title }],
  rightBadgeText,
}: Props) {
  return (
    <header className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {backgroundImageUrl ? (
          <img
            src={backgroundImageUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full bg-[#3F2021]" />
        )}

        {/* Different look than reference: layered gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_30%_30%,rgba(255,122,24,0.18),transparent_60%)]" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-2 text-sm text-white/80">
              {crumbs.map((c, idx) => (
                <React.Fragment key={`${c.label}-${idx}`}>
                  {idx !== 0 ? <ChevronRight className="h-4 w-4 text-white/55" /> : null}
                  {c.href ? (
                    <a
                      href={c.href}
                      className="rounded-md px-2 py-1 transition hover:bg-white/10 hover:text-white"
                    >
                      {c.label}
                    </a>
                  ) : (
                    <span className="rounded-md bg-white/10 px-2 py-1 text-white">
                      {c.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>

            {subtitle ? (
              <p className="mt-3 text-base leading-relaxed text-white/85 sm:text-lg">
                {subtitle}
              </p>
            ) : null}

            {/* Decorative underline (different style) */}
            <div className="mt-6 h-1 w-28 rounded-full bg-gradient-to-r from-[#BA8448] to-[#BA8448]/60" />
          </div>

          {/* Optional right badge */}
          {rightBadgeText ? (
            <div className="md:pb-1">
              <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                {rightBadgeText}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
