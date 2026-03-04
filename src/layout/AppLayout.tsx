import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/global/Navbar";
import SiteFooter from "../components/global/SiteFooter";
import CookieFab from "../cookies/CookieFab";

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.search]);

  return null;
}

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <CookieFab />
      <ScrollToTop />

      <Navbar />

      {/* Saturs izstiepjas un "piespiež" footer uz leju */}
      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}