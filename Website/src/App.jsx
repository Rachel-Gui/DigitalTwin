import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import Publications from "./pages/Publications";
import Team from "./pages/Team";
import { SpanishPageTranslator, useLanguage } from "./i18n";

export default function App() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const inWorkspace=pathname==="/dashboard";
  return (
    <div className="app">
      <ScrollToTop />
      <SpanishPageTranslator />
      <a className="skip-link" href="#main-content">{t("Skip to main content")}</a>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/energy" element={<Navigate to="/dashboard?module=energy" replace />} />
          <Route path="/vr" element={<ModulePage type="vr" />} />
          <Route path="/scenario-analysis" element={<ModulePage type="scenario" />} />
          <Route path="/research" element={<Navigate to="/publications" replace />} />
          <Route path="/publications" element={<Publications />} />
          <Route path="/team" element={<Team />} />
          <Route path="/about" element={<Navigate to="/#about-project" replace />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!inWorkspace&&<Footer />}
    </div>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView({ behavior: "auto", block: "start" }));
    else window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}
