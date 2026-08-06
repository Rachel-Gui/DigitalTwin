import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import Research from "./pages/Research";
import { modules } from "./data/modules";
import { SpanishPageTranslator, useLanguage } from "./i18n";

const Analytics = lazy(() => import("./pages/Analytics"));

export default function App() {
  const { t } = useLanguage();
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
          {modules.map((module) => <Route key={module.key} path={module.path} element={<ModulePage type={module.key} />} />)}
          <Route path="/research" element={<Research />} />
          <Route path="/analytics" element={<Suspense fallback={<div className="route-loading" aria-busy="true">{t("Loading PM2.5 Concentration visualization…")}</div>}><Analytics /></Suspense>} />
          <Route path="/about" element={<Navigate to="/research" replace />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
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
