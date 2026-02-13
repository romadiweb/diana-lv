import { Clock, Mail, MapPin, Phone } from "lucide-react";
import PageHeader from "../layout/PageHeader";

export default function Kontakti() {
  const address = "Avotu iela 4, Liepāja, Latvija";

  // Google Maps embed (no API key needed)
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <main>
      <PageHeader
        title="Kontakti"
        subtitle="Sazinies ar mums jautājumu gadījumā — palīdzēsim izvēlēties piemērotāko kursu un atbildēsim uz neskaidrībām."
        backgroundImageUrl="jaunumi.jpg"
        rightBadgeText="Atbalsts • DIANA"
        crumbs={[
          { label: "Sākums", href: "/" },
          { label: "Kontakti" },
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            {/* Left: contact cards */}
            <div className="md:col-span-5">
              <h2 className="text-2xl font-semibold text-neutral-900">Saziņa</h2>
              <p className="mt-3 text-neutral-700 leading-relaxed">
                Raksti vai zvani — atbildēsim pēc iespējas ātrāk. Ja vēlies, vari arī atbraukt pie
                mums klātienē.
              </p>

              <div className="mt-6 space-y-4">
                <a
                  href="tel:+37126766112"
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF8F5] ring-1 ring-[#3F2021]/10">
                    <Phone className="h-5 w-5 text-[#3F2021]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">Tālrunis</div>
                    <div className="text-sm text-neutral-700 group-hover:underline underline-offset-4">
                      +371 26766112
                    </div>
                  </div>
                </a>

                <a
                  href="tel:+37129173515"
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF8F5] ring-1 ring-[#3F2021]/10">
                    <Phone className="h-5 w-5 text-[#3F2021]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">Papildu tālrunis</div>
                    <div className="text-sm text-neutral-700 group-hover:underline underline-offset-4">
                      +371 29173515
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:gringogi@inbox.lv"
                  className="group flex items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF8F5] ring-1 ring-[#3F2021]/10">
                    <Mail className="h-5 w-5 text-[#3F2021]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">E-pasts</div>
                    <div className="text-sm text-neutral-700 group-hover:underline underline-offset-4">
                      gringogi@inbox.lv
                    </div>
                  </div>
                </a>

                <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF8F5] ring-1 ring-[#3F2021]/10">
                    <MapPin className="h-5 w-5 text-[#3F2021]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">Adrese</div>
                    <div className="text-sm text-neutral-700">{address}</div>
                    <a
                      className="mt-2 inline-flex text-sm font-semibold text-[#BA8448] hover:underline underline-offset-4"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Atvērt Google Maps
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-[#FBF8F5] p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white ring-1 ring-[#3F2021]/10">
                    <Clock className="h-5 w-5 text-[#3F2021]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">Darba laiks</div>
                    <div className="text-sm text-neutral-700">S–Sv: 11:00–18:00</div>
                    <div className="mt-1 text-xs text-neutral-600">
                      (Ja zvans netiek pacelts — atzvanīsim.)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: map + quick note */}
            <div className="md:col-span-7">
              <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="p-5 border-b border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900">Atrašanās vieta</h3>
                  <p className="mt-1 text-sm text-neutral-700">
                    Vari atbraukt pie mums — zemāk redzama karte ar adresi.
                  </p>
                </div>

                <div className="relative">
                  <iframe
                    title="Google Maps - Avotu iela 4, Liepāja"
                    src={mapSrc}
                    className="h-[420px] w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  {/* subtle overlay badge */}
                  <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm backdrop-blur">
                    {address}
                  </div>
                </div>
              </div>

              {/* Optional CTA */}
              <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h4 className="text-base font-semibold text-neutral-900">Ātrs jautājums?</h4>
                <p className="mt-2 text-sm text-neutral-700">
                  Ja vēlies ātrāko atbildi, visbiežāk pietiek uzrakstīt e-pastu ar īsu jautājumu un
                  atzīmēt, kurš kurss interesē.
                </p>
                <a
                  href="mailto:gringogi@inbox.lv?subject=Jaut%C4%81jums%20par%20kursiem"
                  className="mt-4 inline-flex items-center justify-center rounded-full bg-[#BA8448] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.99]"
                >
                  Rakstīt e-pastu
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
