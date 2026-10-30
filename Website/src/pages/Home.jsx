import { useLanguage } from "../i18n";
import seattleHero from "../assets/home/south-park-digital-twin-cover.png";
import PageScrollRuler from "../components/home/PageScrollRuler";
import CapabilityStories from "../components/home/CapabilityStories";
import Partners from "../components/Partners";
import PlatformEntrances from "../components/home/PlatformEntrances";
import { overview, frontier, homeText } from "../components/home/content";
import "../components/home/home.css";

export default function Home(){
  const {language,t:common}=useLanguage();
  const t=text=>homeText(language,text);
  const locale=language==="es"?"es":"en";
  return <div className="platform-home">
    <PageScrollRuler/>
    <section id="project-overview" aria-labelledby="platform-title">
      <div className="seattle-overlay-hero">
        <div className="seattle-hero-layout page-container">
        <img className="seattle-overlay-image" src={seattleHero} width="1672" height="941" alt={t("Illustrative South Park digital twin cover with building-energy colors and platform controls")} fetchPriority="high"/>
        <div className="seattle-overlay-content">
          <h1 id="platform-title">DecarbCity<span>Twin</span></h1>
          <h2>{common("A Platform for Health-Driven")} {common("& Equitable Decarbonization")}</h2>
          <p>{t("An AI-Driven, Multiscale Digital Twin for Building Energy and Urban Environmental Assessment")}</p>
        </div>
      </div>
        </div>
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
