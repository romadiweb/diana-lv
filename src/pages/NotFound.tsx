import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function ScopeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" {...props}>
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="3" />
      <path d="M32 8v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 46v10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 32h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 32h10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="32" cy="32" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-sand flex items-center justify-center px-4">
      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-blush/60 blur-3xl" />
        <div className="absolute -right-28 top-10 h-80 w-80 rounded-full bg-fog/60 blur-3xl" />
      </div>

      {/* White card */}
      <div className="relative w-full max-w-xl rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-8 shadow-[0_14px_50px_rgba(0,0,0,0.08)]">

        {/* Back button INSIDE card */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-cocoa shadow-sm transition hover:bg-white/80 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4 hover:cursor-pointer" />
        </button>

        <div className="text-center pt-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-sm">
            <ScopeIcon className="h-10 w-10 text-[#3F2021]" />
          </div>

          <p className="mt-6 text-xs font-semibold tracking-wider text-cocoa/50">
            404
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-cocoa sm:text-4xl">
            Izskatās, ka esi trāpījis garām…
          </h1>

          <p className="mt-3 text-cocoa/75">
            Šī lapa neeksistē vai ir pārvietota.
          </p>

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full bg-[#3F2021] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 active:scale-[0.99]"
            >
              Uz sākumlapu
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
