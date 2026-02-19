import { useEffect, useMemo, useState } from "react";
import { authedFetch } from "./api";
import { fmtDate, parseLvDateTimeToIso } from "./utils";
import type { UA, CreatedAuthUser } from "./types";

export default function UserAccessManager({ prefFill }: { prefFill?: CreatedAuthUser | null }) {
  const [rows, setRows] = useState<UA[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");

  // Grant access form
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [note, setNote] = useState("");
  const [active, setActive] = useState(true);
  const [never, setNever] = useState(true);
  const [expires, setExpires] = useState("");

  // Edit modal
  const [editing, setEditing] = useState<UA | null>(null);
  const [eActive, setEActive] = useState(true);
  const [eNever, setENever] = useState(true);
  const [eExpires, setEExpires] = useState("");
  const [eNote, setENote] = useState("");

  useEffect(() => {
    // Prefill from "CreateAuthUser" result
    if (prefFill?.id) setUserId(prefFill.id);
    if (prefFill?.email) setEmail(prefFill.email);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefFill?.id]);

  const adminCount = useMemo(() => rows.filter((r) => r.is_admin).length, [rows]);

  async function load(q?: string) {
    setLoading(true);
    setErr(null);
    try {
      const qs = q?.trim() ? `?search=${encodeURIComponent(q.trim())}` : "";
      const data = await authedFetch(`/.netlify/functions/admin-user-access${qs}`);
      setRows((data.rows ?? []) as UA[]);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās ielādēt datus.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openEdit(r: UA) {
    setEditing(r);
    setEActive(!!r.active);
    setENever(!!r.never_expires);
    setEExpires(r.expires_at ? new Date(r.expires_at).toLocaleString("lv-LV") : "");
    setENote(r.note ?? "");
  }

  function closeEdit() {
    setEditing(null);
    setEExpires("");
    setENote("");
  }

  async function grantAccess() {
    setErr(null);

    const uid = userId.trim();
    const em = email.trim();

    if (!uid && !em) {
      setErr("Ievadi user_id vai e-pastu (esošam Auth user).");
      return;
    }
    if (uid && em) {
      setErr("Izvēlies vienu: vai nu user_id, vai e-pasts (nav vajadzīgi abi reizē).");
      return;
    }

    setBusy(true);
    try {
      await authedFetch("/.netlify/functions/admin-user-access", {
        method: "POST",
        body: JSON.stringify({
          action: "grant_access",
          user_id: uid || null,
          email: em || null,
          access: {
            active,
            never_expires: never,
            expires_at: never ? null : parseLvDateTimeToIso(expires),
            note: note.trim() ? note.trim() : null,
            is_admin: false,
          },
        }),
      });

      setNote("");
      setExpires("");
      setActive(true);
      setNever(true);

      await load(search);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās piešķirt piekļuvi.");
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    if (!editing) return;
    setBusy(true);
    setErr(null);
    try {
      const patch: any = {
        active: eActive,
        never_expires: eNever,
        expires_at: eNever ? null : parseLvDateTimeToIso(eExpires),
        note: eNote.trim() ? eNote.trim() : null,
      };

      const res = await authedFetch("/.netlify/functions/admin-user-access", {
        method: "PATCH",
        body: JSON.stringify({ user_id: editing.user_id, patch }),
      });

      const updated = res.row as UA;
      setRows((prev) => prev.map((r) => (r.user_id === updated.user_id ? updated : r)));
      closeEdit();
    } catch (e: any) {
      setErr(e?.message || "Neizdevās saglabāt.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(r: UA) {
    setBusy(true);
    setErr(null);
    try {
      const res = await authedFetch("/.netlify/functions/admin-user-access", {
        method: "PATCH",
        body: JSON.stringify({ user_id: r.user_id, patch: { active: !r.active } }),
      });
      const updated = res.row as UA;
      setRows((prev) => prev.map((x) => (x.user_id === updated.user_id ? updated : x)));
    } catch (e: any) {
      setErr(e?.message || "Neizdevās atjaunināt.");
    } finally {
      setBusy(false);
    }
  }

  async function makeSingleAdmin(userId: string) {
    setBusy(true);
    setErr(null);
    try {
      await authedFetch("/.netlify/functions/admin-user-access", {
        method: "PATCH",
        body: JSON.stringify({ user_id: userId, patch: { is_admin: true } }),
      });
      await load(search);
    } catch (e: any) {
      setErr(e?.message || "Neizdevās piešķirt administratoru.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteRow(userId: string) {
    if (!confirm("Vai tiešām dzēst šo piekļuves ierakstu?")) return;
    setBusy(true);
    setErr(null);
    try {
      await authedFetch("/.netlify/functions/admin-user-access", {
        method: "DELETE",
        body: JSON.stringify({ user_id: userId }),
      });
      setRows((prev) => prev.filter((r) => r.user_id !== userId));
    } catch (e: any) {
      setErr(e?.message || "Neizdevās dzēst.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5">
      <div className="text-lg font-semibold text-cocoa">2) Piekļuve un iestatījumi (user_access)</div>
      <div className="mt-1 text-sm text-cocoa/70">
        Šeit piešķir piekļuvi lietotājam, kurš jau eksistē Auth sistēmā. Administratoru skaits: <b>{adminCount}</b>.
      </div>

      {err && (
        <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
          {err}
        </div>
      )}

      {/* Grant access */}
      <div className="mt-4 rounded-2xl border border-black/10 bg-white/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="font-semibold text-cocoa">Piešķirt / atjaunināt piekļuvi</div>
          <button
            onClick={grantAccess}
            disabled={busy}
            className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-black hover:opacity-95 disabled:opacity-60"
          >
            Saglabāt piekļuvi
          </button>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-cocoa">user_id (Auth UID)</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 font-mono text-xs text-cocoa outline-none focus:border-black/20"
              placeholder="iemet Auth user ID"
            />
            <div className="mt-1 text-xs text-cocoa/60">Ja izmanto user_id, e-pastu atstāj tukšu.</div>
          </div>

          <div>
            <label className="text-sm font-medium text-cocoa">E-pasts (esošam Auth user)</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
              placeholder="user@email.com"
            />
            <div className="mt-1 text-xs text-cocoa/60">Ja izmanto e-pastu, user_id atstāj tukšu.</div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Aktīvs
            </label>

            <label className="flex items-center gap-2 text-sm text-cocoa">
              <input type="checkbox" checked={never} onChange={(e) => setNever(e.target.checked)} />
              Bez termiņa
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-cocoa">Derīgs līdz</label>
            <input
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              onFocus={() => setNever(false)} // ✅ makes it ALWAYS usable
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
              placeholder="25.12.2026 12:00"
            />
            <div className="mt-1 text-xs text-cocoa/60">Klikšķis laukā automātiski noņem “Bez termiņa”.</div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-cocoa">Piezīme</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
              placeholder="piem. Klients / īpašnieks"
            />
          </div>
        </div>
      </div>

      {/* Search + table */}
      <div className="mt-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="w-full sm:w-80">
            <label className="text-sm font-medium text-cocoa">Meklēt</label>
            <div className="mt-1 flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
                placeholder="user_id / e-pasts / piezīme…"
              />
              <button
                onClick={() => load(search)}
                disabled={busy}
                className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-cocoa hover:bg-white disabled:opacity-60"
              >
                Meklēt
              </button>
            </div>
          </div>

          <button
            onClick={() => load(search)}
            disabled={busy}
            className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-cocoa hover:bg-white disabled:opacity-60"
          >
            Atsvaidzināt
          </button>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-cocoa/70">Ielādē…</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-cocoa/70">
                <tr className="border-b border-black/10">
                  <th className="py-2 pr-4">user_id</th>
                  <th className="py-2 pr-4">E-pasts</th>
                  <th className="py-2 pr-4">Aktīvs</th>
                  <th className="py-2 pr-4">Admins</th>
                  <th className="py-2 pr-4">Bez termiņa</th>
                  <th className="py-2 pr-4">Derīgs līdz</th>
                  <th className="py-2 pr-4">Piezīme</th>
                  <th className="py-2 pr-4">Izveidots</th>
                  <th className="py-2 pr-4">Darbības</th>
                </tr>
              </thead>

              <tbody className="text-cocoa">
                {rows.map((r) => (
                  <tr key={r.user_id} className="border-b border-black/5 align-top">
                    <td className="py-3 pr-4 font-mono text-xs">{r.user_id}</td>
                    <td className="py-3 pr-4 text-xs">{r.email ?? "—"}</td>

                    <td className="py-3 pr-4">
                      <button
                        onClick={() => toggleActive(r)}
                        disabled={busy}
                        className={[
                          "rounded-full px-3 py-1 text-xs font-semibold border disabled:opacity-60",
                          r.active ? "bg-green-50 border-green-200 text-green-800" : "bg-neutral-50 border-black/10 text-neutral-700",
                        ].join(" ")}
                      >
                        {r.active ? "Jā" : "Nē"}
                      </button>
                    </td>

                    <td className="py-3 pr-4">
                      {r.is_admin ? (
                        <span className="rounded-full bg-cocoa px-3 py-1 text-xs font-semibold text-white">Admin</span>
                      ) : (
                        <button
                          onClick={() => makeSingleAdmin(r.user_id)}
                          disabled={busy}
                          className="rounded-full border border-black/10 bg-white/60 px-3 py-1 text-xs font-semibold text-cocoa hover:bg-white disabled:opacity-60"
                        >
                          Piešķirt
                        </button>
                      )}
                    </td>

                    <td className="py-3 pr-4">{r.never_expires ? "Jā" : "Nē"}</td>
                    <td className="py-3 pr-4">{fmtDate(r.expires_at)}</td>
                    <td className="py-3 pr-4">{r.note ?? "—"}</td>
                    <td className="py-3 pr-4">{fmtDate(r.created_at)}</td>

                    <td className="py-3 pr-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => openEdit(r)}
                        disabled={busy}
                        className="rounded-xl border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-cocoa hover:bg-white disabled:opacity-60"
                      >
                        Rediģēt
                      </button>
                      <button
                        onClick={() => deleteRow(r.user_id)}
                        disabled={busy}
                        className="rounded-xl border border-red-500/20 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Dzēst
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && (
                  <tr>
                    <td className="py-6 text-sm text-cocoa/70" colSpan={9}>
                      Nekas nav atrasts.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-cocoa">Rediģēt piekļuvi</div>
                <div className="mt-1 font-mono text-xs text-cocoa/70">{editing.user_id}</div>
              </div>
              <button
                onClick={closeEdit}
                className="rounded-xl border border-black/10 bg-white px-3 py-1.5 text-sm font-semibold text-cocoa hover:bg-black/5"
              >
                Aizvērt
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="flex items-center gap-2 text-sm text-cocoa">
                <input type="checkbox" checked={eActive} onChange={(e) => setEActive(e.target.checked)} />
                Aktīvs
              </label>

              <label className="flex items-center gap-2 text-sm text-cocoa">
                <input type="checkbox" checked={eNever} onChange={(e) => setENever(e.target.checked)} />
                Bez termiņa
              </label>

              <div>
                <label className="text-sm font-medium text-cocoa">Derīgs līdz</label>
                <input
                  value={eExpires}
                  onChange={(e) => setEExpires(e.target.value)}
                  onFocus={() => setENever(false)} // ✅ always usable
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
                  placeholder="25.12.2026 12:00"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-cocoa">Piezīme</label>
                <input
                  value={eNote}
                  onChange={(e) => setENote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={saveEdit}
                disabled={busy}
                className="rounded-xl bg-cocoa px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
              >
                Saglabāt
              </button>
              <button
                onClick={closeEdit}
                disabled={busy}
                className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-cocoa hover:bg-black/5 disabled:opacity-60"
              >
                Atcelt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
