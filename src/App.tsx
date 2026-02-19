import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "././layout/AppLayout";
import HomePage from "./pages/HomePage";
import TestFrontPage from "./pages/TestFrontPage";
import TestPage from "./pages/TestPage";
import InfoPage from "./pages/InfoPage";

import ScrollToTop from "./components/global/ScrollToTop";
import ParMums from "./pages/ParMums";
import Kontakti from "./pages/Kontakti";
import Jaunumi from "./pages/Jaunumi";
import JaunumsDetail from "./pages/JaunumsDetail";
import PieteiktiesPage from "./pages/PieteiktiesPage";
import NotFound from "./pages/NotFound";
import SikdatnuInformacija from "./pages/SikdatnuInformacija";

import { CookieConsentProvider } from "./cookies/CookieConsentProvider";
import CookieConsentModal from "./cookies/CookieConsentModal";

// Admin
import AdminGate from "./components/admin/AdminGate";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminHomeHero from "./components/admin/home/AdminHomeHero";
import AdminHomeCourses from "./components/admin/home/AdminHomeCourses";
import AdminHomeFaqs from "./components/admin/home/AdminHomeFaqs";
import AdminHomeArticles from "./components/admin/home/AdminHomeArticles";
import AdminTestTopics from "./components/admin/tests/AdminTestTopics";
import AdminTestQuestions from "./components/admin/tests/AdminTestQuestions";
import AdminTestChoices from "./components/admin/tests/AdminTestChoices";
import AdminUserAccess from "./components/admin/access/AdminUserAccess";

export default function App() {
  return (
    <CookieConsentProvider>
      <BrowserRouter>
        <ScrollToTop />
        <CookieConsentModal />

        <Routes>
          {/* Public site */}
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="/mednieku-tests" element={<TestFrontPage />} />
            <Route path="/mednieku-tests/:topicSlug" element={<TestPage />} />
            <Route path="/jaunumi" element={<Jaunumi />} />
            <Route path="/jaunumi/:slug" element={<JaunumsDetail />} />
            <Route path="/par-mums" element={<ParMums />} />
            <Route path="/kontakti" element={<Kontakti />} />
            <Route path="/pieteikties" element={<PieteiktiesPage />} />
            <Route path="/pieteikties/:courseSlug?" element={<PieteiktiesPage />} />
            <Route path="/sikdatnu-informacija" element={<SikdatnuInformacija />} />
            <Route path="/info" element={<InfoPage />} />
          </Route>

          {/* Admin (no public navbar layout) */}
          <Route element={<AdminGate />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

              <Route path="sakumlapa/hero" element={<AdminHomeHero />} />
              <Route path="sakumlapa/kursi" element={<AdminHomeCourses />} />
              <Route path="sakumlapa/buj" element={<AdminHomeFaqs />} />
              <Route path="sakumlapa/jaunumi" element={<AdminHomeArticles />} />

              <Route path="testi/temas" element={<AdminTestTopics />} />
              <Route path="testi/jautajumi" element={<AdminTestQuestions />} />
              <Route path="testi/atbildes" element={<AdminTestChoices />} />

              <Route path="piekļuve/lietotaji" element={<AdminUserAccess />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CookieConsentProvider>
  );
}
