import StatCard from "./StatCard";

export default function HeroSection({
  topicsCount,
  totalQuestionsCount,
  onStartTest,
  onOpenCourses,
}: {
  topicsCount: number;
  totalQuestionsCount: number | null; // null while loading
  onStartTest: () => void;
  onOpenCourses: () => void;
}) {
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
            Izvēlies tēmu un trenējies ar testiem.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onStartTest}
              className="rounded-sm bg-[#3F2021] px-5 py-3 text-sm font-semibold text-white border border-[#DBDEE4] hover:cursor-pointer hover:scale-105 transition-transform"
            >
              Sākt testu
            </button>

            <button
              type="button"
              onClick={onOpenCourses}
              className="rounded-sm bg-white px-5 py-3 text-sm font-semibold text-cocoa border border-[#DBDEE4] hover:cursor-pointer hover:scale-105 transition-transform"
            >
              Pieteikties kursiem
            </button>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-3">
            <StatCard
              label="Jautājumi"
              value={
                totalQuestionsCount === null ? "—" : String(totalQuestionsCount)
              }
            />
            <StatCard label="Tēmas" value={`${topicsCount}`} />
            <StatCard label="Vid. laiks" value="—" />
          </div>
        </div>
      </div>
    </section>
  );
}
