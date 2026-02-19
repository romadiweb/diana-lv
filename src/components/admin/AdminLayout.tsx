import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type NavItem = { label: string; to: string };
type NavGroup = { title: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    title: "Sākumlapa",
    items: [
      { label: "Hero slaidi", to: "/admin/sakumlapa/hero" },
      { label: "Kursu kartītes", to: "/admin/sakumlapa/kursi" },
      { label: "BUJ", to: "/admin/sakumlapa/buj" },
      { label: "Jaunumi / raksti", to: "/admin/sakumlapa/jaunumi" },
    ],
  },
  {
    title: "Testi",
    items: [
      { label: "Tēmas", to: "/admin/testi/temas" },
      { label: "Jautājumi", to: "/admin/testi/jautajumi" },
      { label: "Atbilžu varianti", to: "/admin/testi/atbildes" },
    ],
  },
  {
    title: "Piekļuve",
    items: [{ label: "Lietotāju piekļuve", to: "/admin/piekļuve/lietotaji" }],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  async function logout() {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-sand">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-black/10 bg-white/70 p-4 backdrop-blur md:block">
          <div className="rounded-2xl bg-white/70 p-4 border border-black/10">
            <div className="text-lg font-semibold text-cocoa">Administrēšana</div>
            <div className="mt-1 text-sm text-cocoa/70">Satura pārvaldība</div>
          </div>

          <nav className="mt-4 space-y-4">
            {NAV.map((g) => (
              <div key={g.title}>
                <div className="px-2 text-xs font-semibold tracking-wide text-cocoa/60 uppercase">
                  {g.title}
                </div>
                <div className="mt-2 space-y-1">
                  {g.items.map((it) => (
                    <NavLink
                      key={it.to}
                      to={it.to}
                      className={({ isActive }) =>
                        [
                          "block rounded-xl px-3 py-2 text-sm font-medium transition",
                          isActive
                            ? "bg-[#F7F7F7] text-[#3F2021]"
                            : "text-cocoa hover:bg-black/5",
                        ].join(" ")
                      }
                      end
                    >
                      {it.label}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-black/10 bg-white/70 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="md:hidden text-lg font-semibold text-cocoa">Admin</div>
                <div className="hidden md:block text-sm text-cocoa/70">
                  Administrēšanas panelis
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-cocoa hover:bg-white"
              >
                Iziet
              </button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
