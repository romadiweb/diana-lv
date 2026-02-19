import { useNavigate } from "react-router-dom";

export default function HeroSection({
  topicsCount,
  totalQuestionsCount,
  onStartTest,
}: {
  topicsCount: number;
  totalQuestionsCount: number | null; // null while loading
  onStartTest: () => void;
  onOpenCourses: () => void;
}) {
  const navigate = useNavigate();
  return (
    <section className="relative" id="sakt">
      <div className="absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blush/70 blur-2xl" />
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-fog/70 blur-2xl" />
      </div>

      <div className="mx-auto w-full px-4 py-10 sm:px-6 lg:px-10 md:py-14">
        <div className="relative">
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-cocoa md:text-5xl">
            Gatavojies mednieka eksāmenam.
          </h1>

          <p className="mt-4 max-w-prose text-cocoa/80">
            Mācību testi balstīti uz normatīvajiem aktiem un oficiālajām eksāmena tēmām.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onStartTest}
              className="rounded-xl bg-[#3F2021] px-5 py-3 text-sm font-semibold text-white border border-[#DBDEE4]
                         hover:cursor-pointer hover:brightness-110 active:scale-[0.99] transition"
            >
              Sākt testu
            </button>

            <button
            type="button"
            onClick={() => navigate("/pieteikties/mednieku-eksamena-tests")}
            className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-cocoa border border-[#DBDEE4]
                      hover:cursor-pointer hover:bg-white/80 active:scale-[0.99] transition"
          >
            Pieteikties kursiem
          </button>

          </div>

          {/* Chips instead of stat cards */}
          <div className="mt-5 flex flex-wrap gap-2 text-sm text-cocoa/80">
            <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1.5 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#3F2021]" />
              {totalQuestionsCount === null ? "Ielādē jautājumus…" : `${totalQuestionsCount} jautājumi`}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1.5 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#3F2021]" />
              {topicsCount} tēmas
            </span>

            {/* If you later calculate avg time, add it as a 3rd chip */}
            {/* <span className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white/60 px-3 py-1.5 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#3F2021]" />
              Vid. laiks: —
            </span> */}
          </div>
        </div>
      </div>
    </section>
  );
}
