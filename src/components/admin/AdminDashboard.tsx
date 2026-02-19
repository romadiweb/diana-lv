import { Link } from "react-router-dom";

type Quick = { title: string; desc: string; to: string };

const QUICK: Quick[] = [
  { title: "Hero slaidi", desc: "Pārvaldi sākumlapas slaidus", to: "/admin/sakumlapa/hero" },
  { title: "Kursu kartītes", desc: "Pārvaldi kursu kartītes sākumlapā", to: "/admin/sakumlapa/kursi" },
  { title: "BUJ", desc: "Biežāk uzdotie jautājumi", to: "/admin/sakumlapa/buj" },
  { title: "Jaunumi / raksti", desc: "Rakstu pievienošana un rediģēšana", to: "/admin/sakumlapa/jaunumi" },
  { title: "Tēmas", desc: "Testa tēmu pārvaldība", to: "/admin/testi/temas" },
  { title: "Jautājumi", desc: "Testa jautājumu pārvaldība", to: "/admin/testi/jautajumi" },
  { title: "Atbilžu varianti", desc: "Atbilžu variantu pārvaldība", to: "/admin/testi/atbildes" },
  { title: "Lietotāju piekļuve", desc: "Aktīvie lietotāji un admins", to: "/admin/piekļuve/lietotaji" },
];

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-semibold text-cocoa">Informācijas panelis</h1>
      <p className="mt-2 text-sm text-cocoa/70">
        Izvēlies sadaļu kreisajā izvēlnē vai izmanto ātrās saites zemāk.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUICK.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="group rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
          >
            <div className="text-lg font-semibold text-cocoa group-hover:underline underline-offset-4">
              {q.title}
            </div>
            <div className="mt-1 text-sm text-cocoa/70">{q.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
