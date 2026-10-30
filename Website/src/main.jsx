import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { LanguageProvider } from "./i18n";
import "./styles.css";
import { ThemeProvider } from "./theme";
import "./theme.css";
import "./journal.css";
import "./header-refinement.css";
import "./footer-refinement.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter><LanguageProvider><ThemeProvider><App /></ThemeProvider></LanguageProvider></BrowserRouter>
);
