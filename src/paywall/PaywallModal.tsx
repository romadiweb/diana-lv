import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { AccessStatus } from "./useAccess";

type Props = {
  open: boolean;
  status: AccessStatus;
  onClose: () => void;
  onSuccess: () => void;
};

export default function PaywallModal({ open, status, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setMsg(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (status.state === "allowed") onSuccess();
  }, [open, status, onSuccess]);

  if (!open) return null;

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setBusy(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setBusy(false);

    if (error) {
      setMsg(error.message);
    } else {
      setMsg(null);
      // useAccess hook will refresh via onAuthStateChange
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  const title =
    status.state === "logged_out"
      ? "Ielogojies, lai turpinātu"
      : status.state === "no_access"
      ? "Piekļuve nav aktīva"
      : status.state === "loading"
      ? "Pārbauda piekļuvi…"
      : "Piekļuve aktīva";

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Piekļuves pārbaude"
      onMouseDown={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div
        className="
          relative z-10 w-full max-w-lg
          rounded-2xl bg-white shadow-2xl border border-neutral-200
          overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-neutral-200 bg-white p-5">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
            <p className="mt-1 text-sm text-neutral-600">
              Mednieku tests ir pieejams tikai kursu dalībniekiem / abonentiem.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Aizvērt"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-900 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {status.state === "logged_out" && (
            <form onSubmit={login} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-neutral-800">E-pasts</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                  placeholder="email@..."
                  autoComplete="email"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-800">Parole</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-400"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {msg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {msg}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {busy ? "Ielogojas..." : "Ielogoties"}
              </button>
            </form>
          )}

          {status.state === "loading" && (
            <div className="text-sm text-neutral-600">Notiek pārbaude…</div>
          )}

          {status.state === "no_access" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {status.reason === "missing_row" && (
                  <>Tavam kontam nav piešķirta piekļuve. Sazinies ar administratoru.</>
                )}
                {status.reason === "inactive" && (
                  <>Tavs konts ir deaktivizēts (piekļuve slēgta pēc kursu pabeigšanas).</>
                )}
                {status.reason === "expired" && (
                  <>
                    Piekļuve ir beigusies
                    {status.expiresAt ? (
                      <> ({new Date(status.expiresAt).toLocaleDateString()}).</>
                    ) : (
                      "."
                    )}
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={logout}
                className="w-full rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
              >
                Izrakstīties
              </button>
            </div>
          )}

          {status.state === "allowed" && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              Piekļuve aktīva — vari turpināt.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
