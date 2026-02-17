import { Facebook, Mail, Phone, MapPin } from "lucide-react";

type SiteFooterProps = {
  /** Optional: open your cookie settings modal */
  onOpenCookieSettings?: () => void;

  /** Optional: override Facebook link */
  facebookUrl?: string;

  /** Optional: override logo path */
  logoSrc?: string;
};

export default function SiteFooter({
  onOpenCookieSettings,
  facebookUrl = "https://facebook.com",
  logoSrc = "/diana-logo.png",
}: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full">
      {/* Main footer */}
      <div className="bg-[#3F2021] text-[#FBF8F5]">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            {/* Left: logo + intro */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-3">
                <img
                  src={logoSrc}
                  alt="DIANA"
                  className="h-16 w-auto object-contain"
                  draggable={false}
                />
                <div className="leading-tight">
                  <div className="text-lg font-semibold tracking-wide">DIANA</div>
                  <div className="text-sm text-[#FBF8F5]/75">Mednieku kursi un veikals</div>
                </div>
              </div>

              <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#FBF8F5]/80">
                Mācības, testi un informācija topošajiem medniekiem — strukturēti, saprotami un
                praktiski.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  title="Facebook"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#FBF8F5] transition hover:bg-white/10 hover:scale-[1.02] active:scale-95"
                >
                  <Facebook className="h-5 w-5" />
                </a>

                {/* tiny “badge” style */}
                <span className=" px-3 py-1 italic text-xs text-[#FBF8F5]/80">
                  Atrodi mūs sociālajos tīklos
                </span>
              </div>
            </div>

            {/* Rekvizīti */}
            <div className="md:col-span-4">
              <h3 className="text-sm font-semibold tracking-wide text-[#FBF8F5]">Rekvizīti</h3>
              <div className="mt-4 space-y-3 text-sm text-[#FBF8F5]/80">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-[#BA8448]" />
                  <div>
                    <div className="font-semibold text-[#FBF8F5]">SIA “UP AUTO”</div>
                    <div className="text-[#FBF8F5]/75">Reģ. Nr.: 42103041471</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-[#BA8448]" />
                  <div>
                    <div className="font-semibold text-[#FBF8F5]">Juridiskā adrese </div>
                    <div className="text-[#FBF8F5]/75">Priežu iela 2-36, Grobiņa, LV-3430</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-[#BA8448]" />
                  <div>
                    <div className="font-semibold text-[#FBF8F5]">Norēķinu konts</div>
                    <div className="text-[#FBF8F5]/75">AS "Swedbank" LV91HABA0551016252281</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kontakti */}
            <div className="md:col-span-4">
              <h3 className="text-sm font-semibold tracking-wide text-[#FBF8F5]">Kontakti</h3>

              <div className="mt-4 space-y-3 space-x-1 text-sm text-[#FBF8F5]/80">
                <a
                  href="tel:+37126766112"
                  className="group inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4 text-[#FBF8F5]/90" />
                  <span className="text-[#FBF8F5] group-hover:underline underline-offset-4">
                    +371 26766112
                  </span>
                </a>

                <a
                  href="tel:+37129173515"
                  className="group inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <Phone className="h-4 w-4 text-[#FBF8F5]/90" />
                  <span className="text-[#FBF8F5] group-hover:underline underline-offset-4">
                    +371 29173515
                  </span>
                </a>

                <a
                  href="mailto:gringogi@inbox.lv"
                  className="group inline-flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                >
                  <Mail className="h-4 w-4 text-[#FBF8F5]/90" />
                  <span className="text-[#FBF8F5] group-hover:underline underline-offset-4">
                    gringogi@inbox.lv
                  </span>
                </a>

                <div className="inline-flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#FBF8F5]/90" />
                  <span className="text-[#FBF8F5]/85">
                    Avotu iela 4, Liepāja, Latvija
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar (different color) */}
      <div className="bg-[#2C1516] text-[#FBF8F5]/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="leading-relaxed">
            © {year} Visas tiesības aizsargātas • Mājaslapu veidoja{" "}
            <a
              href="https://romadi.lv"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#FBF8F5] transition hover:opacity-90"
            >
              romadi.lv
            </a>
          </div>

          {/* Cookie settings on the right */}
          {onOpenCookieSettings ? (
            <button
              type="button"
              onClick={onOpenCookieSettings}
              className="inline-flex items-center justify-center px-4 py-2 font-semibold text-[#FBF8F5] transition hover:bg-white/10 active:scale-95"
            >
              Sīkdatņu iestatījumi
            </button>
          ) : (
            <a
              href="/sikdatnu-informacija"
              className="inline-flex items-center justify-center px-4 py-2 font-semibold text-[#FBF8F5] transition hover:underline active:scale-95"
              title="Pieslēdz onOpenCookieSettings, lai atvērtu modali"
            >
              Sīkdatņu iestatījumi
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
