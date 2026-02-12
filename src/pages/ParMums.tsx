import PageHeader from "../layout/PageHeader";

export default function ParMums() {
  return (
    <main>
      <PageHeader
        title="Par mums"
        subtitle="Mednieku kursi, testi un praktiska informācija — ar cieņu pret dabu un drošu praksi."
        backgroundImageUrl="/jaunumi.jpg"
        rightBadgeText="DIANA • Mednieku kursi"
        crumbs={[
          { label: "Sākums", href: "/" },
          { label: "Par mums" },
        ]}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7">
              <h2 className="text-2xl font-semibold text-neutral-900">
                Mūsu mērķis
              </h2>
              <p className="mt-4 text-neutral-700 leading-relaxed">
                Mēs palīdzam topošajiem medniekiem sagatavoties eksāmeniem un praktiskajai pusei
                ar strukturētu mācību pieeju. Viss saturs ir veidots saprotami, ar reāliem
                piemēriem un uzsvaru uz drošību.
              </p>

              <h3 className="mt-10 text-xl font-semibold text-neutral-900">
                Ko tu iegūsi
              </h3>
              <ul className="mt-4 space-y-3 text-neutral-700">
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#BA8448]" />
                  Strukturētu teorijas programmu un skaidrus soļus līdz eksāmenam
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#BA8448]" />
                  Pārbaudes testus ar atbildēm un skaidrojumiem
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#BA8448]" />
                  Praktisku informāciju par medību kultūru, drošību un ekipējumu
                </li>
              </ul>
            </div>

            <div className="md:col-span-5">
              <div className="rounded-2xl border border-neutral-200 bg-[#FBF8F5] p-6 shadow-sm">
                <div className="text-sm font-semibold text-neutral-900">Ātri fakti</div>

                <div className="mt-4 space-y-3 text-sm text-neutral-700">
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 border border-neutral-200">
                    <span>Darba laiks</span>
                    <span className="font-semibold text-neutral-900">P–Sv 9:00–18:00</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 border border-neutral-200">
                    <span>Formāts</span>
                    <span className="font-semibold text-neutral-900">Klātienē / ZOOM / Online</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4 border border-neutral-200">
                    <span>Atbalsts</span>
                    <span className="font-semibold text-neutral-900">E-pasts / Tālrunis</span>
                  </div>
                </div>

                <a
                  href="/kontakti"
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#BA8448] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 active:scale-[0.99]"
                >
                  Sazināties
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
