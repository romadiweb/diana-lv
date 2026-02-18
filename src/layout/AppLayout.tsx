import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
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
    <>
      <CookieFab />
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <SiteFooter />
    </>
  );
}
