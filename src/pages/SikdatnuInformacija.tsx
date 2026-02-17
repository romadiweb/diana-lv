import PageHeader from "../layout/PageHeader";

type CookieRow = {
  name: string;
  purpose: string;
  category: "Nepieciešamās" | "Statistikas" | "Mārketinga";
  lifetime: string;
};

export default function SikdatnuInformacija() {
  // Ieteikums: šeit norādi reālo datumu, kad tekstu pēdējo reizi pārskatīji
  const lastUpdated = "2026-02-17";

  // PIELĀGO ŠO SARAKSTU SAVAI SISTĒMAI (tie ir piemēri)
  const cookies: CookieRow[] = [
    {
      name: "consent",
      category: "Nepieciešamās",
      lifetime: "līdz 12 mēn.",
      purpose:
        "Saglabā Jūsu izvēli par sīkdatņu izmantošanu, lai vietne zinātu, ko drīkst aktivizēt un ko nē.",
    },
    {
      name: "SESSID / session",
      category: "Nepieciešamās",
      lifetime: "sesija",
      purpose:
        "Nodrošina sesijas darbību (piem., formas aizpilde, drošības pārbaudes) un palīdz vietnei darboties korekti.",
    },
    {
      name: "_ga / _ga_*",
      category: "Statistikas",
      lifetime: "līdz 24 mēn.",
      purpose:
        "Palīdz apkopot anonimizētus statistikas datus par apmeklējumu un lapas lietošanu (tikai ar Jūsu piekrišanu).",
    },
  ];

  const necessary = cookies.filter((c) => c.category === "Nepieciešamās");
  const analytics = cookies.filter((c) => c.category === "Statistikas");
  const marketing = cookies.filter((c) => c.category === "Mārketinga");

  return (
    <main className="min-h-screen bg-sand">
      <PageHeader
        title="Sīkdatņu informācija"
        subtitle="Šeit atradīsiet skaidrojumu par sīkdatņu veidiem un to, kā pārvaldīt savu izvēli."
        backgroundImageUrl="/jaunumi.jpg"
        crumbs={[{ label: "Sākums", href: "/" }, { label: "Sīkdatņu iestatījumi" }]}
      />

      <section>
        <div className="mx-auto max-w-4xl px-4 py-12 sm:py-14">
          <div className="rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-8 shadow-[0_14px_50px_rgba(0,0,0,0.08)]">
            <p className="text-sm text-cocoa/60">Pēdējoreiz atjaunots: {lastUpdated}</p>

            <div className="mt-8 space-y-10 text-cocoa/80 leading-relaxed">
              {/* 1) Overview */}
              <div>
                <h2 className="text-xl font-semibold text-cocoa">Kāpēc vietne izmanto sīkdatnes?</h2>
                <p className="mt-3">
                  Sīkdatnes palīdz nodrošināt vietnes pamatfunkcijas, uzturēt drošību un (ja dodat piekrišanu)
                  saprast, kā vietne tiek izmantota, lai mēs varētu uzlabot saturu un funkcionalitāti.
                </p>
                <p className="mt-3">
                  Jūs varat pārvaldīt savu izvēli, mainot pārlūka iestatījumus vai (ja vietnē ir pieejams)
                  sīkdatņu izvēļu logs.
                </p>
              </div>

              {/* 2) Categories */}
              <div>
                <h2 className="text-xl font-semibold text-cocoa">Sīkdatņu kategorijas</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-black/5 bg-white/60 p-5">
                    <h3 className="font-semibold text-cocoa">Nepieciešamās</h3>
                    <p className="mt-2 text-sm text-cocoa/70">
                      Nepieciešamas vietnes darbībai un drošībai. Šīs sīkdatnes parasti nevar atslēgt, jo bez tām
                      daļa funkciju nedarbosies korekti.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-white/60 p-5">
                    <h3 className="font-semibold text-cocoa">Statistikas</h3>
                    <p className="mt-2 text-sm text-cocoa/70">
                      Izmanto anonimizētus datus par apmeklējumu un uzvedību vietnē, lai uzlabotu saturu un UX.
                      Tās tiek aktivizētas tikai ar Jūsu piekrišanu.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-white/60 p-5 sm:col-span-2">
                    <h3 className="font-semibold text-cocoa">Mārketinga</h3>
                    <p className="mt-2 text-sm text-cocoa/70">
                      Var tikt izmantotas reklāmas personalizēšanai vai kampaņu mērīšanai. Ja Jūs neesat devuši
                      piekrišanu, tās netiek izmantotas.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3) Cookie list (table-like, but in cards to match your UI) */}
              <div>
                <h2 className="text-xl font-semibold text-cocoa">Sīkdatņu saraksts</h2>
                <p className="mt-3">
                  Zemāk ir uzskaitītas sīkdatnes, kuras var tikt izmantotas šajā vietnē. Saraksts var mainīties,
                  ja tiek pievienoti jauni rīki vai funkcijas.
                </p>

                <div className="mt-5 space-y-6">
                  <CookieGroup title="Nepieciešamās sīkdatnes" rows={necessary} />
                  <CookieGroup title="Statistikas sīkdatnes" rows={analytics} />
                  <CookieGroup title="Mārketinga sīkdatnes" rows={marketing} />
                </div>

                <p className="mt-4 text-sm text-cocoa/60">
                  Piezīme: sīkdatņu nosaukumi un derīguma termiņi var atšķirties atkarībā no pārlūka, ierīces un
                  konfigurācijas.
                </p>
              </div>

              {/* 4) Analytics explanation (unique wording) */}
              <div>
                <h2 className="text-xl font-semibold text-cocoa">Par statistikas rīkiem</h2>
                <p className="mt-3">
                  Ja Jūs piekrītat statistikas sīkdatnēm, vietne var izmantot analītikas rīkus, lai saprastu,
                  kuras lapas tiek apmeklētas biežāk, kā lietotāji pārvietojas pa vietni un kur iespējami uzlabojumi.
                </p>
                <p className="mt-3">
                  Šie dati tiek izmantoti vietnes uzlabošanas nolūkā un tiek apstrādāti apkopotā vai anonimizētā veidā,
                  ciktāl tas ir tehniski iespējams konkrētajam rīkam un iestatījumiem.
                </p>
              </div>

              {/* 5) How to manage */}
              <div>
                <h2 className="text-xl font-semibold text-cocoa">Kā mainīt sīkdatņu iestatījumus?</h2>
                <p className="mt-3">
                  Jūs varat dzēst sīkdatnes vai ierobežot to saglabāšanu pārlūka iestatījumos. Lūdzu ņemiet vērā:
                  ja bloķēsiet nepieciešamās sīkdatnes, dažas vietnes funkcijas var nestrādāt.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <BrowserLink
                    label="Google Chrome"
                    href="https://support.google.com/chrome/answer/95647?hl=en"
                  />
                  <BrowserLink
                    label="Safari"
                    href="https://support.apple.com/lv-lv/guide/safari/sfri11471/mac"
                  />
                  <BrowserLink
                    label="Firefox"
                    href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                  />
                  <BrowserLink
                    label="Opera"
                    href="https://help.opera.com/en/latest/web-preferences/"
                  />
                  <BrowserLink
                    label="Microsoft Edge"
                    href="https://support.microsoft.com/en-us/windows/microsoft-edge-browsing-data-and-privacy-bb8174ba-9d73-dcf2-9b4a-c582b4e640dd"
                  />
                </div>
              </div>

              {/* 6) Contact */}
              <div>
                <h2 className="text-xl font-semibold text-cocoa">Kontakti</h2>
                <p className="mt-3">
                  Jautājumu gadījumā par sīkdatnēm vai datu apstrādi, rakstiet mums:
                  <br />
                  <span className="font-semibold text-cocoa">E-pasts:</span> gringogi@inbox.lv
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function CookieGroup({ title, rows }: { title: string; rows: { name: string; purpose: string; lifetime: string }[] }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/60 p-5">
      <h3 className="font-semibold text-cocoa">{title}</h3>

      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-cocoa/65">Šobrīd nav aktīvu vienumu šajā kategorijā.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((c) => (
            <li key={c.name} className="rounded-xl border border-black/5 bg-white/70 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <code className="rounded bg-black/5 px-2 py-0.5 text-cocoa">{c.name}</code>
                  <p className="mt-2 text-sm text-cocoa/75">{c.purpose}</p>
                </div>
                <div className="text-sm text-cocoa/60 sm:text-right">
                  <span className="font-semibold text-cocoa/70">Derīgums:</span> {c.lifetime}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BrowserLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-xl border border-black/5 bg-white/60 px-4 py-3 text-sm font-semibold text-[#3F2021] underline underline-offset-4 transition hover:bg-white/80"
    >
      {label}
    </a>
  );
}
