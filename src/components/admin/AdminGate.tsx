import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import AdminLogin from "./AdminLogin";
import AdminDenied from "./AdminDenied";

type GateState = "loading" | "login" | "denied" | "ok";

export default function AdminGate() {
  const [state, setState] = useState<GateState>("loading");
  const reqIdRef = useRef(0);

  async function check() {
    const reqId = ++reqIdRef.current;
    setState("loading");

    const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
    if (reqId !== reqIdRef.current) return;

    if (sessionErr) {
      console.error("AdminGate getSession error:", sessionErr);
      setState("login");
      return;
    }

    const user = sessionData.session?.user;
    if (!user) {
      setState("login");
      return;
    }

    const { data, error } = await supabase
      .from("user_access")
      .select("active, is_admin")
      .eq("user_id", user.id)
      .limit(1);

    if (reqId !== reqIdRef.current) return;

    if (error) {
      console.error("AdminGate user_access error:", error);
      setState("denied");
      return;
    }

    const row = data?.[0] as { active?: boolean; is_admin?: boolean } | undefined;

    if (row?.active && row?.is_admin) setState("ok");
    else setState("denied");
  }

  useEffect(() => {
    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center px-4">
        <div className="rounded-2xl border border-black/10 bg-white/70 px-6 py-5 backdrop-blur">
          Pārbaudu piekļuvi…
        </div>
      </div>
    );
  }

  if (state === "login") return <AdminLogin />;
  if (state === "denied") return <AdminDenied />;

  return <Outlet />;
}
