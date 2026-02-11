import { useMemo, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronDown, Facebook, Mail, Menu, Phone, X } from "lucide-react";

type NavbarProps = {
  onOpenCourses?: () => void; // CTA action (button in top info bar)
};

export default function Navbar({ onOpenCourses }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Accent for underline + CTA button
  const ACCENT = "#c88f4c";

  const nav = useMemo(
    () => [
      { to: "/", label: "Sākums" },
      { to: "/tests", label: "Testi" },
      { to: "/noderigi", label: "Noderīgi" },
      { to: "/jaunumi", label: "Jaunumi" },
      { to: "/par-mums", label: "Par mums" },
    ],
    []
  );

  /**
   * Desktop link style:
   * - no text color change on hover/active
   * - underline animates left->right, retracts back left + fades out
   * - active stays underlined
   */
  const linkBase =
    "group relative inline-flex items-center px-2 py-2 text-sm font-medium text-[#3F2021]";

  const underlineBase =
    "pointer-events-none absolute -bottom-1 left-0 h-[3px] w-full origin-left transform rounded-full transition-all duration-300 ease-out";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#3F2021]/10 bg-[#FBF8F5]">
      {/* Top info bar (DESKTOP ONLY) */}
      <div className="hidden w-full bg-[#3F2021] text-[#FBF8F5] lg:block">
        <div className="mx-auto flex h-10 w-full items-center justify-between gap-3 px-4 text-xs sm:px-6 lg:px-10">
          <div className="flex items-center gap-4">
            <a
              className="inline-flex items-center gap-2 text-[#FBF8F5]/90 hover:text-[#FBF8F5] hover:underline"
              href="tel:+37126766112"
            >
              <Phone className="h-4 w-4" />
              <span>+371 26766112</span>
            </a>

            <a
              className="inline-flex items-center gap-2 text-[#FBF8F5]/90 hover:text-[#FBF8F5] hover:underline"
              href="tel:+37129173515"
            >
              <Phone className="h-4 w-4" />
              <span>+371 29173515</span>
            </a>

            <a
              className="inline-flex items-center gap-2 text-[#FBF8F5]/90 hover:text-[#FBF8F5] hover:underline"
              href="mailto:gringogi@inbox.lv"
            >
              <Mail className="h-4 w-4" />
              <span>gringogi@inbox.lv</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              aria-label="Facebook"
              className="rounded-md p-1 text-[#FBF8F5]/90 hover:bg-[#FBF8F5]/10 hover:text-[#FBF8F5]"
              href="#"
              target="_blank"
              rel="noreferrer"
            >
              <Facebook className="h-4 w-4" />
            </a>

            {/* CTA lives in the info row (desktop), NOT in the main header */}
            <button
              type="button"
              onClick={onOpenCourses}
              className="ml-2 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 hover:cursor-pointer"
              style={{ backgroundColor: "#c88f4c" }}
            >
              Mednieku eksāmena tests
            </button>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-[#FBF8F5]">
        {/* Increased header height a bit so the bigger logo fits nicely */}
        <div className="mx-auto flex h-[72px] w-full items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              aria-label="Doties uz sākumlapu"
              className="inline-flex items-center"
            >
              <img
                src="/diana-logo.png"
                alt="Diana logo"
                className="h-16 w-auto sm:h-20 lg:h-30 object-contain hover:scale-[1.02] transition-transform"
              />
              <div className="leading-tight">
                <p className="text-base font-semibold text-[#3F2021] sm:text-lg">
                  DIANA
                </p>
                <p className="text-xs text-[#3F2021]/70 sm:text-sm">
                  Mednieku kursi un veikals
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} className={linkBase}>
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    <span
                      className={[
                        underlineBase,
                        isActive
                          ? "scale-x-100 opacity-100"
                          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
                      ].join(" ")}
                      style={{ backgroundColor: ACCENT }}
                    />
                  </>
                )}
              </NavLink>
            ))}

            {/* Dropdown (Kursi) */}
            <div className="group relative">
              <button
                type="button"
                className={`${linkBase} inline-flex items-center gap-2`}
              >
                <span>Mednieku kursi</span>
                <ChevronDown className="h-4 w-4 transition group-hover:rotate-180" />
                <span
                  className={[
                    underlineBase,
                    "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
                  ].join(" ")}
                  style={{ backgroundColor: ACCENT }}
                />
              </button>

              <div className="invisible absolute right-0 top-full mt-3 w-56 rounded-2xl border border-[#3F2021]/10 bg-white p-2 shadow-lg opacity-0 transition group-hover:visible group-hover:opacity-100">
                <NavLink
                  to="/kursi"
                  className="block rounded-xl px-3 py-2 text-sm text-[#3F2021] hover:bg-[#3F2021]/10"
                >
                  Kursu informācija
                </NavLink>
              </div>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl border border-[#3F2021]/20 bg-[#3F2021] p-2 text-[#FBF8F5] transition hover:bg-[#3F2021]/10 lg:hidden"
            aria-label={mobileOpen ? "Aizvērt izvēlni" : "Atvērt izvēlni"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile panel (NO CTA button here) */}
        {mobileOpen && (
          <div className="border-t border-[#3F2021]/10 bg-[#FBF8F5] lg:hidden">
            <div className="mx-auto flex w-full flex-col gap-1 px-4 py-3 sm:px-6">
              {nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    [
                      "rounded-xl px-3 py-2 text-sm font-semibold transition",
                      isActive
                        ? "bg-[#3F2021] text-[#FBF8F5]"
                        : "text-[#3F2021] hover:bg-[#3F2021]/10",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <NavLink
                to="/kursi"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  [
                    "mt-2 rounded-xl px-3 py-2 text-sm font-semibold transition",
                    isActive
                      ? "bg-[#3F2021] text-[#FBF8F5]"
                      : "text-[#3F2021] hover:bg-[#3F2021]/10",
                  ].join(" ")
                }
              >
                Mednieku kursi
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
