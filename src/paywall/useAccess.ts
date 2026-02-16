import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type AccessRow = {
  active: boolean;
  never_expires: boolean;
  expires_at: string | null;
};

export type AccessStatus =
  | { state: "loading" }
  | { state: "logged_out" }
  | { state: "no_access"; reason: "missing_row" | "inactive" | "expired"; expiresAt?: string | null }
  | { state: "allowed"; expiresAt?: string | null; neverExpires: boolean };

function isValidAccess(row: AccessRow | null): { ok: boolean; reason?: "missing_row" | "inactive" | "expired" } {
  if (!row) return { ok: false, reason: "missing_row" };
  if (!row.active) return { ok: false, reason: "inactive" };
  if (row.never_expires) return { ok: true };
  if (!row.expires_at) return { ok: false, reason: "expired" };

  const exp = new Date(row.expires_at).getTime();
  const now = Date.now();
  return exp > now ? { ok: true } : { ok: false, reason: "expired" };
}

export function useAccess() {
  const [status, setStatus] = useState<AccessStatus>({ state: "loading" });

  async function refresh() {
    setStatus({ state: "loading" });

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setStatus({ state: "logged_out" });
      return;
    }

    const { data, error } = await supabase
      .from("user_access")
      .select("active, never_expires, expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      // safest: treat as no access
      setStatus({ state: "no_access", reason: "missing_row" });
      return;
    }

    const row = (data as AccessRow | null) ?? null;
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
      refresh();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { status, refresh };
}
