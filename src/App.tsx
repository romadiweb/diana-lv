import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "././layout/AppLayout"; 
import HomePage from "./pages/HomePage";
import TestFrontPage from "./pages/TestFrontPage";
import TestPage from "./pages/TestPage";
import InfoPage from "./pages/InfoPage";

import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        {/* Everything inside AppLayout will render Navbar + Outlet */}
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="/tests" element={<TestFrontPage />} />
          <Route path="/tests/:topicSlug" element={<TestPage />} />
          <Route path="/info" element={<InfoPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
