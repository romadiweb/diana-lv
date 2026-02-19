import { useState } from "react";
import { supabase } from "../../lib/supabase";
import CaptchaTurnstile from "../../components/global/CaptchaTurnstile";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("Lūdzu, apstiprini drošības pārbaudi.");
      return;
    }

    setBusy(true);
    try {
      // NOTE: Captcha token validation should happen server-side (Netlify function),
      // but we keep UI gating here to match your existing Turnstile usage.
      // If you already have a verify endpoint, you can validate captchaToken before sign-in.

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInErr) {
        setError("Nepareizs e-pasts vai parole.");
        setCaptchaToken("");
        return;
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur">
        <h1 className="text-2xl font-semibold text-cocoa">Administrēšana</h1>
        <p className="mt-1 text-sm text-cocoa/70">
          Ielogojies ar īpašnieka kontu, lai pārvaldītu saturu.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={doLogin} className="mt-5 space-y-3">
          <div>
            <label className="text-sm font-medium text-cocoa">E-pasts</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
              type="email"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-cocoa">Parole</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-cocoa outline-none focus:border-black/20"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {TURNSTILE_SITE_KEY ? (
            <div className="pt-1">
              <CaptchaTurnstile
                siteKey={TURNSTILE_SITE_KEY}
                onToken={(t) => setCaptchaToken(t)}
                onExpire={() => setCaptchaToken("")}
                onError={() => setCaptchaToken("")}
              />
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/20 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Trūkst <b>VITE_TURNSTILE_SITE_KEY</b> mainīgā.
            </div>
          )}

          <button
            type="submit"
            disabled={busy || !captchaToken}
            className="mt-2 w-full rounded-xl bg-cocoa px-4 py-2 font-semibold text-white hover:opacity-95 disabled:opacity-60"
          >
            {busy ? "Ielogojos…" : "Ielogoties"}
          </button>
        </form>
      </div>
    </div>
  );
}
