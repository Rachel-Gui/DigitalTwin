import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Navbar, Footer } from "./components";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import Research from "./pages/Research";
import { modules } from "./data/modules";

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {modules.map((module) => <Route key={module.key} path={module.path} element={<ModulePage type={module.key} />} />)}
          <Route path="/research" element={<Research />} />
          <Route path="/about" element={<Navigate to="/research" replace />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}
