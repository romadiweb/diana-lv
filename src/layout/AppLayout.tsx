import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar"; // adjust path
import SiteFooter from "../components/SiteFooter";
// import Footer from "../components/Footer"; // optional

export default function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <SiteFooter />
    </>
  );
}
