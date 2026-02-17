import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";

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
      <ScrollToTop />
      <Navbar />
      <Outlet />
      <SiteFooter />
    </>
  );
}
