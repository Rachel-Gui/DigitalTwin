import { Link } from "react-router-dom";
import studyAreaMap from "../assets/south-park-study-area-map.png";
import homepageDemo from "../assets/home/homepage_demo_2.png";
import vrHero from "../assets/vr/1111.png";
import paperCover from "../assets/research/energy-paper-cover.png";
import uwPartner from "../assets/partners/uw-stacked-white.png";
import uwMark from "../assets/partners/uw-w.svg";
import siuPartner from "../assets/partners/siu-white.png";
import urbiPartner from "../assets/partners/urbiilab.png";
import seattlePartner from "../assets/partners/seattle-official.svg";
import drccLogo from "../assets/partners/drcc-official-white.png";
import silLogo from "../assets/brand/sustainable-intelligence-lab-logo.png";
import { PublicationRecord, SectionHeader } from "../components";
import { useLanguage } from "../i18n";

export default function Home(){
  const {t}=useLanguage();
  return <div className="home-page">
    <section className="home-hero page-container">
      {/* TODO: Replace with final exported VR walkthrough video. */}
      <div className="home-hero-media" aria-hidden="true"><img src={homepageDemo} alt=""/></div>
      <div className="hero-title"><h1>DecarbCity<span>Twin</span></h1></div>
      <div className="hero-statement"><h2>{t("A Platform for Health-Driven")}<br/>{t("& Equitable Decarbonization")}</h2><p>{t("DecarbCityTwin connects neighborhood air-quality data, building-energy simulation, health-driven retrofit analysis, renewable-energy scenarios, agentic decision support, and immersive VR for the South Park testbed.")}</p></div>
    </section>
    <StudyAreaSection/>
    <ImmersiveModeSection/>
    <PublicationsSection/>
    <PartnersSection/>
  </div>
}

function StudyAreaSection(){
  return <section className="home-study-area">
    <div className="home-study-area-inner page-container">
      <div className="study-area-copy">
        <span className="eyebrow">01 / Current Prototype</span>
        <h2>South Park, Seattle</h2>
        <div className="study-area-body">
          <p>South Park is the current prototype implementation of DecarbCityTwin. The platform is designed as a modular framework that can be adapted to additional neighborhoods and cities in the future.</p>
        </div>
      </div>
      <figure className="study-area-map">
        <img src={studyAreaMap} alt="South Park study area in Seattle’s Duwamish Valley"/>
      </figure>
    </div>
  </section>
}

function ImmersiveModeSection(){
  return <section className="home-feature-section"><div className="home-feature page-container">
    <div className="home-feature-copy"><span className="eyebrow">02 / Immersive Mode</span><h2>Step inside the city’s atmosphere.</h2><p>Explore environmental conditions through interactive, browser-based, and headset-ready 3D experiences.</p><Link className="button home-feature-action" to="/vr">Enter Immersive Mode ↗</Link></div>
    <Link className="home-feature-media" to="/vr" aria-label="Enter Immersive Mode"><img src={vrHero} alt="DecarbCityTwin immersive VR experience interface"/></Link>
  </div></section>
}

function PublicationsSection(){
  return <section className="home-publications"><div className="page-container">
    <SectionHeader eyebrow="03 / Publications" title="Research Publications"/>
    <PublicationRecord image={paperCover} href="https://doi.org/10.3390/architecture6020084"/>
  </div></section>
}

function PartnersSection(){
  return <section className="home-partners" aria-labelledby="project-partners-title"><div className="page-container">
    <div className="home-partners-heading"><span className="eyebrow">PROJECT NETWORK</span><h2 id="project-partners-title">Partners &amp; Collaborators</h2></div>
    <div className="partner-grid">
      <div className="partner-column partner-uw">
        <img className="partner-uw-signature" src={uwPartner} alt="University of Washington"/>
        <p className="partner-university-unit">Population Health Initiative</p>
        <p className="partner-university-unit">Department of Architecture</p>
        <p className="partner-university-unit">Electrical &amp; Computer Engineering</p>
      </div>
      <div className="partner-column">
        <p className="partner-real">Renewable Energy Analysis Lab</p>
        <div className="partner-lockup"><img className="partner-sil-mark" src={silLogo} alt=""/><p>Sustainable<br/>Intelligence Lab <span>[SIL]</span></p></div>
        <div className="partner-idl"><div><strong>INTEGRATED<br/>DESIGN LAB</strong><img src={uwMark} alt=""/></div><span>UNIVERSITY OF WASHINGTON</span></div>
      </div>
      <div className="partner-column">
        <div className="partner-siu"><img src={siuPartner} alt="Southern Illinois University Carbondale"/><p>College of Arts and Media</p></div>
        <div className="partner-lockup partner-urbi"><img src={urbiPartner} alt=""/><p>Urban Intelligence &amp; Integrity Lab <span>[URBiiLAB]</span></p></div>
      </div>
      <div className="partner-column">
        <div className="partner-lockup partner-seattle"><img src={seattlePartner} alt=""/><p>City of Seattle<span>Office of Sustainability &amp; Environment</span></p></div>
        <div className="partner-lockup partner-drcc"><img src={drccLogo} alt=""/><p>Duwamish River<br/>Community Coalition</p></div>
      </div>
    </div>
  </div></section>
}
