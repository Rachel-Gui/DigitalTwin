import paperCover from "../assets/research/energy-paper-cover.png";
import { PublicationRecord } from "../components";
import { useLanguage } from "../i18n";
import { homeText } from "../components/home/content";
import "../components/home/home.css";

export default function Publications(){
  const {language}=useLanguage();
  const t=text=>homeText(language,text);
  return <div className="publications-page">
    <header className="publications-intro page-container"><span className="platform-eyebrow">{t("Research publications")}</span><h1>{t("Evidence behind the platform.")}</h1><p>{t("Peer-reviewed research supporting integrated building-energy assessment, predictive modeling, and health-driven decarbonization.")}</p></header>
    <section className="paper-section"><div className="page-container"><PublicationRecord image={paperCover} href="https://doi.org/10.3390/architecture6020084"/></div></section>
  </div>;
}
