import { Link } from "react-router-dom";

export default function Navbar({ onOpenCourses }: { onOpenCourses?: () => void }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-fog/60 bg-[#3F2021]">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Doties uz sākumlapu">
            <img
              src="/diana-logo.png"
              alt="Diana logo"
              className="h-22 w-22 rounded-xl object-contain hover:opacity-90"
            />
          </Link>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-[#FBF8F5]">Mednieku kursi</p>
            <p className="text-xs text-[#FBF8F5]/80">Testi treniņam</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCourses}
          className="
            rounded-2xl border border-[#FBF8F5]
            px-4 py-2 text-sm font-semibold text-[#FBF8F5]
            transition hover:bg-[#FBF8F5]/10 hover:scale-105 hover:cursor-pointer
          "
        >
          Pierakstīties
        </button>
      </div>
    </header>
  );
}
