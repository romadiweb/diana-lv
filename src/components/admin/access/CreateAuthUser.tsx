import { useState } from "react";
import { authedFetch } from "./api";
import type { CreatedAuthUser } from "./types";

export default function CreateAuthUser({
  onCreated,
}: {
  onCreated?: (u: CreatedAuthUser) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedAuthUser | null>(null);

  async function create() {
    setErr(null);
    setCreated(null);

    const e = email.trim();
    const p = password;

    if (!e) return setErr("Ievadi e-pastu.");
    if (!p || p.length < 6) return setErr("Parolei jābūt vismaz 6 simboli.");

    setBusy(true);
    try {
      const res = await authedFetch("/.netlify/functions/admin-user-access", {
        method: "POST",
        body: JSON.stringify({
          action: "create_auth_user",
          email: e,
          password: p,
        }),
      });

      const user = res.user as CreatedAuthUser;
      setCreated(user);
      onCreated?.(user);

      // keep email, clear password
      setPassword("");
    } catch (e: any) {
      setErr(e?.message || "Neizdevās izveidot lietotāju.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold text-cocoa">1) Izveidot Auth lietotāju</div>
          <div className="mt-1 text-sm text-cocoa/70">
            Šis izveido lietotāju (Pircēja e-pasts un izveidojat viņam paroli) //Authentication (auth.users).<br/> Piekļuves piešķiršana ir nākamajā blokā.
          </div>
        </div>

        <button
          onClick={create}
          disabled={busy}
          className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black hover:opacity-95 disabled:opacity-60"
        >
          Izveidot
        </button>
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-cocoa">E-pasts</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
            placeholder="user@email.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-cocoa">Parole</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
            placeholder="min 6 simboli"
          />
        </div>
      </div>

      {created && (
        <div className="mt-4 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-cocoa">
          <div className="font-semibold">
            {created.existed ? "Lietotājs jau eksistē" : "Lietotājs izveidots"} ✅
          </div>
          <div className="mt-1">
            <span className="text-cocoa/70">Email:</span> {created.email}
          </div>
          <div className="mt-1 font-mono text-xs">
            <span className="text-cocoa/70">User ID:</span> {created.id}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(created.id)}
              className="rounded-xl border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-cocoa hover:bg-white"
            >
              Kopēt user_id
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(created.email)}
              className="rounded-xl border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-cocoa hover:bg-white"
            >
              Kopēt e-pastu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
