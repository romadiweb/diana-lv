import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCookieConsent } from "./CookieConsentProvider";

export default function CookieConsentModal() {
  const { consent, isOpen, close, acceptAll, rejectAll, savePreferences } = useCookieConsent();
  const [mode, setMode] = useState<"main" | "prefs">("main");
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    if (consent) {
      setAnalytics(consent.analytics);
    }
  }, [consent]);

  useEffect(() => {
    if (isOpen) setMode("main");
  }, [isOpen]);

  if (!isOpen) return null;

  // Shared button styles (tweak colors here)
  const btnPrimary =
    "rounded-md px-4 py-2 text-sm font-semibold bg-[#BA8448] text-white hover:bg-[#BA8448]/90 hover:cursor-pointer";
  const btnSecondary =
    "rounded-md px-4 py-2 text-sm font-semibold bg-[#BA8448] text-white hover:bg-[#BA8448]/90 hover:cursor-pointer";
  const btnTertiary =
    "rounded-md px-4 py-2 text-sm font-semibold bg-gray-200 text-black hover:bg-gray-100 hover:cursor-pointer";

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Backdrop (click to close) */}
      <button
        aria-label="Aizvērt sīkdatņu paziņojumu"
        className="absolute inset-0 bg-black/40 pointer-events-auto"
        onClick={close}
        type="button"
      />

      {/* Panel wrapper:
          - Mobile: top headline dialog
          - Desktop: bottom bar
      */}
      <div className="absolute left-0 right-0 top-0 md:top-auto md:bottom-0 pointer-events-none">
        <div className="mx-auto w-full md:max-w-none pointer-events-auto">
          {/* MAIN MODE */}
          {mode === "main" ? (
            <div className="w-full bg-neutral-900 text-white shadow-2xl md:border-t md:border-white/10">
              <div className="mx-auto max-w-6xl px-4 py-5 md:py-4">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
                  {/* Text */}
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold leading-tight">Mēs izmantojam sīkdatnes</h2>

                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      Šī vietne izmanto sīkfailus un citas izsekošanas tehnoloģijas, lai uzlabotu
                      jūsu pārlūkošanas pieredzi: vietnes pamatfunkcionalitātei, analītikai un
                      statistikas uzskaitei. Vairāk informācijas:{" "}
                      <Link
                        to="/sikdatnu-informacija"
                        className="underline underline-offset-2 text-white font-semibold"
                        onClick={close}
                      >
                        sīkdatņu informācija
                      </Link>
                      .
                    </p>
                  </div>

                  {/* Buttons (mobile: row like screenshot; desktop: right side row) */}
                  <div className="flex flex-wrap gap-2 md:flex-nowrap md:justify-end">
                    <button type="button" onClick={acceptAll} className={btnPrimary}>
                      Es piekrītu
                    </button>

                    <button type="button" onClick={rejectAll} className={btnSecondary}>
                      Es noraidu
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("prefs")}
                      className={btnTertiary}
                    >
                      Mainīt manas preferences
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PREFS MODE */
            <div className="w-full bg-neutral-900 text-white shadow-2xl md:border-t md:border-white/10">
              <div className="mx-auto max-w-6xl px-4 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold leading-tight">Sīkdatņu preferences</h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/90">
                      Nepieciešamās sīkdatnes vienmēr ir ieslēgtas (auth, drošība un pamatfunkcijas).<br/>
                      Apskati sīktdatņu sarakstu{" "}
                      <Link
                        to="/sikdatnu-informacija"
                        className="underline underline-offset-2 text-white font-semibold"
                        onClick={close}
                      >
                        šeit.
                      </Link>
                    </p>
                  </div>

                  <button
                    onClick={() => setMode("main")}
                    className="rounded-md px-3 py-2 text-sm font-semibold bg-white/10 hover:bg-white/15 hover:cursor-pointer"
                    type="button"
                  >
                    Atpakaļ
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {/* Necessary */}
                  <div className="rounded-md border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Nepieciešamās</p>
                        <p className="mt-1 text-xs text-white/80">Vienmēr ieslēgtas</p>
                      </div>
                      <span className="rounded-md bg-white/10 px-3 py-1 text-xs font-semibold">
                        Ieslēgts
                      </span>
                    </div>
                  </div>

                  {/* Analytics */}
                  <label className="rounded-md border border-white/10 bg-white/5 p-4 cursor-pointer">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">Analītikas</p>
                        <p className="mt-1 text-xs text-white/80">
                          Vietnes lietojuma mērījumi (piem., Google Analytics)
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#BA8448]"
                        checked={analytics}
                        onChange={(e) => setAnalytics(e.target.checked)}
                      />
                    </div>
                  </label>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => savePreferences({ analytics })}
                    className={btnPrimary}
                  >
                    Saglabāt
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAnalytics(false);
                      savePreferences({ analytics: false });
                    }}
                    className={btnSecondary}
                  >
                    Noraidīt
                  </button>

                  <button type="button" onClick={close} className={btnTertiary}>
                    Aizvērt
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile spacing so it doesn't feel glued to edge behind notch */}
          <div className="h-0 md:hidden" />
        </div>
      </div>
    </div>
  );
}
