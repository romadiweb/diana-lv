import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "././layout/AppLayout"; 
import HomePage from "./pages/HomePage";
import TestFrontPage from "./pages/TestFrontPage";
import TestPage from "./pages/TestPage";
import InfoPage from "./pages/InfoPage";

import ScrollToTop from "./components/ScrollToTop";
import ParMums from "./pages/ParMums";
import Kontakti from "./pages/Kontakti";
import Jaunumi from "./pages/Jaunumi";
import JaunumsDetail from "./pages/JaunumsDetail";
import PieteiktiesPage from "./pages/PieteiktiesPage";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Everything inside AppLayout will render Navbar + Outlet */}
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/mednieku-tests" element={<TestFrontPage />} />
          <Route path="/mednieku-tests/:topicSlug" element={<TestPage />} />
          <Route path="/jaunumi" element={<Jaunumi />} />
          <Route path="/jaunumi/:slug" element={<JaunumsDetail />} />
          <Route path="/par-mums" element={<ParMums/>} />
          <Route path="/kontakti" element={<Kontakti/>} />
          <Route path="/pieteikties/:slug" element={<PieteiktiesPage />} />
          <Route path="/info" element={<InfoPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
