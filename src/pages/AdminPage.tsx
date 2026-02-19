import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

declare global {
  interface Window {
    turnstile?: any;
  }
}

type ViewState = "checking" | "login" | "denied" | "ready";

export default function AdminPage() {
  const [view, setView] = useState<ViewState>("checking");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------
  // Check if logged-in user is admin
  // -----------------------
  async function checkAdminStatus() {
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      setView("login");
      return;
    }

    setUserEmail(user.email ?? null);

    const { data: accessRow } = await supabase
      .from("user_access")
      .select("active, is_admin")
      .eq("user_id", user.id)
      .single();

    if (accessRow?.active && accessRow?.is_admin) {
      setView("ready");
    } else {
      await supabase.auth.signOut();
      setView("denied");
    }
  }

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // -----------------------
  // Login
  // -----------------------
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!turnstileToken) {
      setError("Please complete the security verification.");
      return;
    }

    setBusy(true);

    try {
      // Verify Turnstile using same backend endpoint you use on pieteikumi
      const res = await fetch("/.netlify/functions/turnstile-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: turnstileToken,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        setError("Security verification failed.");
        return;
      }

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        setError(loginError.message);
        return;
      }

      await checkAdminStatus();
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setView("login");
  }

  // -----------------------
  // UI
  // -----------------------

  if (view === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking admin session...
      </div>
    );
  }

  if (view === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg">
          <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>

          {error && (
            <div className="mb-4 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                className="w-full mt-1 px-3 py-2 border rounded-xl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                className="w-full mt-1 px-3 py-2 border rounded-xl"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Turnstile Widget */}
            <div
              className="cf-turnstile"
              data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              data-callback={(token: string) => setTurnstileToken(token)}
            ></div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-black text-white py-2 rounded-xl"
            >
              {busy ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Access denied.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 border rounded-xl"
        >
          Logout
        </button>
      </div>

      <div className="mt-8">
        <p>Welcome {userEmail}</p>
        {/* CRUD sections go here */}
      </div>
    </div>
  );
}
