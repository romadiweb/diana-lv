export default function Jautājumi() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
      <h1 className="text-2xl font-semibold text-cocoa">Jautājumi</h1>
      <p className="mt-2 text-sm text-cocoa/70">
        Šeit izveidosim CRUD pārvaldību tabulai <b>questions</b> (pievienot / rediģēt / dzēst, active, sort_order).
      </p>
    </div>
  );
}
