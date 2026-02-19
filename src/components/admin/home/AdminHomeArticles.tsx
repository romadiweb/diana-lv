export default function AdminHomeArticles() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
      <h1 className="text-2xl font-semibold text-cocoa">Jaunumi / raksti</h1>
      <p className="mt-2 text-sm text-cocoa/70">
        Šeit izveidosim CRUD pārvaldību tabulai <b>home_articles</b> (pievienot / rediģēt / dzēst, active, sort_order).
      </p>
    </div>
  );
}
