import { useLanguage } from "../i18n";
import SeattleCityHero from "../components/home/SeattleCityHero";
import PageScrollRuler from "../components/home/PageScrollRuler";
import CapabilityStories from "../components/home/CapabilityStories";
import Partners from "../components/Partners";
import PlatformEntrances from "../components/home/PlatformEntrances";
import { overview, frontier, homeText } from "../components/home/content";
import "../components/home/home.css";

export default function Home(){
  const {language}=useLanguage();
  const t=text=>homeText(language,text);
  const locale=language==="es"?"es":"en";
  return <div className="platform-home">
    <PageScrollRuler/>
    <section id="project-overview" aria-labelledby="platform-title">
      <SeattleCityHero/>
      <div className="platform-overview page-container" id="about-project">
        <div className="platform-section-heading"><span className="platform-eyebrow">{t("01 / Project Overview")}</span><h2>{t("Connected models. Shared understanding.")}</h2></div>
        <div className="platform-about"><h3>{t("About the project")}</h3><div><p className="platform-about-lead">{overview[locale][0]}</p><div className="platform-about-columns"><p>{overview[locale][1]}</p><p>{overview[locale][2]}</p></div></div></div>
        <CapabilityStories/>
        <section className="frontier-research frontier-editorial" aria-labelledby="frontier-research-title"><header><h3 id="frontier-research-title">{t("Frontier AI-Enabled Digital Twins")}</h3></header><p>“{frontier[locale]}”</p></section>
        <Partners contained={false}/>
        <PlatformEntrances/>
      </div>
    </section>
  </div>;
}
