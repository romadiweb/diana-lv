import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

type AccessRow = {
  active: boolean;
  never_expires: boolean;
  expires_at: string | null;
};

export type AccessStatus =
  | { state: "loading" }
  | { state: "logged_out" }
  | { state: "no_access"; reason: "missing_row" | "inactive" | "expired" | "blocked"; expiresAt?: string | null }
  | { state: "allowed"; expiresAt?: string | null; neverExpires: boolean };

function isValidAccess(row: AccessRow | null): { ok: boolean; reason?: "missing_row" | "inactive" | "expired" } {
  if (!row) return { ok: false, reason: "missing_row" };
  if (!row.active) return { ok: false, reason: "inactive" };
  if (row.never_expires) return { ok: true };
  if (!row.expires_at) return { ok: false, reason: "expired" };

  const exp = new Date(row.expires_at).getTime();
  return exp > Date.now() ? { ok: true } : { ok: false, reason: "expired" };
}

export function useAccess() {
  const [status, setStatus] = useState<AccessStatus>({ state: "loading" });
  const reqIdRef = useRef(0);

  async function refresh() {
    const reqId = ++reqIdRef.current;
    setStatus({ state: "loading" });

    // 1) Wait for a session (prevents false-deny during initial load)
    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (reqId !== reqIdRef.current) return;

    if (sessionErr) {
      console.error("getSession error:", sessionErr);
      setStatus({ state: "logged_out" });
      return;
    }

    const user = sessionData.session?.user;
    if (!user) {
      setStatus({ state: "logged_out" });
      return;
    }

    // 2) Read access row (avoid maybeSingle/single to prevent fragile errors)
    const { data, error } = await supabase
      .from("user_access")
      .select("active, never_expires, expires_at")
      .eq("user_id", user.id)
      .limit(1);

    if (reqId !== reqIdRef.current) return;

    if (error) {
      console.error("user_access select error:", error);
      // If RLS blocks the read, treat as no access (but not logged out)
      setStatus({ state: "no_access", reason: "blocked" });
      return;
    }

    const row = (data?.[0] as AccessRow | undefined) ?? null;
    const validity = isValidAccess(row);

    if (!validity.ok) {
      setStatus({ state: "no_access", reason: validity.reason!, expiresAt: row?.expires_at ?? null });
      return;
    }

    setStatus({
      state: "allowed",
      expiresAt: row?.expires_at ?? null,
      neverExpires: !!row?.never_expires,
    });
  }

  useEffect(() => {
    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      // auth changed -> re-check access
      refresh();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, refresh };
}
