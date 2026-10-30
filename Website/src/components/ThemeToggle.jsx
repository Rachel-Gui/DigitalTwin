import { useTheme } from "../theme";
import { useLanguage } from "../i18n";
export default function ThemeToggle() {
  const {theme,toggleTheme}=useTheme();
  const {language}=useLanguage();
  const light=theme==="light";
  const es=language==="es";
  const action=light?(es?"Cambiar a fondo negro":"Switch to black background"):(es?"Cambiar a fondo blanco":"Switch to white background");
  return <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={action} title={action}>
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">{light?<path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z"/>:<><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>}</svg>
  </button>;
}
